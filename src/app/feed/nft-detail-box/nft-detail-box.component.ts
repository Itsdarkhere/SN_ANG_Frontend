import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { AppRoutingModule } from "src/app/app-routing.module";
import { NFTBidData, NFTBidEntryResponse, NFTEntryResponse, PostEntryResponse } from "src/app/backend-api.service";
import { GlobalVarsService } from "src/app/global-vars.service";
import { BsModalService } from "ngx-bootstrap/modal";
import { BackendApiService } from "src/app/backend-api.service";
import { SharedDialogs } from "src/lib/shared-dialogs";
import { UnlockContentModalComponent } from "src/app/unlock-content-modal/unlock-content-modal.component";
import { MixpanelService } from "src/app/mixpanel.service";
import { PlaceBidModalComponent } from "src/app/place-bid-modal/place-bid-modal.component";
import { Router } from "@angular/router";
import { BuyNowModalComponent } from "src/app/buy-now-modal/buy-now-modal.component";
import { ethers } from "ethers";
import _ from "lodash";
import { environment } from "src/environments/environment";
import { CreateNftAuctionModalComponent } from "src/app/create-nft-auction-modal/create-nft-auction-modal.component";
import { take } from "rxjs/operators";
import { ChangeDetectorRef } from "@angular/core";

import { Link, ImmutableXClient, ImmutableMethodResults } from "@imtbl/imx-sdk";

@Component({
  selector: "app-nft-detail-box",
  templateUrl: "./nft-detail-box.component.html",
  styleUrls: ["./nft-detail-box.component.scss"],
})
export class NftDetailBoxComponent implements OnInit {
  @Input() isNFTDetail = false;
  @Input() nftBidData: NFTBidData;
  @Input() profilePublicKeyBase58Check: string = "";
  @Input() isForSaleOnly: boolean = false;
  @Input() postContent: any;
  @Input() hightestBidOwner = {};

  @Output() closeAuction = new EventEmitter();
  @Output() singleBidCancellation = new EventEmitter();
  @Output() multipleBidsCancellation = new EventEmitter();
  @Output() nftBidPlaced = new EventEmitter();
  @Output() sellNFT = new EventEmitter();

  // BUY NOW
  isBuyNow: boolean;
  buyNowPriceNanos: number;
  buyNowMinBidAmountNanos: number;
  isMinBidLessThanBuyNow: boolean;
  serialNumber: number;
  clickedPlaceABid: boolean;
  clickedBuyNeditionNumber: number;
  editionNumber: number;
  AppRoutingModule = AppRoutingModule;
  clickedBuyNow: boolean;
  _post: any;

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

  nftLastAcceptedBidAmountNanos: number;
  nftMinBidAmountNanos: number;

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

  constructor(
    public globalVars: GlobalVarsService,
    private modalService: BsModalService,
    private backendApi: BackendApiService,
    private mixPanel: MixpanelService,
    private router: Router,
    private changeDetector: ChangeDetectorRef
  ) {}

  async ngOnInit() {
    this.getNFTEntries();

    this.globalVars.NFTRoyaltyToCoinBasisPoints = this.postContent.NFTRoyaltyToCoinBasisPoints / 100;
    this.globalVars.NFTRoyaltyToCreatorBasisPoints = this.postContent.NFTRoyaltyToCreatorBasisPoints / 100;

    await this.updateEthNFTForSaleStatus();
    await this.ownsEthNFTStatus();
  }

