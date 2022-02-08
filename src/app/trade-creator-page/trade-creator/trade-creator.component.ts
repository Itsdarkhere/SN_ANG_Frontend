// TODO: creator coin buys: no-balance case is kinda dumb, we should have a module telling you to buy deso or
// creator coin

// TODO: creator coin buys: need warning about potential slippage

// TODO: creator coin buys: may need tiptips explaining why total != amount * currentPriceElsewhereOnSite

import { Component, HostListener, Input, OnInit } from "@angular/core";
import { GlobalVarsService } from "../../global-vars.service";
import { BackendApiService, TutorialStatus } from "../../backend-api.service";
import { ActivatedRoute, Router } from "@angular/router";
import { CreatorCoinTrade } from "../../../lib/trade-creator-page/creator-coin-trade";
import { AppRoutingModule, RouteNames } from "../../app-routing.module";
import { Observable, of, Subscription } from "rxjs";
import { Location } from "@angular/common";
import { SwalHelper } from "src/lib/helpers/swal-helper";
import _ from "lodash";
import { FormControl, Validators } from "@angular/forms";
import { dynamicMinValidator } from "src/lib/validators/dynamic-min-validator";
import { dynamicMaxValidator } from "src/lib/validators/dynamic-max-validator";
import { FollowService } from "src/lib/services/follow/follow.service";

@Component({
  selector: "trade-creator",
  templateUrl: "./trade-creator.component.html",
  styleUrls: ["./trade-creator.component.scss"],
})
// Yes this is a huge ts file
// It is what it is
export class TradeCreatorComponent implements OnInit {
  @Input() inTutorial: boolean = false;
  @Input() tutorialBuy: boolean;

  router: Router;
  route: ActivatedRoute;
  appData: GlobalVarsService;
  creatorProfile;

  isBuyingCreatorCoin: boolean;

  creatorCoinTrade: CreatorCoinTrade;

  // buy creator coin data
  desoToSell: number;
  expectedCreatorCoinReturnedNanos: number;

  // sell creator coin data
  creatorCoinToSell: number;
  expectedDeSoReturnedNanos: number;

  // show different header text if we're at the "Invest In Yourself" stage of the tutorial
  investInYourself: boolean = false;

  // NEW UI
  tabBuy = false;
  tabSell = true;
  tabTransfer = false;

  // the fees we obtain from the server aren't exact, so bump them up slightly
  // so that we don't accidentally underestimate (causing an error)
  FEE_LEEWAY_MULTIPLE = 1.1;

  // Leave some DeSo in the user's account so they can do normal site activity (like, post, etc)
  MIN_DESO_NANOS_TO_LEAVE_WHEN_BUYING_CREATOR_COINS = 100_000;

  isUpdatingAmounts: boolean = false;

  // Keep track of a sequence number for updateAmounts calls. This ensures
  // that we only display results from the most recent request (and thus don't
  // show the user incorrect response data from a previous ajax call).
  updateAmountsSequenceNumber = 0;

  // https://stackoverflow.com/questions/12475704/regular-expression-to-allow-only-integer-and-decimal
  // the original regex was /^[0-9]+([.][0-9]+)?$/, but I changed the first + to a *
  // so that we could recognize a number like ".1" as valid
  NUMBERS_ONLY_REGEX = /^[0-9]*([.][0-9]+)?$/;

  // These are from the trade-creator-preview component
  // orders will execute as long as the value doesn't slip by more than 25%
  ALLOWED_SLIPPAGE_PERCENT = 75;

  DESO_RECEIVED_LESS_THAN_MIN_SLIPPAGE_ERROR = "RuleErrorDeSoReceivedIsLessThanMinimumSetBySeller";
  CREATOR_COIN_RECEIVED_LESS_THAN_MIN_SLIPPAGE_ERROR = "RuleErrorCreatorCoinLessThanMinimumSetByUser";

  creatorCoinTradeBeingCalled: boolean = false;
  showHighLoadWarning: boolean = false;

  mobile = false;

  constructor(
    private globalVars: GlobalVarsService,
    private _route: ActivatedRoute,
    private _router: Router,
    private backendApi: BackendApiService,
    private location: Location,
    private followService: FollowService
  ) {
    this.appData = globalVars;
    this.router = _router;
    this.route = _route;
  }

