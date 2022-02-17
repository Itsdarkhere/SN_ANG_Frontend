import { Component, OnInit, Input } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { GlobalVarsService } from "../global-vars.service";

@Component({
  selector: "nft-modal-header",
  templateUrl: "./nft-modal-header.component.html",
  styleUrls: ["./nft-modal-header.component.scss"],
})
export class NftModalHeaderComponent implements OnInit {
  @Input() header: string;
  @Input() bsModalRef: BsModalRef;
  @Input() isBuyNow: boolean;
  @Input() clickedPlaceABid: boolean;
  @Input() clickedBuyNow: boolean;

  constructor(public globalVars: GlobalVarsService) {}

  ngOnInit(): void {
    console.log(this.clickedBuyNow);
    console.log(this.isBuyNow);
  }
}
