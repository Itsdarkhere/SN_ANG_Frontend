import { Component, HostListener, OnInit, ChangeDetectorRef, Output, EventEmitter } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { BackendApiService, BackendRoutes } from "../backend-api.service";
import { GlobalVarsService } from "../global-vars.service";
import { trigger, style, animate, transition } from "@angular/animations";
import { Router } from "@angular/router";
import { environment } from "../../environments/environment";
import * as tus from "tus-js-client";
import Timer = NodeJS.Timer;
import { CloudflareStreamService } from "../../lib/services/stream/cloudflare-stream-service";
import { BsModalService } from "ngx-bootstrap/modal";
import { CommentModalComponent } from "../comment-modal/comment-modal.component";
import { ArweaveJsService } from "../arweave-js.service";
import { take } from "rxjs/operators";
import { GeneralSuccessModalComponent } from "../general-success-modal/general-success-modal.component";

import { ethers } from "ethers";
import { Link, ImmutableXClient, ImmutableMethodResults, MintableERC721TokenType } from "@imtbl/imx-sdk";
import { json } from "stream/consumers";
import _ from "lodash";
import { MixpanelService } from "../mixpanel.service";

@Component({
  selector: "app-mint-page",
  templateUrl: "./mint-page.component.html",
  styleUrls: ["./mint-page.component.scss"],
  animations: [
    trigger("mintSwipeAnimation", [
      transition("void => prev", [
        style({ transform: "translateX(-100%)", opacity: "0" }),
        animate("500ms ease", style({ transform: "translateX(0%)", opacity: "1" })),
      ]),

      transition("prev => void", [
        style({ transform: "translateX(0%)", opacity: "1" }),
        animate("500ms ease", style({ transform: "translateX(100%)", opacity: "0" })),
      ]),
      transition("void => next", [
        style({ transform: "translateX(100%)", opacity: "0" }),
        animate("500ms ease", style({ transform: "translateX(0%)", opacity: "1" })),
      ]),
      transition("next => void", [
        style({ transform: "translateX(0%)", opacity: "1" }),
        animate("500ms ease", style({ transform: "translateX(-100%)", opacity: "0" })),
      ]),
    ]),
  ],
})
export class MintPageComponent implements OnInit {
  @Output() postCreated = new EventEmitter();

  step = 1;
  mobile = false;
  submittingPost = false;
  postInput = "";

  post: any;
  disableAnimation = true;
  // Controls animation direction
  animationType = "none";

  // SRC:s
  postVideoArweaveSrc = null;
  postVideoDESOSrc = null;
  postImageArweaveSrc = null;
  postAudioArweaveSrc = null;
  postModelArweaveSrc = null;

  testVideoSrc = "https://arweave.net/bXfovPML_-CRlfoxLdPsK8p7lrshRLwGFHITzaDMMSQ";
  videoUploadPercentage = null;
  arweaveVideoLoading = false;

  showEmbedURL = false;
  showImageLink = false;
  embedURL = "";
  constructedEmbedURL: any;
  videoStreamInterval: Timer = null;
  readyToStream: boolean = false;

  postHashHex = "";
  isSubmitPress = false;

  showVideoTypeIcon = true;

  isUploading = false;
  isCoverImageUploading = false;
  isUploaded = false;
  isCoverImageUploaded = false;
  isUploadConfirmed = false;

  //   Blockchain type
  desoBlockchain = false;
  ethereumBlockchain = false;

  //   WalletAddressShort
  desoWalletAddressShort: string;

  // Content type
  videoType = false;
  imageType = false;
  audioType = false;
  modelType = false;

  //   Auction type
  openAuction = false;
  isBuyNow = false;

  extrasOpen = false;
  arweaveClicked = false;
  // Step 2
  EDITION_OF_ONE = true;
  OPEN_AUCTION = true;
  // Step 3, excluding postimageSrc
  IMAGE: any;
  NAME_OF_PIECE: string;
  DESCRIPTION: string = "";
  CATEGORY: string = null;
  KEY: string;
  VALUE: string;
  KVMap = new Map();
  // Step 4 open auction
  MIN_PRICE: number;
  PRICE_USD: any;
  CREATOR_ROYALTY: number;
  COIN_ROYALTY: number;
  UNLOCKABLE_CONTENT = false;
  PUT_FOR_SALE = true;
  // Step 4 buy now
  buyNowPriceDESO: number;
  minBidClicked = false;
  BUY_NOW_PRICE_USD = "0";

  // step 2 eth
  isEthNFTForSale: boolean;
  //   step 3 eth
  sellingPriceETH: any;
  token_id: any;

  link = new Link(environment.imx.MAINNET_LINK_URL);

  @HostListener("window:resize") onResize() {
    this.setMobileBasedOnViewport();
  }

  constructor(
    private sanitizer: DomSanitizer,
    private arweave: ArweaveJsService,
    private router: Router,
    private globalVars: GlobalVarsService,
    private backendApi: BackendApiService,
    private streamService: CloudflareStreamService,
    private modalService: BsModalService,
    private mixPanel: MixpanelService,
    private changeRef: ChangeDetectorRef //private diaref: MatDialogRef<MintPageComponent>
  ) {}

