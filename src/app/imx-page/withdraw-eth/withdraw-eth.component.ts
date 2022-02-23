import { Component, OnInit } from "@angular/core";
import { environment } from "src/environments/environment";
import { Link, ImmutableXClient, ImmutableMethodResults, ETHTokenType, ImmutableRollupStatus } from "@imtbl/imx-sdk";
import { GlobalVarsService } from "../../global-vars.service";

@Component({
  selector: "app-withdraw-eth",
  templateUrl: "./withdraw-eth.component.html",
  styleUrls: ["./withdraw-eth.component.scss"],
})
export class WithdrawEthComponent implements OnInit {
  withdrawAmount: any;

  constructor(public globalVars: GlobalVarsService) {}

  link = new Link(environment.imx.ROPSTEN_LINK_URL);

  ngOnInit(): void {}
  openLink(link: string) {
    window.open(link, "_blank");
  }

  async withdrawButtonClicked() {
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
    this.globalVars._alertSuccess(
      "Successfully withdrawed ETH to Imx. Please give a couple of hours for your Imx balance to update."
    );
  }
}