  _onSlippageError() {
    this.creatorCoinTrade.showSlippageError = true;
  }

  _onPreviewClicked(action: string) {
    console.log(action);
    this.creatorCoinTrade.showSlippageError = false;
  }

  _onTradeExecuted() {
    if (!this.inTutorial) {
      // Logic for trade executed
    }
  }

  readyForDisplay() {
    return (
      this.creatorProfile &&
      // USD calculations don't work correctly until we have the exchange rate
      this.appData.nanosPerUSDExchangeRate &&
      // Need to make sure the USD exchange rate is actually loaded, not a random default
      this.appData.nanosPerUSDExchangeRate != GlobalVarsService.DEFAULT_NANOS_PER_USD_EXCHANGE_RATE
    );
  }

  _handleTabClick(tab: string) {
    // Reset the creator coin trade as needed.
    this.creatorCoinTrade.amount.reset();
    this.creatorCoinTrade.clearAllFields();
    this.creatorCoinTrade.setTradeType(tab);
    this.creatorCoinTrade.selectedCurrency = this.creatorCoinTrade.defaultCurrency();

    // Swap out the URL.
    let newRoute = AppRoutingModule.buyCreatorPath(this.route.snapshot.params.username);
    if (tab === CreatorCoinTrade.SELL_VERB) {
      newRoute = AppRoutingModule.sellCreatorPath(this.route.snapshot.params.username);
    } else if (tab === CreatorCoinTrade.TRANSFER_VERB) {
      newRoute = AppRoutingModule.transferCreatorPath(this.route.snapshot.params.username);
    }
    this.router.navigate([newRoute], { queryParamsHandling: "merge" });
  }

  _setStateFromActivatedRoute(route) {
    // get the username of the creator
    let creatorUsername = route.snapshot.params.username;
    let tradeType = route.snapshot.params.tradeType;
    if (!this.creatorProfile || creatorUsername != this.creatorProfile.Username) {
      this._getCreatorProfile(creatorUsername);
    }

    switch (tradeType) {
      case this.appData.RouteNames.TRANSFER_CREATOR: {
        this.creatorCoinTrade.isBuyingCreatorCoin = false;
        this.creatorCoinTrade.tradeType = CreatorCoinTrade.TRANSFER_VERB;
        break;
      }
      case this.appData.RouteNames.BUY_CREATOR: {
        this.creatorCoinTrade.isBuyingCreatorCoin = true;
        this.creatorCoinTrade.tradeType = CreatorCoinTrade.BUY_VERB;
        console.log(this.creatorCoinTrade.tradeType);
        break;
      }
      case this.appData.RouteNames.SELL_CREATOR: {
        this.creatorCoinTrade.isBuyingCreatorCoin = false;
        this.creatorCoinTrade.tradeType = CreatorCoinTrade.SELL_VERB;
        break;
      }
      default: {
        console.error(`unexpected path in _setStateFromActivatedRoute: ${tradeType}`);
        // TODO: creator coin buys: rollbar
      }
    }
  }

  _getCreatorProfile(creatorUsername): Subscription {
    let readerPubKey = "";
    if (this.globalVars.loggedInUser) {
      readerPubKey = this.globalVars.loggedInUser.PublicKeyBase58Check;
    }
    return this.backendApi.GetSingleProfile(this.globalVars.localNode, "", creatorUsername).subscribe(
      (response) => {
        if (!response || !response.Profile) {
          this.router.navigateByUrl("/" + this.appData.RouteNames.NOT_FOUND, { skipLocationChange: true });
          return;
        }
        let profile = response.Profile;
        this.creatorCoinTrade.creatorProfile = profile;
        this.creatorProfile = profile;
      },
      (err) => {
        console.error(err);
        console.log("This profile was not found. It either does not exist or it was deleted."); // this.backendApi.parsePostError(err)
      }
    );
  }

