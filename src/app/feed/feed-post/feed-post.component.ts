import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef } from "@angular/core";
import { GlobalVarsService } from "../../global-vars.service";
import { BackendApiService, NFTEntryResponse, PostEntryResponse } from "../../backend-api.service";
import { AppRoutingModule } from "../../app-routing.module";
import { Router } from "@angular/router";
import { SwalHelper } from "../../../lib/helpers/swal-helper";
import { FeedPostImageModalComponent } from "../feed-post-image-modal/feed-post-image-modal.component";
import { DiamondsModalComponent } from "../../diamonds-modal/diamonds-modal.component";
import { LikesModalComponent } from "../../likes-modal/likes-modal.component";
import { TransferModalComponent } from "src/app/transfer-modal/transfer-modal.component";
import { RepostsModalComponent } from "../../reposts-modal/reposts-modal.component";
import { QuoteRepostsModalComponent } from "../../quote-reposts-modal/quote-reposts-modal.component";
import { BsModalService } from "ngx-bootstrap/modal";
import { DomSanitizer } from "@angular/platform-browser";
import * as _ from "lodash";
import { PlaceBidModalComponent } from "../../place-bid-modal/place-bid-modal.component";
import { BuyNowModalComponent } from "../../buy-now-modal/buy-now-modal.component";
import { EmbedUrlParserService } from "../../../lib/services/embed-url-parser-service/embed-url-parser-service";
import { SharedDialogs } from "../../../lib/shared-dialogs";
import { UnlockContentModalComponent } from "src/app/unlock-content-modal/unlock-content-modal.component";
import { CreateNftAuctionModalComponent } from "src/app/create-nft-auction-modal/create-nft-auction-modal.component";
import { take } from "rxjs/operators";
import { MixpanelService } from "src/app/mixpanel.service";

import { environment } from "src/environments/environment";
import { ethers } from "ethers";
import { Link, ImmutableXClient, ImmutableMethodResults } from "@imtbl/imx-sdk";

@Component({
  selector: "feed-post",
  templateUrl: "./feed-post.component.html",
  styleUrls: ["./feed-post.component.scss"],
})
export class FeedPostComponent implements OnInit {
  @Input()
  get post(): PostEntryResponse {
    return this._post;
  }
  set post(post: PostEntryResponse) {
    // When setting the post, we need to consider repost behavior.
    // If a post is a reposting another post (without a quote), then use the reposted post as the post content.
    // If a post is quoting another post, then we use the quoted post as the quoted content.
    this._post = post;
    if (this.isRepost(post)) {
      this.postContent = post.RepostedPostEntryResponse;
      this.reposterProfile = post.ProfileEntryResponse;
      if (this.isQuotedRepost(post.RepostedPostEntryResponse)) {
        this.quotedContent = this.postContent.RepostedPostEntryResponse;
      }
    } else if (this.isQuotedRepost(post)) {
      this.postContent = post;
      this.quotedContent = post.RepostedPostEntryResponse;
    } else {
      this.postContent = post;
    }
  }

  @Input() set blocked(value: boolean) {
    this._blocked = value;
    this.ref.detectChanges();
  }
  get blocked() {
    return this._blocked;
  }
  @Input() isNFTProfile = false;
  @Input() isNFTProfileComment = false;
  @Input() postThread: boolean;
  constructor(
    public globalVars: GlobalVarsService,
    private backendApi: BackendApiService,
    private ref: ChangeDetectorRef,
    private router: Router,
    private modalService: BsModalService,
    private sanitizer: DomSanitizer,
    private mixPanel: MixpanelService
  ) {}

  // Got this from https://code.habd.as/jhabdas/xanthippe/src/branch/master/lib/xanthippe.js#L8
  // Other regexes:
  //   - https://stackoverflow.com/questions/7150652/regex-valid-twitter-mention/8975426
  //   - https://github.com/regexhq/mentions-regex
  static MENTIONS_REGEX = /\B\@([\w\-]+)/gim;
  @Input() showNFTOwnerInfo = {};
  @Input() showIconRow = true;
  @Input() showAdminRow = false;
  @Input() contentShouldLinkToThread: boolean;

  // Controls showing PED name
  @Input() showName: boolean;

  @Input() afterCommentCreatedCallback: any = null;
  @Input() afterRepostCreatedCallback: any = null;
  @Input() showReplyingToContent: any = null;
  @Input() parentPost;
  @Input() isParentPostInThread = false;
  @Input() showThreadConnectionLine = false;
  @Input() showLeftSelectedBorder = false;
  @Input() showInteractionDetails = false;
  @Input() isQuotedContent: boolean = false;

