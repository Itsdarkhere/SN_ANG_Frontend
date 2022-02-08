import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { GlobalVarsService } from "../../../global-vars.service";
import { BackendApiService, NFTBidEntryResponse, NFTEntryResponse, PostEntryResponse, ProfileEntryResponse } from "../../../backend-api.service";
import { Subscription } from "rxjs";
import { InfiniteScroller } from "../../../infinite-scroller";
import { IAdapter, IDatasource } from "ngx-ui-scroll";

@Component({
  selector: 'app-collection-selections',
  templateUrl: './collection-selections.component.html',
  styleUrls: ['./collection-selections.component.scss']
})
export class CollectionSelectionsComponent implements OnInit {

  constructor(
    private globalVars: GlobalVarsService,
    private backendApi: BackendApiService
  ) {}

  @Input() createCollectionForm: FormGroup;
  @Input() views: FormArray;
  @Input() collectionSelections: FormGroup;
  @Input() profile: ProfileEntryResponse;

  static PAGE_SIZE = 10;
  static BUFFER_SIZE = 5;
  static WINDOW_VIEWPORT = true;
  static PADDING = 0.5;
  static MY_BIDS = "My Bids";
  
  activeTab: string;
  isLoading = true;
  lastPage = null;
  startIndex = 0;
  endIndex = 10;
  nftResponse: { NFTEntryResponses: NFTEntryResponse[]; PostEntryResponse: PostEntryResponse }[];
  dataToShow: PostEntryResponse[];
  posts: PostEntryResponse[];
  myBids: NFTBidEntryResponse[];

  ngOnInit(): void {
    this.getNFTs();
  }

  profileBelongsToLoggedInUser(): boolean {
    return (
      this.globalVars.loggedInUser?.ProfileEntryResponse &&
      this.globalVars.loggedInUser.ProfileEntryResponse.PublicKeyBase58Check === this.profile.PublicKeyBase58Check
    );
  }

  getNFTs() {
    this.isLoading = true;
    return this.backendApi
      .GetPostsForPublicKey(
        this.globalVars.localNode,
        "",
        this.profile.Username,
        this.globalVars.loggedInUser?.PublicKeyBase58Check,
        "",
        10000,
        false /*MediaRequired*/
      )
      .toPromise()
      .then((res) => {
        this.posts = res.Posts.filter((post) => post.IsNFT && post.NumNFTCopiesBurned != post.NumNFTCopies);
        this.dataToShow = this.posts.slice(this.startIndex, this.endIndex);
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  getPage(page: number) {
    if (this.lastPage != null && page > this.lastPage) {
      return [];
    }
    const startIdx = page * CollectionSelectionsComponent.PAGE_SIZE;
    const endIdx = (page + 1) * CollectionSelectionsComponent.PAGE_SIZE;

    return new Promise((resolve, reject) => {
      resolve(
        this.activeTab === CollectionSelectionsComponent.MY_BIDS
          ? this.myBids.slice(startIdx, Math.min(endIdx, this.myBids.length))
          : this.nftResponse.slice(startIdx, Math.min(endIdx, this.nftResponse.length))
      );
    });
  }

  infiniteScroller: InfiniteScroller = new InfiniteScroller(
    CollectionSelectionsComponent.PAGE_SIZE,
    this.getPage.bind(this),
    CollectionSelectionsComponent.WINDOW_VIEWPORT,
    CollectionSelectionsComponent.BUFFER_SIZE,
    CollectionSelectionsComponent.PADDING
  );
  datasource: IDatasource<IAdapter<any>> = this.infiniteScroller.getDatasource();

  onScroll() {
    if (this.endIndex <= this.posts.length - 1) {
      this.startIndex = this.endIndex;
      this.endIndex += 20;
      this.dataToShow = [...this.dataToShow, ...this.posts.slice(this.startIndex, this.endIndex)];
    }
  }
}