  ngOnInit(): void {
    this.setMobileBasedOnViewport();
    this.desoWalletAddressShort = this.globalVars.loggedInUser.PublicKeyBase58Check.slice(0, 15) + "...";
    if (localStorage.getItem("address")) {
      console.log("local storage hit -------------------");
      this.globalVars.imxWalletConnected = true;
      this.globalVars.imxWalletAddress = localStorage.getItem("address") as string;
      this.globalVars.ethWalletAddresShort = this.globalVars.imxWalletAddress.slice(0, 15) + "...";
    }

    if (this.globalVars.isMobile()) {
      this.desoBlockchain = true;
    } else {
      this.desoBlockchain = false;
    }
  }
  connectEthWallet() {
    this.openGeneralSuccessModal();
  }
  openGeneralSuccessModal() {
    console.log(` ------------------------- general success modal function hit -------------- `);

    if (!this.globalVars.isMobile()) {
      this.modalService.show(GeneralSuccessModalComponent, {
        class: "modal-dialog-centered nft_placebid_modal_bx  modal-lg",
        initialState: {
          header: "Connect your Ethereum wallet to Immutable X",
          text: "By connecting your wallet to Immutable X, you are able to mint and trade Ethereum NFT's with zero gas fees.",
          buttonText: "Connect with Immutable X",
          buttonClickedAction: "connectWallet",
        },
      });
    } else {
      this.modalService.show(GeneralSuccessModalComponent, {
        class: "modal-dialog-centered nft_placebid_modal_bx  modal-lg",
        initialState: {
          header: "Error",
          text: "Please visit Supernovas on your desktop to interact with the Ethereum blockchain.",
          buttonText: "Ok",
          buttonClickedAction: "general",
        },
      });
    }
  }

  setMobileBasedOnViewport() {
    this.mobile = this.globalVars.isMobile();
  }

  dropFile(event: any): void {
    this._handleFileInput(event[0]);
  }

  // For audio or 3d model cover image
  dropFileCoverImage(event: any): void {
    if (this.audioType || this.modelType) {
      this.handleImageInputCoverImage(event[0]);
    } else {
      this.globalVars._alertError("No content type selected...");
    }
  }

  _handleFileInput(file: File): void {
    const fileToUpload = file;
    if (this.videoType) {
      // To have Arweave stored video and have it visible also on other nodes
      // We need to upload to both Arweave and Deso centralized storage
      // Since Deso upload is slower we do that first
      this.handleVideoDESOInput(fileToUpload);
    } else if (this.imageType) {
      this.handleImageInput(fileToUpload);
    } else if (this.audioType) {
      this.handleAudioArweaveInput(fileToUpload);
    } else if (this.modelType) {
      this.handleModelArweaveInput(fileToUpload);
    } else {
      this.globalVars._alertError("No content type selected...");
    }
  }

  _handleFilesInput(files: FileList): void {
    const fileToUpload = files.item(0);
    if (this.videoType) {
      // To have Arweave stored video and have it visible also on other nodes
      // We need to upload to both Arweave and Deso centralized storage
      // Not optimal obviously
      this.handleVideoDESOInput(fileToUpload);
    } else if (this.imageType) {
      this.handleImageInput(fileToUpload);
    } else if (this.audioType) {
      this.handleAudioArweaveInput(fileToUpload);
    } else if (this.modelType) {
      this.handleModelArweaveInput(fileToUpload);
      console.log("_handleFilesInput received 3D model");
    } else {
      this.globalVars._alertError("No content type selected...");
    }
  }

  // For audio or 3d model cover image
  _handleFilesInputCoverImage(files: FileList): void {
    const fileToUpload = files.item(0);
    console.log(fileToUpload);
    if (this.audioType || this.modelType) {
      this.handleImageInputCoverImage(fileToUpload);
    } else {
      this.globalVars._alertError("No content type selected...");
    }
  }

  handleImageInput(file: File) {
    if (!file.type || !file.type.startsWith("image/")) {
      this.globalVars._alertError("File selected does not have an image file type.");
      return;
    }
    if (file.size > (1024 * 1024 * 1024) / 5) {
      this.globalVars._alertError("File is too large. Please choose a file of a size less than 200MB");
      return;
    }
    this.isUploading = true;
    this.arweave.UploadImage(file).subscribe(
      (res) => {
        setTimeout(() => {
          let url = "https://arweave.net/" + res;
          this.postImageArweaveSrc = url;
          //   this.postImageArweaveSrc = this.mapImageURLs(this.postImageArweaveSrc);
          this.postVideoArweaveSrc = null;
          this.isUploading = false;
          this.isUploaded = this.postImageArweaveSrc.length > 0;
          console.log(` ---------------------------- arweave res is ${res} --------------------------- `);
          console.log(` ---------------------------- url is ${this.postImageArweaveSrc} ---------------------------- `);
        }, 2000);
      },
      (err) => {
        this.isUploading = false;
        this.isUploaded = false;
        this.globalVars._alertError("Failed to upload image to arweave: " + err.message);
      }
    );
  }

  mapImageURLs(imgURL: string): string {
    if (imgURL.startsWith("https://i.imgur.com")) {
      return imgURL.replace("https://i.imgur.com", "https://images.bitclout.com/i.imgur.com");
    } else if (imgURL.startsWith("https://arweave.net/")) {
      // Build cloudflare imageString
      imgURL = "https://supernovas.app/cdn-cgi/image/width=500,height=500,fit=scale-down,quality=85/" + imgURL;
    }
    return imgURL;
  }

  // This is just so we dont have animations start on other 'input' when uploading to this
  // or vice versa
  handleImageInputCoverImage(file: File) {
    if (!file.type || !file.type.startsWith("image/")) {
      this.globalVars._alertError("File selected does not have an image file type.");
      return;
    }
    if (file.size > (1024 * 1024 * 1024) / 5) {
      this.globalVars._alertError("File is too large. Please choose a file of a size less than 200MB");
      return;
    }
    this.isCoverImageUploading = true;
    this.arweave.UploadImage(file).subscribe(
      (res) => {
        setTimeout(() => {
          let url = "https://arweave.net/" + res;
          this.postImageArweaveSrc = url;
          this.postVideoArweaveSrc = null;
          this.isCoverImageUploading = false;
          this.isCoverImageUploaded = this.postImageArweaveSrc.length > 0;
        }, 2000);
      },
      (err) => {
        this.isCoverImageUploading = false;
        this.isCoverImageUploaded = false;
        this.globalVars._alertError("Failed to upload cover image to arweave: " + err.message);
      }
    );
  }

