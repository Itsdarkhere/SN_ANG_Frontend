import { Component, OnInit } from "@angular/core";
import { GlobalVarsService } from "src/app/global-vars.service";
import { BackendApiService } from "src/app/backend-api.service";
import { InfiniteScroller } from "../../infinite-scroller";
import { IAdapter, IDatasource } from "ngx-ui-scroll";
import { uniqBy } from "lodash";

@Component({
  selector: "app-nft-page",
  templateUrl: "./nft-page.component.html",
  styleUrls: ["./nft-page.component.scss"],
})
export class NftPageComponent implements OnInit {
  lastPage: number;
  nftsPageLoading = false;
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
  constructor(public globalVars: GlobalVarsService, private backendApi: BackendApiService) {}

  ngOnInit(): void {
    this.loadData();
  }
  getPage(page: number) {
    if (this.lastPage != null && page > this.lastPage) {
      return [];
    }

    const startIdx = page * NftPageComponent.PAGE_SIZE;
    const endIdx = (page + 1) * NftPageComponent.PAGE_SIZE;

    return new Promise((resolve, reject) => {
      resolve(this.globalVars.nftsCollection.slice(startIdx, Math.min(endIdx, this.globalVars.nftsCollection.length)));
    });
  }
  onScroll() {
    if (this.globalVars.nftsEndIndex <= this.globalVars.nftsCollection.length - 1) {
      this.globalVars.nftsStartIndex = this.globalVars.nftsEndIndex;
      this.globalVars.nftsEndIndex += 20;
      this.globalVars.nftsDataToShow = [
        ...this.globalVars.nftsDataToShow,
        ...this.globalVars.nftsCollection.slice(this.globalVars.nftsStartIndex, this.globalVars.nftsEndIndex),
      ];
    }
  }
  loadData(showmore: boolean = false) {
    this.nftsPageLoading = true;
    this.backendApi
      .GetNFTShowcaseSupernovas(
        this.globalVars.localNode,
        this.globalVars.loggedInUser?.PublicKeyBase58Check,
        this.globalVars.loggedInUser?.PublicKeyBase58Check
      )
      .subscribe(
        (res: any) => {
          this.globalVars.nftsCollection = res.NFTCollections;
          if (this.globalVars.nftsCollection) {
            this.globalVars.nftsCollection = uniqBy(
              this.globalVars.nftsCollection,
              (nftCollection) => nftCollection.PostEntryResponse.PostHashHex
            );
          }
          if (showmore) {
            document.body.scrollTop = 0; // For Safari
            document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
          }
          this.globalVars.nftsDataToShow = [
            ...this.globalVars.nftsCollection.slice(this.globalVars.nftsStartIndex, this.globalVars.nftsEndIndex),
          ];
          this.nftsPageLoading = false;
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
