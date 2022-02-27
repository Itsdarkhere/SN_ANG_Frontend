import { Component, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { ApplyService } from "../../apply.service";
import { GlobalVarsService } from "src/app/global-vars.service";
@Component({
  selector: "app-collection-page-sidebar",
  templateUrl: "./collection-page-sidebar.component.html",
  styleUrls: ["./collection-page-sidebar.component.scss"],
})
export class CollectionPageSidebarComponent implements OnInit {
  flyout = false;
  statusAll = true;
  statusSold = false;
  statusHasBids = false;
  statusForSale = false;
  canUserSort = true;
  marketPrimary = true;
  marketSecondary = true;
  // Types to pass to applyService
  marketTypeString: string;
  statusString: string;
  // For apply service
  subscription: Subscription;
  constructor(private applyService: ApplyService, public globalVars: GlobalVarsService) {}

  ngOnInit(): void {}

  // Status button clicks, does not stay in memory
  statusClick(button: string) {
    switch (button) {
      case "all":
        if (!this.statusAll) {
          this.statusAll = true;
          this.statusForSale = false;
          this.statusHasBids = false;
          this.statusSold = false;
        }
        break;
      case "for sale":
        if (this.statusForSale) {
          this.statusAll = true;
          this.statusForSale = false;
        } else {
          this.statusForSale = true;
          this.statusAll = false;
          this.statusHasBids = false;
          this.statusSold = false;
        }
        break;
      case "has bids":
        if (this.statusHasBids) {
          this.statusAll = true;
          this.statusHasBids = false;
        } else {
          this.statusHasBids = true;
          this.statusAll = false;
          this.statusForSale = false;
          this.statusSold = false;
        }
        break;
      case "sold":
        if (this.statusSold) {
          this.statusAll = true;
          this.statusSold = false;
        } else {
          this.statusSold = true;
          this.statusAll = false;
          this.statusForSale = false;
          this.statusHasBids = false;
        }
        break;
      default:
        break;
    }
    // Check if user can sort
    //this.canSort();
  }

  marketClick(market: string) {
    switch (market) {
      case "primary":
        if (!this.marketPrimary) {
          this.marketPrimary = true;
        } else if (this.marketSecondary && this.marketPrimary) {
          this.marketPrimary = false;
        }
        break;
      case "secondary":
        if (!this.marketSecondary) {
          this.marketSecondary = true;
        } else if (this.marketSecondary && this.marketPrimary) {
          this.marketSecondary = false;
        }
        break;
      case "all":
        this.marketPrimary = true;
        this.marketSecondary = true;
      default:
      // Do nothing
    }
    // Check if user can sort
    //this.canSort();
  }
  // Set marketType in string
  setMarketType() {
    if (this.marketPrimary && this.marketSecondary) {
      this.marketTypeString = "all";
    } else if (!this.marketPrimary && this.marketSecondary) {
      this.marketTypeString = "secondary";
    } else if (this.marketPrimary && !this.marketSecondary) {
      this.marketTypeString = "primary";
    }
  }
  // Set the status in string
  setStatus() {
    if (this.statusAll) {
      this.statusString = "all";
    } else if (this.statusForSale) {
      this.statusString = "for sale";
    } else if (this.statusHasBids) {
      this.statusString = "has bids";
    } else if (this.statusSold) {
      this.statusString = "sold";
    }
  }
  applyClick() {
    // Set selection in string format
    this.setMarketType();
    this.setStatus();
    // Send apply event
    this.applyService.applyPress(this.statusString, this.marketTypeString);
  }
}
