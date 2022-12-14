import { Component, OnInit, Input } from "@angular/core";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { NFTBidEntryResponse, BackendApiService } from "../backend-api.service";
import { GlobalVarsService } from "../global-vars.service";
import { MixpanelService } from "../mixpanel.service";

@Component({
  selector: "app-cancel-bid-modal",
  templateUrl: "./cancel-bid-modal.component.html",
  styleUrls: ["./cancel-bid-modal.component.scss"],
})
export class CancelBidModalComponent implements OnInit {
  @Input() bidEntryResponses: NFTBidEntryResponse[];
  @Input() postHashHex: string;

  selectedBid: NFTBidEntryResponse = null;

  constructor(
    public bsModalRef: BsModalRef,
    public globalVars: GlobalVarsService,
    private backendApi: BackendApiService,
    private mixPanel: MixpanelService,
    private modalService: BsModalService
  ) {}

  ngOnInit(): void {}

  selectSerialNumber(bid: NFTBidEntryResponse) {
    this.selectedBid = this.bidEntryResponses.find((sn) => sn.SerialNumber === bid.SerialNumber);
    this.bidEntryResponses.forEach((bidEntry: NFTBidEntryResponse) => (bidEntry.selected = false));
    bid.selected = !bid.selected;
    this.bidEntryResponses = [...this.bidEntryResponses];
  }

  checkIfBidWasSelected(): boolean {
    const selectedBid = this.bidEntryResponses.find((bid: NFTBidEntryResponse) => bid.selected === true);
    return selectedBid ? true : false;
  }

  cancelBid(): void {
    this.backendApi
      .CreateNFTBid(
        this.globalVars.localNode,
        this.globalVars.loggedInUser.PublicKeyBase58Check,
        this.postHashHex,
        this.selectedBid.SerialNumber,
        0,
        this.globalVars.defaultFeeRateNanosPerKB
      )
      .subscribe(
        () => {
          this.bsModalRef.hide();
          this.modalService.setDismissReason("Bids cancelled");
          this.mixPanel.track14("Cancel Bid");
        },
        (err) => {
          console.error(err);
          this.mixPanel.track14("Cancel Bid ERROR");
        }
      );
  }
}
