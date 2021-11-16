import { Component, OnInit } from "@angular/core";
import { Location } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { BackendApiService, NFTCollectionResponse } from "../../backend-api.service";
import { GlobalVarsService } from "../../global-vars.service";
import { InfiniteScroller } from "../../infinite-scroller";
import { IAdapter, IDatasource } from "ngx-ui-scroll";
import { uniqBy } from "lodash";
import { filter, switchMap } from "rxjs/operators";
import { FunctionPassService } from "src/app/function-pass.service";

@Component({
  selector: "trends",
  templateUrl: "./trends.component.html",
  styleUrls: ["./trends.component.scss"],
})
export class TrendsComponent implements OnInit {
  globalVars: GlobalVarsService;
  nftCollections: NFTCollectionResponse[];
  filteredCollection: NFTCollectionResponse[];
  lastPage: number;
  static PAGE_SIZE = 40;
  static WINDOW_VIEWPORT = true;
  static BUFFER_SIZE = 20;
  static PADDING = 0.5;
  startIndex = 0;
  endIndex = 20;
  dataToShow: NFTCollectionResponse[];
  selectedOptionWidth: string;
  pagedRequestsByTab = {};
  lastPageByTab = {};
  loadingNextPage = false;
  index = 0;
  mobile = false;

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
    this.loadData();
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
      resolve(this.filteredCollection.slice(startIdx, Math.min(endIdx, this.nftCollections.length)));
    });
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
    this.startIndex = 0;
    this.endIndex = 20;

    // Order
    switch (sort) {
      case "most_recent_first":
        // Keep all
        this.nftCollections.sort((a, b) => b.PostEntryResponse.TimestampNanos - a.PostEntryResponse.TimestampNanos);
        break;
      case "oldest_first":
        this.nftCollections.sort((a, b) => a.PostEntryResponse.TimestampNanos - b.PostEntryResponse.TimestampNanos);
        break;
      case "highest_price_first":
        this.nftCollections.sort((a, b) => b.NFTEntryResponse.MinBidAmountNanos - a.NFTEntryResponse.MinBidAmountNanos);
        break;
      case "lowest_price_first":
        this.nftCollections.sort((a, b) => a.NFTEntryResponse.MinBidAmountNanos - b.NFTEntryResponse.MinBidAmountNanos);
        break;
      default:
        this.nftCollections.sort((a, b) => b.PostEntryResponse.TimestampNanos - a.PostEntryResponse.TimestampNanos);
        break;
    }
    // Only use nftCollections in first filter
    switch (status) {
      case "all":
        // Keep all
        this.filteredCollection = this.nftCollections;
        break;
      case "has_bids":
        this.filteredCollection = this.nftCollections.filter(
          (nft) => nft.NFTEntryResponse.HighestBidAmountNanos != 0 && nft.NFTEntryResponse.IsForSale
        );
        break;
      case "no_bids":
        this.filteredCollection = this.nftCollections.filter(
          (nft) => nft.NFTEntryResponse.HighestBidAmountNanos === 0 && nft.NFTEntryResponse.IsForSale
        );
        break;
      case "for_sale":
        this.filteredCollection = this.nftCollections.filter((nft) => nft.NFTEntryResponse.IsForSale);
        break;
      case "sold":
        this.filteredCollection = this.nftCollections.filter(
          (nft) => !nft.NFTEntryResponse.IsForSale && nft.NFTEntryResponse.LastAcceptedBidAmountNanos > 0
        );
        break;
      default:
        this.filteredCollection = this.nftCollections;
        break;
    }
    if (primary === "true" && secondary === "true") {
      // Keep all
      this.dataToShow = this.filteredCollection.slice(this.startIndex, this.endIndex);
    } else if (primary === "true") {
      // Get primary
      this.filteredCollection = this.filteredCollection.filter(
        (nft) => nft.NFTEntryResponse.OwnerPublicKeyBase58Check === nft.PostEntryResponse.PosterPublicKeyBase58Check
      );
      this.dataToShow = this.filteredCollection.slice(this.startIndex, this.endIndex);
      // Get secondary
    } else if (secondary === "true") {
      this.filteredCollection = this.filteredCollection.filter(
        (nft) => nft.NFTEntryResponse.OwnerPublicKeyBase58Check !== nft.PostEntryResponse.PosterPublicKeyBase58Check
      );
      this.dataToShow = this.filteredCollection.slice(this.startIndex, this.endIndex);
    } else {
      // Keep all
      this.dataToShow = this.filteredCollection.slice(this.startIndex, this.endIndex);
    }
    this.lastPage = Math.floor(this.filteredCollection.length / TrendsComponent.PAGE_SIZE);
    this.globalVars.isMarketplaceLoading = false;
  }

  onScroll() {
    if (this.endIndex <= this.filteredCollection.length - 1) {
      this.startIndex = this.endIndex;
      this.endIndex += 20;
      this.dataToShow = [...this.dataToShow, ...this.filteredCollection.slice(this.startIndex, this.endIndex)];
    }
  }

  loadData(showmore: boolean = false) {
    if (!showmore) {
      this.globalVars.isMarketplaceLoading = true;
    }
    this.backendApi
      .GetNFTShowcaseStripped(
        this.globalVars.localNode,
        this.globalVars.loggedInUser?.PublicKeyBase58Check,
        this.globalVars.loggedInUser?.PublicKeyBase58Check
      )
      .subscribe(
        (res: any) => {
          this.nftCollections = res.NFTCollections;
          if (this.nftCollections) {
            this.nftCollections = uniqBy(
              this.nftCollections,
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
}
