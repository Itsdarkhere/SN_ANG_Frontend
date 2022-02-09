import { Component, OnInit, Input, HostListener } from "@angular/core";
import { BackendApiService, ProfileEntryResponse } from "../backend-api.service";
import { GlobalVarsService } from "../global-vars.service";
import { sprintf } from "sprintf-js";
import { SwalHelper } from "../../lib/helpers/swal-helper";
import { Title } from "@angular/platform-browser";
import { RouteNames } from "../app-routing.module";
import { ActivatedRoute, Router } from "@angular/router";
import { environment } from "src/environments/environment";
import { ActionResponseModalComponent } from "../action-response-modal/action-response-modal.component";
import { take } from "rxjs/operators";
import { BsModalService } from "ngx-bootstrap/modal";
import { Console } from "console";

class Messages {
  static INCORRECT_PASSWORD = `The password you entered was incorrect.`;
  static CONNECTION_PROBLEM = `There is currently a connection problem. Is your connection to your node healthy?`;
  static UNKOWN_PROBLEM = `There was a weird problem with the transaction. Debug output: %s`;
  static INSUFFICIENT_BALANCE = `You don't have enough DeSo to process the transaction. Try reducing the fee rate.`;
  static SEND_DESO_MIN = `You must send a non-zero amount of DeSo`;
  static INVALID_PUBLIC_KEY = `The public key you entered is invalid`;
  static CONFIRM_TRANSFER_TO_PUBKEY = "Send %s $DESO with a fee of %s DeSo for a total of %s DeSo to public key %s";
  static CONFIRM_TRANSFER_TO_USERNAME = "Send %s $DESO with a fee of %s DeSo for a total of %s DeSo to username %s";
  static MUST_PURCHASE_CREATOR_COIN = `You must purchase a creator coin before you can send $DESO`;
}

@Component({
  selector: "transfer-deso",
  templateUrl: "./transfer-deso.component.html",
  styleUrls: ["./transfer-deso.component.scss"],
})
export class TransferDeSoComponent implements OnInit {
  @Input() qrOnly: boolean;
  globalVars: GlobalVarsService;
  transferDeSoError = "";
  startingSearchText = "";
  payToPublicKey = "";
  payToCreator: ProfileEntryResponse;
  transferAmount = 0;
  networkFee = 0;
  feeRateDeSoPerKB: string;
  callingUpdateSendDeSoTxnFee = false;
  loadingMax = false;
  sendingDeSo = false;

  // If show success on transfer deso mobile
  openMobileActionResponse = false;

  sendDeSoQRCode: string;

  // NEW UI
  tabBuy = true;
  tabSell = false;
  tabTransfer = false;

  mobile = false;

  constructor(
    private backendApi: BackendApiService,
    private globalVarsService: GlobalVarsService,
    private titleService: Title,
    private route: ActivatedRoute,
    private router: Router,
    private modalService: BsModalService
  ) {
    this.globalVars = globalVarsService;
    this.route.queryParams.subscribe((queryParams) => {
      if (queryParams.public_key) {
        this.startingSearchText = queryParams.public_key;
      }
    });
  }

  tabBuyClick() {
    this.tabBuy = true;
    this.tabSell = false;
    this.tabTransfer = false;
  }
  tabSellClick() {
    this.tabBuy = false;
    this.tabSell = true;
    this.tabTransfer = false;
  }
  tabTransferClick() {
    this.tabBuy = false;
    this.tabSell = false;
    this.tabTransfer = true;
  }

  ngOnInit() {
    this.setMobileBasedOnViewport();
    this.feeRateDeSoPerKB = (this.globalVars.defaultFeeRateNanosPerKB / 1e9).toFixed(9);
    this.titleService.setTitle(`Send $DESO - ${environment.node.name}`);
    this.sendDeSoQRCode = `${this.backendApi._makeRequestURL(location.host, "/" + RouteNames.DESO_PAGE)}?public_key=${
      this.globalVars.loggedInUser.PublicKeyBase58Check
    }`;
  }

  setMobileBasedOnViewport() {
    this.mobile = this.globalVars.isMobile();
  }

  @HostListener("window:resize")
  onResize() {
    this.setMobileBasedOnViewport();
  }