  ngOnInit() {
    this.setMobileBasedOnViewport();
    this.creatorCoinTrade = new CreatorCoinTrade(this.appData);
    this._setStateFromActivatedRoute(this.route);
    this.route.params.subscribe((params) => {
      this._setStateFromActivatedRoute(this.route);
    });
    // New
    // Populate a default currency if it's not already set. selectedCurrency may be already set
    // if the user is going back from the Preview screen.
    //
    // Note: it's important that we set a selectedCurrency before we call _setUpAmountField(),
    // which depends on a currency being set
    if (!this.creatorCoinTrade.selectedCurrency) {
      this.creatorCoinTrade.selectedCurrency = this.creatorCoinTrade.defaultCurrency();
    }

    this._setUpAmountField();

    // important to update amounts in case we're returning to this view due to slippage error
    this._executeUpdateAmounts();

    // This is a hack. If the user is selling creator coins, gets to the preview screen, and clicks
    // back, updateAmounts (above) early-returns because the amount.valid is mysteriously false.
    // I don't know why it's false, but if we call it again a few ms later, it works, so just
    // doing this for now.
    window.setTimeout(() => {
      this._executeUpdateAmounts();
    }, 10);

    if (this.creatorCoinTrade.isBuyingCreatorCoin) {
      // We poll for the fee because we need to wait for feeRateDeSoPerKB
      // to be set. If we don't wait for this, things get messed up.
      let isFetching = false;
      const pollForFee = setInterval(() => {
        if (this.appData.feeRateDeSoPerKB == 0 || isFetching) {
          // Do nothing. feeRateDeSoPerKB hasn't been set yet. If we ask for a fee now,
          // we'll get a misleading value.
          return;
        }

        // This is a hack to get an estimate of the current fee
        isFetching = true;
        this.backendApi
          .SendDeSoPreview(
            this.appData.localNode,
            this.appData.loggedInUser.PublicKeyBase58Check,
            this.appData.loggedInUser.PublicKeyBase58Check,
            // A negative amount causes the max value to be returned as the spend amount.
            -1,
            this.appData.feeRateDeSoPerKB * 1e9 /* min fee rate */
          )
          .subscribe(
            (response: any) => {
              isFetching = false;
              clearInterval(pollForFee);
              this.creatorCoinTrade.currentFeeForSellNanos = response.FeeNanos * this.FEE_LEEWAY_MULTIPLE;
            },
            (error) => {
              isFetching = false;
              clearInterval(pollForFee);
              // TODO: creator coin buys: rollbar
              console.error(error);
            }
          );
      }, 100);
    } else {
      // if selling a creator coin, the fee is baked in, so for the purposes
      // of this component (computing the max), it's 0
      this.creatorCoinTrade.currentFeeForSellNanos = 0;
      if (
        this.globalVars.loggedInUser.PublicKeyBase58Check ===
          this.creatorCoinTrade.creatorProfile.PublicKeyBase58Check &&
        !this.creatorCoinTrade.isCreatorCoinTransfer()
      ) {
        const hodlersCount = this.globalVars.loggedInUser.UsersWhoHODLYouCount;
        SwalHelper.fire({
          target: this.globalVars.getTargetComponentSelector(),
          title: "Warning!",
          html: `You have ${hodlersCount} supporter${hodlersCount > 1 ? "s" : ""}  who own${
            hodlersCount > 1 ? "" : "s"
          } your coin. If you sell, they will be notified. Are you sure?`,
          showCancelButton: true,
          showDenyButton: true,
          showConfirmButton: false,
          icon: "warning",
          denyButtonText: "Proceed",
          cancelButtonText: "Go Back",
          customClass: {
            denyButton: "btn btn-light",
            cancelButton: "btn btn-light no",
          },
          reverseButtons: true,
        }).then((response: any) => {
          if (response.isDismissed) {
            this.location.back();
          }
        });
      }
    }
  }

  setMobileBasedOnViewport() {
    this.mobile = this.globalVars.isMobile();
  }

  @HostListener("window:resize")
  onResize() {
    this.setMobileBasedOnViewport();
  }

  setUpBuyTutorial(): void {
    let balance = this.appData.loggedInUser?.BalanceNanos;
    const jumioDeSoNanos = this.appData.jumioDeSoNanos > 0 ? this.appData.jumioDeSoNanos : 1e8;
    balance = balance > jumioDeSoNanos ? jumioDeSoNanos : balance;
    const percentToBuy =
      this.creatorProfile.PublicKeyBase58Check === this.globalVars.loggedInUser.PublicKeyBase58Check ? 0.1 : 0.5;
    this.creatorCoinTrade.desoToSell = (balance * percentToBuy) / 1e9;
    this.getBuyOrSellObservable().subscribe(
      (response) => {
        this.creatorCoinTrade.expectedCreatorCoinReturnedNanos = response.ExpectedCreatorCoinReturnedNanos || 0;
        this.creatorCoinTrade.expectedFounderRewardNanos = response.FounderRewardGeneratedNanos || 0;
      },
      (err) => {
        console.error(err);
        this.appData._alertError(this.backendApi.parseProfileError(err));
      }
    );
  }

