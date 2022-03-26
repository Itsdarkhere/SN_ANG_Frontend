import { Component, OnInit } from "@angular/core";
import { environment } from "src/environments/environment";
import { Link, ImmutableXClient, ImmutableMethodResults, ETHTokenType, ImmutableRollupStatus } from "@imtbl/imx-sdk";
import { GlobalVarsService } from "../../global-vars.service";
import { ConstantPool } from "@angular/compiler";

@Component({
  selector: "app-withdraw-eth",
  templateUrl: "./withdraw-eth.component.html",
  styleUrls: ["./withdraw-eth.component.scss"],
})
export class WithdrawEthComponent implements OnInit {
  withdrawAmount: any;
  pendingWithdrawalsResponse: any;
  pendingWithdrawals: any;
  readyWithdrawalsResponse: any;
  readyWithdrawals: any;
  completeWithdrawalResponse: any;
  completeWithdrawalSuccess = false;

  constructor(public globalVars: GlobalVarsService) {}

  link = new Link(environment.imx.MAINNET_LINK_URL);

  async ngOnInit(): Promise<void> {
    await this.checkPendingWithdrawals();
    await this.checkReadyWithdrawals();
    // uncomment for testing
    // console.log(" ----------------- on init function done ---------------- ");
    // this.pendingWithdrawals = false;
    // this.readyWithdrawals = false;
    // this.completeWithdrawalSuccess = false;
  }

  async prepareWithdrawButtonClicked() {
    this.withdrawAmount = (<HTMLInputElement>document.getElementById("ethWithdrawAmount")).value;
    if (
      this.withdrawAmount === "" ||
      !this.withdrawAmount ||
      this.withdrawAmount === undefined ||
      this.withdrawAmount === "0"
    ) {
      this.globalVars._alertError("Please enter an amount greater then 0.");
      return;
    }
    console.log(this.withdrawAmount);
    await this.link.prepareWithdrawal({
      type: ETHTokenType.ETH,
      amount: this.withdrawAmount,
    });
    localStorage.setItem("imxDepositAmount", this.withdrawAmount);

    // setTimeout(() => {
    //   this.checkPendingWithdrawals();
    // }, 1000);
    await this.checkPendingWithdrawals();
  }

  async checkPendingWithdrawals() {
    this.pendingWithdrawalsResponse = await this.globalVars.imxClient.getWithdrawals({
      user: this.globalVars.imxWalletAddress,
      rollup_status: ImmutableRollupStatus.included,
    });
    this.pendingWithdrawalsResponse = this.pendingWithdrawalsResponse["result"];
    if (this.pendingWithdrawalsResponse.length === 0) {
      console.log("There are no pending withdrawals");
      this.pendingWithdrawals = false;

      //   return new Promise<void>(function (resolve, reject) {
      //     resolve();
      //   });
    } else {
      console.log("There are pending withdrawals");
      this.pendingWithdrawals = true;
      this.withdrawAmount = localStorage.getItem("imxDepositAmount");

      //   return new Promise<void>(function (resolve, reject) {
      //     resolve();
      //   });
    }
  }

  async checkReadyWithdrawals() {
    this.readyWithdrawalsResponse = await this.globalVars.imxClient.getWithdrawals({
      user: this.globalVars.imxWalletAddress,
      rollup_status: ImmutableRollupStatus.confirmed,
      withdrawn_to_wallet: false,
    });
    this.readyWithdrawalsResponse = this.readyWithdrawalsResponse["result"];
    console.log(this.readyWithdrawalsResponse);
    if (this.readyWithdrawalsResponse.length === 0) {
      console.log("There are no withdrawals ready");
      this.readyWithdrawals = false;

      //   return new Promise<void>(function (resolve, reject) {
      //     resolve();
      //   });
    } else {
      for (var i = 0; i < this.readyWithdrawalsResponse.length; i++) {
        if (this.readyWithdrawalsResponse[i]["token"]["type"] === "ERC20") {
          console.log("There are withdrawals ready");
          this.readyWithdrawals = true;
          this.withdrawAmount = localStorage.getItem("imxDepositAmount");
          break;
        } else {
          console.log("There are no withdrawals ready");
          this.readyWithdrawals = false;
        }
      }

      //   return new Promise<void>(function (resolve, reject) {
      //     resolve();
      //   });
    }
  }

  async completeWithdrawal() {
    this.completeWithdrawalResponse = await this.link.completeWithdrawal({
      type: ETHTokenType.ETH,
    });
    if (this.completeWithdrawalResponse["transactionId"]) {
      this.completeWithdrawalSuccess = true;
      this.withdrawAmount = localStorage.getItem("imxDepositAmount");
    } else {
      this.completeWithdrawalSuccess = false;
    }
  }

  openLink(link: string) {
    window.open(link, "_blank");
  }

  withdrawAgain() {
    this.withdrawAmount = localStorage.removeItem("imxDepositAmount");
    this.pendingWithdrawals = false;
    this.readyWithdrawals = false;
    this.completeWithdrawalSuccess = false;
  }
}