  @Input() showDropdown = true;
  @Input() hideFollowLink = false;

  @Input() includePaddingOnPost = false;

  @Input() showQuotedContent = true;
  @Input() hoverable = true;
  @Input() cardStyle: boolean = false;

  @Input() showReplyingTo = false;
  @Input() isForSaleOnly: boolean = false;
  nftLastAcceptedBidAmountNanos: number;
  nftMinBidAmountNanos: number;

  @Input() showNFTDetails = false;
  @Input() showExpandedNFTDetails = false;
  @Input() setBorder = false;
  @Input() showAvailableSerialNumbers = false;

  @Input() profilePublicKeyBase58Check: string = "";
  @Input() isNFTDetail = false;
  @Input() profileFeed = false;
  // If the post is shown in a modal, this is used to hide the modal on post click.
  @Input() containerModalRef: any = null;

  @Input() bidsOnMyNFTs: any;

  @Input() inTutorial: boolean = false;

  // Discovery page
  @Input() showDiscoveryDetails: boolean = false;

  // emits the PostEntryResponse
  @Output() postDeleted = new EventEmitter();

  // emits the UserBlocked event
  @Output() userBlocked = new EventEmitter();

  // emits the nftBidPLaced event
  @Output() nftBidPlaced = new EventEmitter();

  // emits diamondSent event
  @Output() diamondSent = new EventEmitter();

  // sell Bid
  @Output() sellNFT = new EventEmitter();

  // close Auction
  @Output() closeAuction = new EventEmitter();

  // Change edition
  @Output() changeEdition = new EventEmitter();

  // BUY NOW
  isBuyNow: boolean;
  buyNowPriceNanos: number;
  buyNowMinBidAmountNanos: number;
  isMinBidLessThanBuyNow: boolean;
  serialNumber: number;
  clickedPlaceABid: boolean;
  clickedBuyNow: boolean;

  editionNumber: number;
  AppRoutingModule = AppRoutingModule;
  addingPostToGlobalFeed = false;
  repost: any;
  postContent: any;
  reposterProfile: any;
  _post: any;
  pinningPost = false;
  hidingPost = false;

  isAvailableForSale = false;

  quotedContent: any;
  _blocked: boolean;
  constructedEmbedURL: any;

  showPlaceABid: boolean;
  highBid: number = null;
  lowBid: number = null;
  availableSerialNumbers: NFTEntryResponse[];
  myAvailableSerialNumbers: NFTEntryResponse[];
  mySerialNumbersNotForSale: NFTEntryResponse[];
  serialNumbersDisplay: string;
  nftEntryResponses: NFTEntryResponse[];
  decryptableNFTEntryResponses: NFTEntryResponse[];
  isLockablePopup: boolean = false;

  nftEntryResponse: any;
  buyNowEqualMinBid: boolean;

  unlockableTooltip =
    "This NFT will come with content that's encrypted and only unlockable by the winning bidder. Note that if an NFT is being resold, it is not guaranteed that the new unlockable will be the same original unlockable.";
  mOfNNFTTooltip =
    "Each NFT can have multiple editions, each of which has its own unique serial number. This shows how many editions are currently on sale and how many there are in total. Generally, editions with lower serial numbers are more valuable.";

  // NEWLY WRITTEN LOGIC FOR NFT DETAIL
  ownsEdition: boolean;
  editionForSale: boolean;
  editionIsBuyNow: boolean;
  editionHasBids: boolean;
  editionHasUnlockable: boolean;
  editionHasBidByUser: boolean;
  editionHasBeenSold: boolean;
  multipleEditions: boolean;
  loadingEditionDetails = true;
  loadingEthNFTDetails = true;

  ethereumNFTSalePrice: any;
  ownsEthNFT: boolean;
  sellOrderId: any;
  token_id: any;

  async ownsEthNFTStatus() {
    const options = { method: "GET", headers: { Accept: "application/json" } };

    let res = await fetch(
      `${environment.imx.MAINNET_ENV_URL}/${environment.imx.TOKEN_ADDRESS}/${this.postContent.PostExtraData["tokenId"]}`,
      options
    );

    res = await res.json();

    let ethNftOwner = res["user"];

    if (localStorage.getItem("address")) {
      this.globalVars.imxWalletAddress = localStorage.getItem("address");
    }

    if (ethNftOwner === this.globalVars.imxWalletAddress) {
      this.ownsEthNFT = true;
      //   console.log("The wallet owns the NFT");
    }
  }