  setUpSellTutorial(): void {
    const hodlings = this.globalVars.loggedInUser?.UsersYouHODL;
    if (!hodlings) {
      // some error and return?
      return;
    }
    const creatorCoinsPurchasedInTutorial = this.globalVars.loggedInUser?.CreatorCoinsPurchasedInTutorial;
    // Sell 5% of coins purchased in buy step.
    this.creatorCoinTrade.creatorCoinToSell = (creatorCoinsPurchasedInTutorial * 0.05) / 1e9;
    this.getBuyOrSellObservable().subscribe(
      (response) => {
        this.creatorCoinTrade.expectedDeSoReturnedNanos = response.ExpectedDeSoReturnedNanos || 0;
      },
      (err) => {
        console.error(err);
        this.appData._alertError(this.backendApi.parseProfileError(err));
      }
    );
  }

  getBuyOrSellObservable(): Observable<any> {
    return this.backendApi.BuyOrSellCreatorCoin(
      this.appData.localNode,
      this.appData.loggedInUser.PublicKeyBase58Check /*UpdaterPublicKeyBase58Check*/,
      this.creatorCoinTrade.creatorProfile.PublicKeyBase58Check /*CreatorPublicKeyBase58Check*/,
      this.creatorCoinTrade.operationType() /*OperationType*/,
      this.creatorCoinTrade.desoToSell * 1e9 /*DeSoToSellNanos*/,
      this.creatorCoinTrade.creatorCoinToSell * 1e9 /*CreatorCoinToSellNanos*/,
      0 /*DeSoToAddNanos*/,
      0 /*MinDeSoExpectedNanos*/,
      0 /*MinCreatorCoinExpectedNanos*/,
      this.appData.feeRateDeSoPerKB * 1e9 /*feeRateNanosPerKB*/,
      false
    );
  }
  // Bitclout has everything from under here inside the trade-creator-form component
  // New design is a bitch about doing these in separate files
  // Also includes everything under // NEW in onInit
  // Enjoy

  _setUpAmountField() {
    this.creatorCoinTrade.amount = new FormControl(null, [
      Validators.required,
      Validators.pattern(this.NUMBERS_ONLY_REGEX),
      dynamicMinValidator(() => {
        return this._minAmount();
      }, false /* inclusive */),
      dynamicMaxValidator(() => {
        return this._maxAmount();
      }, true /*inclusive*/),
    ]);

    // if the user has set the amount previously (e.g. because he clicked review and then went
    // back), populate the amount
    let assetToSellAmount = this.creatorCoinTrade.assetToSellAmount();
    if (assetToSellAmount != 0) {
      let amount = this.creatorCoinTrade.convertAmount(
        assetToSellAmount /* input amount */,
        this.creatorCoinTrade.assetToSellCurrency() /* input currency */,
        this.creatorCoinTrade.selectedCurrency /* target currency */
      );
      this.creatorCoinTrade.amount.setValue(amount);
    }

    // Wait 700 ms before calling _executeUpdateAmounts to allow the user to finish typing.
    // This makes the UX a little slower, but reduces server calls.
    let debouncedExecuteUpdateAmounts = _.debounce(_.bind(this._executeUpdateAmounts, this), 700);
    let onValueChange = () => {
      // We run _beforeExecuteUpdateAmounts here so we don't debounce if unnecessary.
      if (!this._beforeExecuteUpdateAmounts()) return;

      // We start the updating spinner here so that it begins before the debounce period.
      this.isUpdatingAmounts = true;
      debouncedExecuteUpdateAmounts();
    };
    this.creatorCoinTrade.amount.valueChanges.subscribe(() => {
      onValueChange();
    });
    this.creatorCoinTrade.transferRecipient.valueChanges.subscribe(() => {
      onValueChange();
    });
  }

