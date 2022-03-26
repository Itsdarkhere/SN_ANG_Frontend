import { Component, OnInit } from "@angular/core";
import { GlobalVarsService } from "../../global-vars.service";
import { BackendApiService, NFTBidEntryResponse, NFTEntryResponse, PostEntryResponse } from "../../backend-api.service";
import { Router } from "@angular/router";
import { ArweaveJsService } from "src/app/arweave-js.service";

@Component({
  selector: "app-create-collection",
  templateUrl: "./create-collection.component.html",
  styleUrls: ["./create-collection.component.scss"],
})
export class CreateCollectionComponent implements OnInit {
  constructor(
    public globalVars: GlobalVarsService,
    private backendApi: BackendApiService,
    private router: Router,
    private arweave: ArweaveJsService
  ) {}

  createCollectionForm: any;
  isChecked: boolean = false;
  selectAllCheckboxes: boolean = false;
  uploadedBannerImage: string;
  uploadingBannerImage = false;
  uploadedProfileImage: string;
  uploadingProfileImage = false;

  creatingCollection = false;
  createCollectionError: string;
  createCollectionFailed = false;

  collectionName: string = "";
  collectionDescription: string = "";
  collectionBannerImage: File = null;
  collectionDisplayImage: File = null;
  stepNumber: number = 1;

  activeTab: string;
  isLoading: boolean = true;
  startIndex: number = 0;
  endIndex: number = 30;
  lastPage = null;
  postData: PostEntryResponse[];
  posts: PostEntryResponse[];
  selectedPosts: PostEntryResponse[] = [];
  myBids: NFTBidEntryResponse[];

  userCollectionNames: string[];
  userCollectionHashes: string[];

  collectionNameHasError = false;
  collectionNameError: string;

  static PAGE_SIZE = 10;
  static BUFFER_SIZE = 5;
  static WINDOW_VIEWPORT = true;
  static PADDING = 0.5;
  static MY_BIDS = "My Bids";

  nftResponse: { NFTEntryResponses: NFTEntryResponse[]; PostEntryResponse: PostEntryResponse }[];

  async ngOnInit(): Promise<void> {
    this.getUserCollectionsData();
    await this.getNFTs();
  }

  nextStep() {
    if (this.stepNumber + 1 == 2) {
      this.disableNFTsAlreadyInCollection();
    }
    this.stepNumber++;
  }

  nextSuccessOrError(success: boolean) {
    if (!success) {
      this.createCollectionFailed = true;
    }
    this.stepNumber++;
  }

  canContinueStepOne() {
    return !(this.collectionDescription.length > 0) || !(this.collectionName.length > 0);
  }

  checkCollectionName() {
    const alphaOnlyPattern = new RegExp("^[a-zA-Z0-9\\s]+$");
    if (this.collectionName == "") {
      this.collectionNameError = "Collection must have a name.";
      this.collectionNameHasError = true;
      return;
    }
    if (!alphaOnlyPattern.test(this.collectionName)) {
      this.collectionNameError = "Collection name must be A-Z & 0-9 only.";
      this.collectionNameHasError = true;
      return;
    }
    if (this.userCollectionNames?.length > 0) {
      let match = this.userCollectionNames.some((item) => item.toLowerCase() == this.collectionName.toLowerCase());
      if (match) {
        this.collectionNameError = "Collection name is not available.";
        this.collectionNameHasError = true;
        return;
      }
    }
    this.collectionNameError = "";
    this.collectionNameHasError = false;
  }

  getUserCollectionsData() {
    this.backendApi
      .GetUserCollectionsData(
        this.globalVars.localNode,
        this.globalVars.loggedInUser.ProfileEntryResponse.Username.toLowerCase()
      )
      .subscribe(
        (res) => {
          this.userCollectionHashes = [];
          this.userCollectionNames = [];
          if (res.UserCollectionData == null) {
            return;
          }
          res.UserCollectionData.forEach((element) => {
            // Use to make sure user does not create collection with the same name as an existing one
            this.userCollectionNames = this.userCollectionNames.concat(element.Collection);
            // Use to filter out nfts with the same postHashHex
            this.userCollectionHashes = this.userCollectionHashes.concat(element.PostHashHex);
          });
        },
        (error) => {
          console.log("ERROR: ", error);
        }
      );
  }

