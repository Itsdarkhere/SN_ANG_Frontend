import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { GlobalVarsService } from "../global-vars.service";
import { BackendApiService, NFTEntryResponse, PostEntryResponse } from "../backend-api.service";
import * as _ from "lodash";
import { Router } from "@angular/router";
// import { InfiniteScroller } from "../infinite-scroller";
import { IAdapter, IDatasource } from "ngx-ui-scroll";
import { Location } from "@angular/common";
import { ToastrService } from "ngx-toastr";
import { CommentModalComponent } from "../comment-modal/comment-modal.component";

import { environment } from "src/environments/environment";
import { Link, ImmutableXClient, ImmutableMethodResults, ETHTokenType, ImmutableRollupStatus } from "@imtbl/imx-sdk";
import { ethers } from "ethers";
import { AppRoutingModule, RouteNames } from "../app-routing.module";

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
    public globalVars: GlobalVarsService,
    private backendApi: BackendApiService,
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private router: Router,
    private toastr: ToastrService,
    private location: Location
  ) {}

  link = new Link(environment.imx.ROPSTEN_LINK_URL);

  ngOnInit(): void {}

  async linkSetup(): Promise<void> {
    const publicApiUrl: string = environment.imx.ROPSTEN_ENV_URL ?? "";
    this.globalVars.imxClient = await ImmutableXClient.build({ publicApiUrl });
    console.log(` ----------------------- client is ${JSON.stringify(this.globalVars.imxClient)}`);
    const res = await this.link.setup({});
    this.globalVars.imxWalletConnected = true;
    this.globalVars.imxWalletAddress = res.address;
    this.globalVars.ethWalletAddresShort = this.globalVars.imxWalletAddress.slice(0, 15) + "...";
    console.log(
      ` ----------------------- walletConnected is ${this.globalVars.imxWalletConnected} ----------------------- `
    );
    console.log(` ----------------------- walletAddress ${this.globalVars.imxWalletAddress} ----------------------- `);

    await this.getImxBalance(this.globalVars.imxWalletAddress);

    localStorage.setItem("address", res.address);

    // Add key to postgres
    // This should both create a new one or replace an existing one.
    this.addIMXPublicKeyToProfileDetails();
    // pass this.globalVars.imxWalletAddress into postgres function to associate with DESO public key this.globalVars.loggedInUser.PublicKeyBase58Check
    // for example, fetch(https://supernovas.app/api/updateDesoProfile, body)
    // body = {"desoPublicKey": "this.globalVars.loggedInUser.PublicKeyBase58Check", "imxWalletAddress": "this.globalVars.imxWalletAddress"}
  }

  addIMXPublicKeyToProfileDetails() {
    if (!this.globalVars.loggedInUser.PublicKeyBase58Check) {
      return;
    }
    this.backendApi
      .InsertOrUpdateIMXPK(
        this.globalVars.localNode,
        this.globalVars.loggedInUser.PublicKeyBase58Check,
        this.globalVars.imxWalletAddress
      )
      .subscribe(
        (res) => {
          console.log(res);
        },
        (err) => {
          console.log(err);
        }
      );
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
    if (this.buttonClickedAction === "general") {
      this.bsModalRef.hide();
    } else if (this.buttonClickedAction === "profileRoute") {
      this.router.navigate(["/u/" + this.globalVars?.loggedInUser?.ProfileEntryResponse.Username]);
      this.bsModalRef.hide();
    } else if (this.buttonClickedAction === "connectWallet") {
      await this.linkSetup();
    }
  }

  wantToDepositButtonClicked() {
    this.depositButtonClickedStatus = true;
    this.globalVars.wantToDepositEth = true;
    this.bsModalRef.hide();
    this.router.navigate([RouteNames.IMX_PAGE]);
  }

  wantToBuyEthButtonClicked() {
    this.buyEthButtonClickedStatus = true;
    this.globalVars.wantToBuyEth = true;
    this.bsModalRef.hide();
    console.log(` want to buy clicked from modal ${this.globalVars.wantToBuyEth}`);
    this.router.navigate([RouteNames.IMX_PAGE]);
  }

  clickOutside() {
    window.location.reload();
  }
}