  // Validations + setup before we send the BuyOrSellCreatorCoin request to the server
  // Returns false if execution should halt, true if it should proceed
  //
  // This was moved out of _executeUpdateAmounts() into a separate function so that
  // we could call it every time the amount changes
  _beforeExecuteUpdateAmounts() {
    this._resetTransferErrors();
    this.creatorCoinTrade.clearAllFields();

    // don't submit invalid amounts
    if (!this.creatorCoinTrade.amount || !this.creatorCoinTrade.amount.valid) {
      return false;
    }

    if (this.creatorCoinTrade.isCreatorCoinTransfer() && !this.creatorCoinTrade.transferRecipient.valid) {
      return false;
    }

    this._setAssetToSellAmount();

    // If we get to this point and there are no amounts, there is nothing to update.
    if (this.creatorCoinTrade.desoToSell === 0 && this.creatorCoinTrade.creatorCoinToSell === 0) {
      return false;
    }

    return true;
  }

  _resetTransferErrors() {
    this.creatorCoinTrade.showUsernameError = false;
    this.creatorCoinTrade.showPubKeyError = false;
    this.creatorCoinTrade.showCannotSendToSelfError = false;
  }

  _setAssetToSellAmount() {
    if (this.creatorCoinTrade.isBuyingCreatorCoin) {
      // convert user-specified amount to deso
      // note: convertAmount takes nanos and returns nanos
      this.creatorCoinTrade.desoToSell = this.creatorCoinTrade.convertAmount(
        this.creatorCoinTrade.amount.value /* input amount */,
        this.creatorCoinTrade.selectedCurrency /* input currency */,
        CreatorCoinTrade.DESO_CURRENCY_STRING /* target currency */
      );
    } else {
      // convert user-specified amount to creator coin
      // note: convertAmount takes nanos and returns nanos
      this.creatorCoinTrade.creatorCoinToSell = this.creatorCoinTrade.convertAmount(
        this.creatorCoinTrade.amount.value /* input amount */,
        this.creatorCoinTrade.selectedCurrency /* input currency */,
        CreatorCoinTrade.CREATOR_COIN_CURRENCY_STRING /* target currency */
      );
    }
  }

  _maxAmount() {
    if (this.creatorCoinTrade == null || this.creatorCoinTrade.selectedCurrency == null) {
      return null;
    }

    let balance;
    if (this.creatorCoinTrade.currentFeeForSellNanos == null) {
      // if we don't have the fee yet, just pretend the max is the user's balance
      // this should generally only happen when we can't obtain the fee (which only happens
      // when the user has 0 balance)

      balance = this.creatorCoinTrade.assetToSellBalance();
    } else {
      balance = this.creatorCoinTrade.assetToSellBalance() - this.creatorCoinTrade.currentFeeForSellNanos / 1e9;
    }

    if (this.creatorCoinTrade.isBuyingCreatorCoin) {
      // if buying creator coin, leave some deso left over so that people can continue
      // to use the site (like, post, sell creator coins, etc) (i.e. don't drain the full balance)
      balance -= this.MIN_DESO_NANOS_TO_LEAVE_WHEN_BUYING_CREATOR_COINS / 1e9;
    }

    let assetToSellCurrency;
    if (this.creatorCoinTrade.isBuyingCreatorCoin) {
      assetToSellCurrency = CreatorCoinTrade.DESO_CURRENCY_STRING;
    } else {
      assetToSellCurrency = CreatorCoinTrade.CREATOR_COIN_CURRENCY_STRING;
    }

    let maxAmount = this.creatorCoinTrade.convertAmount(
      balance /* input amount */,
      assetToSellCurrency /* input currency */,
      this.creatorCoinTrade.selectedCurrency /* target currency */
    );

    // ensure maxAmount is at least 0
    maxAmount = Math.max(0, maxAmount);

    return parseFloat(maxAmount.toFixed(9));
  }

  _minAmount() {
    return 0;
  }

