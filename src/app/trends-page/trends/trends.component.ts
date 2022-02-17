import { Component, HostListener, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BackendApiService } from "../../backend-api.service";
import { GlobalVarsService } from "../../global-vars.service";
import { InfiniteScroller } from "../../infinite-scroller";
import { IAdapter, IDatasource } from "ngx-ui-scroll";
import { FunctionPassService } from "src/app/function-pass.service";

@Component({
  selector: "trends",
  templateUrl: "./trends.component.html",
  styleUrls: ["./trends.component.scss"],
})
export class TrendsComponent implements OnInit {
  globalVars: GlobalVarsService;
  //nftCollections: NFTCollectionResponse[];
  //filteredCollection: NFTCollectionResponse[];
  lastPage: number;
  static PAGE_SIZE = 40;
  static WINDOW_VIEWPORT = true;
  static BUFFER_SIZE = 20;
  static PADDING = 0.5;
  selectedOptionWidth: string;
  pagedRequestsByTab = {};
  lastPageByTab = {};
  loadingNextPage = false;
  index = 0;
  mobile = false;

  // display type, card or grid
  // Naming convention for display grid probably is not optimal but couldnt come up with a better one
  displayCard = true;
  displayGrid = false;
  // Scroll Y position
  scrollPosition: number;

  infiniteScroller: InfiniteScroller = new InfiniteScroller(
    TrendsComponent.PAGE_SIZE,
    this.getPage.bind(this),
    TrendsComponent.WINDOW_VIEWPORT,
    TrendsComponent.BUFFER_SIZE,
    TrendsComponent.PADDING
  );

  datasource: IDatasource<IAdapter<any>> = this.infiniteScroller.getDatasource();

  constructor(
    private backendApi: BackendApiService,
    private route: ActivatedRoute,
    private _globalVars: GlobalVarsService,
    private functionPass: FunctionPassService
  ) {
    this.globalVars = _globalVars;
    this.functionPass.listen().subscribe((m: any) => {
      // Function can either just close menu or choose to sort
      // Marketplace leftbar component
      if (m == "sort") {
        this.sortMarketplace(0, false);
        this.globalVars.marketplaceNFTsOffset = 0;
        document.body.scrollTop = 0; // For Safari
        document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
        this.closeMarketplaceMobileFiltering("sort");
      } else if (m == "close") {
        this.closeMarketplaceMobileFiltering("close");
      }
    });
  }

  ngOnInit(): void {
    if (!this.globalVars.marketplaceNFTsData) {
      this.sortMarketplace(0, false);
    }
    this.setMobileBasedOnViewport();
  }
  @HostListener("window:resize") onResize() {
    this.setMobileBasedOnViewport();
  }
  openMarketplaceMobileFiltering() {
    // Get scroll position before anything else
    this.scrollPosition = window.scrollY;
    this.globalVars.isMarketplaceLeftBarMobileOpen = true;
    this.disable();
  }
  closeMarketplaceMobileFiltering(string: string) {
    if (string == "sort") {
      this.enableNoScroll();
      this.globalVars.isMarketplaceLeftBarMobileOpen = false;
    } else if (string == "close") {
      this.enable();
      this.globalVars.isMarketplaceLeftBarMobileOpen = false;
    }
  }
  // Enable without scrolling, since if user applies we want to scroll to top by default
  enableNoScroll() {
    let anotherElement = document.getElementById("market") as HTMLDivElement;
    anotherElement.style.pointerEvents = "all";
    anotherElement.style.position = "";
    anotherElement.style.overflowY = "";
  }
  // Enable scroll
  enable() {
    let anotherElement = document.getElementById("market") as HTMLDivElement;
    anotherElement.style.pointerEvents = "all";
    anotherElement.style.position = "";
    anotherElement.style.overflowY = "";
    window.scrollTo(0, this.scrollPosition);
  }
  // Disable scroll
  disable() {
    let anotherElement = document.getElementById("market") as HTMLDivElement;
    anotherElement.style.pointerEvents = "none";
    anotherElement.style.position = "fixed";
    anotherElement.style.overflowY = "hidden";
    anotherElement.style.top = -this.scrollPosition + 140 + "px";
  }
  setMobileBasedOnViewport() {
    this.mobile = this.globalVars.isMobile();
  }

  sortMarketplace(offset: number, showMore: boolean) {
    if (!showMore) {
      this.globalVars.isMarketplaceLoading = true;
    }
    this.backendApi
      .SortMarketplace(
        this.globalVars.localNode,
        "",
        offset,
        this.globalVars.marketplaceLowPriceNanos,
        this.globalVars.marketplaceHighPriceNanos,
        this.globalVars.marketplaceStatus,
        this.globalVars.marketplaceMarketType,
        this.globalVars.marketplaceNFTCategory,
        this.globalVars.marketplaceSortType,
        this.globalVars.marketplaceContentFormat,
        this.globalVars.marketplaceVerifiedCreators
      )
      .subscribe(
        (res) => {
          if (showMore) {
            this.globalVars.marketplaceNFTsData = this.globalVars.marketplaceNFTsData.concat(res.PostEntryResponse);
          } else {
            this.globalVars.marketplaceNFTsData = res.PostEntryResponse;
          }
          this.globalVars.isMarketplaceLoading = false;
        },
        (err) => {
          console.log(err.error);
        }
      );
  }
  sortCreators(offset: number, showMore: boolean) {
    if (!showMore) {
      this.globalVars.isMarketplaceLoading = true;
    }
    this.backendApi.SortCreators(this.globalVars.localNode, offset, "verified").subscribe(
      (res) => {
        if (showMore) {
          this.globalVars.marketplaceCreatorData = this.globalVars.marketplaceCreatorData.concat(
            res.SortCreatorsResponses
          );
        } else {
          this.globalVars.marketplaceCreatorData = res.SortCreatorsResponses;
        }
        this.globalVars.isMarketplaceLoading = false;
      },
      (err) => {
        console.log(err);
      }
    );
  }
  getPage(page: number) {
    if (this.lastPage != null && page > this.lastPage) {
      return [];
    }

    const startIdx = page * TrendsComponent.PAGE_SIZE;
    const endIdx = (page + 1) * TrendsComponent.PAGE_SIZE;

    return new Promise((resolve, reject) => {
      resolve(
        this.globalVars.marketplaceNFTsData.slice(
          startIdx,
          Math.min(endIdx, this.globalVars.marketplaceNFTsData.length)
        )
      );
    });
  }
  // Choosing between a grid display of NFTs and Card display
  setDisplayType(display: string) {
    switch (display) {
      case "Card":
        this.globalVars.marketplaceViewTypeCard = true;
        break;
      case "Grid":
        this.globalVars.marketplaceViewTypeCard = false;
        break;
      default:
        break;
    }
  }
  getParamsAndSort() {
    this.route.queryParams
      .subscribe((params) => {
        let filters = {
          sort: params.sort || "",
          status: params.status || "",
          primary: params.primary || "false",
          secondary: params.secondary || "false",
        };
        //this.applySorting(filters);
      })
      .unsubscribe();
  }
  onScrollNFTs() {
    this.globalVars.marketplaceNFTsOffset = this.globalVars.marketplaceNFTsOffset + 30;
    this.sortMarketplace(this.globalVars.marketplaceNFTsOffset, true);
  }
  counter(i: number) {
    return new Array(i);
  }
  sortSelectChange(event) {
    if (this.globalVars.marketplaceSortType != event) {
      this.globalVars.marketplaceSortType = event;
      this.sortMarketplace(0, false);
    }
  }
}
