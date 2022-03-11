import { Component, OnInit, Input } from "@angular/core";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { GlobalVarsService } from "../global-vars.service";
import { BidPlacedModalComponent } from "../bid-placed-modal/bid-placed-modal.component";
import { BackendApiService, NFTEntryResponse, PostEntryResponse } from "../backend-api.service";
import * as _ from "lodash";
import { Router } from "@angular/router";
import { InfiniteScroller } from "../infinite-scroller";
import { IAdapter, IDatasource } from "ngx-ui-scroll";
import { GoogleAnalyticsService } from "../google-analytics.service";
import { MixpanelService } from "../mixPanel.service";

@Component({
  selector: "place-bid-modal",
  templateUrl: "./place-bid-modal.component.html",
  styleUrls: ["./place-bid-modal.component.scss"],
})
export class PlaceBidModalComponent implements OnInit {
  static PAGE_SIZE = 50;
  static BUFFER_SIZE = 10;
  static WINDOW_VIEWPORT = false;
  static PADDING = 0.5;

  @Input() postHashHex: string;
  @Input() post: PostEntryResponse;
  @Input() clickedPlaceABid: boolean;
  @Input() isBuyNow: boolean;
  bidAmountDESO: number;
  bidAmountUSD: string;
  selectedSerialNumber: NFTEntryResponse = null;
  availableCount: number;
  //   availableSerialNumbers: NFTEntryResponse[];
  availableSerialNumbers: any;
  biddableSerialNumbers: NFTEntryResponse[];
  highBid: number = null;
  lowBid: number = null;
  minBid: number = null;
  loading = true;
  isSelectingSerialNumber = true;
  saveSelectionDisabled = false;
  showSelectedSerialNumbers = false;
  placingBids: boolean = false;
  errors: string;

  constructor(
    private analyticsService: GoogleAnalyticsService,
    public globalVars: GlobalVarsService,
    private backendApi: BackendApiService,
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private mixPanel: MixpanelService,
    private router: Router
  ) {}

  //   ngOnInit(): void {
  //     this.backendApi
  //       .GetNFTCollectionSummary(
  //         this.globalVars.localNode,
  //         this.globalVars.loggedInUser.PublicKeyBase58Check,
  //         this.post.PostHashHex
  //       )
  //       .subscribe((res) => {
  //         this.availableSerialNumbers = _.values(res.SerialNumberToNFTEntryResponse).sort(
  //           (a, b) => a.SerialNumber - b.SerialNumber
  //         );
  //         this.availableCount = res.NFTCollectionResponse.PostEntryResponse.NumNFTCopiesForSale;
  //         this.biddableSerialNumbers = this.availableSerialNumbers.filter(
  //           (nftEntryResponse) =>
  //             nftEntryResponse.OwnerPublicKeyBase58Check !== this.globalVars.loggedInUser.PublicKeyBase58Check
  //         );
  //       })
  //       .add(() => (this.loading = false));

  //     this.SendBidModalOpenedEvent();
  //   }

  ngOnInit(): void {
    console.log(this.clickedPlaceABid);
    this.backendApi
      .GetNFTCollectionSummary(
        this.globalVars.localNode,
        this.globalVars.loggedInUser.PublicKeyBase58Check,
        this.post.PostHashHex
      )
      .subscribe((res) => {
        let resObjJSON = JSON.stringify(res.SerialNumberToNFTEntryResponse);
        let resObj = JSON.parse(resObjJSON);

        console.log(res);
        // console.log(resObj);
        let objValues = Object.values(resObj);
        console.log(objValues);

        // this.availableSerialNumbers = _.values(res.SerialNumberToNFTEntryResponse).sort(
        this.availableSerialNumbers = objValues.sort(
          (a: { SerialNumber: number }, b: { SerialNumber: number }) => a.SerialNumber - b.SerialNumber
        );

        let availableSerialNumbersJSON = JSON.stringify(this.availableSerialNumbers);
        let availableSerialNumbersObj = JSON.parse(availableSerialNumbersJSON);

        // console.log(` ------------------ type of availableSerialNumbers ${typeof this.availableSerialNumbers}`);
        // console.log(` ------------------ availableSerialNumbersJSON ${availableSerialNumbersJSON}`);
        // console.log(` ------------------ availableSerialNumbersObj ${availableSerialNumbersObj.length}`);

        // // log each object in the array since you cannot with availableSerialNumbersObj since it logs [object Object]
        // for (var i = 0; i < availableSerialNumbersObj.length; i++) {
        //   console.log(availableSerialNumbersObj[i]);
        // }

        this.availableCount = res.NFTCollectionResponse.PostEntryResponse.NumNFTCopiesForSale;
        // if the nftEntryResponse OwnerPublicKeyBase58Check doesn't equal the logged in user then you can bid
        this.biddableSerialNumbers = availableSerialNumbersObj.filter(
          (nftEntryResponse) =>
            nftEntryResponse.OwnerPublicKeyBase58Check !== this.globalVars.loggedInUser.PublicKeyBase58Check
        );
      })
      .add(() => (this.loading = false));

    this.SendBidModalOpenedEvent();
  }
  SendBidModalOpenedEvent() {
    this.analyticsService.eventEmitter("bid_modal_opened", "usage", "activity", "click", 10);
  }
  updateBidAmountUSD(desoAmount) {
    this.bidAmountUSD = this.globalVars.nanosToUSDNumber(desoAmount * 1e9).toFixed(2);
    this.setErrors();
  }