  handleImageInput(files: FileList) {
    // Dont upload while uploading
    if (this.uploadingBannerImage) {
      return;
    }
    let file = files[0];
    if (!file.type || !file.type.startsWith("image/")) {
      this.globalVars._alertError("File selected does not have an image file type.");
      return;
    }
    if (file.size > (1024 * 1024 * 1024) / 5) {
      this.globalVars._alertError("File is too large. Please choose a file of a size less than 200MB");
      return;
    }
    this.uploadingBannerImage = true;
    this.arweave.UploadImage(file).subscribe(
      (res) => {
        setTimeout(() => {
          let url = "https://arweave.net/" + res;
          this.uploadedBannerImage = url;
          this.uploadingBannerImage = false;
        }, 2000);
      },
      (err) => {
        this.uploadingBannerImage = false;
        this.globalVars._alertError("Failed to upload image to arweave: " + err.message);
      }
    );
  }

  handleProfileImageInput(files: FileList) {
    // Dont upload while uploading
    if (this.uploadingProfileImage) {
      return;
    }
    let file = files[0];
    if (!file.type || !file.type.startsWith("image/")) {
      this.globalVars._alertError("File selected does not have an image file type.");
      return;
    }
    if (file.size > (1024 * 1024 * 1024) / 5) {
      this.globalVars._alertError("File is too large. Please choose a file of a size less than 200MB");
      return;
    }
    this.uploadingProfileImage = true;
    this.arweave.UploadImage(file).subscribe(
      (res) => {
        setTimeout(() => {
          let url = "https://arweave.net/" + res;
          this.uploadedProfileImage = url;
          this.uploadingProfileImage = false;
        }, 2000);
      },
      (err) => {
        this.uploadingProfileImage = false;
        this.globalVars._alertError("Failed to upload image to arweave: " + err.message);
      }
    );
  }

  setPostValue: any;

  setValue($event, post, postData: PostEntryResponse[], i: number) {
    if ($event.target.checked) {
      this.setPostValue = postData[i];
      // console.log(post);
    }
  }

  getNFTs() {
    return this.backendApi
      .GetPostsForPublicKey(
        this.globalVars.localNode,
        "",
        this.globalVars.loggedInUser?.ProfileEntryResponse?.Username, //this.globalVars.loggedInUser?.ProfileEntryResponse?.Username,
        this.globalVars.loggedInUser?.ProfileEntryResponse.PublicKeyBase58Check, //this.globalVars.loggedInUser?.ProfileEntryResponse.PublicKeyBase58Check,
        "",
        10000,
        false /*MediaRequired*/
      )
      .toPromise()
      .then((res) => {
        this.posts = res.Posts.filter((post) => post.IsNFT && post.NumNFTCopiesBurned != post.NumNFTCopies);
        this.postData = this.posts.slice(this.startIndex, 300);
      });
  }
  // After this -> if successfull show success screen
  createCollection() {
    if (!this.creatingCollection) {
      this.creatingCollection = true;
    }
    let hashHexArr: string[] = [];
    this.selectedPosts.forEach((post) => {
      hashHexArr.push(post.PostHashHex);
    });
    this.backendApi
      .CreateCollection(
        this.globalVars.localNode,
        hashHexArr,
        this.globalVars.loggedInUser.ProfileEntryResponse.Username.toLowerCase(),
        this.collectionName.toLowerCase(),
        this.collectionDescription,
        this.uploadedBannerImage,
        this.uploadedProfileImage
      )
      .subscribe(
        (res) => {
          this.createCollectionError = JSON.stringify(res);
          this.creatingCollection = false;
          this.nextSuccessOrError(true);
          console.log(res);
        },
        (error) => {
          console.log(error);
          this.creatingCollection = false;
          this.nextSuccessOrError(false);
        }
      );
  }

  hasProfile() {
    //   close nav bar because it will open on mobile
    if (this.globalVars.isMobileIphone()) {
      this.globalVars.isLeftBarMobileOpen = false;
    }

    if (this.globalVars?.loggedInUser?.ProfileEntryResponse?.Username) {
      this.router.navigate(["/u/" + this.globalVars?.loggedInUser?.ProfileEntryResponse.Username]);
      this.globalVars.isLeftBarMobileOpen = false;
    } else {
      this.router.navigate(["/update-profile"]);
      this.globalVars.isLeftBarMobileOpen = false;
    }
  }

  selectAllNFTs() {
    this.selectedPosts = [];
    this.postData.forEach((nft) => {
      if (!nft.disabled) {
        this.selectedPosts.push(nft);
        nft.selected = true;
      }
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

  disableNFTsAlreadyInCollection() {
    this.isLoading = true;
    this.postData.forEach((post) => {
      if (this.userCollectionHashes.includes(post.PostHashHex)) {
        post.disabled = true;
      }
    });
    this.postData.sort((a, b) => {
      if (a.disabled == b.disabled) return 0;
      if (b.disabled) return -1;
      return 1;
    });
    this.isLoading = false;
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
}
