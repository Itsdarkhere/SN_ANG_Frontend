import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ProfileEntryResponse } from "src/app/backend-api.service";
import { CreatorCoinTrade } from "src/lib/trade-creator-page/creator-coin-trade";
import { Router } from "@angular/router";
import { GlobalVarsService } from "src/app/global-vars.service";
import _ from "lodash";
@Component({
  selector: "app-trade-creator-sell",
  templateUrl: "./trade-creator-sell.component.html",
  styleUrls: ["./trade-creator-sell.component.scss"],
})
export class TradeCreatorSellComponent implements OnInit {
  @Input() creatorProfile: ProfileEntryResponse;
  @Input() creatorCoinTrade: CreatorCoinTrade;
  @Input() sellingCoin: boolean;
  @Output() sellMax = new EventEmitter();
  @Output() sellClick = new EventEmitter();
  @Output() invalidateAndUpdateAmounts = new EventEmitter();

  // Leave some DeSo in the user's account so they can do normal site activity (like, post, etc)
  MIN_DESO_NANOS_TO_LEAVE_WHEN_BUYING_CREATOR_COINS = 100_000;

  constructor(private router: Router, private globalVars: GlobalVarsService) {}

  ngOnInit(): void {}

  clickSell() {
    this.sellClick.emit();
  }

  emitSellMax() {
    this.sellMax.emit();
  }

  _minAmount() {
    return 0;
  }
}
