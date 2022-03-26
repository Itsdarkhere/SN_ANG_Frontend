import { Component, OnInit } from "@angular/core";
import { environment } from "src/environments/environment";
import { Link, ImmutableXClient, ImmutableMethodResults, ETHTokenType, ImmutableRollupStatus } from "@imtbl/imx-sdk";
import { GlobalVarsService } from "../../global-vars.service";

@Component({
  selector: "app-buy-eth",
  templateUrl: "./buy-eth.component.html",
  styleUrls: ["./buy-eth.component.scss"],
})
export class BuyEthComponent implements OnInit {
  constructor(public globalVars: GlobalVarsService) {}

  link = new Link(environment.imx.MAINNET_LINK_URL);

  ngOnInit(): void {}
  openLink(link: string) {
    window.open(link, "_blank");
  }

  async buyEthButtonClicked() {
    await this.link.fiatToCrypto({});
    this.globalVars._alertSuccess(
      "Successfully purchased ETH on Imx with Moonpay. Please give a couple of hours for your Imx balance to update."
    );
  }
}
