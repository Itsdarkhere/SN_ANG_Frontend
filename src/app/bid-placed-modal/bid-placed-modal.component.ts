import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { GlobalVarsService } from "../global-vars.service";

@Component({
  selector: "bid-placed-modal",
  templateUrl: "./bid-placed-modal.component.html",
})
export class BidPlacedModalComponent {
  constructor(
    public bsModalRef: BsModalRef,
    private router: Router,
    public modalService: BsModalService,
    public globalVars: GlobalVarsService
  ) {}

  onExploreClicked() {
    this.globalVars.exploreShowcase(this.bsModalRef, this.modalService);
  }
  viewBids() {
    this.bsModalRef.hide();
    this.router.navigate(["/activity"]);
  }
  hideAndRefresh() {
    this.bsModalRef.hide();
    this.modalService.setDismissReason("Success");
  }
}
