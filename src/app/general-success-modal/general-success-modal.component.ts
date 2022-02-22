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

import { environment } from "src/environments/environment";
import { Link, ImmutableXClient, ImmutableMethodResults, ETHTokenType, ImmutableRollupStatus } from "@imtbl/imx-sdk";
import { ethers } from "ethers";

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

  @Input() header: string;
  @Input() text: string;
  @Input() buttonText: string;
  @Input() buttonClickedAction: string;

  depositButtonClickedStatus: boolean = false;
  buyEthButtonClickedStatus: boolean = false;
  depositAmount: any;

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

  link = new Link(environment.imx.ROPSTEN_LINK_URL);

  ngOnInit(): void {
    this.SendBidModalOpenedEvent();
  }

  SendBidModalOpenedEvent() {
    this.analyticsService.eventEmitter("bid_modal_opened", "usage", "activity", "click", 10);
  }

  async linkSetup(): Promise<void> {
    // this.buyEthButtonClickedStatus = true;
    this.globalVars.imxWalletConnected = true;
    // console.log(` ----------------------- client is ${JSON.stringify(this.globalVars.imxClient)}`);
    // const res = await this.link.setup({});
    // this.globalVars.imxWalletConnected = true;
    // this.globalVars.imxWalletAddress = res.address;
    // console.log(
    //   ` ----------------------- walletConnected is ${this.globalVars.imxWalletConnected} ----------------------- `
    // );
    // console.log(` ----------------------- walletAddress ${this.globalVars.imxWalletAddress} ----------------------- `);

    // await this.getImxBalance(this.globalVars.imxWalletAddress);

    // localStorage.setItem("address", res.address);
  }

  async getImxBalance(walletAddressInput: string): Promise<void> {
    this.globalVars.imxBalance = await this.globalVars.imxClient.getBalance({
      user: walletAddressInput,
      tokenAddress: "eth",
    });
    this.globalVars.imxBalance = this.globalVars.imxBalance.balance.toString();
    this.globalVars.imxBalance = ethers.utils.formatEther(this.globalVars.imxBalance);
    console.log(` ----------------------- balance is ${this.globalVars.imxBalance} ETH ----------------------- `);
  }

  async generalSuccessModalButtonClicked() {
    if (this.buttonClickedAction === "profileRoute") {
      this.router.navigate(["/u/" + this.globalVars?.loggedInUser?.ProfileEntryResponse.Username]);
      this.bsModalRef.hide();
    } else if (this.buttonClickedAction === "connectWallet") {
      await this.linkSetup();
    }
  }

  wantToDepositButtonClicked() {
    this.depositButtonClickedStatus = true;
  }

  async depositButtonClicked() {
    this.depositAmount = (<HTMLInputElement>document.getElementById("ethDepositAmount")).value;
    console.log(this.depositAmount);
    await this.link.deposit({
      type: ETHTokenType.ETH,
      amount: this.depositAmount,
    });
    this.bsModalRef.hide();
    this.globalVars._alertSuccess(
      "Successfully deposited ETH to Imx. Please give a couple of hours for your Imx balance to update."
    );
  }

  wantToBuyEthButtonClicked() {
    this.buyEthButtonClickedStatus = true;
  }

  async buyEthButtonClicked() {
    await this.link.fiatToCrypto({});
    this.bsModalRef.hide();
    this.globalVars._alertSuccess(
      "Successfully purchased ETH on Imx with Moonpay. Please give a couple of hours for your Imx balance to update."
    );
  }
}
