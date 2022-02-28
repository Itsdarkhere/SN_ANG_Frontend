import { Component, OnDestroy, OnInit } from "@angular/core";
import { PostEntryResponse } from "src/app/backend-api.service";
import { GlobalVarsService } from "src/app/global-vars.service";
import { BackendApiService } from "src/app/backend-api.service";
import { ApplyService } from "./apply.service";
import { ActivatedRoute } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { Subscription } from "rxjs";

@Component({
  selector: "app-collection-page",
  templateUrl: "./collection-page.component.html",
  styleUrls: ["./collection-page.component.scss"],
})
export class CollectionPageComponent implements OnInit, OnDestroy {
  collectionName: string;
  collectionCreator: string;
  collectionCreatorPK: string;
  collectionNFTs: PostEntryResponse[];
  collectionCardView = true;
  collectionCollection = true;
  collectionDescription: string;
  collectionBannerLocation: string;
  // Params for query
  collectionMarketType = "all";
  collectionStatus = "all";
  collectionOrderByType = "most recent first";
  // For apply service
  subscription: Subscription;
  constructor(
    private globalVars: GlobalVarsService,
    private backendApi: BackendApiService,
    private route: ActivatedRoute,
    private titleService: Title,
    private applyService: ApplyService
  ) {
    this.route.params.subscribe((params) => {
      this.collectionCreator = params.username;
      this.collectionName = params.collection;
      this.titleService.setTitle(`${this.collectionName} collection`);
      // Load data here
    });
  }

  ngOnInit(): void {
    this.subscription = this.applyService.currentSort.subscribe((object) =>
      this.sortCollection(object.status, object.marketType, object.orderByType, object.offset, object.loadMore)
    );
  }
  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  sortCollection(status: string, marketType: string, orderByType: string, offset: number, loadMore: boolean) {
    if (!loadMore) {
      this.globalVars.collectionNFTsLoading = true;
    }
    this.backendApi
      .SortCollection(
        this.globalVars.localNode,
        this.globalVars.loggedInUser.PublicKeyBase58Check,
        this.collectionCreator,
        this.collectionName,
        offset,
        status,
        marketType,
        orderByType
      )
      .subscribe(
        (res) => {
          if (!loadMore) {
            this.collectionNFTs = res?.PostEntryResponse;
            this.collectionBannerLocation = res?.CollectionBannerLocation;
            console.log(this.collectionBannerLocation);
            console.log(res);
            this.collectionDescription = res?.CollectionDescription;
            this.globalVars.collectionNFTsLoading = false;
            if (this.collectionNFTs[0]) {
              this.collectionCreatorPK = this.collectionNFTs[0]?.PosterPublicKeyBase58Check;
            }
          } else if (res?.PostEntryResponse?.lenght > 0) {
            this.collectionNFTs = this.collectionNFTs.concat(res?.PostEntryResponse);
          }
        },
        (err) => {
          console.log(err);
          this.globalVars.collectionNFTsLoading = false;
        }
      );
  }
}