  // This submits the BuyOrSellCreatorCoin request. We want our debouncedExecuteUpdateAmounts
  // function to call this only once, after the user finishes typing
  _executeUpdateAmounts() {
    this.isUpdatingAmounts = true;
    this._resetTransferErrors();

    // Re-validate that everything is ok before submitting. Without this, we could have a
    // situation like:
    //   - amount is valid
    //   - debounced _executeUpdateAmounts call is queued up
    //   - user changes UI to an invalid amount
    //   - the debounced _executeUpdateAmounts is called, but now the amount is invalid
    let success = this._beforeExecuteUpdateAmounts();
    if (!success) {
      this.isUpdatingAmounts = false;
      return;
    }

    // Increment the current sequence number
    this.updateAmountsSequenceNumber += 1;
    let currentSequenceNumber = this.updateAmountsSequenceNumber;

    if (this.creatorCoinTrade.isCreatorCoinTransfer()) {
      // Hit the backend with "Broadcast=false" to calculate network fees.
      this.backendApi
        .TransferCreatorCoin(
          this.appData.localNode,
          this.appData.loggedInUser.PublicKeyBase58Check /*SenderPublicKeyBase58Check*/,
          this.creatorCoinTrade.creatorProfile.PublicKeyBase58Check /*CreatorPublicKeyBase58Check*/,
          this.creatorCoinTrade.transferRecipient.value.PublicKeyBase58Check /*ReceiverPublicKeyBase58Check*/,
          this.creatorCoinTrade.amount.value * 1e9 /*CreatorCoinToTransferNanos*/,
          this.appData.feeRateDeSoPerKB * 1e9 /*feeRateNanosPerKB*/,
          false
        )
        .subscribe(
          (response) => {
            // Ensure that the current sequence number matches the global sequence number,
            // since we only want to display results from the most recent request
            if (currentSequenceNumber != this.updateAmountsSequenceNumber) {
              return;
            }

            this.creatorCoinTrade.networkFeeNanos = response.FeeNanos;
            this.isUpdatingAmounts = false;
          },
          (err) => {
            this.isUpdatingAmounts = false;
            console.error(err);
            // If we didn't find the profile, show the 'couldn't find username' error text.
            if (err.error?.error?.indexOf("TransferCreatorCoin: Problem getting profile for username") >= 0) {
              this.creatorCoinTrade.showUsernameError = true;
            } else if (err.error?.error?.indexOf("TransferCreatorCoin: Problem decoding receiver public key") >= 0) {
              this.creatorCoinTrade.showPubKeyError = true;
            } else if (err.error?.error?.indexOf("TransferCreatorCoin: Sender and receiver cannot be the same") >= 0) {
              this.creatorCoinTrade.showCannotSendToSelfError = true;
            } else {
              this.appData._alertError(this.backendApi.parseProfileError(err));
            }
          }
        );
    } else {
      // obtain amounts from backend without actually broadcasting
      this.backendApi
        .BuyOrSellCreatorCoin(
          this.appData.localNode,
          this.appData.loggedInUser.PublicKeyBase58Check /*UpdaterPublicKeyBase58Check*/,
          this.creatorCoinTrade.creatorProfile.PublicKeyBase58Check /*CreatorPublicKeyBase58Check*/,
          this.creatorCoinTrade.operationType() /*OperationType*/,
          this.creatorCoinTrade.desoToSell * 1e9 /*DeSoToSellNanos*/,
          this.creatorCoinTrade.creatorCoinToSell * 1e9 /*CreatorCoinToSellNanos*/,
          0 /*DeSoToAddNanos*/,
          0 /*MinDeSoExpectedNanos*/,
          0 /*MinCreatorCoinExpectedNanos*/,

          this.appData.feeRateDeSoPerKB * 1e9 /*feeRateNanosPerKB*/,
          false
        )
        .subscribe(
          (response) => {
            // Ensure that the current sequence number matches the global sequence number,
            // since we only want to display results from the most recent request
            if (currentSequenceNumber != this.updateAmountsSequenceNumber) {
              return;
            }

            this.creatorCoinTrade.expectedCreatorCoinReturnedNanos = response.ExpectedCreatorCoinReturnedNanos || 0;
            this.creatorCoinTrade.expectedDeSoReturnedNanos = response.ExpectedDeSoReturnedNanos || 0;
            this.creatorCoinTrade.expectedFounderRewardNanos = response.FounderRewardGeneratedNanos || 0;
            this.isUpdatingAmounts = false;
          },
          (err) => {
            this.isUpdatingAmounts = false;
            // TODO: creator coin buys: rollbar
            console.error(err);
            this.appData._alertError(this.backendApi.parseProfileError(err));
          }
        );
    }
  }
  // Validation
  _invalidateAndUpdateAmounts() {
    // Calling updateValueAndValidity() to force angular to revalidate the amount input
    // now that the currency has changed
    this.creatorCoinTrade.amount.updateValueAndValidity();

    this._executeUpdateAmounts();
  }

