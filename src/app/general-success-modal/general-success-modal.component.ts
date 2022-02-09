import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { GlobalVarsService } from "../global-vars.service";
import { BackendApiService, NFTEntryResponse, PostEntryResponse } from "../backend-api.service";
import * as _ from "lodash";
import { Router } from "@angular/router";
// import { InfiniteScroller } from "../infinite-scroller";
import { IAdapter, IDatasource } from "ngx-ui-scroll";
import { GoogleAnalyticsService } from "../google-analytics.service";
import { Location } from "@angular/common";
import { ToastrService } from "ngx-toastr";
import { CommentModalComponent } from "../comment-modal/comment-modal.component";

@Component({
  selector: "app-general-success-modal",
  templateUrl: "./general-success-modal.component.html",
  styleUrls: ["./general-success-modal.component.scss"],
})
export class GeneralSuccessModalComponent implements OnInit {
  static PAGE_SIZE = 50;
  static BUFFER_SIZE = 10;
  static WINDOW_VIEWPORT = false;
  static PADDING = 0.5;

  // //   @Input() bsModalRef: BsModalRef;
  // @Input() postHashHex: string;
  // @Input() post: PostEntryResponse;
  // @Input() selectedSerialNumber: NFTEntryResponse;
  // @Output() closeModal = new EventEmitter<any>();
  // bidAmountDESO: number;
  // bidAmountUSD: string;
  // //   selectedSerialNumber: NFTEntryResponse = null;
  // availableCount: number;
  // availableSerialNumbers: NFTEntryResponse[];
  // biddableSerialNumbers: NFTEntryResponse[];
  // highBid: number = null;
  // lowBid: number = null;
  // minBid: number = null;
  // loading = true;
  // isSelectingSerialNumber = true;
  // saveSelectionDisabled = false;
  // showSelectedSerialNumbers = false;
  // placingBids: boolean = false;
  // errors: string;
  // buyingNFT: boolean = false;
  // buyNowNftSuccess: boolean = false;

  @Input() header: string;
  @Input() text: string;
  @Input() buttonText: string;

  constructor(
    private analyticsService: GoogleAnalyticsService,
    public globalVars: GlobalVarsService,
    private backendApi: BackendApiService,
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private router: Router,
    private toastr: ToastrService,
    private location: Location
  ) {}

  ngOnInit(): void {
    //   this.backendApi
    //     .GetNFTCollectionSummary(
    //       this.globalVars.localNode,
    //       this.globalVars.loggedInUser.PublicKeyBase58Check,
    //       this.post.PostHashHex
    //     )
    //     .subscribe((res) => {
    //       this.availableSerialNumbers = _.values(res.SerialNumberToNFTEntryResponse).sort(
    //         (a, b) => a.SerialNumber - b.SerialNumber
    //       );
    //       this.availableCount = res.NFTCollectionResponse.PostEntryResponse.NumNFTCopiesForSale;
    //       this.biddableSerialNumbers = this.availableSerialNumbers.filter(
    //         (nftEntryResponse) =>
    //           nftEntryResponse.OwnerPublicKeyBase58Check !== this.globalVars.loggedInUser.PublicKeyBase58Check
    //       );
    //     })
    //     .add(() => (this.loading = false));

    this.SendBidModalOpenedEvent();
  }

  SendBidModalOpenedEvent() {
    this.analyticsService.eventEmitter("bid_modal_opened", "usage", "activity", "click", 10);
  }

  generalSuccessModalButtonClicked() {
    this.router.navigate(["/u/" + this.globalVars?.loggedInUser?.ProfileEntryResponse.Username]);
    this.bsModalRef.hide();
  }

  // updateBidAmountUSD(desoAmount) {
  //   this.bidAmountUSD = this.globalVars.nanosToUSDNumber(desoAmount * 1e9).toFixed(2);
  //   this.setErrors();
  // }

  // updateBidAmountDESO(usdAmount) {
  //   this.bidAmountDESO = Math.trunc(this.globalVars.usdToNanosNumber(usdAmount)) / 1e9;
  //   this.setErrors();
  // }

  // setErrors(): void {
  //   const bidAmountExceedsBalance = this.bidAmountDESO * 1e9 > this.globalVars.loggedInUser.BalanceNanos;
  //   this.errors =
  //     !this.bidAmountDESO && this.selectedSerialNumber.MinBidAmountNanos === 0
  //       ? "You must bid more than 0 DESO.\n\n"
  //       : "";
  //   this.errors += !this.selectedSerialNumber ? "You must select an edition to bid.\n\n" : "";
  //   this.errors += bidAmountExceedsBalance ? `You do not have ${this.bidAmountDESO} DESO to fulfill this bid.\n\n` : "";
  //   this.errors +=
  //     this.selectedSerialNumber?.MinBidAmountNanos > this.bidAmountDESO * 1e9
  //       ? `Your bid of ${this.bidAmountDESO} does not meet the minimum bid requirement of ${this.globalVars.nanosToDeSo(
  //           this.selectedSerialNumber.MinBidAmountNanos
  //         )} DESO (${this.globalVars.nanosToUSD(this.selectedSerialNumber.MinBidAmountNanos, 2)})\n\n`
  //       : "";
  // }

