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

  // Status buttons
  statusAll = true;
  statusForSale = false;
  statusHasBids = false;
  statusSold = false;

  // Content format buttons
  formatAll = true;
  formatImages = false;
  formatVideo = false;
  formatMusic = false;
  format3D = false;

  // Creator Type
  verifiedCreators = true;
  allNFTs = false;

  // Sorting
  static MOST_RECENT_FIRST = "Most recent first";
  static OLDEST_FIRST = "Oldest first";
  static HIGHEST_PRICE_FIRST = "Highest price first";
  static LOWEST_PRICE_FIRST = "Lowest price first";
  static MOST_LIKES_FIRST = "Most likes first";
  static MOST_DIAMONDS_FIRST = "Most diamonds first";
  static MOST_COMMENTS_FIRST = "Most comments first";
  static MOST_REPOSTS_FIRST = "Most reposts first";

  // Status
  static ALL = "All";
  static HAS_BIDS = "Has bids";
  static NO_BIDS = "No bids yet";
  static FOR_SALE = "For sale";
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
    this.route.queryParams.subscribe((queryParams) => {
      if (queryParams.sort in this.selectValues) {
        this.onSelectChange(this.selectValues[queryParams.sort]);
      } else if (!queryParams.sort) {
        this.selectValue = "Most recent first";
      }
      this.primary = queryParams.primary === "false" ? false : true;
      this.secondary = queryParams.secondary === "false" ? false : true;
      this.status = this.statusValues[queryParams.status] || "All";
    }).unsubscribe;
  }
  selectValues = {
    most_recent_first: "Most recent first",
    oldest_first: "Oldest first",
    highest_price_first: "Highest price first",
    lowest_price_first: "Lowest price first",
    most_likes_first: "Most likes first",
    most_diamonds_first: "Most diamonds first",
    most_comments_first: "Most comments first",
    most_reposts_first: "Most reposts first",
  };

  selectValuesInverse = {
    [MarketplaceLeftBarComponent.MOST_RECENT_FIRST]: "most_recent_first",
    [MarketplaceLeftBarComponent.OLDEST_FIRST]: "oldest_first",
    [MarketplaceLeftBarComponent.HIGHEST_PRICE_FIRST]: "highest_price_first",
    [MarketplaceLeftBarComponent.LOWEST_PRICE_FIRST]: "lowest_price_first",
    [MarketplaceLeftBarComponent.MOST_LIKES_FIRST]: "most_likes_first",
    [MarketplaceLeftBarComponent.MOST_DIAMONDS_FIRST]: "most_diamonds_first",
    [MarketplaceLeftBarComponent.MOST_COMMENTS_FIRST]: "most_comments_first",
    [MarketplaceLeftBarComponent.MOST_REPOSTS_FIRST]: "most_reposts_first",
  };

  statusValues = {
    all: "All",
    has_bids: "Has bids",
    no_bids: "No bids yet",
    for_sale: "For sale",
    sold: "Sold",
  };

  statusValuesInverse = {
    [MarketplaceLeftBarComponent.ALL]: "all",
    [MarketplaceLeftBarComponent.HAS_BIDS]: "has_bids",
    [MarketplaceLeftBarComponent.NO_BIDS]: "no_bids",
    [MarketplaceLeftBarComponent.FOR_SALE]: "for_sale",
    [MarketplaceLeftBarComponent.SOLD]: "sold",
  };

  changeStatus(status) {
    this.status = status;
  }
  // Status button clicks
  statusClick(button: string) {
    switch (button) {
      case "All":
        if (this.statusAll) {
          this.statusAll = false;
        } else {
          this.statusAll = true;
          // IF all you close others
          this.statusForSale = false;
          this.statusHasBids = false;
          this.statusSold = false;
        }
        break;
      case "For Sale":
        if (this.statusForSale) {
          this.statusForSale = false;
        } else {
          this.statusAll = false;
          this.statusForSale = true;
        }
        break;
      case "Has Bids":
        if (this.statusHasBids) {
          this.statusHasBids = false;
        } else {
          this.statusAll = false;
          this.statusHasBids = true;
        }
        break;
      case "Sold":
        if (this.statusSold) {
          this.statusSold = false;
        } else {
          this.statusAll = false;
          this.statusSold = true;
        }
        break;
      default:
        break;
    }
  }

  // Status button clicks
  formatClick(button: string) {
    switch (button) {
      case "All":
        if (!this.formatAll) {
          this.formatAll = true;
          this.format3D = false;
          this.formatImages = false;
          this.formatMusic = false;
          this.formatVideo = false;
        }
        break;
      case "Images":
        if (this.formatImages) {
          this.formatImages = false;
          // Applies all if all other formats are closed
          this.formatAllIfNoOtherFormats();
        } else {
          this.formatImages = true;
          if (this.formatAll) {
            this.formatAll = false;
          }
        }
        break;
      case "Video":
        if (this.formatVideo) {
          this.formatVideo = false;
          // Applies all if all other formats are closed
          this.formatAllIfNoOtherFormats();
        } else {
          this.formatVideo = true;
          if (this.formatAll) {
            this.formatAll = false;
          }
        }
        break;
      case "Music":
        if (this.formatMusic) {
          this.formatMusic = false;
          // Applies all if all other formats are closed
          this.formatAllIfNoOtherFormats();
        } else {
          this.formatMusic = true;
          if (this.formatAll) {
            this.formatAll = false;
          }
        }
        break;
      case "3D":
        if (this.format3D) {
          this.format3D = false;
          // Applies all if all other formats are closed
          this.formatAllIfNoOtherFormats();
        } else {
          this.format3D = true;
          if (this.formatAll) {
            this.formatAll = false;
          }
        }
        break;
      default:
        break;
    }
  }
  formatAllIfNoOtherFormats() {
    if (!this.format3D && !this.formatImages && !this.formatVideo && !this.formatMusic) {
      this.formatAll = true;
    }
  }
  creatorsClick(creatorType: string) {
    switch (creatorType) {
      case "verified":
        this.verifiedCreators = true;
        this.allNFTs = false;
        break;
      case "all":
        this.allNFTs = true;
        this.verifiedCreators = false;
        break;
      default:
        break;
    }
  }
  // Functionpass service is made to pass this argument
  apply() {
    this.globalVars.isMarketplaceLoading = true;
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