  // These have previously been inside the trade-creator-profile component

  _buyOrSellCreatorCoin() {
    // don't submit multiple requests
    if (this.creatorCoinTradeBeingCalled) {
      return;
    }

    this._sanityCheckBuyOrSell();

    this.creatorCoinTradeBeingCalled = true;

    const minDeSoExpectedNanos =
      this.creatorCoinTrade.expectedDeSoReturnedNanos * (this.ALLOWED_SLIPPAGE_PERCENT / 100);

    const minCreatorCoinExpectedNanos =
      this.creatorCoinTrade.expectedCreatorCoinReturnedNanos * (this.ALLOWED_SLIPPAGE_PERCENT / 100);

    // If we haven't completed the request in 20 seconds, show the high load warning
    window.setTimeout(() => {
      if (this.creatorCoinTradeBeingCalled) {
        this.showHighLoadWarning = true;
      }
    }, 20000);

    this.backendApi
      .BuyOrSellCreatorCoin(
        this.appData.localNode,
        this.appData.loggedInUser.PublicKeyBase58Check /*UpdaterPublicKeyBase58Check*/,
        this.creatorCoinTrade.creatorProfile.PublicKeyBase58Check /*CreatorPublicKeyBase58Check*/,
        this.creatorCoinTrade.operationType() /*OperationType*/,
        this.creatorCoinTrade.desoToSell * 1e9 /*DeSoToSellNanos*/,
        this.creatorCoinTrade.creatorCoinToSell * 1e9 /*CreatorCoinToSellNanos*/,
        0 /*DeSoToAddNanos*/,
        minDeSoExpectedNanos /*MinDeSoExpectedNanos*/,
        minCreatorCoinExpectedNanos /*MinCreatorCoinExpectedNanos*/,

        this.appData.feeRateDeSoPerKB * 1e9 /*feeRateNanosPerKB*/,
        true,
        this.inTutorial
      )
      .subscribe(
        (response) => {
          const {
            ExpectedDeSoReturnedNanos,
            ExpectedCreatorCoinReturnedNanos,
            SpendAmountNanos,
            TotalInputNanos,
            ChangeAmountNanos,
            FeeNanos,
          } = response;
          this.globalVars.logEvent("coins : trade", {
            Creator: this.creatorCoinTrade.creatorProfile.Username,
            Operation: this.creatorCoinTrade.operationType(),
            ExpectedDeSoReturnedNanos,
            ExpectedCreatorCoinReturnedNanos,
            SpendAmountNanos,
            TotalInputNanos,
            ChangeAmountNanos,
            FeeNanos,
          });

          this.creatorCoinTrade.expectedCreatorCoinReturnedNanos = ExpectedCreatorCoinReturnedNanos || 0;
          this.creatorCoinTrade.expectedDeSoReturnedNanos = ExpectedDeSoReturnedNanos || 0;

          const observable =
            this.creatorCoinTrade.followCreator &&
            !this.followService._isLoggedInUserFollowing(this.creatorCoinTrade.creatorProfile.PublicKeyBase58Check) &&
            this.appData.loggedInUser.PublicKeyBase58Check !==
              this.creatorCoinTrade.creatorProfile.PublicKeyBase58Check &&
            this.creatorCoinTrade.tradeType === CreatorCoinTrade.BUY_VERB
              ? this.followService._toggleFollow(true, this.creatorCoinTrade.creatorProfile.PublicKeyBase58Check)
              : of(null).subscribe();
          observable.add(() => {
            this.appData.updateEverything(
              response.TxnHashHex,
              this._creatorCoinSuccess,
              this._creatorCoinFailure,
              this
            );
          });
        },
        (response) => {
          this._handleRequestErrors(response);
        }
      );
  }
  _handleRequestErrors(response: any) {
    this.creatorCoinTradeBeingCalled = false;
    // CloudFlare rate limiting doesn't return an Access-Allow-Control-Origin header so the browser
    // barfs and returns an unknown error code which has a status of 0
    if (response.status === 0) {
      return this.appData._alertError("DeSo is under heavy load. Please try again in one minute.");
    }

    const errorMessage = response.error.error;
    const parsedError = this.backendApi.parseProfileError(response);

    const hasSlippageError =
      errorMessage.includes(this.DESO_RECEIVED_LESS_THAN_MIN_SLIPPAGE_ERROR) ||
      errorMessage.includes(this.CREATOR_COIN_RECEIVED_LESS_THAN_MIN_SLIPPAGE_ERROR);

    this.globalVars.logEvent("coins : trade : error", { parsedError, hasSlippageError });

    if (hasSlippageError) {
      // Do logic
    } else {
      this.appData._alertError(parsedError);
    }
  }
  _sanityCheckBuyOrSell() {
    // Sanity check that only one of desoToSell and creatorCoinToSell is nonzero
    // I've never seen this happen, but just trying to be careful since user money is involved,
    // and if it happens, I'd like to know about it so we can fix root cause
    let desoToSell = this.creatorCoinTrade.desoToSell || 0;
    let creatorCoinToSell = this.creatorCoinTrade.creatorCoinToSell || 0;
    if (desoToSell > 0 && creatorCoinToSell > 0) {
      console.error(`desoToSell ${desoToSell} and creatorCoinToSell ${creatorCoinToSell} are both > 0`);
      // TODO: creator coin buys: rollbar

      // in case that happened, as a hack, reset one of them to 0 ... just so the user doesn't
      // get weird behavior
      if (this.creatorCoinTrade.isBuyingCreatorCoin) {
        this.creatorCoinTrade.creatorCoinToSell = 0;
      } else {
        this.creatorCoinTrade.desoToSell = 0;
      }
    }
  }

