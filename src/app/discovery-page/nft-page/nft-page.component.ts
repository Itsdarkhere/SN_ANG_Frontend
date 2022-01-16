import { Component, OnInit } from "@angular/core";
import { GlobalVarsService } from "src/app/global-vars.service";
import { BackendApiService } from "src/app/backend-api.service";
import { InfiniteScroller } from "../../infinite-scroller";
import { IAdapter, IDatasource } from "ngx-ui-scroll";
import { ActivatedRoute } from "@angular/router";
import { uniqBy } from "lodash";

@Component({
  selector: "app-nft-page",
  templateUrl: "./nft-page.component.html",
  styleUrls: ["./nft-page.component.scss"],
})
export class NftPageComponent implements OnInit {
  lastPage: number;
  nftsPageLoading = false;
  offset = 0;
  category = "fresh";
  static PAGE_SIZE = 40;
  static WINDOW_VIEWPORT = true;
  static BUFFER_SIZE = 20;
  static PADDING = 0.5;

  infiniteScroller: InfiniteScroller = new InfiniteScroller(
    NftPageComponent.PAGE_SIZE,
    this.getPage.bind(this),
    NftPageComponent.WINDOW_VIEWPORT,
    NftPageComponent.BUFFER_SIZE,
    NftPageComponent.PADDING
  );

  datasource: IDatasource<IAdapter<any>> = this.infiniteScroller.getDatasource();
  constructor(
    public globalVars: GlobalVarsService,
    private backendApi: BackendApiService,
    public route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((queryParams) => {
      if (queryParams.category) {
        this.category = queryParams.category;
      }
      this.loadData(this.offset, false);
    }).unsubscribe;
  }
  getPage(page: number) {
    if (this.lastPage != null && page > this.lastPage) {
      return [];
    }

    const startIdx = page * NftPageComponent.PAGE_SIZE;
    const endIdx = (page + 1) * NftPageComponent.PAGE_SIZE;

    return new Promise((resolve, reject) => {
      resolve(this.globalVars.nftsDataToShow.slice(startIdx, Math.min(endIdx, this.globalVars.nftsDataToShow.length)));
    });
  }
  onScroll() {
    this.offset = this.offset + 30;
    this.loadData(this.offset, true);
  }
  loadData(offset: number = 0, showmore: boolean) {
    if (!showmore) {
      this.nftsPageLoading = true;
    }
    this.backendApi
      .GetNFTsByCategory(
        this.globalVars.localNode,
        this.globalVars.loggedInUser?.PublicKeyBase58Check,
        this.category,
        offset
      )
      .subscribe(
        (res: any) => {
          if (showmore) {
            this.globalVars.nftsDataToShow = this.globalVars.nftsDataToShow.concat(res.PostEntryResponse);
          } else {
            this.globalVars.nftsDataToShow = res.PostEntryResponse;
          }
          this.nftsPageLoading = false;
          console.log(this.globalVars.nftsDataToShow.length);
          /*if (showmore) {
            document.body.scrollTop = 0; // For Safari
            document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
          }*/
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
