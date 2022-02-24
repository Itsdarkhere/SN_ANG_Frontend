import { Component, OnInit, Input, HostListener } from "@angular/core";
import { BackendApiService, ProfileEntryResponse } from "../backend-api.service";
import { GlobalVarsService } from "../global-vars.service";
import { Title } from "@angular/platform-browser";
import { RouteNames } from "../app-routing.module";
import { ActivatedRoute, Router } from "@angular/router";
import { environment } from "src/environments/environment";
import { BsModalService } from "ngx-bootstrap/modal";

import { ethers } from "ethers";
import { Link, ImmutableXClient, ImmutableMethodResults, ETHTokenType, ImmutableRollupStatus } from "@imtbl/imx-sdk";

@Component({
  selector: "app-imx-page",
  templateUrl: "./imx-page.component.html",
  styleUrls: ["./imx-page.component.scss"],
})
export class ImxPageComponent implements OnInit {
  globalVars: GlobalVarsService;

  // NEW UI
  tabDeposit = true;
  tabBuy = false;
  tabWithdraw = false;

  mobile = false;

  ethKeyCopied = false;

  imxWalletAddressShort: string;

  constructor(
    private backendApi: BackendApiService,
    private globalVarsService: GlobalVarsService,
    private titleService: Title,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.globalVars = globalVarsService;
  }

  tabBuyClick() {
    this.tabBuy = true;
    this.tabDeposit = false;
    this.tabWithdraw = false;
  }
  tabDepositClick() {
    this.tabBuy = false;
    this.tabDeposit = true;
    this.tabWithdraw = false;
  }
  tabWithdrawClick() {
    this.tabBuy = false;
    this.tabDeposit = false;
    this.tabWithdraw = true;
  }

  async ngOnInit() {
    this.setMobileBasedOnViewport();

    const publicApiUrl: string = environment.imx.ROPSTEN_ENV_URL ?? "";
    this.globalVars.imxClient = await ImmutableXClient.build({ publicApiUrl });
    if (localStorage.getItem("address")) {
      console.log(` ----------------- address in local storage is ${localStorage.getItem("address")}`);
      this.globalVars.imxWalletAddress = localStorage.getItem("address");
      console.log(` --------------- imxWalletAddress is ${this.globalVars.imxWalletAddress}`);
      this.getImxBalance(this.globalVars.imxWalletAddress);
    }

    this.imxWalletAddressShort = this.globalVars.imxWalletAddress.slice(0, 24) + "...";

    console.log(` want to deposit eth ${this.globalVars.wantToDepositEth}`);
    console.log(` want to buy eth ${this.globalVars.wantToBuyEth}`);

    if (this.globalVars.wantToDepositEth === true) {
      this.tabDepositClick();
    }
    if (this.globalVars.wantToBuyEth === true) {
      this.tabBuyClick();
    }
  }

  copyEthKey() {
    this.ethKeyCopied = true;
    this.globalVars._copyText(this.globalVars.imxWalletAddress);
    setTimeout(() => {
      this.ethKeyCopied = false;
    }, 1500);
  }

  setMobileBasedOnViewport() {
    this.mobile = this.globalVars.isMobile();
  }

  @HostListener("window:resize")
  onResize() {
    this.setMobileBasedOnViewport();
  }

  routeToBrowse() {
    this.router.navigate([RouteNames.BROWSE]);
  }

  async getImxBalance(walletAddressInput: string): Promise<void> {
    console.log(` ----------------------- imxClient is ${this.globalVars.imxClient} `);
    this.globalVars.imxBalance = await this.globalVars.imxClient.getBalance({
      user: walletAddressInput,
      tokenAddress: "eth",
    });
    this.globalVars.imxBalance = this.globalVars.imxBalance.balance.toString();
    this.globalVars.imxBalance = ethers.utils.formatEther(this.globalVars.imxBalance);
    console.log(` ----------------------- balance is ${this.globalVars.imxBalance} ETH ----------------------- `);
  }

  linkLogOut() {
    console.log("log button hit --------------------");
    localStorage.removeItem("address");
    this.globalVars.imxWalletAddress = "undefined";
    this.globalVars.imxWalletConnected = false;
    this.router.navigate([RouteNames.WALLET]);
  }
}