  handleVideoArweaveInput(file: File) {
    if (!file.type || !file.type.startsWith("video/")) {
      this.globalVars._alertError("File selected does not have an video file type.");
      return;
    }
    if (file.size > (1024 * 1024 * 1024) / 5) {
      this.globalVars._alertError("File is too large. Please choose a file of a size less than 200MB");
      return;
    }
    // Its named uploadImage but works for both.
    this.arweave
      .UploadImage(file)
      .pipe(take(1))
      .subscribe(
        (res) => {
          setTimeout(() => {
            let url = "https://arweave.net/" + res;
            this.postVideoArweaveSrc = url;
            this.postImageArweaveSrc = null;
            this.postAudioArweaveSrc = null;
            this.postModelArweaveSrc = null;
          }, 2000);
        },
        (err) => {
          this.isUploading = false;
          this.isUploaded = false;
          this.globalVars._alertError("Failed to upload video to arweave: " + err.message);
        }
      );
  }

  handleAudioArweaveInput(file: File) {
    if (!file.type || !file.type.startsWith("audio/")) {
      this.globalVars._alertError("File selected does not have an audio file type.");
      return;
    }
    if (file.size > (1024 * 1024 * 1024) / 5) {
      this.globalVars._alertError("File is too large. Please choose a file of a size less than 200MB");
      return;
    }
    this.isUploading = true;
    // Its named uploadImage but works for both.
    this.arweave
      .UploadImage(file)
      .pipe(take(1))
      .subscribe(
        (res) => {
          setTimeout(() => {
            let url = "https://arweave.net/" + res;
            this.postAudioArweaveSrc = url;
            this.postVideoArweaveSrc = null;
            this.isUploading = false;
            this.isUploaded = false;
          }, 2000);
        },
        (err) => {
          this.isUploading = false;
          this.isUploaded = false;
          this.globalVars._alertError("Failed to upload audio to arweave: " + err.message);
        }
      );
  }

  handleModelArweaveInput(file: File) {
    // if (!file.type) {
    //   this.globalVars._alertError("File selected is not an accepted 3D file type.");
    //   return;
    // }
    if (file.size > (1024 * 1024 * 1024) / 5) {
      this.globalVars._alertError("File is too large. Please choose a file of a size less than 200MB");
      return;
    }
    // Its named uploadImage but works for both.
    this.arweave
      .UploadImage(file)
      .pipe(take(1))
      .subscribe(
        (res) => {
          setTimeout(() => {
            let url = "https://arweave.net/" + res;
            this.postModelArweaveSrc = url;
            this.postVideoArweaveSrc = null;
            this.postImageArweaveSrc = null;
            this.postAudioArweaveSrc = null;
            console.log(url);
          }, 2000);
        },
        (err) => {
          this.isUploading = false;
          this.isUploaded = false;
          this.globalVars._alertError("Failed to upload 3D model to arweave: " + err.message);
        }
      );
  }

  loadArweaveVideo() {
    this.arweaveVideoLoading = true;
    setTimeout(() => {
      let video = document.getElementById("fake-video-nft-1") as HTMLVideoElement;
      video.load();
      video.pause();
      video.currentTime = 0;
      //video.play();
      this.arweaveVideoLoading = false;
    }, 3000);
  }

  activateOnHover(play) {
    let element = document.getElementById("fake-video-nft-1") as HTMLVideoElement;
    if (play) {
      this.showVideoTypeIcon = false;
      element.play();
    } else {
      this.showVideoTypeIcon = true;
      element.pause();
    }
  }

  handleVideoDESOInput(file: File): void {
    if (file.size > (1024 * 1024 * 1024) / 5) {
      this.globalVars._alertError("File is too large. Please choose a file of a size less than 200MB");
      return;
    }
    this.isUploading = true;
    let upload: tus.Upload;
    let mediaId = "";
    const comp: MintPageComponent = this;
    const options = {
      endpoint: this.backendApi._makeRequestURL(environment.uploadVideoHostname, BackendRoutes.RoutePathUploadVideo),
      chunkSize: 5 * 1024 * 1024, // Required a minimum chunk size of 5MB, here we use 5MB.
      uploadSize: file.size,
      onError: function (error) {
        comp.globalVars._alertError(error.message);
        upload.abort(true).then(() => {
          throw error;
        });
      },
      onProgress: function (bytesUploaded, bytesTotal) {
        comp.videoUploadPercentage = ((bytesUploaded / bytesTotal) * 100).toFixed(2);
      },
      onSuccess: function () {
        // Construct the url for the video based on the videoId and use the iframe url.
        comp.postVideoDESOSrc = `https://iframe.videodelivery.net/${mediaId}`;
        comp.postImageArweaveSrc = null;
        comp.videoUploadPercentage = null;
        comp.pollForReadyToStream();
        // At this step we are going to only show the deso part of the video
        // Since arweave is quicker but takes 3s after upload to start
        comp.handleVideoArweaveInput(file);
      },
      onAfterResponse: function (req, res) {
        return new Promise((resolve) => {
          // The stream-media-id header is the video Id in Cloudflare's system that we'll need to locate the video for streaming.
          let mediaIdHeader = res.getHeader("stream-media-id");
          if (mediaIdHeader) {
            mediaId = mediaIdHeader;
          }
          resolve(res);
        });
      },
    };

    // Clear the interval used for polling cloudflare to check if a video is ready to stream.
    if (this.videoStreamInterval != null) {
      clearInterval(this.videoStreamInterval);
    }
    // Reset the postVideoSrc and readyToStream values.
    this.postVideoDESOSrc = null;
    this.readyToStream = false;
    // Create and start the upload.
    upload = new tus.Upload(file, options);
    upload.start();
    return;
  }

  arweaveClick() {
    this.arweaveClicked = true;
  }

  addKV() {
    this.KVMap.set(this.KEY.trim(), this.VALUE.trim());
    this.KEY = "";
    this.VALUE = "";
  }

  //   Blockchain type
  desoBlockchainSelected() {
    this.desoBlockchain = true;
    this.ethereumBlockchain = false;
  }

  ethereumBlockchainSelected() {
    this.desoBlockchain = false;
    this.ethereumBlockchain = true;
  }

