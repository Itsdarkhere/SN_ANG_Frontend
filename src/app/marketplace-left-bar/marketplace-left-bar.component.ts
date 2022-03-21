import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { GlobalVarsService } from "../global-vars.service";
import { Location } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { FunctionPassService } from "../function-pass.service";
import { toInteger } from "lodash";
import { MixpanelService } from "../mixpanel.service";

@Component({
  selector: "app-marketplace-left-bar",
  templateUrl: "./marketplace-left-bar.component.html",
  styleUrls: ["./marketplace-left-bar.component.scss"],
})
export class MarketplaceLeftBarComponent implements OnInit {
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() onFilter: EventEmitter<any> = new EventEmitter();
  @Input() flyout: boolean;
  priceValue: string = "all";

  // Content format
  formatAll: boolean;
  formatImages: boolean;
  formatVideo: boolean;
  formatMusic: boolean;
  format3D: boolean;
  // Status
  statusAll: boolean;
  statusForSale: boolean;
  statusHasBids: boolean;
  statusSold: boolean;
  // Market
  marketPrimary: boolean;
  marketSecondary: boolean;
  // Creator type
  creatorTypeVerified: boolean;
  // Category
  NFTCategory: string;

  // Price range
  lowPrice: number;
  highPrice: number;
  // If set price range can be clicked
  // price range incorrect
  priceRangeCorrect = false;
  priceRangeIncorrect = false;
  // Last sort values, keep last sort values in memory to compare them to current values
  // This is to enable / disable the apply button accordingly
  lastSortLowPrice = undefined;
  lastSortHighPrice = undefined;
  lastSortContentFormatAll = true;
  lastSortContentFormatVideo = false;
  lastSortContentFormatMusic = false;
  lastSortContentFormatImages = false;
  lastSortContentFormat3D = false;
  lastSortCreatorTypeVerified = true;
  lastSortMarketPrimary = true;
  lastSortMarketSecondary = true;
  lastSortStatusAll = true;
  lastSortStatusForSale = false;
  lastSortStatusHasBids = false;
  lastSortStatusSold = false;
  lastSortCategory = "all";

  undefinedCheck = undefined;
  // If Apply button is disabled or allowed
  canUserSort = false;

  constructor(
    public globalVars: GlobalVarsService,
    private router: Router,
    private route: ActivatedRoute,
    private mixPanel: MixpanelService,
    private location: Location,
    private functionPass: FunctionPassService
  ) {}

  ngOnInit(): void {
    // Set button active states from global memory
    this.statusClick(this.globalVars.marketplaceStatus);
    this.marketClick(this.globalVars.marketplaceMarketType);
    this.creatorsClick(this.globalVars.marketplaceVerifiedCreators);
    this.formatClick(this.globalVars.marketplaceContentFormat);
    this.categorySelectChange(this.globalVars.marketplaceNFTCategory);
    this.setFunction();
    this.mixPanel.track18("Marketplace Viewed");
  }
  // Input validation
  checkPriceRange() {
    if (this.lowPrice < this.highPrice && this.lowPrice >= 0) {
      this.priceRangeCorrect = true;
      this.priceRangeIncorrect = false;
    } else if (this.lowPrice == null && this.highPrice == null) {
      this.priceRangeCorrect = true;
      this.priceRangeIncorrect = false;
    } else {
      this.priceRangeIncorrect = true;
      this.priceRangeCorrect = false;
    }
    this.canSort();
  }
  setPriceRangeInNanos() {
    this.globalVars.marketplacePriceRangeSet = true;
    // These are displayed in the ui once price is set
    this.globalVars.marketplaceLowPriceUSD = this.lowPrice;
    this.globalVars.marketplaceHighPriceUSD = this.highPrice;
    // These are used in the canSort()
    this.lastSortLowPrice = this.lowPrice;
    this.lastSortHighPrice = this.highPrice;
    // These are sent to the backend
    // Unfortunately need to cast to int to remove numbers after ( . )
    // This does make the query slightly less accurate
    this.globalVars.marketplaceLowPriceNanos = toInteger(this.globalVars.usdToNanosNumber(this.lowPrice));
    this.globalVars.marketplaceHighPriceNanos = toInteger(this.globalVars.usdToNanosNumber(this.highPrice));
  }
  showPriceRange() {
    if (!this.globalVars.marketplaceLowPriceUSD && !this.globalVars.marketplaceHighPriceUSD) {
      return "0$ to ";
    } else {
      return this.globalVars.marketplaceLowPriceUSD + "$ to " + this.globalVars.marketplaceHighPriceUSD + "$";
    }
  }
  resetPriceRange() {
    this.lowPrice = 0;
    this.highPrice = 0;
    this.priceRangeCorrect = false;
    this.priceRangeIncorrect = false;
    this.globalVars.marketplacePriceRangeSet = false;
    this.globalVars.marketplaceLowPriceNanos = 0;
    this.globalVars.marketplaceHighPriceNanos = 0;
    this.globalVars.marketplaceHighPriceUSD = 0;
    this.globalVars.marketplaceHighPriceUSD = 0;
    this.canSort();
  }