  async updateEthNFTForSaleStatus() {
    const options = { method: "GET", headers: { Accept: "*/*" } };

    // console.log(environment.imx.TOKEN_ADDRESS);

    let res = await fetch(
      `${environment.imx.MAINNET_ENV_URL}/orders?status=active&sell_token_address=${environment.imx.TOKEN_ADDRESS}`,
      options
    );

    res = await res.json();

    // console.log(typeof this.nftPost.PostExtraData["tokenId"]);
    // console.log(res);

    if (res["result"]["length"] === 0) {
      console.log("There are no NFTs for sale");
      this.globalVars.isEthereumNFTForSale = false;
      this.loadingEthNFTDetails = false;
      console.log(` ---------------- is nft for sale ${this.globalVars.isEthereumNFTForSale}`);
      console.log(` ---------------- loading nft details ${this.loadingEthNFTDetails}`);
      return;
    }

    var tokenIdsForSale = [];
    var nftsForSaleArr = [];
    for (var i = 0; i < res["result"].length; i++) {
      //   if (this.postContent.PostExtraData["tokenId"] == res["result"][i]["sell"]["data"]["token_id"]) {
      //     this.globalVars.isEthereumNFTForSale = true;
      //     this.ethereumNFTSalePrice = res["result"][i]["buy"]["data"]["quantity"];
      //     this.ethereumNFTSalePrice = ethers.utils.formatEther(this.ethereumNFTSalePrice);
      //     this.sellOrderId = res["result"][i]["order_id"];
      //     console.log(this.sellOrderId);
      //   }
      tokenIdsForSale.push(res["result"][i]["sell"]["data"]["token_id"]);
      nftsForSaleArr.push(res["result"][i]);
    }

    // console.log(tokenIdsForSale);
    // console.log(typeof this.postContent.PostExtraData["tokenId"]);

    if (tokenIdsForSale.includes(this.postContent.PostExtraData["tokenId"])) {
      for (var i = 0; i < nftsForSaleArr.length; i++) {
        if (this.postContent.PostExtraData["tokenId"] == nftsForSaleArr[i]["sell"]["data"]["token_id"]) {
          this.globalVars.isEthereumNFTForSale = true;
          this.ethereumNFTSalePrice = res["result"][i]["buy"]["data"]["quantity"];
          this.ethereumNFTSalePrice = ethers.utils.formatEther(this.ethereumNFTSalePrice);
          this.sellOrderId = res["result"][i]["order_id"];
          console.log(this.sellOrderId);
        }
      }
    } else {
      this.globalVars.isEthereumNFTForSale = false;
    }

    this.loadingEthNFTDetails = false;
  }

  _tabSerialNumberClicked(id: number) {
    this.loadingEditionDetails = true;
    this.editionNumber = id;
    // Pass to parent the wish to change edition
    // Parent then should call sibling nft-detai-box
    this.changeEdition.emit(id);
  }

  getNFTEntries() {
    this.backendApi
      .GetNFTEntriesForNFTPost(
        this.globalVars.localNode,
        this.globalVars.loggedInUser?.PublicKeyBase58Check,
        this.postContent.PostHashHex
      )
      .subscribe((res) => {
        this.nftEntryResponses = res.NFTEntryResponses;
        // Set serialnumber of which to use in logic to be one that the user owns
        // or the first one if user does not own any
        if (this.nftEntryResponses?.length > 1) {
          this.multipleEditions = true;
        }
        this.setSerialNumberToUse();
        // Insert selected ser into variable
        // Insert selected ser into variable
        this.nftEntryResponses.forEach((item) => {
          if (item.SerialNumber == this.editionNumber) {
            this.nftEntryResponse = item;
          }
        });

        this.nftEntryResponses.sort((a, b) => a.SerialNumber - b.SerialNumber);
        this.decryptableNFTEntryResponses = this.nftEntryResponses.filter(
          (sn) =>
            sn.OwnerPublicKeyBase58Check === this.globalVars.loggedInUser?.PublicKeyBase58Check &&
            sn.EncryptedUnlockableText &&
            sn.LastOwnerPublicKeyBase58Check
        );

        if (this.decryptableNFTEntryResponses.length) {
          this.backendApi
            .DecryptUnlockableTexts(
              this.globalVars.loggedInUser?.PublicKeyBase58Check,
              this.decryptableNFTEntryResponses
            )
            .subscribe((res) => (this.decryptableNFTEntryResponses = res));
        }
        this.availableSerialNumbers = this.nftEntryResponses.filter((nftEntryResponse) => nftEntryResponse.IsForSale);
        const profileSerialNumbers = this.nftEntryResponses.filter(
          (serialNumber) =>
            serialNumber.OwnerPublicKeyBase58Check === this.profilePublicKeyBase58Check &&
            (!this.isForSaleOnly || serialNumber.IsForSale)
        );
        this.serialNumbersDisplay =
          profileSerialNumbers
            .map((serialNumber) => `#${serialNumber.SerialNumber}`)
            .slice(0, 5)
            .join(", ") + (profileSerialNumbers.length > 5 ? "..." : "");
        this.mySerialNumbersNotForSale = this.nftEntryResponses.filter(
          (nftEntryResponse) =>
            !nftEntryResponse.IsForSale &&
            nftEntryResponse.OwnerPublicKeyBase58Check === this.globalVars.loggedInUser?.PublicKeyBase58Check
        );
        this.myAvailableSerialNumbers = this.availableSerialNumbers.filter(
          (nftEntryResponse) =>
            nftEntryResponse.OwnerPublicKeyBase58Check === this.globalVars.loggedInUser?.PublicKeyBase58Check
        );
        this.showPlaceABid = !!(this.availableSerialNumbers.length - this.myAvailableSerialNumbers.length);
        this.highBid = _.maxBy(this.availableSerialNumbers, "HighestBidAmountNanos")?.HighestBidAmountNanos || 0;
        this.lowBid = _.minBy(this.availableSerialNumbers, "HighestBidAmountNanos")?.HighestBidAmountNanos || 0;
        if (this.nftEntryResponses.length === 1) {
          this.nftLastAcceptedBidAmountNanos = this.nftEntryResponses[0].LastAcceptedBidAmountNanos;
          if (this.nftEntryResponses[0].MinBidAmountNanos >= 0) {
            this.nftMinBidAmountNanos = this.nftEntryResponses[0].MinBidAmountNanos;
          }
        } else {
          this.nftLastAcceptedBidAmountNanos = this.nftEntryResponses[0]?.LastAcceptedBidAmountNanos;
          this.nftMinBidAmountNanos = this.nftEntryResponses[0]?.MinBidAmountNanos;
        }
      });
  }

