import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import { Router } from "@angular/router";
import { NFTBidData, NFTBidEntryResponse, PostEntryResponse } from "src/app/backend-api.service";
import { GlobalVarsService } from "src/app/global-vars.service";
import { BsModalService } from "ngx-bootstrap/modal";
import { FeedPostImageModalComponent } from "src/app/feed/feed-post-image-modal/feed-post-image-modal.component";
import { BackendApiService } from "src/app/backend-api.service";
import { Subscription } from "rxjs";
import _ from "lodash";
import { PlaceBidModalComponent } from "src/app/place-bid-modal/place-bid-modal.component";
import { SharedDialogs } from "src/lib/shared-dialogs";
import { MixpanelService } from "src/app/mixpanel.service";
import { BuyNowModalComponent } from "src/app/buy-now-modal/buy-now-modal.component";

@Component({
  selector: "app-discovery",
  templateUrl: "./discovery.component.html",
  styleUrls: ["./discovery.component.scss"],
})
export class DiscoveryComponent implements OnInit {
  @Input() post: PostEntryResponse;
  @Input() mobile: boolean;
  nftBidData: NFTBidData;
  isBuyNow: boolean;
  bids: NFTBidEntryResponse[];
  hightestBidOwner: any = {};
  myBidsLength: number;
  hasContentLoaded = false;
  removeShimmer = true;
  backgroundImage: string;
  constructor(
    //private route: DiscoveryRoute,
    private router: Router,
    public modalService: BsModalService,
    public globalVars: GlobalVarsService,
    public backendApi: BackendApiService,
    private mixPanel: MixpanelService
  ) {}
  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.post) {
      if (this.post?.PostHashHex) {
        this.loadBidData();
        this.getNFTEntries();
      }
    }
  }
  blocked() {
    //console.log("nicce");
  }
  mapImageURLs(imgURL: string): string {
    if (imgURL.startsWith("https://i.imgur.com")) {
      return imgURL.replace("https://i.imgur.com", "https://images.bitclout.com/i.imgur.com");
    } else if (imgURL.startsWith("https://arweave.net/")) {
      // Build cloudflare imageString
      imgURL = "https://supernovas.app/cdn-cgi/image/width=500,height=500,fit=scale-down,quality=85/" + imgURL;
    }
    return imgURL;
  }

  openBuyNowModal(event: any) {
    if (!this.globalVars.loggedInUser?.ProfileEntryResponse) {
      SharedDialogs.showCreateProfileToPerformActionDialog(this.router, "buy now");
      return;
    }
    event.stopPropagation();
    const modalDetails = this.modalService.show(BuyNowModalComponent, {
      class: "modal-dialog-centered nft_placebid_modal_bx  modal-lg",
      initialState: {
        post: this.post,
        clickedBuyNow: true,
      },
    });

    const onHideEvent = modalDetails.onHide;
    onHideEvent.subscribe((response) => {
      if (response === "bid placed") {
        this.loadBidData();
        this.getNFTEntries();
      }
    });
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
  openPlaceBidModal(event: any) {
    if (!this.globalVars.loggedInUser?.ProfileEntryResponse) {
      SharedDialogs.showCreateProfileToPerformActionDialog(this.router, "place a bid");
      return;
    }
    this.mixPanel.track15("Open Place a Bid Modal");
    event.stopPropagation();
    const modalDetails = this.modalService.show(PlaceBidModalComponent, {
      class: "modal-dialog-centered  nft_placebid_modal_bx nft_placebid_modal_bx_right  modal-lg",
      initialState: { post: this.post },
    });

    const onHideEvent = modalDetails.onHide;
    onHideEvent.subscribe((response) => {
      if (response === "bid placed") {
        // Do something
      }
    });
  }
  viewNFT() {
    this.router.navigate(["/nft/" + this.post.PostHashHex], {
      queryParamsHandling: "merge",
    });
  }
  loadBidData(): Subscription {
    return this.backendApi
      .GetNFTBidsForNFTPost(
        this.globalVars.localNode,
        this.globalVars.loggedInUser?.PublicKeyBase58Check,
        this.post.PostHashHex
      )
      .subscribe(
        (res) => {
          this.nftBidData = res;
          if (this.nftBidData?.BidEntryResponses?.length > 0) {
            this.bids = this.nftBidData.BidEntryResponses.filter(
              (bidEntry) => bidEntry.BidAmountNanos <= bidEntry.BidderBalanceNanos
            );
            this.hightestBidOwner = _.maxBy(this.bids, "BidAmountNanos");

            this.myBidsLength = this.nftBidData.BidEntryResponses.filter(
              (bidEntry) => bidEntry.PublicKeyBase58Check === this.globalVars.loggedInUser?.PublicKeyBase58Check
            )?.length;
          }
        },
        (err) => {
          this.globalVars._alertError(err);
        }
      )
      .add(() => {
        this.delayLoading();
      });
  }

  getNFTEntries() {
    this.backendApi
      .GetNFTEntriesForNFTPost(
        this.globalVars.localNode,
        this.globalVars.loggedInUser?.PublicKeyBase58Check,
        this.post.PostHashHex
      )
      .subscribe((res) => {
        this.isBuyNow = res.NFTEntryResponses[0].IsBuyNow;
      });
  }

  // NFT profile had this implementation, while far from perfect it does work quite nicely there
  delayLoading() {
    if (this.post.PostExtraData["arweaveVideoSrc"]) {
      setTimeout(() => {
        this.hasContentLoaded = true;
      }, 1000);
    } else if (this.post.ImageURLs[0]) {
      setTimeout(() => {
        document.getElementById("discovery_top_sc").style.backgroundImage = "url(" + this.post.ImageURLs[0] + ")";
        this.hasContentLoaded = true;
      }, 1000);
    }
  }
}