  // Content type
  imageTypeSelected() {
    this.imageType = true;
    this.audioType = false;
    this.videoType = false;
    this.modelType = false;
    this.mixPanel.track5("Image Mint Selected");
  }

  videoTypeSelected() {
    this.videoType = true;
    this.audioType = false;
    this.imageType = false;
    this.modelType = false;
    this.mixPanel.track6("Video Mint Selected");
  }

  audioTypeSelected() {
    this.audioType = true;
    this.videoType = false;
    this.imageType = false;
    this.modelType = false;
    this.mixPanel.track7("Audio Mint Selected");
  }

  modelTypeSelected() {
    this.modelType = true;
    this.audioType = false;
    this.videoType = false;
    this.imageType = false;
    this.mixPanel.track7("3D Mint Selected");
  }

  //   Auction type
  openAuctionSelected() {
    this.openAuction = true;
    this.isBuyNow = false;
    this.mixPanel.track8("Open Auction Selected");
  }

  buyNowSelected() {
    this.isBuyNow = true;
    this.openAuction = false;
    this.mixPanel.track9("Buy Now Selected");
    console.log(` -------------------- isBuyNow ${this.isBuyNow} openAuction ${this.openAuction} ---------- `);
  }

  updateBidAmountUSD(desoAmount) {
    this.PRICE_USD = this.globalVars.nanosToUSDNumber(desoAmount * 1e9).toFixed(2);
    if (this.minBidClicked) {
      console.log(` ------------- price usd ${this.PRICE_USD}`);
      console.log(` ------------- buy now price usd ${this.BUY_NOW_PRICE_USD}`);
      let PRICE_USD_NUM = parseInt(this.PRICE_USD);
      let BUY_NOW_PRICE_USD_NUM = parseInt(this.BUY_NOW_PRICE_USD);

      if (PRICE_USD_NUM > BUY_NOW_PRICE_USD_NUM) {
        this.globalVars._alertError("The minimum bid cannot be greater than the buy now price.");
        this.PRICE_USD = 0;
        (<HTMLInputElement>document.getElementById("optional-min-bid")).value = "";
      }
    }
  }

  updateBuyNowBidAmountUSD(desoAmount) {
    this.BUY_NOW_PRICE_USD = this.globalVars.nanosToUSDNumber(desoAmount * 1e9).toFixed(2);
  }

  updateSellingPriceETH(price) {
    this.sellingPriceETH = price;
  }

  updateRoyaltyETH(royalty) {
    this.CREATOR_ROYALTY = royalty;
    console.log(this.CREATOR_ROYALTY);
  }

  imageUploaded() {
    return this.postImageArweaveSrc?.length > 0;
  }

  hasUnreasonableRoyalties() {
    let isEitherUnreasonable =
      Number(this.CREATOR_ROYALTY) < 0 ||
      Number(this.CREATOR_ROYALTY) > 100 ||
      Number(this.COIN_ROYALTY) < 0 ||
      Number(this.COIN_ROYALTY) > 100;
    let isSumUnreasonable = Number(this.CREATOR_ROYALTY) + Number(this.COIN_ROYALTY) > 100;
    return isEitherUnreasonable || isSumUnreasonable;
  }
  hasUnreasonableEthRoyalties() {
    if (this.CREATOR_ROYALTY === undefined) {
      return true;
    } else if (Number(this.CREATOR_ROYALTY) < 0 || Number(this.CREATOR_ROYALTY) > 100) {
      return true;
    } else {
      return false;
    }
  }

  //   // uncomment for testing
  //   logPriceAndRoyalty() {
  //     console.log(this.sellingPriceETH);
  //     console.log(this.CREATOR_ROYALTY);
  //     console.log(this.globalVars.localNode);
  //   }

  uploadFile(event: any): void {
    this._handleFilesInput(event[0]);
  }

  hasUnreasonableMinBidAmount() {
    //return parseFloat(this.MIN_PRICE) < 0 || this.MIN_PRICE < 0;
    return this.MIN_PRICE < 0;
  }

  hasUnreasonableBuyNowPrice() {
    return this.buyNowPriceDESO < 0;
  }

  hasUnreasonableEthSalePrice() {
    if (this.sellingPriceETH === undefined) {
      return true;
    } else {
      return this.sellingPriceETH < 0;
    }
  }

  deleteKV(key) {
    this.KVMap.delete(key);
  }

  nextStep() {
    this.animationType = "next";
    this.changeRef.detectChanges();
    this.mixPanel.track10("Mint Continued from step: " + this.step);
    if (this.step + 1 < 6) {
      this.step++;
      // Arweave needs a boost to start itself
      if (this.step === 4 && this.videoType) {
        this.loadArweaveVideo();
      }
    }
  }
  nextStepEth() {
    this.animationType = "next";
    this.changeRef.detectChanges();
    if (this.step + 1 < 6) {
      if (this.step === 1) {
        this.step++;
      }

      if (this.step === 2) {
        //   step++ on uploadEthMetadata
        this.uploadEthMetadata();
      }
      //   if (this.step === 3) {
      //     this.isEthNFTForSale = true;
      //   }
      //   step++ on updateIMXMetadataPostHash
      if (this.step === 3) {
        if (this.CREATOR_ROYALTY === undefined || this.CREATOR_ROYALTY === 0) {
          this.mintv2(this.token_id);
        } else {
          this.mintv2WithRoyalties(this.token_id, this.CREATOR_ROYALTY);
        }
      }
    }
  }
  previousStep() {
    this.animationType = "prev";
    this.changeRef.detectChanges();
    if (this.step - 1 > 0) {
      this.step--;
    }
  }
  previousStepEth() {
    this.animationType = "prev";
    this.changeRef.detectChanges();
    if (this.step - 1 > 0) {
      this.step--;
    }
  }

  async sellNFTLater() {
    this.isEthNFTForSale = false;
    await this.createEthPost();
    console.log("eth post created");
    setTimeout(() => {
      this.router.navigate(["/u/" + this.globalVars?.loggedInUser?.ProfileEntryResponse.Username]);
    }, 2000);
  }

