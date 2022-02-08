import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ProfileEntryResponse } from "src/app/backend-api.service";
import { CreatorCoinTrade } from "src/lib/trade-creator-page/creator-coin-trade";

@Component({
  selector: "app-trade-creator-buy",
  templateUrl: "./trade-creator-buy.component.html",
  styleUrls: ["./trade-creator-buy.component.scss"],
})
export class TradeCreatorBuyComponent implements OnInit {
  constructor() {}

  @Input() creatorCoinTrade: CreatorCoinTrade;
  @Input() creatorProfile: ProfileEntryResponse;
  @Output() buyClick = new EventEmitter();
  @Output() invalidateAndUpdateAmounts = new EventEmitter();

  // Leave some DeSo in the user's account so they can do normal site activity (like, post, etc)
  MIN_DESO_NANOS_TO_LEAVE_WHEN_BUYING_CREATOR_COINS = 100_000;

  ngOnInit(): void {}

  clickBuy() {
    this.buyClick.emit();
  }
  emitInvalidateAndUpdateAmounts() {
    this.invalidateAndUpdateAmounts.emit();
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
}