  // buyNowNft() {
  //   console.log(this.globalVars.SerialNumber);

  //   this.buyNowNftSuccess = true;
  // }

  // quoteRepost(event, isQuote = true) {
  //   // Prevent the post navigation click from occurring.
  //   event.stopPropagation();

  //   if (!this.globalVars.loggedInUser) {
  //     // Check if the user has an account.
  //     this.globalVars.logEvent("alert : reply : account");
  //     this.globalVars._alertError("Cannot Quote repost, create account to post...");
  //   } else if (!this.globalVars.doesLoggedInUserHaveProfile()) {
  //     // Check if the user has a profile.
  //     this.globalVars.logEvent("alert : reply : profile");
  //     this.globalVars._alertError("Cannot Quote repost, create profile to post...");
  //   } else {
  //     const initialState = {
  //       // If we are quoting a post, make sure we pass the content so we don't repost a repost.
  //       parentPost: this.post,
  //       afterCommentCreatedCallback: null,
  //       isQuote,
  //     };
  //     if (!this.post) {
  //       this.globalVars._alertError("Cannot Quote repost, create profile to post...");
  //       return;
  //     }
  //     // If the user has an account and a profile, open the modal so they can comment.
  //     this.modalService.show(CommentModalComponent, {
  //       class: "modal-dialog-centered",
  //       initialState,
  //     });
  //   }
  // }

  // SendBidPlacedEvent() {
  //   this.analyticsService.eventEmitter("bid_placed", "usage", "activity", "transaction", 10);
  // }
  // navigateToBuyDESO(): void {
  //   this.bsModalRef.hide();
  //   this.router.navigate(["/" + this.globalVars.RouteNames.BUY_DESO]);
  // }
  // showToast(): void {
  //   const link = `/${this.globalVars.RouteNames.NFT}/${this.post.PostHashHex}`;
  //   this.toastr.show(`NFT Purchased<a href="${link}" class="toast-link cursor-pointer">View</a>`, null, {
  //     toastClass: "info-toast",
  //     enableHtml: true,
  //     positionClass: "toast-bottom-center",
  //   });
  // }

  // saveSelection(): void {
  //   if (!this.saveSelectionDisabled) {
  //     this.isSelectingSerialNumber = false;
  //     this.showSelectedSerialNumbers = true;
  //     this.highBid = this.selectedSerialNumber.HighestBidAmountNanos;
  //     this.lowBid = this.selectedSerialNumber.LowestBidAmountNanos;
  //     this.minBid = this.selectedSerialNumber.MinBidAmountNanos;
  //     this.setErrors();
  //   }
  // }

  // selectSerialNumber(idx: number) {
  //   this.selectedSerialNumber = this.availableSerialNumbers.find((sn) => sn.SerialNumber === idx);
  //   this.saveSelection();
  // }

  // deselectSerialNumber() {
  //   if (this.placingBids) {
  //     return;
  //   }
  //   this.selectedSerialNumber = null;
  //   this.showSelectedSerialNumbers = false;
  //   this.highBid = null;
  //   this.lowBid = null;
  //   this.setErrors();
  // }

  // infiniteScroller: InfiniteScroller = new InfiniteScroller(
  //   GeneralSuccessModalComponent.PAGE_SIZE,
  //   this.getPage.bind(this),
  //   GeneralSuccessModalComponent.WINDOW_VIEWPORT,
  //   GeneralSuccessModalComponent.BUFFER_SIZE,
  //   GeneralSuccessModalComponent.PADDING
  // );
  // datasource: IDatasource<IAdapter<any>> = this.infiniteScroller.getDatasource();
  // lastPage = null;

  // getPage(page: number) {
  //   if (this.lastPage != null && page > this.lastPage) {
  //     return [];
  //   }
  //   const startIdx = page * GeneralSuccessModalComponent.PAGE_SIZE;
  //   const endIdx = (page + 1) * GeneralSuccessModalComponent.PAGE_SIZE;

  //   return new Promise((resolve, reject) => {
  //     resolve(this.biddableSerialNumbers.slice(startIdx, Math.min(endIdx, this.biddableSerialNumbers.length)));
  //   });
  // }
}
