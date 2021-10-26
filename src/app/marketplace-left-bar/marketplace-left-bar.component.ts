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
  primary = false;
  secondary = false;
  selectValue: string;
  // Sorting
  static MOST_RECENT = "Most recent";
  static OLDEST_FIRST = "Oldest first";
  static HIGHEST_PRICE = "Highest price first";
  static LOWEST_PRICE = "Lowest price first";
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
        this.primary = queryParams.primary === "true" ? true : false;
        this.secondary = queryParams.secondary === "true" ? true : false;
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

  // Functionpass service is made to pass this argument
  apply() {
    this.loading = true;
    this.onFilter.emit("");
    this.functionPass.filter("");
    // Close mobile filtering and stop button loading icon, this is just an illusion of loading
    setTimeout(() => {
      this.loading = false;
      this.globalVars.isMarketplaceLeftBarMobileOpen = false;
    }, 500);
  }
  togglePrimary() {
    this.primary = !this.primary;

    this.router.navigate([], {
      queryParams: {
        primary: this.primary,
      },
      queryParamsHandling: "merge",
    });
  }

  toggleSecondary() {
    this.secondary = !this.secondary;

    this.router.navigate([], {
      queryParams: {
        secondary: this.secondary,
      },
      queryParamsHandling: "merge",
    });
  }

  onSelectChange(event) {
    if (this.selectValue != event) {
      this.selectValue = event;
    }
    this.router.navigate([], {
      queryParams: {
        sort: this.selectValuesInverse[event] || "most_recent",
      },
      queryParamsHandling: "merge",
    });
  }
}
