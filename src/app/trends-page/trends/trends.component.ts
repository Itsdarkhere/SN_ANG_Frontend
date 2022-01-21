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
      this.getParamsAndSort();
    });
  }

  ngOnInit(): void {
    if (!this.globalVars.marketplaceDataToShow) {
      this.loadData();
    }
    this.setMobileBasedOnViewport();
  }

  setMobileBasedOnViewport() {
    this.mobile = this.globalVars.isMobile();
  }

  getPage(page: number) {
    if (this.lastPage != null && page > this.lastPage) {
      return [];
    }

    const startIdx = page * TrendsComponent.PAGE_SIZE;
    const endIdx = (page + 1) * TrendsComponent.PAGE_SIZE;

    return new Promise((resolve, reject) => {
      resolve(
        this.globalVars.marketplaceFilteredCollection.slice(
          startIdx,
          Math.min(endIdx, this.globalVars.marketplaceCollection.length)
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
        this.applySorting(filters);
      })
      .unsubscribe();
  }

  applySorting(filters) {
    // Filter based on status
    let status = filters.status;
    let primary = filters.primary;
    let secondary = filters.secondary;
    let sort = filters.sort;
    // Reset start and endIndex
    this.globalVars.marketplaceStartIndex = 0;
    this.globalVars.marketplaceEndIndex = 20;

    // Order
    switch (sort) {
      case "most_recent_first":
        // Keep all
        this.globalVars.marketplaceCollection.sort(
          (a, b) => b.PostEntryResponse.TimestampNanos - a.PostEntryResponse.TimestampNanos
        );
        break;
      case "oldest_first":
        this.globalVars.marketplaceCollection.sort(
          (a, b) => a.PostEntryResponse.TimestampNanos - b.PostEntryResponse.TimestampNanos
        );
        break;
      case "highest_price_first":
        this.globalVars.marketplaceCollection.sort(
          (a, b) => b.NFTEntryResponse.MinBidAmountNanos - a.NFTEntryResponse.MinBidAmountNanos
        );
        break;
      case "lowest_price_first":
        this.globalVars.marketplaceCollection.sort(
          (a, b) => a.NFTEntryResponse.MinBidAmountNanos - b.NFTEntryResponse.MinBidAmountNanos
        );
        break;
      case "most_likes_first":
        this.globalVars.marketplaceCollection.sort(
          (a, b) => b.PostEntryResponse.LikeCount - a.PostEntryResponse.LikeCount
        );
        break;
      case "most_diamonds_first":
        this.globalVars.marketplaceCollection.sort(
          (a, b) => b.PostEntryResponse.DiamondCount - a.PostEntryResponse.DiamondCount
        );
        break;
      case "most_comments_first":
        this.globalVars.marketplaceCollection.sort(
          (a, b) => b.PostEntryResponse.CommentCount - a.PostEntryResponse.CommentCount
        );
        break;
      case "most_reposts_first":
        this.globalVars.marketplaceCollection.sort(
          (a, b) => b.PostEntryResponse.RepostCount - a.PostEntryResponse.RepostCount
        );
        break;
      default:
        this.globalVars.marketplaceCollection.sort(
          (a, b) => b.PostEntryResponse.TimestampNanos - a.PostEntryResponse.TimestampNanos
        );
        break;
    }
    // Only use nftCollections in first filter
    switch (status) {
      case "all":
        // Keep all
        this.globalVars.marketplaceFilteredCollection = this.globalVars.marketplaceCollection;
        break;
      case "has_bids":
        this.globalVars.marketplaceFilteredCollection = this.globalVars.marketplaceCollection.filter(
          (nft) => nft.NFTEntryResponse.HighestBidAmountNanos != 0 && nft.NFTEntryResponse.IsForSale
        );
        break;
      case "no_bids":
        this.globalVars.marketplaceFilteredCollection = this.globalVars.marketplaceCollection.filter(
          (nft) => nft.NFTEntryResponse.HighestBidAmountNanos === 0 && nft.NFTEntryResponse.IsForSale
        );
        break;
      case "for_sale":
        this.globalVars.marketplaceFilteredCollection = this.globalVars.marketplaceCollection.filter(
          (nft) => nft.NFTEntryResponse.IsForSale
        );
        break;
      case "sold":
        this.globalVars.marketplaceFilteredCollection = this.globalVars.marketplaceCollection.filter(
          (nft) => !nft.NFTEntryResponse.IsForSale && nft.NFTEntryResponse.LastAcceptedBidAmountNanos > 0
        );
        break;
      default:
        this.globalVars.marketplaceFilteredCollection = this.globalVars.marketplaceCollection;
        break;
    }
    if (primary === "true" && secondary === "true") {
      // Keep all
      this.globalVars.marketplaceDataToShow = this.globalVars.marketplaceFilteredCollection.slice(
        this.globalVars.marketplaceStartIndex,
        this.globalVars.marketplaceEndIndex
      );
    } else if (primary === "true") {
      // Get primary
      this.globalVars.marketplaceFilteredCollection = this.globalVars.marketplaceFilteredCollection.filter(
        (nft) => nft.NFTEntryResponse.OwnerPublicKeyBase58Check === nft.PostEntryResponse.PosterPublicKeyBase58Check
      );
      this.globalVars.marketplaceDataToShow = this.globalVars.marketplaceFilteredCollection.slice(
        this.globalVars.marketplaceStartIndex,
        this.globalVars.marketplaceEndIndex
      );
      // Get secondary
    } else if (secondary === "true") {
      this.globalVars.marketplaceFilteredCollection = this.globalVars.marketplaceFilteredCollection.filter(
        (nft) => nft.NFTEntryResponse.OwnerPublicKeyBase58Check !== nft.PostEntryResponse.PosterPublicKeyBase58Check
      );
      this.globalVars.marketplaceDataToShow = this.globalVars.marketplaceFilteredCollection.slice(
        this.globalVars.marketplaceStartIndex,
        this.globalVars.marketplaceEndIndex
      );
    } else {
      // Keep all
      this.globalVars.marketplaceDataToShow = this.globalVars.marketplaceFilteredCollection.slice(
        this.globalVars.marketplaceStartIndex,
        this.globalVars.marketplaceEndIndex
      );
    }
    this.lastPage = Math.floor(this.globalVars.marketplaceFilteredCollection.length / TrendsComponent.PAGE_SIZE);
    this.globalVars.isMarketplaceLoading = false;
  }

  onScroll() {
    if (this.globalVars.marketplaceEndIndex <= this.globalVars.marketplaceFilteredCollection.length - 1) {
      this.globalVars.marketplaceStartIndex = this.globalVars.marketplaceEndIndex;
      this.globalVars.marketplaceEndIndex += 20;
      this.globalVars.marketplaceDataToShow = [
        ...this.globalVars.marketplaceDataToShow,
        ...this.globalVars.marketplaceFilteredCollection.slice(
          this.globalVars.marketplaceStartIndex,
          this.globalVars.marketplaceEndIndex
        ),
      ];
    }
  }

  loadData(showmore: boolean = false) {
    if (!showmore) {
      this.globalVars.isMarketplaceLoading = true;
    }
    this.backendApi
      .GetNFTShowcaseSupernovas(
        this.globalVars.localNode,
        this.globalVars.loggedInUser?.PublicKeyBase58Check,
        this.globalVars.loggedInUser?.PublicKeyBase58Check
      )
      .subscribe(
        (res: any) => {
          this.globalVars.marketplaceCollection = res.NFTCollections;
          if (this.globalVars.marketplaceCollection) {
            this.globalVars.marketplaceCollection = uniqBy(
              this.globalVars.marketplaceCollection,
              (nftCollection) => nftCollection.PostEntryResponse.PostHashHex
            );
          }
          this.getParamsAndSort();
          if (showmore) {
            document.body.scrollTop = 0; // For Safari
            document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
          }
        },
        (error) => {
          this.globalVars._alertError(error.error.error);
        }
      );
  }

  counter(i: number) {
    return new Array(i);
  }
}
