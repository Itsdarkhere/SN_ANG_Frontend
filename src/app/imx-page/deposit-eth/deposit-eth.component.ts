import { Component, OnInit } from "@angular/core";
import { environment } from "src/environments/environment";
import { Link, ImmutableXClient, ImmutableMethodResults, ETHTokenType, ImmutableRollupStatus } from "@imtbl/imx-sdk";
import { GlobalVarsService } from "../../global-vars.service";
import { BsModalService } from "ngx-bootstrap/modal";
import { GeneralSuccessModalComponent } from "../../general-success-modal/general-success-modal.component";

@Component({
  selector: "app-deposit-eth",
  templateUrl: "./deposit-eth.component.html",
  styleUrls: ["./deposit-eth.component.scss"],
})
export class DepositEthComponent implements OnInit {
  depositAmount: any;

  constructor(public globalVars: GlobalVarsService, private modalService: BsModalService) {}

  link = new Link(environment.imx.ROPSTEN_LINK_URL);

  ngOnInit(): void {}
  openLink(link: string) {
    window.open(link, "_blank");
  }

  async depositButtonClicked() {
    this.depositAmount = (<HTMLInputElement>document.getElementById("ethDepositAmount")).value;
    if (
      this.depositAmount === "" ||
      !this.depositAmount ||
      this.depositAmount === undefined ||
      this.depositAmount === "0"
    ) {
      this.globalVars._alertError("Please enter an amount greater then 0.");
      return;
    }
    console.log(this.depositAmount);
    await this.link.deposit({
      type: ETHTokenType.ETH,
      amount: this.depositAmount,
    });
    this.modalService.show(GeneralSuccessModalComponent, {
      class: "modal-dialog-centered nft_placebid_modal_bx  modal-lg",
      initialState: {
        header: "Success!",
        text: "Successfully deposited ETH to IMX. Please give a couple of hours for your IMX balance to update.",
        buttonText: "Ok",
        buttonClickedAction: "general",
      },
    });
  }
}
