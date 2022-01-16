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

@Component({
  selector: "app-discovery",
  templateUrl: "./discovery.component.html",
  styleUrls: ["./discovery.component.scss"],
})
export class DiscoveryComponent implements OnInit {
  @Input() post: PostEntryResponse;
  nftBidData: NFTBidData;
  bids: NFTBidEntryResponse[];
  hightestBidOwner: any = {};
  myBidsLength: number;
  hasImageLoaded = false;
  constructor(
    //private route: DiscoveryRoute,
    private router: Router,
    public modalService: BsModalService,
    public globalVars: GlobalVarsService,
    public backendApi: BackendApiService
  ) {}
  imageLoaded() {
    this.hasImageLoaded = true;
  }
  ngOnInit(): void {}
  ngOnChanges(changes: SimpleChanges) {
    if (changes.post) {
      if (this.post.PostHashHex) {
        this.loadBidData();
      }
    }
  }
  blocked() {
    //console.log("nicce");
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
    event.stopPropagation();
    const modalDetails = this.modalService.show(PlaceBidModalComponent, {
      class: "modal-dialog-centered nft_placebid_modal_bx  modal-lg",
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
          if (this.nftBidData.BidEntryResponses?.length > 0) {
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
      );
  }
}
