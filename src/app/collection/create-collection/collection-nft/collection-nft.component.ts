import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { GlobalVarsService } from "../../../global-vars.service";
import { BackendApiService, NFTBidEntryResponse, NFTEntryResponse, PostEntryResponse } from "../../../backend-api.service";
import { InfiniteScroller } from "../../../infinite-scroller";
import { IAdapter, IDatasource } from "ngx-ui-scroll";
import { ControlContainer, NgForm } from '@angular/forms';

@Component({
  selector: 'app-collection-nft',
  templateUrl: './collection-nft.component.html',
  styleUrls: ['./collection-nft.component.scss'],
  viewProviders: [ { provide: ControlContainer, useExisting: NgForm } ]
})

export class CollectionNftComponent implements OnInit {
  constructor(private globalVars: GlobalVarsService, private backendApi: BackendApiService) {}

  @Output() userNfts: EventEmitter<PostEntryResponse[]> = new EventEmitter();

  static PAGE_SIZE = 10;
  static BUFFER_SIZE = 5;
  static WINDOW_VIEWPORT = true;
  static PADDING = 0.5;
  static MY_BIDS = "My Bids";

  selectedNft: PostEntryResponse;
  
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
  
  addPost(post: PostEntryResponse) {
    console.log(this.selectedNft);
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
        this.userNfts.emit(this.postData);
        this.isLoading = false;
      });
  }

  getPage(page: number) {
    if (this.lastPage != null && page > this.lastPage) {
      return [];
    }
    const startIdx = page * CollectionNftComponent.PAGE_SIZE;
    const endIdx = (page + 1) * CollectionNftComponent.PAGE_SIZE;

    return new Promise((resolve, reject) => {
      resolve(
        this.activeTab === CollectionNftComponent.MY_BIDS
          ? this.myBids.slice(startIdx, Math.min(endIdx, this.myBids.length))
          : this.nftResponse.slice(startIdx, Math.min(endIdx, this.nftResponse.length))
      );
    });
  }

  infiniteScroller: InfiniteScroller = new InfiniteScroller(
    CollectionNftComponent.PAGE_SIZE,
    this.getPage.bind(this),
    CollectionNftComponent.WINDOW_VIEWPORT,
    CollectionNftComponent.BUFFER_SIZE,
    CollectionNftComponent.PADDING
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