  _creatorCoinSuccess = (comp: any) => {
    comp.appData.celebrate();
    comp.creatorCoinTradeBeingCalled = false;
    comp.showHighLoadWarning = false;
    this._onTradeExecuted();
  };

  _creatorCoinFailure = (comp: any) => {
    comp.creatorCoinTradeBeingCalled = false;
    comp.showHighLoadWarning = false;
    comp.appData._alertError("Transaction broadcast successfully but read node timeout exceeded. Please refresh.");
  };
  // TRANSFER COINS
  _transferCreatorCoin() {
    // don't submit multiple requests
    if (this.creatorCoinTradeBeingCalled) {
      return;
    }
    this.creatorCoinTradeBeingCalled = true;

    // If we haven't completed the request in 20 seconds, show the high load warning
    window.setTimeout(() => {
      if (this.creatorCoinTradeBeingCalled) {
        this.showHighLoadWarning = true;
      }
    }, 20000);

    // Broadcast the transaction.
    this.backendApi
      .TransferCreatorCoin(
        this.appData.localNode,
        this.appData.loggedInUser.PublicKeyBase58Check /*SenderPublicKeyBase58Check*/,
        this.creatorCoinTrade.creatorProfile.PublicKeyBase58Check /*CreatorPublicKeyBase58Check*/,
        this.creatorCoinTrade.transferRecipient.value.PublicKeyBase58Check /*ReceiverPublicKeyBase58Check*/,
        this.creatorCoinTrade.amount.value * 1e9 /*CreatorCoinToTransferNanos*/,
        this.appData.feeRateDeSoPerKB * 1e9 /*feeRateNanosPerKB*/,
        true
      )
      .subscribe(
        (response) => {
          const { SpendAmountNanos, TotalInputNanos, ChangeAmountNanos, FeeNanos } = response;
          this.globalVars.logEvent("coins : transfer", {
            Creator: this.creatorCoinTrade.creatorProfile.Username,
            SenderPublicKeyBase58Check: this.appData.loggedInUser.PublicKeyBase58Check,
            ReceiverUsernameOrPublicKeyBase58Check: this.creatorCoinTrade.transferRecipient.value.PublicKeyBase58Check,
            CreatorCoinToTransferNanos: this.creatorCoinTrade.amount.value * 1e9,
            SpendAmountNanos,
            TotalInputNanos,
            ChangeAmountNanos,
            FeeNanos,
          });

          // This will update the user's balance.
          this.appData.updateEverything(response.TxnHashHex, this._creatorCoinSuccess, this._creatorCoinFailure, this);
        },
        (err) => {
          this._handleRequestErrors(err);
        }
      );
  }
}