  _clickMaxDeSo() {
    this.loadingMax = true;
    this.backendApi
      .SendDeSoPreview(
        this.globalVars.localNode,
        this.globalVars.loggedInUser.PublicKeyBase58Check,
        this.payToPublicKey,
        // A negative amount causes the max value to be returned as the spend amount.
        -1,
        Math.floor(parseFloat(this.feeRateDeSoPerKB) * 1e9)
      )
      .subscribe(
        (res: any) => {
          this.loadingMax = false;
          if (res == null || res.FeeNanos == null || res.SpendAmountNanos == null) {
            this.globalVars._alertError(Messages.CONNECTION_PROBLEM);
            return null;
          }

          this.transferDeSoError = "";
          this.networkFee = res.FeeNanos / 1e9;
          this.transferAmount = res.SpendAmountNanos / 1e9;
        },
        (error) => {
          this.loadingMax = false;
          console.error(error);
          this.transferDeSoError = this._extractError(error);
        }
      );
  }

  openActionModalOrSlideUp() {
    // on mobile open slideup
    // Desktop / tablet open modal
    if (this.globalVars.isMobileIphone()) {
      this.openMobileActionResponse = true;
    } else {
      const actionResponseModalDetails = this.modalService.show(ActionResponseModalComponent, {
        class: "action-response-modal modal-dialog-centered",
        initialState: {
          headingText: "Transferred!",
          mainText: "You transferred the DeSo successfully.",
          buttonOneText: "View Wallet",
        },
      });
      const onHiddenEvent = actionResponseModalDetails.onHidden.pipe(take(1));
      onHiddenEvent.subscribe((response) => {
        if (response == "routeToWallet") {
          this.router.navigate([RouteNames.WALLET]);
        }
      });
    }
  }
  closeSlideUp(closeReason: string) {
    if (closeReason == "close") {
      this.openMobileActionResponse = false;
    } else {
      this.openMobileActionResponse = false;
      this.router.navigate([RouteNames.WALLET]);
    }
  }

  _clickSendDeSo(object: any) {
    // Set them here so we can easily pass variables inside function
    this.payToPublicKey = object?.publicKey;
    this.transferAmount = object?.amount;
    if (this.globalVars.loggedInUser == null) {
      this.globalVars._alertError("User must be logged in in order to send DeSo");
      return;
    }

    if (this.payToPublicKey == null || this.payToPublicKey === "") {
      this.globalVars._alertError("A valid pay-to public key or username must be set before you can send $DESO");
      return;
    }

    if (this.transferDeSoError != null && this.transferDeSoError !== "") {
      this.globalVars._alertError(this.transferDeSoError);
      return;
    }

    if (this.transferAmount === 0 && this.networkFee === 0) {
      this.globalVars._alertError(Messages.SEND_DESO_MIN);
      return;
    }

    // Quick and dirty hack so that we can show the right alert if someone enters a username.
    let isUsername = false;
    if (this.payToPublicKey.substring(0, 2) != "BC" && this.payToPublicKey.length < 50) {
      isUsername = true;
    }

    // Recompute the fee one more time and offer a confirmation.
    let desoTxnFeePromise = this._updateSendDeSoTxnFee(true /*force*/);

    if (desoTxnFeePromise == null) {
      this.globalVars._alertError("There was a problem processing this transaction.");
      return;
    }

    this.sendingDeSo = true;
    desoTxnFeePromise.then(
      (res) => {
        // If res is null then an error should be set.
        if (res == null || res.FeeNanos == null || res.SpendAmountNanos == null) {
          this.sendingDeSo = false;
          this.globalVars._alertError(
            this.transferDeSoError,
            false,
            this.transferDeSoError === Messages.MUST_PURCHASE_CREATOR_COIN
          );
          return;
        }
        this.backendApi
          .SendDeSo(
            this.globalVars.localNode,
            this.globalVars.loggedInUser.PublicKeyBase58Check,
            this.payToPublicKey,
            this.transferAmount * 1e9,
            Math.floor(parseFloat(this.feeRateDeSoPerKB) * 1e9)
          )
          .subscribe(
            (res: any) => {
              const { TotalInputNanos, SpendAmountNanos, ChangeAmountNanos, FeeNanos, TransactionIDBase58Check } = res;

              if (res == null || FeeNanos == null || SpendAmountNanos == null || TransactionIDBase58Check == null) {
                this.globalVars.logEvent("bitpop : send : error");
                this.globalVars._alertError(Messages.CONNECTION_PROBLEM);
                return null;
              }

              this.globalVars.logEvent("bitpop : send", {
                TotalInputNanos,
                SpendAmountNanos,
                ChangeAmountNanos,
                FeeNanos,
              });

              this.transferDeSoError = "";
              this.networkFee = res.FeeNanos / 1e9;
              this.transferAmount = 0.0;

              // This will update the user's balance.
              this.globalVars.updateEverything(res.TxnHashHex, this._sendDeSoSuccess, this._sendDeSoFailure, this);
            },
            (error) => {
              this.sendingDeSo = false;
              console.error(error);
              this.transferDeSoError = this._extractError(error);
              this.globalVars.logEvent("bitpop : send : error", { parsedError: this.transferDeSoError });
              this.globalVars._alertError(
                this.transferDeSoError,
                false,
                this.transferDeSoError === Messages.MUST_PURCHASE_CREATOR_COIN
              );
            }
          );

        return;
      },
      (err) => {
        // If an error is returned then the error message should be set.
        this.globalVars._alertError(this.transferDeSoError);
        return;
      }
    );
  }

