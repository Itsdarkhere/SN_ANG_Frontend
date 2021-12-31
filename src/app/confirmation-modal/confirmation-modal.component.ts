import { Component, Input, OnInit } from "@angular/core";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { of } from "rxjs";
import { concatMap, last, map } from "rxjs/operators";
import { BackendApiService } from "../backend-api.service";
import { GlobalVarsService } from "../global-vars.service";

@Component({
  selector: "app-confirmation-modal",
  templateUrl: "./confirmation-modal.component.html",
  styleUrls: ["./confirmation-modal.component.scss"],
})
export class ConfirmationModalComponent {
  @Input() title: string;
  @Input() text: string;
  @Input() buttonText: string;

  closingAuction: boolean = false;

  constructor(
    public bsModalRef: BsModalRef,
    private modalService: BsModalService,
    private backendApi: BackendApiService,
    private globalVars: GlobalVarsService
  ) {}

  confirm() {
    this.bsModalRef.hide();
    this.modalService.setDismissReason("confirmed");
  }
}
