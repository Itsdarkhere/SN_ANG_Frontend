import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { GlobalVarsService } from "../global-vars.service";
import { Location } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { FunctionPassService } from "../function-pass.service";
import { toInteger } from "lodash";

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

  // Content format buttons
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
  // Content format
  contentFormatAll: boolean;
  contentFormatImages: boolean;
  contentFormatVideo: boolean;
  contentFormatMusic: boolean;
  contentFormat3D: boolean;
  // Category
  NFTCategory: string;

  // Price range
  lowPrice: number;
  highPrice: number;
  // If set price range can be clicked
  // price range incorrect
  priceRangeCorrect = false;
  priceRangeIncorrect = false;

  constructor(
    public globalVars: GlobalVarsService,
    private router: Router,
    private route: ActivatedRoute,
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
  }
  // Input validation
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
  setPriceRangeInNanos() {
    this.globalVars.marketplacePriceRangeSet = true;
    // These are displayed in the ui once price is set
    this.globalVars.marketplaceLowPriceUSD = this.lowPrice;
    this.globalVars.marketplaceHighPriceUSD = this.highPrice;
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
  }
  // Set the status, stays in memory
  setStatus() {
    if (this.statusAll) {
      this.globalVars.marketplaceStatus = "all";
    } else if (this.statusForSale) {
      this.globalVars.marketplaceStatus = "for sale";
    } else if (this.statusHasBids) {
      this.globalVars.marketplaceStatus = "has bids";
    } else if (this.statusSold) {
      this.globalVars.marketplaceStatus = "sold";
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
  }
  // Set marketType TO global memory
  setMarketType() {
    if (this.marketPrimary && this.marketSecondary) {
      this.globalVars.marketplaceMarketType = "all";
    } else if (!this.marketPrimary && this.marketSecondary) {
      this.globalVars.marketplaceMarketType = "secondary";
    } else if (this.marketPrimary && !this.marketSecondary) {
      this.globalVars.marketplaceMarketType = "primary";
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
  }
  // Set to memory
  setCreatorType() {
    if (this.creatorTypeVerified) {
      this.globalVars.marketplaceVerifiedCreators = "verified";
    } else {
      this.globalVars.marketplaceVerifiedCreators = "all";
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
          this.formatImages = true;
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
          this.formatVideo = true;
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
          if (this.formatAll) {
            this.formatAll = false;
          }
        }
        break;
      // These below only get triggered on init
      case "images video":
        this.contentFormatVideo = true;
        this.contentFormatImages = true;
        this.contentFormatAll = false;
        this.contentFormatMusic = false;
        break;
      case "images music":
        this.contentFormatImages = true;
        this.contentFormatMusic = true;
        this.contentFormatVideo = false;
        this.contentFormatAll = false;
        break;
      case "music video":
        this.contentFormatVideo = true;
        this.contentFormatMusic = true;
        this.contentFormatAll = false;
        this.contentFormatImages = false;
        break;
      default:
        break;
    }
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
    } else if (this.formatImages && this.formatMusic && this.formatVideo) {
      this.globalVars.marketplaceContentFormat = "all";
    } else if (this.formatImages && this.formatVideo) {
      this.globalVars.marketplaceContentFormat = "images video";
    } else if (this.formatImages && this.formatMusic) {
      this.globalVars.marketplaceContentFormat = "images music";
    } else if (this.formatMusic && this.formatVideo) {
      this.globalVars.marketplaceContentFormat = "music video";
    } else if (this.formatImages) {
      this.globalVars.marketplaceContentFormat = "images";
    } else if (this.formatVideo) {
      this.globalVars.marketplaceContentFormat = "video";
    } else if (this.formatMusic) {
      this.globalVars.marketplaceContentFormat = "music";
    }
  }
  // Functionpass service is made to pass this argument
  apply() {
    this.globalVars.isMarketplaceLoading = true;
    this.setPriceRangeInNanos();
    this.setMarketType();
    this.setCategory();
    this.setContentFormat();
    this.setStatus();
    this.setCreatorType();
    this.onFilter.emit("");
    this.functionPass.filter("");
    setTimeout(() => {
      this.globalVars.isMarketplaceLeftBarMobileOpen = false;
    }, 200);
  }
  // Set to showcase active state
  categorySelectChange(event) {
    if (this.NFTCategory != event) {
      this.NFTCategory = event;
    }
  }
  // Set to global memory
  setCategory() {
    this.globalVars.marketplaceNFTCategory = this.NFTCategory;
  }
}