  uploadEthMetadata() {
    this.postHashHex = "filler postHashHex";
    console.log(this.postHashHex);

    this.backendApi
      .InsertIMXMetadata(
        this.globalVars.localNode,
        this.NAME_OF_PIECE,
        this.DESCRIPTION,
        this.postImageArweaveSrc,
        this.postImageArweaveSrc,
        this.CATEGORY,
        this.postHashHex
      )
      .subscribe((res) => {
        console.log(res["Response"]);
        this.token_id = res["Response"];

        this.step++;
        // if (this.CREATOR_ROYALTY === undefined || this.CREATOR_ROYALTY === 0) {
        //   this.mintv2(this.token_id);
        // } else {
        //   this.mintv2WithRoyalties(this.token_id, this.CREATOR_ROYALTY);
        // }
      });
  }

  updateIMXMetadataPostHash() {
    this.backendApi
      .UpdateIMXMetadataPostHash(this.globalVars.localNode, this.token_id, this.postHashHex)
      .subscribe((res) => {
        console.log(` --------------- updated IMXMetadataPoshHash and res is ${JSON.stringify(res)} --------------- `);
        this.step++;
      });
  }

  async mintv2(token_id: any) {
    // initialise a client with the minter for your NFT smart contract
    const provider = new ethers.providers.JsonRpcProvider(
      `${environment.imx.ALCHEMY_MAINNET_URL}/${environment.imx.ALCHEMY_API_KEY}`
    );
    const minterPrivateKey: string = environment.imx.MINTER_PK ?? ""; // registered minter for your contract
    const minter = new ethers.Wallet(minterPrivateKey).connect(provider);
    const publicApiUrl: string = environment.imx.MAINNET_ENV_URL ?? "";
    const starkContractAddress: string = environment.imx.MAINNET_STARK_CONTRACT_ADDRESS ?? "";
    const registrationContractAddress: string = environment.imx.MAINNET_REGISTRATION_ADDRESS ?? "";
    const minterClient = await ImmutableXClient.build({
      publicApiUrl,
      signer: minter,
      starkContractAddress,
      registrationContractAddress,
    });

    // mint any number of NFTs to specified wallet address (must be registered on Immutable X first)
    const token_address: string = environment.imx.TOKEN_ADDRESS ?? ""; // contract registered by Immutable
    const royaltyRecieverAddress: string = environment.imx.ROYALTY_ADDRESS ?? "";
    const tokenReceiverAddress: string = this.globalVars.imxWalletAddress ?? "";

    token_id = token_id.toString();
    var mintBlueprintv2 = `https://supernovas.app/api/v0/imx/metadata/${token_id}`;

    const result = await minterClient.mintV2([
      {
        users: [
          {
            etherKey: tokenReceiverAddress.toLowerCase(),
            tokens: [
              {
                id: token_id,
                blueprint: mintBlueprintv2,
                // overriding royalties for specific token
                // royalties: [
                //   {
                //     recipient: tokenReceiverAddress.toLowerCase(),
                //     percentage: 0.0,
                //   },
                // ],
              },
            ],
          },
        ],
        contractAddress: token_address.toLowerCase(),

        // globally set royalties
        // royalties: [
        //   {
        //     recipient: royaltyRecieverAddress.toLowerCase(),
        //     percentage: 0.0,
        //   },
        // ],
      },
    ]);
    console.log(`Token minted: ${JSON.stringify(result)}`);

    this.createEthPost();
  }

  async mintv2WithRoyalties(token_id: any, royalty: number) {
    // initialise a client with the minter for your NFT smart contract
    const provider = new ethers.providers.JsonRpcProvider(
      `${environment.imx.ALCHEMY_MAINNET_URL}/${environment.imx.ALCHEMY_API_KEY}`
    );
    const minterPrivateKey: string = environment.imx.MINTER_PK ?? ""; // registered minter for your contract
    const minter = new ethers.Wallet(minterPrivateKey).connect(provider);
    const publicApiUrl: string = environment.imx.MAINNET_ENV_URL ?? "";
    const starkContractAddress: string = environment.imx.MAINNET_STARK_CONTRACT_ADDRESS ?? "";
    const registrationContractAddress: string = environment.imx.MAINNET_REGISTRATION_ADDRESS ?? "";
    const minterClient = await ImmutableXClient.build({
      publicApiUrl,
      signer: minter,
      starkContractAddress,
      registrationContractAddress,
    });

    // mint any number of NFTs to specified wallet address (must be registered on Immutable X first)
    const token_address: string = environment.imx.TOKEN_ADDRESS ?? ""; // contract registered by Immutable
    const royaltyRecieverAddress: string = environment.imx.ROYALTY_ADDRESS ?? "";
    const tokenReceiverAddress: string = this.globalVars.imxWalletAddress ?? "";

    token_id = token_id.toString();
    var mintBlueprintv2 = `https://supernovas.app/api/v0/imx/metadata/${token_id}`;

    const result = await minterClient.mintV2([
      {
        users: [
          {
            etherKey: tokenReceiverAddress.toLowerCase(),
            tokens: [
              {
                id: token_id,
                blueprint: mintBlueprintv2,
                // overriding royalties for specific token
                royalties: [
                  {
                    recipient: tokenReceiverAddress.toLowerCase(),
                    percentage: royalty,
                  },
                ],
              },
            ],
          },
        ],
        contractAddress: token_address.toLowerCase(),

        // globally set royalties
        // royalties: [
        //   {
        //     recipient: royaltyRecieverAddress.toLowerCase(),
        //     percentage: 0.0,
        //   },
        // ],
      },
    ]);
    console.log(`Token minted with royalty: ${JSON.stringify(result)}`);

    this.createEthPost();
  }

