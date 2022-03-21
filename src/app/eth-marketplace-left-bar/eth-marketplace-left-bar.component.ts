import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { GlobalVarsService } from "../global-vars.service";
import { Location } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { FunctionPassService } from "../function-pass.service";
import { toInteger } from "lodash";

@Component({
  selector: "app-eth-marketplace-left-bar",
  templateUrl: "./eth-marketplace-left-bar.component.html",
  styleUrls: ["./eth-marketplace-left-bar.component.scss"],
})
export class EthMarketplaceLeftBarComponent implements OnInit {
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
  lastSortLowPrice = 0;
  lastSortHighPrice = 0;
  lastSortContentFormatAll = true;
  lastSortContentFormatVideo = false;
  lastSortContentFormatMusic = false;
  lastSortContentFormatImages = false;
  lastSortCreatorTypeVerified = true;
  lastSortMarketPrimary = true;
  lastSortMarketSecondary = true;
  lastSortStatusAll = true;
  lastSortStatusForSale = false;
  lastSortStatusHasBids = false;
  lastSortStatusSold = false;
  lastSortCategory = "all";
  // If Apply button is disabled or allowed
  canUserSort = false;

  constructor(
    public globalVars: GlobalVarsService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location,
    private functionPass: FunctionPassService
  ) {}

  ngOnInit(): void {
    // Set button active states from global memory
    this.statusClick(this.globalVars.ethMarketplaceStatus);
    this.categorySelectChange(this.globalVars.ethMarketplaceNFTCategory);
    this.creatorsClick(this.globalVars.ethMarketplaceVerifiedCreators);
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
          //   this.globalVars.ethMarketplaceCanFilter = false;
        }
        break;
      case "for sale":
        if (this.statusForSale) {
          this.statusAll = true;
          this.statusForSale = false;
        } else {
          this.statusForSale = true;
          //   this.globalVars.ethMarketplaceCanFilter = true;
          this.statusAll = false;
          this.statusHasBids = false;
          this.statusSold = false;
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
      this.globalVars.ethMarketplaceStatus = "all";
      // Store to use in canSort()
      this.lastSortStatusAll = true;
      this.lastSortStatusForSale = false;
      this.lastSortStatusHasBids = false;
      this.lastSortStatusSold = false;
    } else if (this.statusForSale) {
      this.globalVars.ethMarketplaceStatus = "for sale";
      // Store to use in canSort()
      this.lastSortStatusForSale = true;
      this.lastSortStatusSold = false;
      this.lastSortStatusAll = false;
      this.lastSortStatusHasBids = false;
    }
    // Check if user can sort
    this.canSort();
  }
  // Set from click
  creatorsClick(creatorType: string) {
    switch (creatorType) {
      case "verified":
        this.creatorTypeVerified = true;
        break;
      case "all":
        this.creatorTypeVerified = false;
        // this.categoryAndFormatToBaseState();
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
  //   categoryAndFormatToBaseState() {
  //     this.globalVars.ethMarketplaceNFTCategory = "All";
  //   }
  canSort() {
    //   if category is different from last then sort
    if (this.NFTCategory != this.lastSortCategory) {
      this.canUserSort = true;
      // If content format is different from last sort
    } else if (this.lastSortStatusAll != this.statusAll || this.lastSortStatusForSale != this.statusForSale) {
      this.canUserSort = true;
      // If creator type is different from last time
    } else if (this.lastSortCreatorTypeVerified != this.creatorTypeVerified) {
      this.canUserSort = true;
      // If nothing has changed user cannot sort
    } else {
      this.canUserSort = false;
    }
  }
  // Functionpass service is made to pass this argument
  apply() {
    this.globalVars.isEthMarketplaceLoading = true;
    // this.setPriceRangeInNanos();
    // this.setMarketType();
    this.setCategory();
    // this.setContentFormat();
    this.setStatus();
    this.setCreatorType();
    // this.onFilter.emit("sort");
    // this.functionPass.filter("sort");
    this.canUserSort = false;

    this.globalVars.getEthNFTsByFilter();
    // console.log(this.globalVars.ethMarketplaceStatus);

    // if (this.globalVars.ethMarketplaceStatus === "all") {
    //   this.globalVars.getAllEthNFTs();
    // }

    // if (this.globalVars.ethMarketplaceStatus === "for sale") {
    //   this.globalVars.sortEthMarketplace();
    // }

    setTimeout(() => {
      this.globalVars.isEthMarketplaceLeftBarMobileOpen = false;

      console.log(` ------- lastSortStatusAll ${this.lastSortStatusAll} `);
      console.log(` ------- lastSortStatusForSale ${this.lastSortStatusForSale} `);
      console.log(` ------- canSort? ${this.canUserSort}`);
    }, 200);
  }
  closeMenu() {
    this.functionPass.filter("close");
    this.onFilter.emit("close");
    setTimeout(() => {
      this.globalVars.isEthMarketplaceLeftBarMobileOpen = false;
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
    if (this.globalVars.ethMarketplaceNFTCategory != this.NFTCategory) {
      this.globalVars.ethMarketplaceNFTCategory = this.NFTCategory;
      // Store to use in canSort
      this.lastSortCategory = this.NFTCategory;
      // Check if user can sort
      this.canSort();
    }
  }
}
