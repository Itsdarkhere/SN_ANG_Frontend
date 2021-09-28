import { Component, OnInit } from "@angular/core";
import { BackendApiService, NFTCollectionResponse } from "../../backend-api.service";
import { GlobalVarsService } from "../../global-vars.service";
import { InfiniteScroller } from "../../infinite-scroller";
import { IAdapter, IDatasource } from "ngx-ui-scroll";
import { uniqBy } from "lodash";
import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";

@Component({
  selector: "trends",
  templateUrl: "./trends.component.html",
  styleUrls: ["./trends.component.scss"],
})
export class TrendsComponent implements OnInit {
  globalVars: GlobalVarsService;
  loading: boolean = false;
  nftCollections: NFTCollectionResponse[];
  lastPage: number;
  static PAGE_SIZE = 50;
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

  infiniteScroller: InfiniteScroller = new InfiniteScroller(
    TrendsComponent.PAGE_SIZE,
    this.getPage.bind(this),
    TrendsComponent.WINDOW_VIEWPORT,
    TrendsComponent.BUFFER_SIZE,
    TrendsComponent.PADDING
  );

  datasource: IDatasource<IAdapter<any>> = this.infiniteScroller.getDatasource();

  constructor(
    private _globalVars: GlobalVarsService,
    private backendApi: BackendApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.globalVars = _globalVars;
  }

  ngOnInit(): void {
    // code to remove extra query param if not required
    // this.router.navigate(
    //   ['.'],
    //   { relativeTo: this.route, queryParams: { } }
    // );
    // this.router.events.subscribe(resp=>{
    //   if(resp instanceof NavigationEnd){
    //     this.loadData();
    //   }
    // })
    this.loadData();
  }

  getPage(page: number) {
    const startIdx = page * TrendsComponent.PAGE_SIZE;
    const endIdx = (page + 1) * TrendsComponent.PAGE_SIZE;

    return new Promise((resolve, reject) => {
      resolve(this.nftCollections.slice(startIdx, Math.min(endIdx, this.nftCollections.length)));
    });
  }

  onScroll() {
    console.log("scrolling..!!");
    if (this.endIndex <= this.nftCollections.length - 1) {
      this.startIndex = this.endIndex;
      this.endIndex += 20;
      this.dataToShow = [...this.dataToShow, ...this.nftCollections.slice(this.startIndex, this.endIndex)];
    }
  }

  loadData(showmore: boolean = false) {
    if (!showmore) {
      this.loading = true;
    }
    console.log(this.nftCollections);
    this.backendApi
      .GetNFTShowcase(
        this.globalVars.localNode,
        this.globalVars.loggedInUser?.PublicKeyBase58Check,
        this.globalVars.loggedInUser?.PublicKeyBase58Check
      )
      .subscribe(
        (res: any) => {
          this.nftCollections = res.NFTCollections;
          console.log(res);
          if (this.nftCollections) {
            this.nftCollections.sort((a, b) => b.PostEntryResponse.TimestampNanos - a.PostEntryResponse.TimestampNanos);
            this.nftCollections = uniqBy(
              this.nftCollections,
              (nftCollection) => nftCollection.PostEntryResponse.PostHashHex
            );
          }
          this.dataToShow = this.nftCollections.slice(this.startIndex, this.endIndex);
          console.log(this.dataToShow);
          this.lastPage = Math.floor(this.nftCollections.length / TrendsComponent.PAGE_SIZE);
          if (showmore) {
            document.body.scrollTop = 0; // For Safari
            document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
          }
        },
        (error) => {
          this.globalVars._alertError(error.error.error);
        }
      )
      .add(() => {
        this.loading = false;
      });
  }
  showRecent() {
    this.loadData(true);
  }
}