  async sellNFT() {
    if (this.sellingPriceETH === 0 || this.sellingPriceETH === undefined) {
      this.globalVars._alertError("The selling price must be greater then 0.");
    }

    const sellOrderId = await this.link.sell({
      amount: this.sellingPriceETH,
      tokenId: this.token_id,
      tokenAddress: environment.imx.TOKEN_ADDRESS,
    });

    console.log(sellOrderId);
    this.updateIMXMetadataPostHash();
  }

  async createEthPost() {
    let bodyObj = {};
    let postExtraData = {};

    bodyObj = {
      Body: this.DESCRIPTION,
      ImageURLs: [this.postImageArweaveSrc].filter((n) => n),
    };
    postExtraData = {
      // add ethereum: true boolean
      name: this.NAME_OF_PIECE,
      category: this.CATEGORY,
      properties: JSON.stringify(Array.from(this.KVMap)),
      isEthereumNFT: JSON.stringify(true),
      tokenId: JSON.stringify(this.token_id),
      ethContractNumber: environment.imx.ETH_CONTRACT_NUMBER,
    };
    if (environment.node.id) {
      postExtraData["Node"] = environment.node.id.toString();
    }

    this.backendApi
      .SubmitPost(
        this.globalVars.localNode,
        this.globalVars.loggedInUser.PublicKeyBase58Check,
        "",
        "",
        "" /*Title*/,
        bodyObj /*BodyObj*/,
        "",
        // PostExtraData
        postExtraData,
        "",
        false /*IsHidden*/,
        this.globalVars.defaultFeeRateNanosPerKB /*MinFeeRateNanosPerKB*/
      )
      .subscribe(
        (response) => {
          this.globalVars.logEvent(`post : create`);
          this.postHashHex = response.PostEntryResponse.PostHashHex;
          this.post = response.PostEntryResponse;
          console.log(
            ` ---------------------------- response is ${JSON.stringify(response)} ---------------------------- `
          );
          console.log(` ---------------------------- postHashHex ${this.postHashHex} ---------------------------- `);
          this.sellNFT();
        },
        (err) => {
          const parsedError = this.backendApi.parsePostError(err);
          this.globalVars._alertError(parsedError);
          this.globalVars.logEvent(`post : create : error`, { parsedError });
          this.isSubmitPress = false;
          this.changeRef.detectChanges();
          this.globalVars._alertError("Post failed, please mint again.");
        }
      );
  }

  quoteEthRepost(event, isQuote = true) {
    // Prevent the post navigation click from occurring.
    event.stopPropagation();

    if (!this.globalVars.loggedInUser) {
      // Check if the user has an account.
      this.globalVars.logEvent("alert : reply : account");
      this.globalVars._alertError("Cannot Quote repost, create account to post...");
    } else if (!this.globalVars.doesLoggedInUserHaveProfile()) {
      // Check if the user has a profile.
      this.globalVars.logEvent("alert : reply : profile");
      this.globalVars._alertError("Cannot Quote repost, create profile to post...");
    } else {
      const initialState = {
        // If we are quoting a post, make sure we pass the content so we don't repost a repost.
        parentPost: this.post,
        afterCommentCreatedCallback: null,
        isQuote,
      };
      if (!this.post) {
        this.globalVars._alertError("Cannot Quote repost, create profile to post...");
        return;
      }

      this.globalVars.isEthQuoteRepost = true;

      // If the user has an account and a profile, open the modal so they can comment.
      this.modalService.show(CommentModalComponent, {
        class: "modal-dialog-centered",
        initialState,
      });
    }
  }

  viewEthPost() {
    setTimeout(() => {
      this.router.navigate(["/" + this.globalVars.RouteNames.ETH_NFT + "/" + this.postHashHex]);
    }, 1000);
  }

  pollForReadyToStream(): void {
    let attempts = 0;
    let numTries = 1200;
    let timeoutMillis = 500;
    this.videoStreamInterval = setInterval(() => {
      if (attempts >= numTries) {
        clearInterval(this.videoStreamInterval);
        return;
      }
      this.streamService
        .checkVideoStatusByURL(this.postVideoDESOSrc)
        .subscribe(([readyToStream, exitPolling]) => {
          if (readyToStream) {
            this.readyToStream = true;
            this.isUploaded = true;
            this.isUploading = false;
            clearInterval(this.videoStreamInterval);
            return;
          }
          if (exitPolling) {
            clearInterval(this.videoStreamInterval);
            return;
          }
        })
        .add(() => attempts++);
    }, timeoutMillis);
  }

  isDescribed() {
    return this.DESCRIPTION?.length > 0 && this.DESCRIPTION?.length <= GlobalVarsService.MAX_POST_LENGTH;
  }

  isCategorized() {
    return this.CATEGORY?.length > 0;
  }

  isNamed() {
    return this.NAME_OF_PIECE?.length > 0 && this.NAME_OF_PIECE?.length <= 25;
  }

  isPriced() {
    if (this.openAuction) {
      return this.isPostMinPriceCorrect() && this.isPostRoyaltyCorrect();
    }
    if (this.isBuyNow) {
      return this.isBuyNowPriceDESOCorrect() && this.isPostRoyaltyCorrect();
    }
  }

  isPostMinPriceCorrect() {
    return this.isNumber(this.MIN_PRICE) && this.MIN_PRICE >= 0;
  }

  isBuyNowPriceDESOCorrect() {
    return this.isNumber(this.buyNowPriceDESO) && this.buyNowPriceDESO >= 0;
  }

  isPostRoyaltyCorrect() {
    return (
      this.isPostCreatorRoyaltyCorrect() &&
      this.isPostHoldersRoyaltyCorrect() &&
      parseFloat(String(this.CREATOR_ROYALTY)) + parseFloat(String(this.COIN_ROYALTY)) <= 100
    );
  }

  hasImage() {
    return this.postImageArweaveSrc.length > 0;
  }

  isPostCreatorRoyaltyCorrect() {
    return this.isNumber(this.CREATOR_ROYALTY) && this.CREATOR_ROYALTY >= 0 && this.CREATOR_ROYALTY <= 100;
  }

