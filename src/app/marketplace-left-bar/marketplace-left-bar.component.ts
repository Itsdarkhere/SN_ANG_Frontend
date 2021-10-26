import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { GlobalVarsService } from "../global-vars.service";
import { Location } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { FunctionPassService } from "../function-pass.service";

@Component({
  selector: "app-marketplace-left-bar",
  templateUrl: "./marketplace-left-bar.component.html",
  styleUrls: ["./marketplace-left-bar.component.scss"],
})
export class MarketplaceLeftBarComponent implements OnInit {
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onFilter: EventEmitter<any> = new EventEmitter();
  primary = true;
  secondary = true;
  selectValue: string;
  status: string;
  // Sorting
  static MOST_RECENT = "Most recent";
  static OLDEST_FIRST = "Oldest first";
  static HIGHEST_PRICE = "Highest price first";
  static LOWEST_PRICE = "Lowest price first";
  // Status
  static ALL = "All";
  static HAS_BIDS = "Has bids";
  static NO_BIDS = "No bids yet";
  static SOLD = "Sold";

  // Trendscomponent = Marketplace
  trends: any;
  // Fake loading animation
  loading = false;

  constructor(
    public globalVars: GlobalVarsService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private functionPass: FunctionPassService
  ) {}

  ngOnInit(): void {
    this.route.queryParams
      .subscribe((queryParams) => {
        if (queryParams.sort in this.selectValues) {
          this.onSelectChange(this.selectValues[queryParams.sort]);
          //
        } else if (!queryParams.sort) {
          this.selectValue = "Most recent";
        }
        this.primary = queryParams.primary === "false" ? false : true;
        this.secondary = queryParams.secondary === "false" ? false : true;
        this.status = queryParams.status || "All";
      })
      .unsubscribe();
  }
  selectValues = {
    most_recent: "Most recent",
    oldest_first: "Oldest first",
    highest_price: "Highest price first",
    lowest_price: "Lowest price first",
  };

  selectValuesInverse = {
    [MarketplaceLeftBarComponent.MOST_RECENT]: "most_recent",
    [MarketplaceLeftBarComponent.OLDEST_FIRST]: "oldest_first",
    [MarketplaceLeftBarComponent.HIGHEST_PRICE]: "highest_price",
    [MarketplaceLeftBarComponent.LOWEST_PRICE]: "lowest_price",
  };

  statusValues = {
    all: "All",
    has_bids: "Has bids",
    no_bids: "No bids yet",
    sold: "Sold",
  };

  statusValuesInverse = {
    [MarketplaceLeftBarComponent.ALL]: "all",
    [MarketplaceLeftBarComponent.HAS_BIDS]: "has_bids",
    [MarketplaceLeftBarComponent.NO_BIDS]: "no_bids",
    [MarketplaceLeftBarComponent.SOLD]: "sold",
  };

  changeStatus(status) {
    this.status = status;
  }
  // Functionpass service is made to pass this argument
  apply() {
    this.loading = true;
    this.router.navigate([], {
      queryParams: {
        primary: this.primary,
        secondary: this.secondary,
        status: this.statusValuesInverse[this.status] || "all",
        sort: this.selectValuesInverse[this.selectValue] || "most_recent",
      },
      queryParamsHandling: "merge",
    });
    // Close mobile filtering and stop button loading icon, this is just an illusion of loading
    setTimeout(() => {
      // Change the first two out from this timeout
      this.onFilter.emit("");
      this.functionPass.filter("");
      this.loading = false;
      this.globalVars.isMarketplaceLeftBarMobileOpen = false;
    }, 200);
  }
  togglePrimary() {
    this.primary = !this.primary;
  }

  toggleSecondary() {
    this.secondary = !this.secondary;
  }

  onSelectChange(event) {
    if (this.selectValue != event) {
      this.selectValue = event;
    }
  }
}