  categoryAndFormatToBaseState() {
    this.globalVars.marketplaceNFTCategory = "all";
    this.globalVars.marketplaceContentFormat = "all";
    this.format3D = false;
    this.formatImages = false;
    this.formatMusic = false;
    this.formatVideo = false;
    this.formatAll = true;
  }
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
    this.canSort();
  }
  // Set the status, stays in memory
  setStatus() {
    if (this.statusAll) {
      this.globalVars.marketplaceStatus = "all";
      this.globalVars.ethMarketplaceStatus = "all";
      // Store to use in canSort()
      this.lastSortStatusAll = true;
      this.lastSortStatusForSale = false;
      this.lastSortStatusHasBids = false;
      this.lastSortStatusSold = false;
    } else if (this.statusForSale) {
      this.globalVars.marketplaceStatus = "for sale";
      this.globalVars.ethMarketplaceStatus = "for sale";
      // Store to use in canSort()
      this.lastSortStatusForSale = true;
      this.lastSortStatusSold = false;
      this.lastSortStatusAll = false;
      this.lastSortStatusHasBids = false;
    } else if (this.statusHasBids) {
      this.globalVars.marketplaceStatus = "has bids";
      // Store to use in canSort()
      this.lastSortStatusHasBids = true;
      this.lastSortStatusAll = false;
      this.lastSortStatusForSale = false;
      this.lastSortStatusSold = false;
    } else if (this.statusSold) {
      this.globalVars.marketplaceStatus = "sold";
      // Store to use in canSort()
      this.lastSortStatusSold = true;
      this.lastSortStatusHasBids = false;
      this.lastSortStatusAll = false;
      this.lastSortStatusForSale = false;
    }
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
    this.canSort();
  }
  // Set marketType TO global memory
  setMarketType() {
    if (this.marketPrimary && this.marketSecondary) {
      this.globalVars.marketplaceMarketType = "all";
      // Store to compare in canSort()
      this.lastSortMarketPrimary = true;
      this.lastSortMarketSecondary = true;
    } else if (!this.marketPrimary && this.marketSecondary) {
      this.globalVars.marketplaceMarketType = "secondary";
      // Store to compare in canSort()
      this.lastSortMarketPrimary = false;
      this.lastSortMarketSecondary = true;
    } else if (this.marketPrimary && !this.marketSecondary) {
      this.globalVars.marketplaceMarketType = "primary";
      // Store to compare in canSort()
      this.lastSortMarketPrimary = true;
      this.lastSortMarketSecondary = false;
    }
  }
  // Set from click
  creatorsClick(creatorType: string) {
    switch (creatorType) {
      case "verified":
        this.creatorTypeVerified = true;
        break;
      case "all":
        this.creatorTypeVerified = false;
        this.categoryAndFormatToBaseState();
        break;
      default:
        break;
    }
    // Check if user can sort
    this.canSort();
  }
  // Set to memory
  setCreatorType() {
    if (this.creatorTypeVerified) {
      this.globalVars.marketplaceVerifiedCreators = "verified";
      // Store to use in canSort
      this.lastSortCreatorTypeVerified = true;
    } else {
      this.globalVars.marketplaceVerifiedCreators = "all";
      // Store to use in canSort
      this.lastSortCreatorTypeVerified = false;
    }
  }
  // Format button clicks
  formatClick(button: string) {
    switch (button) {
      case "all":
        if (!this.formatAll) {
          this.formatAll = true;
          this.format3D = false;
          this.formatImages = false;
          this.formatMusic = false;
          this.formatVideo = false;
        }
        break;
      case "images":
        if (this.formatImages) {
          this.formatImages = false;
          // Applies all if all other formats are closed
          this.formatAllIfNoOtherFormats();
        } else {
          this.formatMusic = false;
          this.formatImages = true;
          this.formatVideo = false;
          this.format3D = false;
          if (this.formatAll) {
            this.formatAll = false;
          }
        }
        break;
      case "video":
        if (this.formatVideo) {
          this.formatVideo = false;
          // Applies all if all other formats are closed
          this.formatAllIfNoOtherFormats();
        } else {
          this.formatMusic = false;
          this.formatImages = false;
          this.formatVideo = true;
          this.format3D = false;
          if (this.formatAll) {
            this.formatAll = false;
          }
        }
        break;
      case "music":
        if (this.formatMusic) {
          this.formatMusic = false;
          // Applies all if all other formats are closed
          this.formatAllIfNoOtherFormats();
        } else {
          this.formatMusic = true;
          this.formatImages = false;
          this.formatVideo = false;
          this.format3D = false;
          if (this.formatAll) {
            this.formatAll = false;
          }
        }
        break;
      case "3d":
        if (this.format3D) {
          this.format3D = false;
          // Applies all if all other formats are closed
          this.formatAllIfNoOtherFormats();
        } else {
          this.formatMusic = false;
          this.formatImages = false;
          this.formatVideo = false;
          this.format3D = true;
          if (this.formatAll) {
            this.formatAll = false;
          }
        }
        break;
      // These below only get triggered on init
      /*case "images video":
        this.formatVideo = true;
        this.formatImages = true;
        this.formatAll = false;
        this.formatMusic = false;
        break;
      case "images music":
        this.formatImages = true;
        this.formatMusic = true;
        this.formatVideo = false;
        this.formatAll = false;
        break;
      case "music video":
        this.formatVideo = true;
        this.formatMusic = true;
        this.formatAll = false;
        this.formatImages = false;
        break;
      */
      default:
        break;
    }
    // Check if user can sort
    this.canSort();
  }
  // Set format to all if there is no other formats after clicking
  formatAllIfNoOtherFormats() {
    if (!this.format3D && !this.formatImages && !this.formatVideo && !this.formatMusic) {
      this.formatAll = true;
      this.globalVars.marketplaceContentFormat = "all";
    }
  }
  // Set to stay in memory
  setContentFormat() {
    if (this.formatAll) {
      this.globalVars.marketplaceContentFormat = "all";
      // Store to use in canSort
      this.lastSortContentFormatAll = true;
      this.lastSortContentFormatImages = false;
      this.lastSortContentFormatVideo = false;
      this.lastSortContentFormatMusic = false;
      this.lastSortContentFormat3D = false;
    } else if (this.formatImages) {
      this.globalVars.marketplaceContentFormat = "images";
      // Store to use in canSort
      this.lastSortContentFormatAll = false;
      this.lastSortContentFormatImages = true;
      this.lastSortContentFormatVideo = false;
      this.lastSortContentFormatMusic = false;
      this.lastSortContentFormat3D = false;
    } else if (this.formatVideo) {
      this.globalVars.marketplaceContentFormat = "video";
      // Store to use in canSort
      this.lastSortContentFormatAll = false;
      this.lastSortContentFormatMusic = false;
      this.lastSortContentFormatImages = false;
      this.lastSortContentFormatVideo = true;
      this.lastSortContentFormat3D = false;
    } else if (this.formatMusic) {
      this.globalVars.marketplaceContentFormat = "music";
      // Store to use in canSort
      this.lastSortContentFormatAll = false;
      this.lastSortContentFormatVideo = false;
      this.lastSortContentFormatMusic = true;
      this.lastSortContentFormatImages = false;
      this.lastSortContentFormat3D = false;
    } else if (this.format3D) {
      this.globalVars.marketplaceContentFormat = "3d";
      // Store to use in canSort
      this.lastSortContentFormatAll = false;
      this.lastSortContentFormatImages = false;
      this.lastSortContentFormatVideo = false;
      this.lastSortContentFormatMusic = false;
      this.lastSortContentFormat3D = true;
    }
  }
  canSort() {
    // If price is different from last sort
    if (this.lastSortLowPrice != this.lowPrice || this.lastSortHighPrice != this.highPrice) {
      console.log(this.lowPrice);
      console.log(this.highPrice);

      this.canUserSort = true;
      // If market is different from last sort
    } else if (
      this.lastSortMarketPrimary != this.marketPrimary ||
      this.lastSortMarketSecondary != this.marketSecondary
    ) {
      this.canUserSort = true;
      // If category is different from last sort
    } else if (this.NFTCategory != this.lastSortCategory) {
      this.canUserSort = true;
      // If content format is different from last sort
    } else if (
      this.lastSortContentFormatAll != this.formatAll ||
      this.lastSortContentFormatImages != this.formatImages ||
      this.lastSortContentFormatVideo != this.formatVideo ||
      this.lastSortContentFormatMusic != this.formatMusic ||
      this.lastSortContentFormat3D != this.format3D
    ) {
      this.canUserSort = true;
      // If status is different from last time
    } else if (
      this.lastSortStatusAll != this.statusAll ||
      this.lastSortStatusForSale != this.statusForSale ||
      this.lastSortStatusHasBids != this.statusHasBids ||
      this.lastSortStatusSold != this.statusSold
    ) {
      this.canUserSort = true;
      // If creator type is different from last time
    } else if (this.lastSortCreatorTypeVerified != this.creatorTypeVerified) {
      this.canUserSort = true;
      // If nothing has changed user cannot sort
    } else {
      this.canUserSort = false;
    }
  }
  setFunction() {
    this.setPriceRangeInNanos();
    this.setMarketType();
    this.setCategory();
    this.setContentFormat();
    this.setStatus();
    this.setCreatorType();

    this.canSort();
  }
  // Functionpass service is made to pass this argument
  apply() {
    if (this.globalVars.desoMarketplace) {
      this.globalVars.isMarketplaceLoading = true;
      this.setPriceRangeInNanos();
      this.setMarketType();
      this.setCategory();
      this.setContentFormat();
      this.setStatus();
      this.setCreatorType();
      this.onFilter.emit("sort");
      this.functionPass.filter("sort");
      this.canUserSort = false;
      setTimeout(() => {
        this.globalVars.isMarketplaceLeftBarMobileOpen = false;
      }, 200);
    } else {
      this.globalVars.isEthMarketplaceLoading = true;
      this.setCategory();
      this.setStatus();
      this.canUserSort = false;

      console.log(this.globalVars.ethMarketplaceStatus);

      if (this.globalVars.ethMarketplaceStatus === "all" || this.globalVars.ethMarketplaceStatus === "for sale") {
        this.globalVars.getEthNFTsByFilter();
      }

      setTimeout(() => {
        this.globalVars.isMarketplaceLeftBarMobileOpen = false;
      }, 200);
    }
  }
  closeMenu() {
    this.functionPass.filter("close");
    this.onFilter.emit("close");
    setTimeout(() => {
      this.globalVars.isMarketplaceLeftBarMobileOpen = false;
    }, 200);
  }
  // Set to showcase active state
  categorySelectChange(event) {
    if (this.NFTCategory != event) {
      this.NFTCategory = event;
      // Check if user can sort
      this.canSort();
    }
  }
  // Set to global memory
  setCategory() {
    if (this.globalVars.marketplaceNFTCategory != this.NFTCategory) {
      this.globalVars.marketplaceNFTCategory = this.NFTCategory;
      // Store to use in canSort
      this.lastSortCategory = this.NFTCategory;
      // Check if user can sort
      this.canSort();
    }
  }
}