  isPostHoldersRoyaltyCorrect() {
    return this.isNumber(this.COIN_ROYALTY) && this.COIN_ROYALTY >= 0 && this.COIN_ROYALTY <= 100;
  }

  hasKeyValue() {
    return this.KEY?.length > 0 && this.VALUE?.length > 0;
  }

  isNumber(n: string | number): boolean {
    return !isNaN(parseFloat(String(n))) && isFinite(Number(n));
  }

  isPostReady() {
    return (
      (this.postImageArweaveSrc?.length > 0 ||
        (this.postVideoArweaveSrc?.length > 0 && this.postVideoDESOSrc?.length > 0)) &&
      this.isDescribed() &&
      this.isPriced()
    );
  }

  mintNFT() {
    if (!this.MIN_PRICE) {
      this.MIN_PRICE = 0;
    }

    if (!this.buyNowPriceDESO) {
      this.buyNowPriceDESO = 0;
    }

    // if we are doing a buy now and there is no min bid option clicked, then set the min price to the buy now price
    if (this.isBuyNow && !this.minBidClicked) {
      this.MIN_PRICE = this.buyNowPriceDESO;
    }

    let creatorRoyaltyBasisPoints = 0;
    if (this.CREATOR_ROYALTY) {
      creatorRoyaltyBasisPoints = this.CREATOR_ROYALTY * 100;
    }

    let coinRoyaltyBasisPoints = 0;
    if (this.COIN_ROYALTY) {
      coinRoyaltyBasisPoints = this.COIN_ROYALTY * 100;
    }

    this.backendApi
      .CreateNft(
        this.globalVars.localNode,
        this.globalVars.loggedInUser?.PublicKeyBase58Check,
        this.postHashHex,
        1, // number of copies
        creatorRoyaltyBasisPoints,
        coinRoyaltyBasisPoints,
        this.UNLOCKABLE_CONTENT, // include unlockable
        this.PUT_FOR_SALE, // put on sale
        Math.trunc(this.MIN_PRICE * 1e9),
        this.isBuyNow,
        Math.trunc(this.buyNowPriceDESO * 1e9),
        this.globalVars.defaultFeeRateNanosPerKB
      )
      .subscribe(
        (res) => {
          //this.dropNFT();
          this.globalVars.updateEverything(res.TxnHashHex, this.mintNFTSuccess, this.mintNFTFailure, this);
        },
        (err) => {
          this.globalVars._alertError(err.error.error);
          this.router.navigate(["/" + this.globalVars.RouteNames.POSTS + "/" + this.postHashHex]);
        }
      );
    this.mixPanel.track42("NFT created", {
      Poster: this.globalVars.loggedInUser?.PublicKeyBase58Check,
      "Post hex": this.postHashHex,
      "Royalty to creator": creatorRoyaltyBasisPoints / 100,
      "Royalty to coin": coinRoyaltyBasisPoints / 100,
      Unlockable: this.UNLOCKABLE_CONTENT,
      "For Sale": this.PUT_FOR_SALE,
      "Min Bid DeSo": this.MIN_PRICE,
      "Is Buy Now": this.isBuyNow,
      "Buy now price DeSo": this.buyNowPriceDESO / 1e9,
      "Min fee rate per KB": this.globalVars.defaultFeeRateNanosPerKB,
      "Post body": this.NAME_OF_PIECE,
      Category: this.CATEGORY,
      Audio: this.audioType,
      Video: this.videoType,
      "3D": this.modelType,
      Image: this.imageType,
    });
  }

  // These two below are for adding straight to marketplace once minted, backend has been modified to fit this need
  /*dropNFT() {
    // Get the latest drop so that we can update it.
    this.backendApi
      .GetMarketplaceRefSupernovas(
        this.globalVars.localNode,
        this.globalVars.loggedInUser.PublicKeyBase58Check,
        -1 // Dropnumber
      )
      .subscribe(
        (res: any) => {
          if (res.DropEntry.DropTstampNanos == 0) {
            this.SendFailEvent();
          }

          this.addNFTToLatestDrop(res.DropEntry, this.postHashHex);
        },
        (error) => {
          this.globalVars._alertError(error.error.error);
        }
      );
  }

  addNFTToLatestDrop(latestDrop: any, postHash: string) {
    this.backendApi
      .AddToMarketplaceSupernovas(
        this.globalVars.localNode,
        this.globalVars.loggedInUser.PublicKeyBase58Check,
        latestDrop.DropNumber,
        latestDrop.DropTstampNanos,
        latestDrop.IsActive,
        postHash ,
        "" 
      )
      .subscribe(
        (res: any) => {
          console.log("Added to marketplace!");
          this.SendMintedEvent();
        },
        (error) => {
          this.globalVars._alertError(error.error.error);
        }
      );
  }*/
  SendMintedEvent() {}

  mintNFTSuccess(comp: MintPageComponent) {
    comp.nextStep();
  }

  seeNFT() {
    this.router.navigate(["/" + this.globalVars.RouteNames.NFT + "/" + this.postHashHex]);
  }

  mintNFTFailure(comp: MintPageComponent) {
    comp.globalVars._alertError("Your post has been created, but the minting failed. Please try again from the start.");
    comp.router.navigate(["/" + comp.globalVars.RouteNames.POSTS + "/" + comp.postHashHex]);
  }

