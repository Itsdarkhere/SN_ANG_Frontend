import { Component, HostListener, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { BackendApiService } from "../../backend-api.service";
import { GlobalVarsService } from "../../global-vars.service";
import { InfiniteScroller } from "../../infinite-scroller";
import { IAdapter, IDatasource } from "ngx-ui-scroll";
import { FunctionPassService } from "src/app/function-pass.service";
import { connectableObservableDescriptor } from "rxjs/internal/observable/ConnectableObservable";
import { add } from "lodash";
import { BsModalService } from "ngx-bootstrap/modal";
import { GeneralSuccessModalComponent } from "../../general-success-modal/general-success-modal.component";
import { ThrowStmt } from "@angular/compiler";

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
  body = document.querySelector("body");

  desoMarketplace: boolean = true;
  ethMarketplace: boolean = false;
  postEntryResponseArr: [];

  infiniteScroller: InfiniteScroller = new InfiniteScroller(
    TrendsComponent.PAGE_SIZE,
    this.getPage.bind(this),
    TrendsComponent.WINDOW_VIEWPORT,
    TrendsComponent.BUFFER_SIZE,
    TrendsComponent.PADDING
  );

  datasource: IDatasource<IAdapter<any>> = this.infiniteScroller.getDatasource();

  marketplaceSortTypeOptions = [
    { id: "most recent first", name: "Most recent first" },
    { id: "oldest first", name: "Oldest first" },
    { id: "highest price first", name: "Highest price first" },
    { id: "lowest price first", name: "Lowest price first" },
    { id: "most likes first", name: "Most likes first" },
    { id: "most diamonds first", name: "Most diamonds first" },
    { id: "most comments first", name: "Most comments first" },
    { id: "most reposts first", name: "Most reposts first" },
  ];

  ethMarketplaceSortTypeOptions = [
    { id: "most recent first", name: "Most recent first" },
    { id: "oldest first", name: "Oldest first" },
    { id: "most likes first", name: "Most likes first" },
    { id: "most diamonds first", name: "Most diamonds first" },
    { id: "most comments first", name: "Most comments first" },
    { id: "most reposts first", name: "Most reposts first" },
  ];

  constructor(
    private backendApi: BackendApiService,
    private route: ActivatedRoute,
    private _globalVars: GlobalVarsService,
    private functionPass: FunctionPassService,
    private modalService: BsModalService
  ) {
    this.globalVars = _globalVars;
    this.functionPass.listen().subscribe((m: any) => {
      // Function can either just close menu or choose to sort
      // Marketplace leftbar component
      if (m == "sort") {
        this.sortMarketplace(0, false);
        this.globalVars.marketplaceNFTsOffset = 0;
        //document.body.scrollTop = 0; // For Safari
        //document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
        this.closeMarketplaceMobileFiltering("sort");
      } else if (m == "close") {
        this.closeMarketplaceMobileFiltering("close");
      } else if (m == "ethSort") {
        this.globalVars.ethMarketplaceNFTsOffset = 0;
        this.closeEthMarketplaceMobileFiltering("ethSort");
      } else if (m == "ethClose") {
        this.closeEthMarketplaceMobileFiltering("ethClose");
      }
    });
  }

  ngOnInit(): void {
    this.setMobileBasedOnViewport();
    if (this.globalVars.desoMarketplace) {
      if (!this.globalVars.marketplaceNFTsData) {
        this.sortMarketplace(0, false);
      }
    } else {
      if (!this.globalVars.ethMarketplaceNFTsData) {
        this.updateEthMarketplaceStatus();
      }
    }
  }

  blockchainSelectChange(desoMarket: string) {
    if (desoMarket == "true" && !this.globalVars.desoMarketplace) {
      this.updateDesoMarketplaceStatus();
    } else if (desoMarket == "false" && this.globalVars.desoMarketplace) {
      this.updateEthMarketplaceStatus();
    }
  }
  updateDesoMarketplaceStatus() {
    this.globalVars.desoMarketplace = true;
  }

  updateEthMarketplaceStatus() {
    this.globalVars.desoMarketplace = false;

    this.globalVars.ethMarketplaceStatus = "all";
    this.globalVars.ethMarketplaceNFTCategory = "all";
    this.globalVars.ethMarketplaceVerifiedCreators = "verified";
    this.globalVars.marketplaceSortType = "most recent first";

    this.globalVars.getAllEthNFTs();
    console.log("getting eth");
  }

  @HostListener("window:resize") onResize() {
    this.setMobileBasedOnViewport();
  }
  openMarketplaceMobileFiltering() {
    // Get scroll position before anything else
    if (!this.globalVars.desoMarketplace) {
      this.openEthMarketplaceMobileFiltering();
    } else {
      this.scrollPosition = window.scrollY;
      this.globalVars.isMarketplaceLeftBarMobileOpen = true;
      this.disable();
    }
  }
  openEthMarketplaceMobileFiltering() {
    // Get scroll position before anything else
    this.scrollPosition = window.scrollY;
    this.globalVars.isEthMarketplaceLeftBarMobileOpen = true;
    this.disable();
  }
  closeMarketplaceMobileFiltering(string: string) {
    if (string == "sort") {
      console.log("SORT");
      this.enableNoScroll();
      this.globalVars.isMarketplaceLeftBarMobileOpen = false;
    } else if (string == "close") {
      this.enable();
      this.globalVars.isMarketplaceLeftBarMobileOpen = false;
    }
  }
  closeEthMarketplaceMobileFiltering(string: string) {
    if (string == "ethSort") {
      this.enableNoScroll();
      this.globalVars.isEthMarketplaceLeftBarMobileOpen = false;
    } else if (string == "ethClose") {
      this.enable();
      this.globalVars.isEthMarketplaceLeftBarMobileOpen = false;
    }
  }
  // Enable without scrolling, since if user applies we want to scroll to top by default
  enableNoScroll() {
    this.body.style.removeProperty("overflow");
    this.body.style.removeProperty("position");
    this.body.style.removeProperty("top");
    this.body.style.removeProperty("width");
    window.scrollTo(0, 0);
  }
  // Enable scroll
  enable() {
    this.body.style.removeProperty("overflow");
    this.body.style.removeProperty("position");
    this.body.style.removeProperty("top");
    this.body.style.removeProperty("width");
    window.scrollTo(0, this.scrollPosition);
  }
  // Disable scroll
  disable() {
    this.scrollPosition = window.pageYOffset;
    this.body.style.overflow = "hidden";
    this.body.style.position = "fixed";
    this.body.style.top = `-${this.scrollPosition}px`;
    this.body.style.width = "100%";
  }
  setMobileBasedOnViewport() {
    this.mobile = this.globalVars.isMobile();
  }

  sortMarketplace(offset: number, showMore: boolean) {
    if (!showMore) {
      this.globalVars.isMarketplaceLoading = true;
    }
    console.log(this.globalVars.marketplaceNFTCategory);
    this.backendApi
      .SortMarketplace(
        this.globalVars.localNode,
        this.globalVars?.loggedInUser?.PublicKeyBase58Check,
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
            console.log(this.globalVars.marketplaceNFTsData);
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

  setEthDisplayType() {
    this.modalService.show(GeneralSuccessModalComponent, {
      class: "modal-dialog-centered nft_placebid_modal_bx  modal-lg",
      initialState: {
        header: "Error",
        text: "You cannot set display type for ETH.",
        buttonText: "Ok",
        buttonClickedAction: "connectWalletMobileError",
      },
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
        //this.applySorting(filters);
      })
      .unsubscribe();
  }
  onScrollNFTs() {
    this.globalVars.marketplaceNFTsOffset = this.globalVars.marketplaceNFTsOffset + 30;
    this.sortMarketplace(this.globalVars.marketplaceNFTsOffset, true);
  }
  onScrollEthNFTs() {
    if (this.globalVars.ethMarketplaceNFTsData.length > 30) {
      //   console.log(" ------------- greater then 30 ");
      //   console.log(this.globalVars.ethMarketplaceNFTsData);
      this.globalVars.ethMarketplaceNFTsOffset = this.globalVars.ethMarketplaceNFTsOffset + 30;
      console.log(this.globalVars.ethMarketplaceNFTsOffset);
      //   additional array
      let additionalData = this.globalVars.ethMarketplaceNFTsData.slice(this.globalVars.ethMarketplaceNFTsOffset);
      console.log(additionalData);
      this.globalVars.ethMarketplaceNFTsDataToShow =
        this.globalVars.ethMarketplaceNFTsDataToShow.concat(additionalData);
      console.log(this.globalVars.ethMarketplaceNFTsDataToShow);
    } else {
      return;
    }
  }
  counter(i: number) {
    return new Array(i);
  }
  sortSelectChange(event) {
    if (this.globalVars.marketplaceSortType != event) {
      if (!this.globalVars.desoMarketplace) {
        this.sortSelectChangeEth(event);
      } else {
        this.globalVars.marketplaceSortType = event;
        this.sortMarketplace(0, false);
      }
    }
  }
  sortSelectChangeEth(event) {
    if (this.globalVars.marketplaceSortType != event) {
      // this.globalVars.ethMarketplaceStatus = "for sale";
      this.globalVars.marketplaceSortType = event;

      if (
        this._globalVars.marketplaceSortType === "highest price first" ||
        this._globalVars.marketplaceSortType === "lowest price first"
      ) {
        this.modalService.show(GeneralSuccessModalComponent, {
          class: "modal-dialog-centered nft_placebid_modal_bx  modal-lg",
          initialState: {
            header: "Error",
            text: "You cannot filter by price.",
            buttonText: "Ok",
            buttonClickedAction: "connectWalletMobileError",
          },
        });
      } else {
        this.globalVars.getEthNFTsByFilter();
      }
    }
    //     }
  }
}
