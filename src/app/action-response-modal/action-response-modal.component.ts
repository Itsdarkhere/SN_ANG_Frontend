import { animate, style, transition, trigger } from "@angular/animations";
import { Component, Input, OnInit } from "@angular/core";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";

@Component({
  selector: "app-action-response-modal",
  templateUrl: "./action-response-modal.component.html",
  styleUrls: ["./action-response-modal.component.scss"],
})
// Definately make this into a more generally usable modal
export class ActionResponseModalComponent implements OnInit {
  constructor(private bsModalRef: BsModalRef, private modalService: BsModalService) {}
  @Input() headingText: string;
  @Input() modalText: string;
  @Input() buttonOneText: string;
  ngOnInit(): void {}

  dissmissReasonOne() {
    this.bsModalRef.hide();
    this.modalService.setDismissReason("nft sold");
  }
  dissmissReasonTwo() {
    this.bsModalRef.hide();
    this.modalService.setDismissReason("nft sold");
  }
}
