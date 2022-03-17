import { Component, Input } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { BsModalService } from "ngx-bootstrap/modal";
import { GlobalVarsService } from "../global-vars.service";
import { BackendApiService, NFTEntryResponse, PostEntryResponse } from "../backend-api.service";
import { concatMap, last, map } from "rxjs/operators";
import { of } from "rxjs";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";

import { Link, ImmutableXClient, ImmutableMethodResults, MintableERC721TokenType } from "@imtbl/imx-sdk";

@Component({
  selector: "app-cancel-nft-auction-modal",
  templateUrl: "./cancel-nft-auction-modal.component.html",
  styleUrls: ["./cancel-nft-auction-modal.component.scss"],
})
export class CancelNftAuctionModalComponent {
  @Input() sellOrderId: string;

  link = new Link(environment.imx.ROPSTEN_LINK_URL);
  cancelEthNFTSuccess: boolean = false;

  constructor(
    private backendApi: BackendApiService,
    public globalVars: GlobalVarsService,
    public bsModalRef: BsModalRef,
    private modalService: BsModalService,
    private router: Router
  ) {}

  async cancelEthNFT() {
    const link = new Link(environment.imx.ROPSTEN_LINK_URL);
    await link.cancel({
      orderId: this.sellOrderId,
    });

    this.cancelEthNFTSuccess = true;

    // give the owner the option to list nft for sale again. you need to change it to false
    this.globalVars.isEthereumNFTForSale = false;
  }

  cancelEthSaleSuccess() {
    this.bsModalRef.hide();
    location.reload();
  }
}