  updateBuyNow() {
    if (this.nftEntryResponse.IsBuyNow) {
      this.editionIsBuyNow = true;
      if (this.editionIsBuyNow && this.nftEntryResponse.BuyNowPriceNanos === this.nftEntryResponse.MinBidAmountNanos) {
        this.buyNowEqualMinBid = true;
      } else {
        this.buyNowEqualMinBid = false;
      }
    } else {
      this.isBuyNow = false;
    }
    this.buyNowPriceNanos = this.nftEntryResponse.BuyNowPriceNanos;
    this.buyNowMinBidAmountNanos = this.nftEntryResponse.MinBidAmountNanos;
    this.serialNumber = this.nftEntryResponse.SerialNumber;
    if (this.buyNowMinBidAmountNanos < this.buyNowPriceNanos) {
      this.isMinBidLessThanBuyNow = true;
    } else {
      this.isMinBidLessThanBuyNow = false;
    }
  }

  showCreateNFTAuction(): boolean {
    return (
      this.post.IsNFT &&
      !!this.nftEntryResponses?.filter(
        (nftEntryResponse) =>
          !nftEntryResponse.IsForSale &&
          nftEntryResponse.OwnerPublicKeyBase58Check === this.globalVars.loggedInUser?.PublicKeyBase58Check
      )?.length
    );
  }
  hasNFTsNotOnSale(): boolean {
    return (
      this.post.IsNFT &&
      !!this.nftEntryResponses?.filter(
        (nftEntryResponse) =>
          !nftEntryResponse.IsForSale &&
          nftEntryResponse.OwnerPublicKeyBase58Check === this.globalVars.loggedInUser?.PublicKeyBase58Check
      )?.length
    );
  }

  hasNFTsOnSale(): boolean {
    return (
      this.post.IsNFT &&
      !!this.nftEntryResponses?.filter(
        (nftEntryResponse) =>
          nftEntryResponse.IsForSale &&
          nftEntryResponse.OwnerPublicKeyBase58Check === this.globalVars.loggedInUser?.PublicKeyBase58Check
      )?.length
    );
  }
  async ngOnInit() {
    if (!this.post.RepostCount) {
      this.post.RepostCount = 0;
    }
    this.setEmbedURLForPostContent();
    if (this.showNFTDetails && this.postContent.IsNFT && !this.nftEntryResponses?.length) {
      this.getNFTEntries();
    }
    this.globalVars.NFTRoyaltyToCoinBasisPoints = this.postContent.NFTRoyaltyToCoinBasisPoints / 100;
    this.globalVars.NFTRoyaltyToCreatorBasisPoints = this.postContent.NFTRoyaltyToCreatorBasisPoints / 100;

    if (this.postContent.PostExtraData?.isEthereumNFT) {
      await this.updateEthNFTForSaleStatus();
      await this.ownsEthNFTStatus();
    }
    // console.log(` ---------- is eth nft for sale ${this.globalVars.isEthereumNFTForSale} ---------- `);
  }

