import { Component } from '@angular/core';
import { GlobalVarsService } from "../../../global-vars.service";
import { BackendApiService, NFTBidEntryResponse, NFTEntryResponse, PostEntryResponse } from "../../../backend-api.service";
import { InfiniteScroller } from "../../../infinite-scroller";
import { IAdapter, IDatasource } from "ngx-ui-scroll";

@Component({
  selector: 'app-collection-selections',
  templateUrl: './collection-selections.component.html',
  styleUrls: ['./collection-selections.component.scss']
})
export class CollectionSelectionsComponent {
  constructor(private globalVars: GlobalVarsService, private backendApi: BackendApiService) {}

  static PAGE_SIZE = 10;
  static BUFFER_SIZE = 5;
  static WINDOW_VIEWPORT = true;
  static PADDING = 0.5;
  static MY_BIDS = "My Bids";
  
  isLoading: boolean = true;
  startIndex: number = 0;
  endIndex: number = 10;
  activeTab: string;
  lastPage = null;
  nftResponse: { NFTEntryResponses: NFTEntryResponse[]; PostEntryResponse: PostEntryResponse }[];
  postData: PostEntryResponse[];
  posts: PostEntryResponse[];
  myBids: NFTBidEntryResponse[];

  ngOnInit(): void {
    this.getNFTs();
  }

  addPost(i: number, post: PostEntryResponse) {
    if (post) { 
    }
    else{
    }
    console.log(post);
  }

  getNFTs() {
    this.isLoading = true;
    return this.backendApi
      .GetPostsForPublicKey(
        this.globalVars.localNode,
        "",
        this.globalVars.loggedInUser?.ProfileEntryResponse?.Username,
        this.globalVars.loggedInUser?.ProfileEntryResponse.PublicKeyBase58Check,
        "",
        10000,
        false /*MediaRequired*/
      )
      .toPromise()
      .then((res) => {
        this.posts = res.Posts.filter(post => post.IsNFT && post.NumNFTCopiesBurned != post.NumNFTCopies);
        this.postData = this.posts.slice(this.startIndex, this.endIndex);
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
      this.postData = [...this.postData, ...this.posts.slice(this.startIndex, this.endIndex)];
    }
  }
}
