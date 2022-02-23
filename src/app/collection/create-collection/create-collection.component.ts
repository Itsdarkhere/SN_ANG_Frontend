import { Component, OnInit } from "@angular/core";
import { GlobalVarsService } from "../../global-vars.service";
import { BackendApiService, NFTBidEntryResponse, NFTEntryResponse, PostEntryResponse } from "../../backend-api.service";

@Component({
  selector: "app-create-collection",
  templateUrl: "./create-collection.component.html",
  styleUrls: ["./create-collection.component.scss"],
})
export class CreateCollectionComponent implements OnInit {
  constructor(private globalVars: GlobalVarsService, private backendApi: BackendApiService) {}

  createCollectionForm: any;
  isChecked: boolean = false;
  selectAllCheckboxes: boolean = false;
  uploadedBannerImage: undefined;
  uploadedDisplayImage: undefined;

  collectionName: string = "";
  collectionDescription: string = "";
  collectionBannerImage: File = null;
  collectionDisplayImage: File = null;
  stepNumber: number = 2;

  activeTab: string;
  isLoading: boolean = true;
  startIndex: number = 0;
  endIndex: number = 30;
  lastPage = null;
  postData: PostEntryResponse[];
  posts: PostEntryResponse[];
  selectedPosts: PostEntryResponse[] = [];
  myBids: NFTBidEntryResponse[];

  static PAGE_SIZE = 10;
  static BUFFER_SIZE = 5;
  static WINDOW_VIEWPORT = true;
  static PADDING = 0.5;
  static MY_BIDS = "My Bids";

  nftResponse: { NFTEntryResponses: NFTEntryResponse[]; PostEntryResponse: PostEntryResponse }[];

  async ngOnInit(): Promise<void> {
    await this.getNFTs();
    console.log(this.postData.length);

    // for(var i = 0; i < this.postData.length; i++) {
    //   // <HTMLInputElement>document.getElementById(i).checked = false;
    //   var counter = i.toString();
    //   let ele = document.getElementById(counter) as HTMLInputElement;
    //   ele.checked = false;
    //   console.log(i);
    // }
  }

  nextStep() {
    this.stepNumber++;
    if (this.stepNumber === 2) {
      if (this.postData && this.isLoading === false) {
        for (var i = 0; i < this.postData.length; i++) {
          // <HTMLInputElement>document.getElementById(i).checked = false;
          var counter = i.toString();
          let ele = document.getElementById(counter) as HTMLInputElement;
          ele.checked = false;
          console.log(i);
        }
      }
    }
  }

  canContinueStepOne() {
    return !(this.collectionDescription.length > 0) || !(this.collectionName.length > 0);
  }

  updateBanner($event: any) {
    if ($event.target.files) {
      this.collectionBannerImage = $event.target.files[0];
      let reader = new FileReader();
      reader.readAsDataURL($event.target.files[0]);
      reader.onload = (event: any) => {
        this.uploadedBannerImage = event.target.result;
      };
    }
  }

  updateDisplayImage($event: any) {
    if ($event.target.files) {
      this.collectionDisplayImage = $event.target.files[0];
      let reader = new FileReader();
      reader.readAsDataURL($event.target.files[0]);
      reader.onload = (event: any) => {
        this.uploadedDisplayImage = event.target.result;
      };
    }
  }

  setPostValue: any;

  setValue($event, post, postData: PostEntryResponse[], i: number) {
    if ($event.target.checked) {
      this.setPostValue = postData[i];
      // console.log(post);
    }
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
        this.posts = res.Posts.filter((post) => post.IsNFT && post.NumNFTCopiesBurned != post.NumNFTCopies);
        this.postData = this.posts.slice(this.startIndex, this.endIndex);
      })
      .finally(() => {
        this.isLoading = false;
      });
  }

  selectAllNFTs() {
    this.selectedPosts = [];
    this.postData.forEach((nft) => {
      this.selectedPosts.push(nft);
      nft.selected = true;
    });
    console.log(this.selectedPosts);
  }

  selectNFT(post: PostEntryResponse) {
    if (post.selected) {
      this.removeNFTFromSelected(post);
    } else {
      this.addNFTToSelected(post);
    }
  }

  removeNFTFromSelected(post: PostEntryResponse) {
    let index = this.selectedPosts.indexOf(post);
    this.selectedPosts.splice(index, 1);
    post.selected = false;
  }

  addNFTToSelected(post: PostEntryResponse) {
    let tempVar = false;
    if (this.selectedPosts?.length > 0) {
      tempVar =
        this.selectedPosts.filter((p) => {
          p.PostHashHex == post.PostHashHex;
        })?.length > 0;
    }
    if (!tempVar) {
      this.selectedPosts.push(post);
    }
    post.selected = true;
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

  onSubmit(createCollectionForm) {
    console.log(createCollectionForm.value);
  }
}