  onPostClicked(event) {
    if (this.inTutorial) {
      return;
    }
    if (this.containerModalRef !== null) {
      this.containerModalRef.hide();
    }

    // if we shouldn't be navigating the user to a new page, just return
    if (!this.contentShouldLinkToThread) {
      return true;
    }

    // don't navigate if the user is selecting text
    // from https://stackoverflow.com/questions/31982407/prevent-onclick-event-when-selecting-text
    const selection = window.getSelection();
    if (selection.toString().length !== 0) {
      return true;
    }

    // don't navigate if the user clicked a link
    if (event.target.tagName.toLowerCase() === "a") {
      return true;
    }

    const route = this.postContent.IsNFT ? this.globalVars.RouteNames.NFT : this.globalVars.RouteNames.POSTS;

    // identify ctrl+click (or) cmd+clik and opens feed in new tab
    if (event.ctrlKey) {
      const url = this.router.serializeUrl(
        this.router.createUrlTree(["/" + route, this.postContent.PostHashHex], {
          queryParamsHandling: "merge",
        })
      );
      window.open(url, "_blank");
      // don't navigate after new tab is opened
      return true;
    }

    this.router.navigate(["/" + route, this.postContent.PostHashHex], {
      queryParamsHandling: "merge",
    });
  }

  isRepost(post: any): boolean {
    return post.Body === "" && (!post.ImageURLs || post.ImageURLs?.length === 0) && post.RepostedPostEntryResponse;
  }

  isQuotedRepost(post: any): boolean {
    return (post.Body !== "" || post.ImageURLs?.length > 0) && post.RepostedPostEntryResponse;
  }

  isRegularPost(post: any): boolean {
    return !this.isRepost(post) && !this.isQuotedRepost(post);
  }

  openImgModal(event, imageURL) {
    event.stopPropagation();
    this.modalService.show(FeedPostImageModalComponent, {
      class: "modal-dialog-centered img_popups modal-lg",
      initialState: {
        imageURL,
      },
    });
  }

  openInteractionModal(event, component): void {
    event.stopPropagation();
    this.modalService.show(component, {
      class: "modal-dialog-centered",
      initialState: { postHashHex: this.post.PostHashHex },
    });
  }
  openTransferModal(event): void {
    this.openInteractionModal(event, TransferModalComponent);
  }

  openDiamondsModal(event): void {
    if (this.postContent.DiamondCount) {
      this.openInteractionModal(event, DiamondsModalComponent);
    }
  }

  openLikesModal(event): void {
    if (this.postContent.LikeCount) {
      this.openInteractionModal(event, LikesModalComponent);
    }
  }

  openRepostsModal(event): void {
    if (this.postContent.RepostCount) {
      this.openInteractionModal(event, RepostsModalComponent);
    }
  }

  openQuoteRepostsModal(event): void {
    if (this.postContent.QuoteRepostCount) {
      this.openInteractionModal(event, QuoteRepostsModalComponent);
    }
  }