  async updateEthNFTForSaleStatus() {
    const options = { method: "GET", headers: { Accept: "*/*" } };

    let res = await fetch(
      `https://api.ropsten.x.immutable.com/v1/orders?status=active&sell_token_address=${environment.imx.TOKEN_ADDRESS}`,
      options
    );

    res = await res.json();

    // console.log(typeof this.nftPost.PostExtraData["tokenId"]);
    // console.log(res);

    if (res["result"]["length"] === 0) {
      this.globalVars.isEthereumNFTForSale = false;
      this.loadingEthNFTDetails = false;
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

    if (tokenIdsForSale.includes(this.postContent.PostExtraData["tokenId"])) {
      for (var i = 0; i < nftsForSaleArr.length; i++) {
        if (this.postContent.PostExtraData["tokenId"] == nftsForSaleArr[i]["sell"]["data"]["token_id"]) {
          this.globalVars.isEthereumNFTForSale = true;
          this.ethereumNFTSalePrice = res["result"][i]["buy"]["data"]["quantity"];
          this.ethereumNFTSalePrice = ethers.utils.formatEther(this.ethereumNFTSalePrice);
          this.sellOrderId = res["result"][i]["order_id"];
        }
      }
    } else {
      this.globalVars.isEthereumNFTForSale = false;
    }

    this.loadingEthNFTDetails = false;
  }
  async ownsEthNFTStatus() {
    const options = { method: "GET", headers: { Accept: "application/json" } };

    let res = await fetch(
      `https://api.ropsten.x.immutable.com/v1/assets/${environment.imx.TOKEN_ADDRESS}/${this.postContent.PostExtraData["tokenId"]}`,
      options
    );

    res = await res.json();

    let ethNftOwner = res["user"];

    if (localStorage.getItem("address")) {
      this.globalVars.imxWalletAddress = localStorage.getItem("address");
    }

    if (ethNftOwner === this.globalVars.imxWalletAddress) {
      this.ownsEthNFT = true;
    }
  }

  updateBuyNow() {
    console.log(this.nftEntryResponse);
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

  changeEdition(id: number) {
    // Insert selected ser into variable
    // Do this in nft detail box
    this.loadingEditionDetails = true;
    this.nftEntryResponses.forEach((item) => {
      if (item.SerialNumber == id) {
        this.nftEntryResponse = item;
      }
    });
    this.updateBuyNow();
    this.updateEditionSpecificLogic();
  }

  updateDetailsSameEdition() {
    this.loadingEditionDetails = true;
    this.updateBuyNow();
    this.updateEditionSpecificLogic();
  }

  updateEditionSpecificLogic() {
    this.multipleEditions = this.nftEntryResponses.length > 1;
    this.isAvailableForSale = this.nftEntryResponse.IsForSale;
    // Check if user owns this edition
    this.ownsEdition =
      this.nftEntryResponse.OwnerPublicKeyBase58Check == this.globalVars?.loggedInUser?.PublicKeyBase58Check;
    // Check if this edition is for sale
    this.editionForSale = this.nftEntryResponse.IsForSale;
    // Check if edition has bids
    this.editionHasBids = this.nftBidData?.BidEntryResponses.length > 0;
    // Check if edition has unlockable
    if (!this.editionIsBuyNow) {
      this.editionHasUnlockable = this.nftEntryResponse.DecryptedUnlockableText != null;
    }
    // Check if user has made a bid on this edition
    if (!this.ownsEdition) {
      this.editionHasBidByUser =
        this.nftBidData.BidEntryResponses.filter(
          (bid) => bid.PublicKeyBase58Check === this.globalVars.loggedInUser.PublicKeyBase58Check
        )?.length > 0;
    }
    // Check if edition has been sold before
    this.editionHasBeenSold = this.nftEntryResponse.LastAcceptedBidAmountNanos > 0;
    this.changeDetector.detectChanges();
    setTimeout(() => {
      // Stop shimmer
      this.loadingEditionDetails = false;
    }, 350);
  }

  ViewUnlockableContent() {
    this.modalService.show(UnlockContentModalComponent, {
      class: "modal-dialog-centered nft_placebid_modal_bx nft_placebid_modal_bx_right modal-lg",
      initialState: { decryptableNFTEntryResponses: this.decryptableNFTEntryResponses },
    });
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
        this.nftBidPlaced.emit();
      }
    });
  }
  onBidCancel = (event: any): void => {
    const numberOfBids = this.nftBidData.BidEntryResponses.length;
    if (this.hasUserPlacedBids() && numberOfBids > 0) {
      if (numberOfBids > 1) {
        this.multipleBidsCancellation.emit({
          cancellableBids: this.nftBidData.BidEntryResponses,
          postHashHex: this.postContent.PostHashHex,
        });
      } else {
        this.singleBidCancellation.emit({
          postHashHex: this.postContent.PostHashHex,
          serialNumber: this.nftBidData.BidEntryResponses[0].SerialNumber,
          bidAmountNanos: 0,
        });
      }
    }
  };
  hasUserPlacedBids(): boolean {
    const pastBid = this.nftBidData.BidEntryResponses.find((bidEntry: NFTBidEntryResponse) => {
      return bidEntry.PublicKeyBase58Check === this.globalVars.loggedInUser?.PublicKeyBase58Check;
    });
    return pastBid ? true : false;
  }
  openBuyNowModal(event: any) {
    //   is not an ETH nft
    if (this.postContent?.PostExtraData["isEthereumNFT"] === false) {
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
          this.nftBidPlaced.emit();
        }
      });
    }
  }

  sellYourBid() {
    this.sellNFT.emit();
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
        this.setSerialNumberToUse();
        // Insert selected ser into variable
        // Insert selected ser into variable
        this.nftEntryResponses.forEach((item) => {
          if (item.SerialNumber == this.editionNumber) {
            console.log("Found" + this.editionNumber);
            this.nftEntryResponse = item;
          }
        });

        // Update buy now related stuff
        this.updateBuyNow();

        this.loadingEditionDetails = true;
        // Update edition specifics
        this.updateEditionSpecificLogic();

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
      this.editionNumber = this.nftEntryResponses[0].SerialNumber;
    }
  }
  getRouterLink(val: any): any {
    return val;
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
  hasNFTsOnSale(): boolean {
    return (
      this.postContent.IsNFT &&
      !!this.nftEntryResponses?.filter(
        (nftEntryResponse) =>
          nftEntryResponse.IsForSale &&
          nftEntryResponse.OwnerPublicKeyBase58Check === this.globalVars.loggedInUser?.PublicKeyBase58Check
      )?.length
    );
  }
  openCreateNFTAuctionModal(event): void {
    let createNftAuctionDetails = this.modalService.show(CreateNftAuctionModalComponent, {
      class:
        "modal-dialog-centered nft_placebid_modal_bx  nft_placebid_modal_bx_right nft_placebid_modal_bx_right modal-lg",
      initialState: { post: this.postContent, nftEntryResponses: this.nftEntryResponses, isEthNFT: false, tokenId: "" },
    });
    const onHiddenEvent = createNftAuctionDetails.onHidden.pipe(take(1));
    onHiddenEvent.subscribe((response) => {
      if (response === "nft auction started") {
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
        post: this.postContent,
        nftEntryResponses: this.nftEntryResponses,
        isEthNFT: true,
        tokenId: this.token_id,
      },
    });
  }
  closeYourAuction() {
    this.closeAuction.emit();
    //this.closeAuction.emit();
  }
  async closeYourETHAuction() {
    const link = new Link(environment.imx.ROPSTEN_LINK_URL);
    await link.cancel({
      orderId: this.sellOrderId,
    });
    // give the owner the option to list nft for sale again. you need to change it to false
    this.globalVars.isEthereumNFTForSale = false;

    this.globalVars.ethNFTSellerWalletAddress = "-";
    this.globalVars.ethNFTSellerPrice = "-";
    this.globalVars.ethNFTSellerTimestamp = "-";
  }
}