  _sendDeSoSuccess(comp: any) {
    // the button should no longer say "Working..."
    comp.sendingDeSo = false;
    comp.openActionModalOrSlideUp();
  }
  _sendDeSoFailure(comp: any) {
    comp.appData._alertError("Transaction broadcast successfully but read node timeout exceeded. Please refresh.");
    comp.sendingDeSo = false;
  }

  setPublicKeyAndReCalcFee(publicKey: string) {
    this.payToPublicKey = publicKey;
    this._updateSendDeSoTxnFee(true);
  }

  _updateSendDeSoTxnFee(force: boolean): Promise<any> {
    if (!this.globalVars.loggedInUser) {
      return;
    }

    if (this.callingUpdateSendDeSoTxnFee && !force) {
      console.log("Not calling _updateSendDeSoTxnFee because callingUpdateSendDeSoTxnFee is false");
      return;
    }

    if (this.payToPublicKey == null || this.payToPublicKey === "") {
      return;
    }

    this.callingUpdateSendDeSoTxnFee = true;
    return this.backendApi
      .SendDeSoPreview(
        this.globalVars.localNode,
        this.globalVars.loggedInUser.PublicKeyBase58Check,
        this.payToPublicKey,
        Math.floor(this.transferAmount * 1e9),
        Math.floor(parseFloat(this.feeRateDeSoPerKB) * 1e9)
      )
      .toPromise()
      .then(
        (res: any) => {
          this.callingUpdateSendDeSoTxnFee = false;

          if (res == null || res.FeeNanos == null) {
            this.transferDeSoError = Messages.CONNECTION_PROBLEM;

            return null;
          }

          this.transferDeSoError = "";
          this.networkFee = res.FeeNanos / 1e9;
          return res;
        },
        (error) => {
          this.callingUpdateSendDeSoTxnFee = false;

          console.error(error);
          this.transferDeSoError = this._extractError(error);
          return null;
        }
      );
  }

  _extractError(err: any): string {
    if (err.error != null && err.error.error != null) {
      // Is it obvious yet that I'm not a frontend gal?
      // TODO: Error handling between BE and FE needs a major redesign.
      let rawError = err.error.error;
      if (rawError.includes("password")) {
        return Messages.INCORRECT_PASSWORD;
      } else if (rawError.includes("not sufficient")) {
        return Messages.INSUFFICIENT_BALANCE;
      } else if (rawError.includes("RuleErrorTxnMustHaveAtLeastOneInput")) {
        return Messages.SEND_DESO_MIN;
      } else if (
        (rawError.includes("SendDeSo: Problem") && rawError.includes("Invalid input format")) ||
        rawError.includes("Checksum does not match")
      ) {
        return Messages.INVALID_PUBLIC_KEY;
      } else if (rawError.includes("You must purchase a creator coin")) {
        return Messages.MUST_PURCHASE_CREATOR_COIN;
      } else {
        return rawError;
      }
    }
    if (err.status != null && err.status != 200) {
      return Messages.CONNECTION_PROBLEM;
    }
    // If we get here we have no idea what went wrong so just alert the
    // errorString.
    return JSON.stringify(err);
  }
}