  updateBidAmountDESO(usdAmount) {
    this.bidAmountDESO = Math.trunc(this.globalVars.usdToNanosNumber(usdAmount)) / 1e9;
    this.setErrors();
  }

  setErrors(): void {
    const bidAmountExceedsBalance = this.bidAmountDESO * 1e9 > this.globalVars.loggedInUser.BalanceNanos;
    this.errors =
      !this.bidAmountDESO && this.selectedSerialNumber.MinBidAmountNanos === 0
        ? "You must bid more than 0 DESO.\n\n"
        : "";
    this.errors += !this.selectedSerialNumber ? "You must select an edition to bid.\n\n" : "";
    this.errors += bidAmountExceedsBalance ? `You do not have ${this.bidAmountDESO} DESO to fulfill this bid.\n\n` : "";
    this.errors +=
      this.selectedSerialNumber?.MinBidAmountNanos > this.bidAmountDESO * 1e9
        ? `Your bid of ${this.bidAmountDESO} does not meet the minimum bid requirement of ${this.globalVars.nanosToDeSo(
            this.selectedSerialNumber.MinBidAmountNanos
          )} DESO (${this.globalVars.nanosToUSD(this.selectedSerialNumber.MinBidAmountNanos, 2)})\n\n`
        : "";
  }

  placeBid() {
    this.setErrors();
    if (this.errors) {
      return;
    }
    this.saveSelectionDisabled = true;
    this.placingBids = true;
    this.backendApi
      .CreateNFTBid(
        this.globalVars.localNode,
        this.globalVars.loggedInUser.PublicKeyBase58Check,
        this.post.PostHashHex,
        this.selectedSerialNumber.SerialNumber,
        Math.trunc(this.bidAmountDESO * 1e9),
        this.globalVars.defaultFeeRateNanosPerKB
      )
      .subscribe(
        (res) => {
          // Hide this modal and open the next one.
          this.bsModalRef.hide();
          this.modalService.show(BidPlacedModalComponent, {
            class: "modal-dialog-centered modal-dialog-bottom rt_popups modal-sm",
          });
          this.modalService.setDismissReason("bid placed");
          this.mixPanel.track16("Bid Placed");
        },
        (err) => {
          console.error(err);
          this.globalVars._alertError(this.backendApi.parseMessageError(err));
        }
      )
      .add(() => {
        this.placingBids = false;
        this.saveSelectionDisabled = false;
      });
  }

  navigateToBuyDESO(): void {
    this.bsModalRef.hide();
    this.router.navigate(["/" + this.globalVars.RouteNames.BUY_DESO]);
  }

  saveSelection(): void {
    if (!this.saveSelectionDisabled) {
      this.isSelectingSerialNumber = false;
      this.showSelectedSerialNumbers = true;
      this.highBid = this.selectedSerialNumber.HighestBidAmountNanos;
      this.lowBid = this.selectedSerialNumber.LowestBidAmountNanos;
      this.minBid = this.selectedSerialNumber.MinBidAmountNanos;
      this.setErrors();
    }
  }

  selectSerialNumber(idx: number) {
    this.selectedSerialNumber = this.availableSerialNumbers.find((sn) => sn.SerialNumber === idx);
    this.saveSelection();
  }

  deselectSerialNumber() {
    if (this.placingBids) {
      return;
    }
    this.selectedSerialNumber = null;
    this.showSelectedSerialNumbers = false;
    this.highBid = null;
    this.lowBid = null;
    this.setErrors();
  }

  infiniteScroller: InfiniteScroller = new InfiniteScroller(
    PlaceBidModalComponent.PAGE_SIZE,
    this.getPage.bind(this),
    PlaceBidModalComponent.WINDOW_VIEWPORT,
    PlaceBidModalComponent.BUFFER_SIZE,
    PlaceBidModalComponent.PADDING
  );
  datasource: IDatasource<IAdapter<any>> = this.infiniteScroller.getDatasource();
  lastPage = null;

  getPage(page: number) {
    if (this.lastPage != null && page > this.lastPage) {
      return [];
    }
    const startIdx = page * PlaceBidModalComponent.PAGE_SIZE;
    const endIdx = (page + 1) * PlaceBidModalComponent.PAGE_SIZE;

    return new Promise((resolve, reject) => {
      resolve(this.biddableSerialNumbers.slice(startIdx, Math.min(endIdx, this.biddableSerialNumbers.length)));
    });
  }
}
