import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { GlobalVarsService } from "../global-vars.service";
import { Location } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { FunctionPassService } from "../function-pass.service";
import { toInteger } from "lodash";
import { THIS_EXPR } from "@angular/compiler/src/output/output_ast";

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
  categoryValue: string = "all";
  priceValue: string = "all";
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

  lowPrice: number;
  highPrice: number;
  // If set price range can be clicked
  // price range incorrect
  priceRangeCorrect = false;
  priceRangeIncorrect = false;

  isPriceRangeSet = false;

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
      if (true) {
      } else if (!queryParams.sort) {
        //this.selectValue = "Most recent first";
      }
    }).unsubscribe;
  }

  changeStatus(status) {
    this.status = status;
  }
  checkPriceRange() {
    if (this.lowPrice < this.highPrice && this.lowPrice >= 0) {
      this.priceRangeCorrect = true;
      this.priceRangeIncorrect = false;
    } else if (this.lowPrice && this.highPrice) {
      this.priceRangeIncorrect = true;
      this.priceRangeCorrect = false;
    } else {
      this.priceRangeIncorrect = false;
      this.priceRangeCorrect = false;
    }
  }
  setPriceRange() {
    this.isPriceRangeSet = true;
    // Postgres reads only nanos
    this.setPriceRangeInNanos();
  }
  setPriceRangeInNanos() {
    // Unfortunately need to cast to int to remove numbers after ( . )
    // This does make the query slightly less accurate
    this.globalVars.lowPrice = toInteger(this.globalVars.usdToNanosNumber(this.lowPrice));
    this.globalVars.highPrice = toInteger(this.globalVars.usdToNanosNumber(this.highPrice));
  }
  resetPriceRange() {
    this.lowPrice = 0;
    this.highPrice = 0;
    this.priceRangeCorrect = false;
    this.priceRangeIncorrect = false;
    this.isPriceRangeSet = false;
    this.globalVars.lowPrice = 0;
    this.globalVars.highPrice = 0;
  }
  // Status button clicks
  statusClick(button: string) {
    switch (button) {
      case "All":
        if (this.statusAll) {
          this.statusAll = true;
        } else {
          this.statusAll = true;
          // IF all you close others
          this.statusForSale = false;
          this.statusHasBids = false;
          this.statusSold = false;
          this.globalVars.auctionStatus = "all";
        }
        break;
      case "For Sale":
        if (this.statusForSale) {
          this.statusForSale = false;
          this.statusAll = true;
        } else {
          this.statusAll = false;
          this.statusHasBids = false;
          this.statusSold = false;
          this.statusForSale = true;
          this.globalVars.auctionStatus = "for sale";
        }
        break;
      case "Has Bids":
        if (this.statusHasBids) {
          this.statusHasBids = false;
          this.statusAll = true;
        } else {
          this.statusAll = false;
          this.statusForSale = false;
          this.statusSold = false;
          this.statusHasBids = true;
          this.globalVars.auctionStatus = "has bids";
        }
        break;
      case "Sold":
        if (this.statusSold) {
          this.statusSold = false;
          this.statusAll = true;
        } else {
          this.statusAll = false;
          this.statusHasBids = false;
          this.statusForSale = false;
          this.statusSold = true;
          this.globalVars.auctionStatus = "sold";
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
      this.globalVars.contentFormat = "all";
    }
  }
  creatorsClick(creatorType: string) {
    switch (creatorType) {
      case "verified":
        this.verifiedCreators = true;
        this.allNFTs = false;
        this.globalVars.creatorsType = "verified";
        break;
      case "all":
        this.allNFTs = true;
        this.verifiedCreators = false;
        this.globalVars.creatorsType = "all";
        this.categoryAndFormatToBaseState();
        break;
      default:
        break;
    }
  }
  categoryAndFormatToBaseState() {
    this.globalVars.category = "all";
    this.globalVars.contentFormat = "all";
    this.categoryValue = "all";
    this.format3D = false;
    this.formatImages = false;
    this.formatMusic = false;
    this.formatVideo = false;
    this.formatAll = true;
  }
  setMarketTypeFilter() {
    if (this.primary && this.secondary) {
      this.globalVars.marketType = "all";
    } else if (this.primary && !this.secondary) {
      this.globalVars.marketType = "primary";
    } else if (!this.primary && this.secondary) {
      this.globalVars.marketType = "secondary";
    } else {
      this.globalVars.marketType = "all";
    }
  }
  setContentFormatFilter() {
    if (this.formatAll) {
      this.globalVars.contentFormat = "all";
    } else if (this.formatImages && this.formatMusic && this.formatVideo) {
      this.globalVars.contentFormat = "all";
    } else if (this.formatImages && this.formatVideo) {
      this.globalVars.contentFormat = "images video";
    } else if (this.formatImages && this.formatMusic) {
      this.globalVars.contentFormat = "images music";
    } else if (this.formatMusic && this.formatVideo) {
      this.globalVars.contentFormat = "music video";
    } else if (this.formatImages) {
      this.globalVars.contentFormat = "images";
    } else if (this.formatVideo) {
      this.globalVars.contentFormat = "video";
    } else if (this.formatMusic) {
      this.globalVars.contentFormat = "music";
    }
  }
  // Functionpass service is made to pass this argument
  apply() {
    this.globalVars.isMarketplaceLoading = true;
    this.setPriceRange();
    this.loading = true;
    this.setMarketTypeFilter();
    this.setContentFormatFilter();
    this.onFilter.emit("");
    this.functionPass.filter("");
    setTimeout(() => {
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
  categorySelectChange(event) {
    if (this.categoryValue != event) {
      this.categoryValue = event;
      this.globalVars.category = event;
    }
  }
}