  submitPost() {
    if (this.isSubmitPress) return;
    if (!this.isPostReady()) return;

    this.isSubmitPress = true;
    let bodyObj = {};
    let postExtraData = {};
    // Decide between Video and Image
    if (this.videoType) {
      bodyObj = {
        Body: this.DESCRIPTION,
        VideoURLs: [this.postVideoDESOSrc].filter((n) => n),
      };
      postExtraData = {
        name: this.NAME_OF_PIECE,
        category: this.CATEGORY,
        properties: JSON.stringify(Array.from(this.KVMap)),
        // Needed to display video on Supernovas from Arview
        arweaveVideoSrc: this.postVideoArweaveSrc,
      };
    } else if (this.audioType) {
      bodyObj = {
        Body: this.DESCRIPTION,
        ImageURLs: [this.postImageArweaveSrc].filter((n) => n),
      };
      postExtraData = {
        name: this.NAME_OF_PIECE,
        category: this.CATEGORY,
        properties: JSON.stringify(Array.from(this.KVMap)),
        // Needed to display video on Supernovas from Arview
        arweaveAudioSrc: this.postAudioArweaveSrc,
      };
    } else if (this.modelType) {
      bodyObj = {
        Body: this.DESCRIPTION,
        ImageURLs: [this.postImageArweaveSrc].filter((n) => n),
      };
      postExtraData = {
        name: this.NAME_OF_PIECE,
        category: this.CATEGORY,
        properties: JSON.stringify(Array.from(this.KVMap)),
        // need to create this
        arweaveModelSrc: this.postModelArweaveSrc,
      };
    } else {
      bodyObj = {
        Body: this.DESCRIPTION,
        ImageURLs: [this.postImageArweaveSrc].filter((n) => n),
      };
      postExtraData = {
        name: this.NAME_OF_PIECE,
        category: this.CATEGORY,
        properties: JSON.stringify(Array.from(this.KVMap)),
      };
    }
    if (environment.node.id) {
      postExtraData["Node"] = environment.node.id.toString();
    }

    this.backendApi
      .SubmitPost(
        this.globalVars.localNode,
        this.globalVars.loggedInUser.PublicKeyBase58Check,
        "",
        "",
        "" /*Title*/,
        bodyObj /*BodyObj*/,
        "",
        // PostExtraData
        postExtraData,
        "",
        false /*IsHidden*/,
        this.globalVars.defaultFeeRateNanosPerKB /*MinFeeRateNanosPerKB*/
      )
      .subscribe(
        (response) => {
          this.globalVars.logEvent(`post : create`);
          this.postHashHex = response.PostEntryResponse.PostHashHex;
          this.post = response.PostEntryResponse;
          this.mintNFT();
        },
        (err) => {
          const parsedError = this.backendApi.parsePostError(err);
          this.globalVars._alertError(parsedError);
          this.globalVars.logEvent(`post : create : error`, { parsedError });
          this.isSubmitPress = false;
          this.changeRef.detectChanges();
        }
      );
  }

  _createPost() {
    // Check if the user has an account.
    if (!this.globalVars?.loggedInUser) {
      this.globalVars.logEvent("alert : post : account");
      //SharedDialogs.showCreateAccountToPostDialog(this.globalVars);
      return;
    }

    // Check if the user has a profile.
    if (!this.globalVars?.doesLoggedInUserHaveProfile()) {
      this.globalVars.logEvent("alert : post : profile");
      //SharedDialogs.showCreateProfileToPostDialog(this.router);
      return;
    }

    // Check if the user's profile is verified
    if (!this.globalVars.loggedInUser.ProfileEntryResponse?.IsVerified) {
      this.globalVars.logEvent("alert : post : no-verification");
      return;
    }

    this.submitPost();
  }
  _createPostEth() {
    // // Check if the user has an account.
    // if (!this.globalVars?.loggedInUser) {
    //   this.globalVars.logEvent("alert : post : account");
    //   //SharedDialogs.showCreateAccountToPostDialog(this.globalVars);
    //   return;
    // }

    // // Check if the user has a profile.
    // if (!this.globalVars?.doesLoggedInUserHaveProfile()) {
    //   this.globalVars.logEvent("alert : post : profile");
    //   //SharedDialogs.showCreateProfileToPostDialog(this.router);
    //   return;
    // }

    // // Check if the user's profile is verified
    // if (!this.globalVars.loggedInUser.ProfileEntryResponse?.IsVerified) {
    //   this.globalVars.logEvent("alert : post : no-verification");
    //   return;
    // }

    // this.submitPost();
    this.nextStepEth();
  }
  mapToObj(m) {
    return Array.from(m).reduce((obj, [key, value]) => {
      obj[key] = value;
      return obj;
    }, {});
  }

  openModal(event, isQuote = true) {
    // Prevent the post navigation click from occurring.
    event.stopPropagation();

    if (!this.globalVars.loggedInUser) {
      // Check if the user has an account.
      this.globalVars.logEvent("alert : reply : account");
      this.globalVars._alertError("Cannot Quote repost, create account to post...");
    } else if (!this.globalVars.doesLoggedInUserHaveProfile()) {
      // Check if the user has a profile.
      this.globalVars.logEvent("alert : reply : profile");
      this.globalVars._alertError("Cannot Quote repost, create profile to post...");
    } else {
      const initialState = {
        // If we are quoting a post, make sure we pass the content so we don't repost a repost.
        parentPost: this.post,
        afterCommentCreatedCallback: null,
        isQuote,
      };
      if (!this.post) {
        this.globalVars._alertError("Cannot Quote repost, create profile to post...");
        return;
      }
      // If the user has an account and a profile, open the modal so they can comment.
      this.modalService.show(CommentModalComponent, {
        class: "modal-dialog-centered",
        initialState,
      });
    }
  }

  handleMinBidClicked() {
    var checkbox = <HTMLInputElement>document.getElementById("checkbox-min-bid");

    if (checkbox.checked) {
      console.log("Checkbox is checked..");
      this.minBidClicked = true;
    } else {
      console.log("Checkbox is not checked..");
      this.minBidClicked = false;
    }
  }

  //   testDisabled() {
  //     console.log(` ---------------- isSubmitPress ${this.isSubmitPress} has to be false------------------ `);
  //     console.log(` -------------- this.isPostReady() needs to be true ${this.isPostReady()} ----------- `);
  //     console.log(` ---------------- hasUnreasonableRoyalties() has to be false ${this.hasUnreasonableRoyalties()}`);
  //     console.log(` --------------- hasUnreasonableBuyNowPrice() has to be false ${this.hasUnreasonableBuyNowPrice()}`);
  //   }
}