  hidePost() {
    SwalHelper.fire({
      target: this.globalVars.getTargetComponentSelector(),
      title: "Hide post?",
      html: `This can’t be undone. The post will be removed from your profile, from search results, and from the feeds of anyone who follows you.`,
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-light",
        cancelButton: "btn btn-light no",
      },
      reverseButtons: true,
    }).then((response: any) => {
      if (response.isConfirmed) {
        // Hide the post in the UI immediately, even before the delete goes thru, to give
        // the user some indication that his delete is happening. This is a little janky.
        // For example, on the feed, the border around the post is applied by an outer element,
        // so the border will remain (and the UI will look a bit off) until the delete goes thru,
        // we emit the delete event, and the parent removes the outer element/border from the UI.
        //
        // Note: This is a rare instance where I needed to call detectChanges(). Angular wasn't
        // picking up the changes until I called this explicitly. IDK why.
        this.hidingPost = true;
        this.ref.detectChanges();
        this.backendApi
          .SubmitPost(
            this.globalVars.localNode,
            this.globalVars.loggedInUser.PublicKeyBase58Check,
            this._post.PostHashHex /*PostHashHexToModify*/,
            "" /*ParentPostHashHex*/,
            "" /*Title*/,
            { Body: this._post.Body, ImageURLs: this._post.ImageURLs, VideoURLs: this._post.VideoURLs } /*BodyObj*/,
            this._post.RepostedPostEntryResponse?.PostHashHex || "",
            {},
            "" /*Sub*/,
            true /*IsHidden*/,
            this.globalVars.feeRateDeSoPerKB * 1e9 /*feeRateNanosPerKB*/
          )
          .subscribe(
            (response) => {
              this.globalVars.logEvent("post : hide");
              this.postDeleted.emit(response.PostEntryResponse);
            },
            (err) => {
              console.error(err);
              const parsedError = this.backendApi.parsePostError(err);
              this.globalVars.logEvent("post : hide : error", { parsedError });
              this.globalVars._alertError(parsedError);
            }
          );
      }
    });
  }

  blockUser() {
    SwalHelper.fire({
      target: this.globalVars.getTargetComponentSelector(),
      title: "Block user?",
      html: `This will hide all comments from this user on your posts as well as hide them from your view on your feed and other threads.`,
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-light",
        cancelButton: "btn btn-light no",
      },
      reverseButtons: true,
    }).then((response: any) => {
      if (response.isConfirmed) {
        this.backendApi
          .BlockPublicKey(
            this.globalVars.localNode,
            this.globalVars.loggedInUser.PublicKeyBase58Check,
            this.post.PosterPublicKeyBase58Check
          )
          .subscribe(
            () => {
              this.globalVars.logEvent("user : block");
              this.globalVars.loggedInUser.BlockedPubKeys[this.post.PosterPublicKeyBase58Check] = {};
              this.userBlocked.emit(this.post.PosterPublicKeyBase58Check);
            },
            (err) => {
              console.error(err);
              const parsedError = this.backendApi.stringifyError(err);
              this.globalVars.logEvent("user : block : error", { parsedError });
              this.globalVars._alertError(parsedError);
            }
          );
      }
    });
  }

  _numToFourChars(numToConvert: number) {
    let abbrev = numToConvert.toFixed(2);
    const hasDecimal = abbrev.split(".").length == 2;
    if (hasDecimal) {
      // If it has a decimal and is <1000, there are three cases to consider.
      if (abbrev.length <= 4) {
        return abbrev;
      }
      if (abbrev.length == 5) {
        return numToConvert.toFixed(1);
      }
      if (abbrev.length == 6) {
        return numToConvert.toFixed();
      }
    }

    // If we get here, the number should not show a decimal in the UI.
    abbrev = numToConvert.toFixed();
    if (abbrev.length <= 3) {
      return abbrev;
    }

    abbrev = (numToConvert / 1e3).toFixed() + "K";
    if (abbrev.length <= 4) {
      return abbrev;
    }

    abbrev = (numToConvert / 1e6).toFixed() + "M";
    if (abbrev.length <= 4) {
      return abbrev;
    }

    abbrev = (numToConvert / 1e9).toFixed() + "B";
    if (abbrev.length <= 4) {
      return abbrev;
    }
  }

  _addPostToGlobalFeed(event: any) {
    // Prevent the post from navigating.
    event.stopPropagation();

    this.addingPostToGlobalFeed = true;
    const postHashHex = this.post.PostHashHex;
    const inGlobalFeed = this.post.InGlobalFeed;
    this.backendApi
      .AdminUpdateGlobalFeed(
        this.globalVars.localNode,
        this.globalVars.loggedInUser.PublicKeyBase58Check,
        postHashHex,
        inGlobalFeed /*RemoveFromGlobalFeed*/
      )
      .subscribe(
        (res) => {
          this.post.InGlobalFeed = !this.post.InGlobalFeed;
          this.globalVars.logEvent("admin: add-post-to-global-feed", {
            postHashHex,
            userPublicKeyBase58Check: this.globalVars.loggedInUser?.PublicKeyBase58Check,
            username: this.globalVars.loggedInUser?.ProfileEntryResponse?.Username,
          });
          this.ref.detectChanges();
        },
        (err) => {
          this.globalVars._alertError(JSON.stringify(err.error));
        }
      )
      .add(() => {
        this.addingPostToGlobalFeed = false;
        this.ref.detectChanges();
      });
  }

  _pinPostToGlobalFeed(event: any) {
    // Prevent the post from navigating.
    event.stopPropagation();

    this.pinningPost = true;
    const postHashHex = this._post.PostHashHex;
    const isPostPinned = this._post.IsPinned;
    this.backendApi
      .AdminPinPost(
        this.globalVars.localNode,
        this.globalVars.loggedInUser.PublicKeyBase58Check,
        postHashHex,
        isPostPinned
      )
      .subscribe(
        (res) => {
          this._post.IsPinned = isPostPinned;
          this.globalVars.logEvent("admin: pin-post-to-global-feed", {
            postHashHex,
            userPublicKeyBase58Check: this.globalVars.loggedInUser?.PublicKeyBase58Check,
            username: this.globalVars.loggedInUser?.ProfileEntryResponse?.Username,
          });
          this.ref.detectChanges();
        },
        (err) => {
          this.globalVars._alertError(JSON.stringify(err.error));
        }
      )
      .add(() => {
        this.pinningPost = false;
        this.ref.detectChanges();
      });
  }

  setEmbedURLForPostContent(): void {
    EmbedUrlParserService.getEmbedURL(
      this.backendApi,
      this.globalVars,
      this.postContent.PostExtraData["EmbedVideoURL"]
    ).subscribe((res) => (this.constructedEmbedURL = res));
  }

  getEmbedHeight(): number {
    return EmbedUrlParserService.getEmbedHeight(this.postContent.PostExtraData["EmbedVideoURL"]);
  }

  getEmbedWidth(): string {
    return EmbedUrlParserService.getEmbedWidth(this.postContent.PostExtraData["EmbedVideoURL"]);
  }

  // getNode(): DeSoNode {
  //   const nodeId = this.postContent.PostExtraData["Node"];
  //   if (nodeId && nodeId != environment.node.id) {
  //     const node = this.globalVars.nodes[nodeId];
  //     if (node) {
  //       return node;
  //     }
  //   }
  // }

  // Vimeo iframes have a lot of spacing on top and bottom on mobile.
  setNegativeMargins(link: string, globalVars: GlobalVarsService) {
    return globalVars.isMobile() && EmbedUrlParserService.isVimeoLink(link);
  }

  mapImageURLs(imgURL: string): string {
    if (imgURL.startsWith("https://i.imgur.com")) {
      return imgURL.replace("https://i.imgur.com", "https://images.bitclout.com/i.imgur.com");
    }
    return imgURL;
  }

  openPlaceBidModal(event: any) {
    this.clickedBuyNow = false;
    this.clickedPlaceABid = true;
    this.mixPanel.track15("Open Place a Bid Modal");
    if (!this.globalVars.loggedInUser?.ProfileEntryResponse) {
      SharedDialogs.showCreateProfileToPerformActionDialog(this.router, "place a bid");
      return;
    }
    event.stopPropagation();
    const modalDetails = this.modalService.show(PlaceBidModalComponent, {
      class: "modal-dialog-centered nft_placebid_modal_bx nft_placebid_modal_bx_right modal-lg",
      initialState: { post: this.postContent, clickedPlaceABid: this.clickedPlaceABid, isBuyNow: this.isBuyNow },
    });

    const onHideEvent = modalDetails.onHide;
    onHideEvent.subscribe((response) => {
      if (response === "bid placed") {
        this.getNFTEntries();
        this.nftBidPlaced.emit();
      }
    });
  }

  openBuyNowModal(event: any) {
    //   is not an ETH nft
    if (this.postContent.PostExtraData?.isEthereumNFT === false) {
      this.clickedBuyNow = true;
      this.clickedPlaceABid = false;

      if (!this.globalVars.loggedInUser?.ProfileEntryResponse) {
        SharedDialogs.showCreateProfileToPerformActionDialog(this.router, "buy now");
        return;
      }
      event.stopPropagation();
      const modalDetails = this.modalService.show(BuyNowModalComponent, {
        class: "modal-dialog-centered nft_placebid_modal_bx  modal-lg",
        initialState: {
          post: this.postContent,
          clickedBuyNow: this.clickedBuyNow,
          isEthNFT: false,
          ethereumNFTSalePrice: "",
          sellOrderId: "",
        },
      });

      const onHideEvent = modalDetails.onHide;
      onHideEvent.subscribe((response) => {
        if (response === "bid placed") {
          this.getNFTEntries();
          this.nftBidPlaced.emit();
        }
      });
    }
    // is an ETH NFT
    else {
      this.clickedBuyNow = true;
      this.clickedPlaceABid = false;

      if (!this.globalVars.loggedInUser?.ProfileEntryResponse) {
        SharedDialogs.showCreateProfileToPerformActionDialog(this.router, "buy now");
        return;
      }
      event.stopPropagation();
      const modalDetails = this.modalService.show(BuyNowModalComponent, {
        class: "modal-dialog-centered nft_placebid_modal_bx  modal-lg",
        initialState: {
          post: this.postContent,
          clickedBuyNow: this.clickedBuyNow,
          isEthNFT: true,
          ethereumNFTSalePrice: this.ethereumNFTSalePrice,
          sellOrderId: this.sellOrderId,
        },
      });

      const onHideEvent = modalDetails.onHide;
      onHideEvent.subscribe((response) => {
        if (response === "bid placed") {
          this.getNFTEntries();
          this.nftBidPlaced.emit();
        }
      });
    }
  }

  ViewUnlockableContent() {
    this.modalService.show(UnlockContentModalComponent, {
      class: "modal-dialog-centered nft_placebid_modal_bx nft_placebid_modal_bx_right modal-lg",
      initialState: { decryptableNFTEntryResponses: this.decryptableNFTEntryResponses },
    });
  }

  showUnlockableContent = false;
  toggleShowUnlockableContent(): void {
    if (!this.decryptableNFTEntryResponses?.length) {
      return;
    }
    this.showUnlockableContent = !this.showUnlockableContent;
  }
  showmOfNNFTTooltip = false;
  toggleShowMOfNNFTTooltip(): void {
    this.showmOfNNFTTooltip = !this.showmOfNNFTTooltip;
  }
  toggleLockablePopup() {
    this.isLockablePopup = !this.isLockablePopup;
  }
  clickOutside() {
    this.isLockablePopup = false;
    this.showUnlockableContent = false;
  }
  // This has a problem with returning owner and showing last sold for amounts as zero
  compareBit(minBid, maxBid, showPlaceABid): string {
    if (!showPlaceABid && !!this.nftEntryResponses) {
      if (
        this.nftEntryResponse?.IsForSale === false &&
        this.nftEntryResponse?.LastAcceptedBidAmountNanos === 0 &&
        this.nftEntryResponse?.OwnerPublicKeyBase58Check === this.postContent.PosterPublicKeyBase58Check
      ) {
        return "Owner";
      }
      return this.nftEntryResponse?.IsForSale === false ? "Last Sold for" : "Minimum Bid";
    } else {
      if (Number(maxBid) > 0) {
        return "Highest Bid";
      } else if (Number(maxBid) === 0) {
        return "Minimum Bid";
      }
    }
    return "";
  }
  UserOwnsSerialNumbers() {
    const loggedInPubKey = this.globalVars?.loggedInUser?.PublicKeyBase58Check;
    if (!this.nftEntryResponses) {
      return false;
    }
    let serialList = this.nftEntryResponses.filter(
      (NFTEntryResponse) => NFTEntryResponse.OwnerPublicKeyBase58Check === loggedInPubKey
    );
    return serialList.length > 0;
  }
  // If user owns a serial number we want to show stuff related to that serial number
  setSerialNumberToUse() {
    const loggedInPubKey = this.globalVars?.loggedInUser?.PublicKeyBase58Check;
    if (!this.nftEntryResponses) {
      return false;
    }
    let serialList = this.nftEntryResponses.filter(
      (NFTEntryResponse) => NFTEntryResponse.OwnerPublicKeyBase58Check === loggedInPubKey
    );
    if (serialList.length > 0) {
      this.editionNumber = serialList[0].SerialNumber;
    } else {
      this.editionNumber = 1;
    }
  }
  sellYourBid() {
    this.sellNFT.emit();
  }
  closeYourAuction() {
    this.closeAuction.emit();
  }
  async closeYourETHAuction() {
    const link = new Link(environment.imx.MAINNET_LINK_URL);
    await link.cancel({
      orderId: this.sellOrderId,
    });
    // give the owner the option to list nft for sale again. you need to change it to false
    this.globalVars.isEthereumNFTForSale = false;
  }
  getRouterLink(val: any): any {
    return this.inTutorial ? [] : val;
  }

  openCreateNFTAuctionModal(event): void {
    let createNftAuctionDetails = this.modalService.show(CreateNftAuctionModalComponent, {
      class:
        "modal-dialog-centered nft_placebid_modal_bx  nft_placebid_modal_bx_right nft_placebid_modal_bx_right modal-lg",
      initialState: { post: this.post, nftEntryResponses: this.nftEntryResponses, isEthNFT: false, tokenId: "" },
    });
    const onHiddenEvent = createNftAuctionDetails.onHidden.pipe(take(1));
    onHiddenEvent.subscribe((response) => {
      if (response === "nft auction started") {
        this.getNFTEntries();
        // Refreshes this component on nft post level
        this.nftBidPlaced.emit();
      }
    });
  }

  openCreateETHNFTAuctionModal(event): void {
    this.token_id = this.postContent.PostExtraData["tokenId"];
    console.log(` ------------------- tokenId from feed-post is ${this.token_id}`);

    this.modalService.show(CreateNftAuctionModalComponent, {
      class:
        "modal-dialog-centered nft_placebid_modal_bx  nft_placebid_modal_bx_right nft_placebid_modal_bx_right modal-lg",
      initialState: {
        post: this.post,
        nftEntryResponses: this.nftEntryResponses,
        isEthNFT: true,
        tokenId: this.token_id,
      },
    });
  }
}
