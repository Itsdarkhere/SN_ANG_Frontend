import { AfterViewInit, Component, ComponentFactoryResolver, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Form, FormGroup } from '@angular/forms';
import { GlobalVarsService } from "../../global-vars.service";
import { BackendApiService, NFTBidEntryResponse, NFTEntryResponse, PostEntryResponse } from "../../backend-api.service";
import { InfiniteScroller } from "../../infinite-scroller";
import { IAdapter, IDatasource } from "ngx-ui-scroll";

@Component({
  selector: 'app-create-collection',
  templateUrl: './create-collection.component.html',
  styleUrls: ['./create-collection.component.scss']
})
export class CreateCollectionComponent implements AfterViewInit, OnInit {
  constructor(private globalVars: GlobalVarsService, private backendApi: BackendApiService) {}

  @ViewChild("createCollectionForm", { static: true }) createCollectionForm: FormGroup;

  // SubmitCollection(createCollectionForm: NgForm): void {   
  //   console.log(createCollectionForm.value);
  // }

  isChecked: boolean = false;

  selectAllCheckboxes: boolean = false;

  collectionNfts: any;

  ngAfterViewInit() {
    
  }

  selectAllNfts($event) {
    this.selectAllCheckboxes = !this.selectAllCheckboxes;
    console.log(this.selectAllCheckboxes);

    if ($event && !this.selectAllCheckboxes) {
        // this.createCollectionForm.get["collectionNfts"].map(control => control.setValue(true));
        console.log(this.createCollectionForm.get["collectionNfts"]);
      } else {
        this.createCollectionForm.get["collectionNfts"].map(control => control.setValue(false));
        console.log(this.createCollectionForm.get["collectionNfts"].value);
      }
  }
  

  setValue($event, post: PostEntryResponse) {
    // this.isChecked = !this.isChecked;
    if($event.currentTarget.checked) {
      this.collectionNfts = { nftValue: post };
      console.log(this.collectionNfts);
    }
  }

  ngOnInit(): void {
    this.getNFTs();
  }
  
  collectionName: string = "";
  collectionDescription: string = "";
  collectionBannerImage: File = null;
  collectionDisplayImage: File = null;

  onSubmit(createCollectionForm) {
    console.log(createCollectionForm.value);
  }

  static PAGE_SIZE = 10;
  static BUFFER_SIZE = 5;
  static WINDOW_VIEWPORT = true;
  static PADDING = 0.5;
  static MY_BIDS = "My Bids";

  activeTab: string;
  isLoading: boolean = true;
  startIndex: number = 0;
  endIndex: number = 10;
  lastPage = null;

  postData: PostEntryResponse[];
  posts: PostEntryResponse[];
  myBids: NFTBidEntryResponse[];

  nftResponse: { NFTEntryResponses: NFTEntryResponse[]; PostEntryResponse: PostEntryResponse }[];

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
    const startIdx = page * CreateCollectionComponent.PAGE_SIZE;
    const endIdx = (page + 1) * CreateCollectionComponent.PAGE_SIZE;

    return new Promise((resolve, reject) => {
      resolve(
        this.activeTab === CreateCollectionComponent.MY_BIDS
          ? this.myBids.slice(startIdx, Math.min(endIdx, this.myBids.length))
          : this.nftResponse.slice(startIdx, Math.min(endIdx, this.nftResponse.length))
      );
    });
  }

  // infiniteScroller: InfiniteScroller = new InfiniteScroller(
  //   CreateCollectionComponent.PAGE_SIZE,
  //   this.getPage.bind(this),
  //   CreateCollectionComponent.WINDOW_VIEWPORT,
  //   CreateCollectionComponent.BUFFER_SIZE,
  //   CreateCollectionComponent.PADDING
  // );
  // datasource: IDatasource<IAdapter<any>> = this.infiniteScroller.getDatasource();

  // onScroll() {
  //   if (this.endIndex <= this.posts.length - 1) {
  //     this.startIndex = this.endIndex;
  //     this.endIndex += 20;
  //     this.postData = [...this.postData, ...this.posts.slice(this.startIndex, this.endIndex)];
  //   }
  // }
}
