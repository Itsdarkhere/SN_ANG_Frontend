import { Component, OnInit } from "@angular/core";
import { Location } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { BackendApiService, NFTCollectionResponse } from "../../backend-api.service";
import { GlobalVarsService } from "../../global-vars.service";
import { InfiniteScroller } from "../../infinite-scroller";
import { IAdapter, IDatasource } from "ngx-ui-scroll";
import { uniqBy } from "lodash";
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
  //startIndex = 0;
  //endIndex = 20;
  //dataToShow: NFTCollectionResponse[];
  selectedOptionWidth: string;
  pagedRequestsByTab = {};
  lastPageByTab = {};
  loadingNextPage = false;
  index = 0;
  mobile = false;

  // Nfts, creators, collections
  typeNFTs = true;
  typeCollections = false;
  typeCreators = false;

  sortValue = "most recent first";

  // display type, card or grid
  // Naming convention for display grid probably is not optimal but couldnt come up with a better one
  displayCard = true;
  displayGrid = false;

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
      this.sortMarketplace(0, false);
      this.globalVars.marketplaceOffset = 0;
      document.body.scrollTop = 0; // For Safari
      document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
    });
  }

  ngOnInit(): void {
    if (!this.globalVars.marketplaceDataToShow) {
      //this.sortMarketplace(this.globalVars.marketplaceOffset, false);
    }
    this.setMobileBasedOnViewport();
    this.sortMarketplace(0, false);
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
        this.globalVars.lowPrice,
        this.globalVars.highPrice,
        this.globalVars.auctionStatus,
        this.globalVars.marketType,
        this.globalVars.category,
        this.sortValue,
        this.globalVars.contentFormat,
        this.globalVars.creatorsType
      )
      .subscribe(
        (res) => {
          if (showMore) {
            this.globalVars.marketplaceDataToShow = this.globalVars.marketplaceDataToShow.concat(res.PostEntryResponse);
          } else {
            this.globalVars.marketplaceDataToShow = res.PostEntryResponse;
          }
          this.globalVars.isMarketplaceLoading = false;
        },
        (err) => {
          console.log(err.error);
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
        this.globalVars.marketplaceDataToShow.slice(
          startIdx,
          Math.min(endIdx, this.globalVars.marketplaceDataToShow.length)
        )
      );
    });
  }
  // Choosing between a grid display of NFTs and Card display
  setDisplayType(display: string) {
    switch (display) {
      case "Card":
        this.displayCard = true;
        this.displayGrid = false;
        break;
      case "Grid":
        this.displayGrid = true;
        this.displayCard = false;
        break;
      default:
        break;
    }
  }
  setContentType(content: string) {
    switch (content) {
      case "NFTs":
        this.typeNFTs = true;
        // Only one content type at a time
        this.typeCollections = false;
        this.typeCreators = false;
        break;
      case "Collections":
        this.typeCollections = true;
        // Only one content type at a time
        this.typeNFTs = false;
        this.typeCreators = false;
        break;
      case "Creators":
        this.typeCreators = true;
        // Only one content type at a time
        this.typeCollections = false;
        this.typeNFTs = false;
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
  onScroll() {
    this.globalVars.marketplaceOffset = this.globalVars.marketplaceOffset + 30;
    this.sortMarketplace(this.globalVars.marketplaceOffset, true);
  }

  counter(i: number) {
    return new Array(i);
  }
  sortSelectChange(event) {
    if (this.sortValue != event) {
      this.sortValue = event;
      this.sortMarketplace(0, false);
    }
  }
}
