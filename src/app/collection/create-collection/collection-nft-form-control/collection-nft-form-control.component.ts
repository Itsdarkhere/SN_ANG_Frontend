import { Component, forwardRef, Input, OnInit } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormArray, FormBuilder, FormControl, FormGroup, NG_VALUE_ACCESSOR } from '@angular/forms';
import { GlobalVarsService } from "../../../global-vars.service";
import { BackendApiService, NFTBidEntryResponse, NFTEntryResponse, PostEntryResponse } from "../../../backend-api.service";
import { InfiniteScroller } from "../../../infinite-scroller";
import { IAdapter, IDatasource } from "ngx-ui-scroll";

@Component({
  selector: 'app-collection-nft-form-control',
  templateUrl: './collection-nft-form-control.component.html',
  styleUrls: ['./collection-nft-form-control.component.scss'],
  providers: [{ 
    provide: NG_VALUE_ACCESSOR, 
    useExisting: forwardRef(() => CollectionNftFormControlComponent), 
    multi: true }]
})
export class CollectionNftFormControlComponent implements ControlValueAccessor, OnInit {
  constructor(
    private globalVars: GlobalVarsService, 
    private backendApi: BackendApiService,
    private fb: FormBuilder) { }

  static PAGE_SIZE = 10;
  static BUFFER_SIZE = 5;
  static WINDOW_VIEWPORT = true;
  static PADDING = 0.5;
  static MY_BIDS = "My Bids";

  @Input() collectionSelections: FormGroup;
  @Input() collectionNfts: FormArray;

  isNftSelected: boolean = false;
  nftCounter: number = 0;
  isLoading: boolean = true;
  startIndex: number = 0;
  endIndex: number = 10;
  activeTab: string;
  lastPage = null;
  nftResponse: { NFTEntryResponses: NFTEntryResponse[]; PostEntryResponse: PostEntryResponse }[];
  postData: PostEntryResponse[];
  posts: PostEntryResponse[];
  myBids: NFTBidEntryResponse[];

  nftIndex: number;
  selectedNft!: PostEntryResponse;
  disabled: boolean = false;
  private onTouched!: Function;
  private onChanged!: Function;

  ngOnInit(): void {
    console.log(this.collectionNfts);
    this.getNFTs();
  }
  
  addPost(i: number, post: PostEntryResponse) {
    this.onTouched();
    this.nftIndex = i;
    this.selectedNft = post;
    this.onChanged();
    console.log(this.selectedNft);
  }

  writeValue(value: any): void {
    this.selectedNft = value;
    this.collectionNfts.insert(this.nftIndex, value)
  }
  registerOnChange(fn: any): void {
    this.onChanged = fn;
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
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
    const startIdx = page * CollectionNftFormControlComponent.PAGE_SIZE;
    const endIdx = (page + 1) * CollectionNftFormControlComponent.PAGE_SIZE;

    return new Promise((resolve, reject) => {
      resolve(
        this.activeTab === CollectionNftFormControlComponent.MY_BIDS
          ? this.myBids.slice(startIdx, Math.min(endIdx, this.myBids.length))
          : this.nftResponse.slice(startIdx, Math.min(endIdx, this.nftResponse.length))
      );
    });
  }

  infiniteScroller: InfiniteScroller = new InfiniteScroller(
    CollectionNftFormControlComponent.PAGE_SIZE,
    this.getPage.bind(this),
    CollectionNftFormControlComponent.WINDOW_VIEWPORT,
    CollectionNftFormControlComponent.BUFFER_SIZE,
    CollectionNftFormControlComponent.PADDING
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
