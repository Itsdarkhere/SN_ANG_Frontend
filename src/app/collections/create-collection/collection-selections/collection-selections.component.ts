import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { GlobalVarsService } from "../../../global-vars.service";
import { BackendApiService, NFTBidEntryResponse, NFTEntryResponse, PostEntryResponse } from "../../../backend-api.service";
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

  @Input() collectionSelections: FormGroup;
  // @Output() indexOfNft = new EventEmitter<number>();
  @Output() selectedNft = new EventEmitter<{i: number, post: PostEntryResponse}>();
  @Output() deselectedNft = new EventEmitter<object>();

  static PAGE_SIZE = 10;
  static BUFFER_SIZE = 5;
  static WINDOW_VIEWPORT = true;
  static PADDING = 0.5;
  static MY_BIDS = "My Bids";

  isNftSelected: boolean = false;
  nftCounter: number = 0;
  // nftIndex: number;

  isLoading: boolean = true;
  startIndex = 0;
  endIndex = 10;
  activeTab: string;
  lastPage = null;
  nftResponse: { NFTEntryResponses: NFTEntryResponse[]; PostEntryResponse: PostEntryResponse }[];
  postData: PostEntryResponse[];
  posts: PostEntryResponse[];
  myBids: NFTBidEntryResponse[];
  
  ngOnInit(): void {
    // console.log(this.globalVars.loggedInUser?.ProfileEntryResponse);
    this.getNFTs();
  }

  // captureIndexValue(i: number) {
  //   this.nftIndex = i;
  //   this.indexOfNft.emit(i);
  //   console.log(this.nftIndex);
  // }

  addPost(i: number, post: PostEntryResponse) {
    this.isNftSelected = !this.isNftSelected;
    this.selectedNft.emit({i, post});

    if(this.isNftSelected) {
      this.nftCounter += 1;
      console.log(this.nftCounter);
      //increment counter
      //add css classes
      //emit event to parent to add to array
    } else {
      this.nftCounter <= 0 ? this.nftCounter === 0 : this.nftCounter -= 1;
      console.log(this.nftCounter);
      //decrement counter
      //remove css classes
      //emit event to parent to remove from array
    }
    // console.log(post);
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
        // console.log(this.postData)
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
