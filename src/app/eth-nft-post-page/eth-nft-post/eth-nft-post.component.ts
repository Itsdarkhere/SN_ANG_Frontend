import { ChangeDetectorRef, Component, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { GlobalVarsService } from "../../global-vars.service";
import {
  BackendApiService,
  NFTBidData,
  NFTBidEntryResponse,
  NFTEntryResponse,
  PostEntryResponse,
} from "../../backend-api.service";
import { DomSanitizer, Title } from "@angular/platform-browser";
import { BsModalService } from "ngx-bootstrap/modal";
import { SwalHelper } from "../../../lib/helpers/swal-helper";
import { RouteNames } from "../../app-routing.module";
import { Location } from "@angular/common";
import * as _ from "lodash";
import { SellNftModalComponent } from "../../sell-nft-modal/sell-nft-modal.component";
import { CloseNftAuctionModalComponent } from "../../close-nft-auction-modal/close-nft-auction-modal.component";
import { Subscription } from "rxjs";
import { AddUnlockableModalComponent } from "../../add-unlockable-modal/add-unlockable-modal.component";
import { FeedPostComponent } from "../../feed/feed-post/feed-post.component";
import { environment } from "src/environments/environment";
import { SharedDialogs } from "src/lib/shared-dialogs";
import { CommentModalComponent } from "src/app/comment-modal/comment-modal.component";
import { GoogleAnalyticsService } from "src/app/google-analytics.service";
import { FeedPostImageModalComponent } from "src/app/feed/feed-post-image-modal/feed-post-image-modal.component";
import { CancelEvent } from "../shared/models/cancel-event.interface";
import { Meta } from "@angular/platform-browser";
import {
  FIRST_ICON_PATH,
  SECOND_ICON_PATH,
  THIRD_ICON_PATH,
  FOURTH_ICON_PATH,
  FIFTH_ICON_PATH,
} from "src/app/feed/shared/constants/defines";
import { CancelBidModalComponent } from "src/app/cancel-bid-modal/cancel-bid-modal.component";
import { ConfirmationModalComponent } from "src/app/confirmation-modal/confirmation-modal.component";
import { take } from "rxjs/operators";
import { EmbedUrlParserService } from "src/lib/services/embed-url-parser-service/embed-url-parser-service";
import { any } from "underscore";

import { ethers } from "ethers";

@Component({
  selector: "app-eth-nft-post",
  templateUrl: "./eth-nft-post.component.html",
  styleUrls: ["./eth-nft-post.component.scss"],
})
export class EthNftPostComponent implements OnInit {
  @ViewChild(FeedPostComponent) feedPost: FeedPostComponent;

  isAvailableForSale = false;
  nftPost: PostEntryResponse;
  nftPostHashHex: string;
  nftBidData: NFTBidData;
  myBids: NFTBidEntryResponse[];
  availableSerialNumbers: NFTEntryResponse[];
  myAvailableSerialNumbers: NFTEntryResponse[];
  loading = true;
  refreshingBids = true;
  sellNFTDisabled = true;
  showPlaceABid: boolean;
  highBid: number;
  lowBid: number;
  selectedBids: boolean[];
  selectedBid: NFTBidEntryResponse;
  showBidsView: boolean = true;
  bids: NFTBidEntryResponse[];
  bidsOnMyNfts: NFTBidEntryResponse[];
  owners: NFTEntryResponse[];
  hightestBidOwner: any = {};
  EthNftPostComponent = EthNftPostComponent;
  activeTab = EthNftPostComponent.THREAD;
  properties: any;
  showIconRow = true;
  firstIconPath = FIRST_ICON_PATH;
  secondIconPath = SECOND_ICON_PATH;
  thirdIconPath = THIRD_ICON_PATH;
  fourthIconPath = FOURTH_ICON_PATH;
  fifthIconPath = FIFTH_ICON_PATH;

  canReplaceExistingIcons = true;
  _post: any;
  postContent: any;
  reposterProfile: any;
  quotedContent: any;
  constructedEmbedURL: any;

  ethereumNFTSalePrice: any;

  static ALL_BIDS = "All Bids";
  static MY_BIDS = "My Bids";
  //static MY_AUCTIONS = "My Auctions";
  static OWNERS = "Provenance";
  static THREAD = "Bids";
  static DETAILS = "Details";

  tabs = [
    EthNftPostComponent.THREAD,
    EthNftPostComponent.MY_BIDS,
    //EthNftPostComponent.MY_AUCTIONS,
    EthNftPostComponent.OWNERS,
    EthNftPostComponent.DETAILS,
  ];

  constructor(
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
    private analyticsService: GoogleAnalyticsService,
    private router: Router,
    public globalVars: GlobalVarsService,
    private backendApi: BackendApiService,
    private changeRef: ChangeDetectorRef,
    private modalService: BsModalService,
    private titleService: Title,
    private location: Location,
    private metaService: Meta
  ) {
    // This line forces the component to reload when only a url param changes.  Without this, the UiScroll component
    // behaves strangely and can reuse data from a previous post.
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;

    this.route.params.subscribe((params) => {
      this._setStateFromActivatedRoute(route);
    });
  }
  async ngOnInit() {
    if (!localStorage.getItem("firstLoad")) {
      window.location.reload();
      localStorage.setItem("firstLoad", "true");
    } else {
      return;
    }
    console.log("------------------------------ page loaded ------------------------------");
    // this.refreshPosts();
    //this.logString();
  }

  logString() {
    let arr = this.string.split(",");
    if (arr[this.index]) {
      this.backendApi.GetSingleProfile(this.globalVars.localNode, "", arr[this.index]).subscribe(
        (res) => {
          let utf8Encode = new TextEncoder();
          this.stringer = this.stringer + "('" + res.Profile.Username + "'),";
          setTimeout(() => {
            this.index = this.index + 1;
            this.logString();
          }, 100);
        },
        (error) => {
          console.log(error);
          setTimeout(() => {
            this.index = this.index + 1;
            this.logString();
          }, 100);
        }
      );
    } else {
      console.log(this.stringer);
    }
  }
  stringer = "";
  index = 0;
  string =
    "lazypretty,grabbits,thumby,maimislang,a1iya,pixelscradle,varavyshka,paulmp,telehumans,desolatemasksociety,olibraithwaite,hinatayuriko,thechrisaguirre,nyaupanesougat,sydbottum,zatihni,sabira,badsanta,foxen,desomaze,dewhales,africuz,shants1900,nestingdolls,vasylya,minimi,maensivu,bitcloutcoinmaster,dragonballnft,jennroyster,bitbunnies,desomusicnft,bigmiker35,gawergy,lilover,spunkart,arterida,cloutdragons,mucho237,onelemonhalflemon,lukasjakson,principia,akashjames,dazedchimps,privatecollective,bitmotions,europeannft,artdeso,gaikenftcreations,radpanda,chaoscreatures,jdarmstrong,dotnft,dhuman,fractal_fox,yuichi,sumor,grump,joiet,kryptocats,desorarity,cloutpunk,lildragons,deathblooms,desocupcakes,izy,cloutpups,mattcirca,desosaurus,deart,samhorine,clarasquared,beerbuds,toyrooms,pixelunit,seelz,gjh,aniketghosh,uglyass,deso_castles,phoobiedoo,sirguy,krt,machinespleak,cansy,icecreams,hafirat,xhuman,saintllaines,aylacroft,eva_ignis,popsiclepuppy,mikeezero,digitalize,matreshka,nftrally,dopeheads,zetareticuli,cryptorascals,bitpig,nordian,pebblepeople,petopia,pokervampires,juvonen,jopi_h,ohlala,nikkecee,nokoko,audiobit,prianichek,66shells,artwalker77,joosh,theorigin,briandrever,oulmouman,dmjks,bitclout_artist,doz,behuman,nf3,kyrell,myimagination,desogen,niksmccoy,testdummy,angie_mathot,transhumanist,derliber,retrobit,skullymania,brahmoz,zoran,jasonlevin,neverwelcome,gokuzar,weirdnature,homelessdrawings,striga,elrickerikose,rezzybeans,aikon,disruptepreneur,cloutgnome,arcana,notsoluckyapes,thenomadtruth,shamaali1,uni_rabbits,danielwilson,findesemana,miniclout,miscreant,sambucaartje,lynndelarosa,rbnks,claramouse,nathanwells,betaverse,noventabpm,severedxxheads,cc_,jodybossert,dowhatyoulove,troya,becopro,dankfranks,fan3k,annskully,allhalloween,saintangelo,olivierozoux,derishaviar,edercallejas,deso_gaming,foxista,therealtosch,desoghost,pigeon_punks,longo,desodawgs,paulyhart,cloutrocks,littledinos,meeks,noahphnx,eriavsanuz,randhir,kad,oo_nft,desotrollz,fuckedupcats,billythai1,desocow,skulluck,degendudes,benjibliss,lorisea,desomon,bigcatsclub,scottantonymarks,xuanling11,cdubya,rudil,ikhan,bleep,knights_of_clout,illumemenati,shondrums,sergio_a_o_v,cloutis,goldberry,clayperrymusic,gangstergoats,tartar,misha_cg,kiragold,sull,pixelateme,weird_unicorns,agustinolmedo,ficusfox,tiems,artstory,clobits,rowdyreindeer,janispetke,shadeflowers,niftybunny,diorama,jhaypy,desolatedskunkz,alextoma,david_golzio,nba_scoreending,hotrepublic,haun,atjeremy,thetom,abwatershots,bitquest,deso_kingdoms,sketchact,funkgator,cloutdevil,gaike_poststampart,meg_the_artist,murselat,dazeddesodudes,spoofies,yogicool,txcflwr,monicarizzolli,leopoldploner,denniskarssie,cranialorigami,foretoldfdn,oganart,stargazearts,slick420,desotronz,nataliart,wilks,rhynelf,goose_cocks,menajem,nader,eggheads,bitavatar,skyblack_toons,murkury,arkham,zvillage,cyborgunity,reverbvisions,sirguyos,moontis,photographybymechell,finn_hartmann,tobiasschmid,x_dimension__,bemyportraitmuse,nadyaez,luckyapes,naderpunks,dshade69,compulsivedoodler,chimpescape,astronfts,thirdeyecats,swafs,xtinct,qtnyc,cranues,blxckcherry,degenducks,boogeyman,williamthethird,lanedigitalart,ballsies,bilgute,raminabrahim,thecryptoconnoisseurs,patrickassale,grumkins,clout_cocks,pingwin,meredithmarsone,familyart,manyruffledfeathers,benholfeld,tristan_siokos,gracebaseme,supernovas,nandubatchu,eerie,unicat,irm,anonymous_graphics,fizzler,desobirds,rainmen,angrykitties,artblock,kjartee,thinkdifferent,deso_lands,luckylee,crazyskull,lildixie,brootle,cyrusabrahim,mythica,mechelllord,wootville,burki,digitalfr33dom,childofthedice,artofneferum,mgamentag,sjgfx,clayoglesby,futoshijapanese,nynja5k,devshivam,dr_javier,therainbowland,tipsyelf,bitcloutbunny,thecharliebrown,desolotl,larrycalabreseart,mrpreet,elnegro,lotuschild,mechaenergy,mushmula,nfthree,vadove,childrensworld,fuckeduppunks,arthearts,hauntednight,mp3,lost_robots,jopi,marblesonstream,anku,sinondabeat,mosquitonfts,niloselos,octoposse,pixal,dandevans,edeson,pixelangelo,rarebuddha,fuckaroos,crypt0droids,bytaylormarie,ohdeer,allclothingbrand,deso_crusaders,cloutdog,xsnchzx,stephenkelly,r0ck3r,todcomplex,mystic_essence,fransarthur,gifcollection,nachoaverage,wendyleigh,metaversepostcards,bitcloutkids,oldangusred,katwolfie,nanobots,ghozt,idreessyed,yigitcakar,metazens,markhumes,desolaters,hindinft,ladyhilbert,reynolkb,5un_is_shining,aelis,kanshi,fairytale,thissorryspacesuit,beerselfie,pixalfoundation,alinetas,rickandmortyog,gretta_art,all_things_creative,titsandtattoos,manrikphoto,chimrky,matthewjschultz,tamasantal,ne_nast_e,williamlaurent,carbononion,frekhzfaber,cloutagotchi,malay11,ruffs,infraredartist,deerdick,heiditn,mysticessence,crypto_viking,stickies,nft_mostwanted,itsaditya,kipu";
  clearURL(url) {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
  // openImgModal(event, imageURL) {
  //   event.stopPropagation();
  //   this.modalService.show(FeedPostImageModalComponent, {
  //     class: "modal-dialog-centered modal-lg",
  //     initialState: {
  //       imageURL,
  //     },
  //   });
  // }
  mapImageURLs(imgURL: string): string {
    if (imgURL.startsWith("https://i.imgur.com")) {
      return imgURL.replace("https://i.imgur.com", "https://images.bitclout.com/i.imgur.com");
    } else if (imgURL.startsWith("https://arweave.net/")) {
      // Build cloudflare imageString
      imgURL = "https://supernovas.app/cdn-cgi/image/width=800,height=800,fit=scale-down,quality=90/" + imgURL;
    }
    return imgURL;
  }
  // If image errors, use image straight from link
  useNormalImage(imgURL: string) {
    let image = document.getElementById("post-image") as HTMLImageElement;
    image.src = imgURL;
  }
  getPost(fetchParents: boolean = true) {
    // Hit the Get Single Post endpoint with specific parameters
    let readerPubKey = "";
    if (this.globalVars.loggedInUser) {
      readerPubKey = this.globalVars.loggedInUser.PublicKeyBase58Check;
    }
    return this.backendApi.GetSinglePost(
      this.globalVars.localNode,
      this.nftPostHashHex /*PostHashHex*/,
      readerPubKey /*ReaderPublicKeyBase58Check*/,
      fetchParents,
      0,
      0,
      this.globalVars.showAdminTools() /*AddGlobalFeedBool*/
    );
  }

  openImgModal(event, imageURL) {
    event.stopPropagation();
    this.modalService.show(FeedPostImageModalComponent, {
      class: "modal-dialog-centered img_popups modal-lg",
      initialState: {
        imageURL,
      },
    });
  }

  refreshPosts() {
    // Fetch the post entry
    this.getPost().subscribe(
      async (res) => {
        console.log(res);
        if (!res || !res.PostFound) {
          this.router.navigateByUrl("/" + this.globalVars.RouteNames.NOT_FOUND, { skipLocationChange: true });
          return;
        }
        // if (!res.PostFound.IsNFT) {
        //   const postHashHex = res.PostFound.PostHashHex;
        //   SwalHelper.fire({
        //     target: this.globalVars.getTargetComponentSelector(),
        //     html: "This post is not an NFT",
        //     showConfirmButton: true,
        //     showCancelButton: true,
        //     customClass: {
        //       confirmButton: "btn btn-light",
        //       cancelButton: "btn btn-light no",
        //     },
        //     confirmButtonText: "View Post",
        //     cancelButtonText: "Go back",
        //     reverseButtons: true,
        //   }).then((res) => {
        //     if (res.isConfirmed) {
        //       this.router.navigate(["/" + RouteNames.POSTS + "/" + postHashHex]);
        //       return;
        //     }
        //     this.location.back();
        //   });
        //   return;
        // }
        // Set current post
        this.nftPost = res.PostFound;
        this.configurePostType(this.nftPost);
        this.titleService.setTitle(this.nftPost.ProfileEntryResponse.Username + ` on ${environment.node.name}`);
        this.refreshBidData();
        this.configureMetaTags();

        console.log(` ------------------- this.nftPost ${JSON.stringify(this.nftPost)} ------------------- `);
      },
      (err) => {
        // TODO: post threads: rollbar
        console.error(err);
        this.router.navigateByUrl("/" + this.globalVars.RouteNames.NOT_FOUND, { skipLocationChange: true });
        this.delayLoading();
      }
    );
  }
  refreshBidData(): Subscription {
    this.refreshingBids = true;
    return this.backendApi
      .GetNFTBidsForNFTPost(
        this.globalVars.localNode,
        this.globalVars.loggedInUser?.PublicKeyBase58Check,
        this.nftPost.PostHashHex
      )
      .subscribe(
        (res) => {
          this.nftBidData = res;
          if (!this.nftBidData.BidEntryResponses) {
            this.nftBidData.BidEntryResponses = [];
          }
          this.availableSerialNumbers = this.nftBidData.NFTEntryResponses?.filter(
            (nftEntryResponse) => nftEntryResponse?.IsForSale
          );
          this.myAvailableSerialNumbers = this.availableSerialNumbers?.filter(
            (nftEntryResponse) =>
              nftEntryResponse.OwnerPublicKeyBase58Check === this.globalVars.loggedInUser?.PublicKeyBase58Check
          );
          /*if (!this.myAvailableSerialNumbers?.length) {
              this.tabs = this.tabs.filter((t) => t !== EthNftPostComponent.MY_AUCTIONS);
              this.activeTab = this.activeTab === EthNftPostComponent.MY_AUCTIONS ? this.tabs[0] : this.activeTab;
            }*/
          this.myBids = this.nftBidData.BidEntryResponses.filter(
            (bidEntry) => bidEntry.PublicKeyBase58Check === this.globalVars.loggedInUser?.PublicKeyBase58Check
          );
          // adding my bid on data load
          this.bids = this.nftBidData.BidEntryResponses.filter(
            (bidEntry) => bidEntry.BidAmountNanos <= bidEntry.BidderBalanceNanos
          );
          // This figures out if your nft has bids
          const serialNumbers = this.myAvailableSerialNumbers?.map((nftEntryResponse) => nftEntryResponse.SerialNumber);
          this.bidsOnMyNfts = this.nftBidData.BidEntryResponses.filter(
            (bidEntry) =>
              (serialNumbers.includes(bidEntry.SerialNumber) || bidEntry.SerialNumber === 0) &&
              bidEntry.BidAmountNanos <= bidEntry.BidderBalanceNanos
          );
          this.hightestBidOwner = _.maxBy(this.bids, "BidAmountNanos");
          console.log(this.hightestBidOwner);
          if (!this.myBids.length) {
            this.tabs = this.tabs.filter((t) => t !== EthNftPostComponent.MY_BIDS);
            this.activeTab = this.activeTab === EthNftPostComponent.MY_BIDS ? this.tabs[0] : this.activeTab;
          }
          if (this.nftPost.PostExtraData?.properties) {
            if (!Array.isArray(JSON.parse(this.nftPost.PostExtraData?.properties))) {
              this.tabs = this.tabs.filter((t) => t !== EthNftPostComponent.DETAILS);
              this.activeTab = this.activeTab === EthNftPostComponent.DETAILS ? this.tabs[0] : this.activeTab;
            } else {
              // If it has properties
              let propertiesList = JSON.parse(this.nftPost.PostExtraData?.properties);
              // Make sure its an Array
              if (Array.isArray(propertiesList)) {
                this.properties = propertiesList;
              }
            }
          } else {
            this.tabs = this.tabs.filter((t) => t !== EthNftPostComponent.DETAILS);
            this.activeTab = this.activeTab === EthNftPostComponent.DETAILS ? this.tabs[0] : this.activeTab;
          }
          this.showPlaceABid = !!(this.availableSerialNumbers?.length - this.myAvailableSerialNumbers?.length);
          this.highBid = _.maxBy(this.nftBidData.NFTEntryResponses, "HighestBidAmountNanos")?.HighestBidAmountNanos;
          this.lowBid = _.minBy(this.nftBidData.NFTEntryResponses, "LowestBidAmountNanos")?.LowestBidAmountNanos;
          this.owners = this.nftBidData.NFTEntryResponses;
          // if (this.feedPost) {
          //   this.feedPost.nftBidData = this.nftBidData
          // }
        },
        (err) => {
          console.error(err);
          this.globalVars._alertError(err);
        }
      )
      .add(() => {
        this._handleTabClick(this.activeTab);
        this.delayLoading();
        this.refreshingBids = false;
      });
  }

  _setStateFromActivatedRoute(route) {
    if (this.nftPostHashHex !== route.snapshot.params.postHashHex) {
      // get the username of the target user (user whose followers / following we're obtaining)
      this.nftPostHashHex = route.snapshot.params.postHashHex;

      this.loading = true;
      this.refreshPosts();
    }
  }

  isPostBlocked(post: any): boolean {
    return this.globalVars.hasUserBlockedCreator(post.PosterPublicKeyBase58Check);
  }

  afterUserBlocked(blockedPubKey: any) {
    this.globalVars.loggedInUser.BlockedPubKeys[blockedPubKey] = {};
  }

  afterNftBidPlaced() {
    this.refreshBidData();
  }

  sellNFT(): void {
    const sellNFTModalDetails = this.modalService.show(SellNftModalComponent, {
      class: "modal-dialog-center nft_placebid_modal_bx nft_placebid_modal_bx_right rt_popups modal-lg",
      initialState: {
        post: this.nftPost,
        nftEntries: this.nftBidData.NFTEntryResponses,
        selectedBidEntries: this.nftBidData.BidEntryResponses,
      },
    });
    const onHiddenEvent = sellNFTModalDetails.onHidden.pipe(take(1));
    onHiddenEvent.subscribe((response) => {
      if (response === "nft sold") {
        this.loading = true;
        this.refreshPosts();
        this.feedPost.getNFTEntries();
      } else if (response === "unlockable content opened") {
        const unlockableModalDetails = this.modalService.show(AddUnlockableModalComponent, {
          class: "modal-dialog-centered nft_placebid_modal_bx nft_placebid_modal_bx_right rt_popups",
          initialState: {
            post: this.nftPost,
            selectedBidEntries: this.nftBidData.BidEntryResponses.filter((bidEntry) => bidEntry.selected),
          },
        });
        const onHiddenEvent = unlockableModalDetails.onHidden.pipe(take(1));
        onHiddenEvent.subscribe((response) => {
          if (response === "nft sold") {
            this.loading = true;
            this.refreshPosts();
            this.feedPost.getNFTEntries();
          }
        });
      }
    });
  }

  checkSelectedBidEntries(bidEntry: NFTBidEntryResponse): void {
    if (bidEntry.selected) {
      // De-select any bid entries for the same serial number.
      this.nftBidData.BidEntryResponses.forEach((bidEntryResponse) => {
        if (
          bidEntryResponse.SerialNumber === bidEntry.SerialNumber &&
          bidEntry !== bidEntryResponse &&
          bidEntryResponse.selected
        ) {
          bidEntryResponse.selected = false;
        }
      });
    }
    // enabled / disable the Sell NFT button based on the count of bid entries that are selected.
    /*this.sellNFTDisabled = !this.nftBidData.BidEntryResponses.filter((bidEntryResponse) => bidEntryResponse.selected)
        ?.length;*/
  }

  selectBidEntry(bidEntry: NFTBidEntryResponse): void {
    this.bids.forEach((bidEntry) => (bidEntry.selected = false));
    bidEntry.selected = true;
    this.sellNFTDisabled = false;
  }

  closeAuction(): void {
    const closeNftAuctionModalDetails = this.modalService.show(CloseNftAuctionModalComponent, {
      class: "modal-dialog-centered close_auction_pop rt_popups",
      initialState: {
        post: this.nftPost,
        myAvailableSerialNumbers: this.myAvailableSerialNumbers,
      },
    });
    const onHiddenEvent = closeNftAuctionModalDetails.onHidden.pipe(take(1));
    onHiddenEvent.subscribe((response) => {
      if (response === "auction cancelled") {
        this.refreshBidData();
        this.feedPost.getNFTEntries();
      }
    });
  }

  userOwnsSerialNumber(serialNumber: number): boolean {
    const loggedInPubKey = this.globalVars.loggedInUser.PublicKeyBase58Check;
    return !!this.nftBidData.NFTEntryResponses.filter(
      (nftEntryResponse) =>
        nftEntryResponse.SerialNumber === serialNumber && nftEntryResponse.OwnerPublicKeyBase58Check === loggedInPubKey
    ).length;
  }

  UserOwnsSerialNumbers() {
    const loggedInPubKey = this.globalVars.loggedInUser.PublicKeyBase58Check;
    let serialList = this.nftBidData.NFTEntryResponses.filter(
      (NFTEntryResponse) => NFTEntryResponse.OwnerPublicKeyBase58Check === loggedInPubKey && !NFTEntryResponse.IsPending
    );
    return serialList;
  }
  setEmbedURLForPostContent(): void {
    EmbedUrlParserService.getEmbedURL(
      this.backendApi,
      this.globalVars,
      this.postContent.PostExtraData["EmbedVideoURL"]
    ).subscribe((res) => (this.constructedEmbedURL = res));
  }
  getEmbedHeight(): number {
    return EmbedUrlParserService.getEmbedHeight(this.postContent.PostExtraData["EmbedVideoURL"]);
  }
  getEmbedWidth(): string {
    return EmbedUrlParserService.getEmbedWidth(this.postContent.PostExtraData["EmbedVideoURL"]);
  }
  usersPendingSerialNumbers() {
    const loggedInPubKey = this.globalVars.loggedInUser.PublicKeyBase58Check;
    let serialList = this.nftBidData.NFTEntryResponses.filter(
      (NFTEntryResponse) => NFTEntryResponse.OwnerPublicKeyBase58Check === loggedInPubKey && NFTEntryResponse.IsPending
    );
    return serialList;
  }

  _handleTabClick(tabName: string): void {
    this.activeTab = tabName;
    this.showBidsView = tabName === EthNftPostComponent.ALL_BIDS || tabName === EthNftPostComponent.MY_BIDS; //||
    //tabName === EthNftPostComponent.MY_AUCTIONS;
    if (this.activeTab === EthNftPostComponent.ALL_BIDS) {
      this.bids = this.nftBidData.BidEntryResponses.filter(
        (bidEntry) => bidEntry.BidAmountNanos <= bidEntry.BidderBalanceNanos
      );
    } else if (this.activeTab === EthNftPostComponent.MY_BIDS) {
      this.bids = this.nftBidData.BidEntryResponses.filter(
        (bidEntry) => bidEntry.PublicKeyBase58Check === this.globalVars.loggedInUser?.PublicKeyBase58Check
      );
    } /*else if (this.activeTab === EthNftPostComponent.MY_AUCTIONS) {
        const serialNumbers = this.myAvailableSerialNumbers?.map((nftEntryResponse) => nftEntryResponse.SerialNumber);
        this.bids = this.nftBidData.BidEntryResponses.filter(
          (bidEntry) =>
            (serialNumbers.includes(bidEntry.SerialNumber) || bidEntry.SerialNumber === 0) &&
            bidEntry.BidAmountNanos <= bidEntry.BidderBalanceNanos
        );
      }*/
    if (this.showBidsView) {
      this.sortBids(this.sortByField, this.sortDescending);
    } else if (this.activeTab === EthNftPostComponent.OWNERS) {
      this.sortNftEntries(this.sortByField, this.sortDescending);
    }
  }

  static SORT_BY_PRICE = "PRICE";
  static SORT_BY_USERNAME = "USERNAME";
  static SORT_BY_EDITION = "EDITION";
  sortByField = EthNftPostComponent.SORT_BY_PRICE;
  sortDescending = true;

  sortBids(attribute: string = EthNftPostComponent.SORT_BY_PRICE, descending: boolean = true): void {
    if (!this.bids?.length) {
      return;
    }
    const sortDescending = descending ? -1 : 1;
    this.bids.sort((a, b) => {
      const bidDiff = this.compareBidAmount(a, b);
      const serialNumDiff = this.compareSerialNumber(a, b);
      const usernameDiff = this.compareUsername(a, b);
      if (attribute === EthNftPostComponent.SORT_BY_PRICE) {
        return sortDescending * bidDiff || serialNumDiff || usernameDiff;
      } else if (attribute === EthNftPostComponent.SORT_BY_USERNAME) {
        return sortDescending * usernameDiff || bidDiff || serialNumDiff;
      } else if (attribute === EthNftPostComponent.SORT_BY_EDITION) {
        return sortDescending * serialNumDiff || bidDiff || usernameDiff;
      }
    });
  }

  handleColumnHeaderClick(header: string): void {
    if (this.sortByField === header) {
      this.sortDescending = !this.sortDescending;
    } else {
      this.sortDescending = false;
    }
    this.sortByField = header;
    this.sortBids(header, this.sortDescending);
    this.sortNftEntries(header, this.sortDescending);
  }

  compareBidAmount(a: NFTBidEntryResponse, b: NFTBidEntryResponse): number {
    return a.BidAmountNanos - b.BidAmountNanos;
  }
  compareSerialNumber(a: NFTBidEntryResponse | NFTEntryResponse, b: NFTBidEntryResponse | NFTEntryResponse): number {
    return a.SerialNumber - b.SerialNumber;
  }
  compareUsername(a: NFTBidEntryResponse, b: NFTBidEntryResponse): number {
    const aUsername = a.ProfileEntryResponse?.Username || a.PublicKeyBase58Check;
    const bUsername = b.ProfileEntryResponse?.Username || b.PublicKeyBase58Check;
    if (aUsername < bUsername) {
      return -1;
    }
    if (bUsername < aUsername) {
      return 1;
    }
    return 0;
  }

  sortNftEntries(attribute: string, descending: boolean = true): void {
    if (!this.owners?.length) {
      return;
    }
    const sortDescending = descending ? -1 : 1;
    this.owners.sort((a, b) => {
      const lastAcceptedBidDiff = this.compareLastAcceptedBidAmount(a, b);
      const serialNumDiff = this.compareSerialNumber(a, b);
      const usernameDiff = this.compareNFTEntryUsername(a, b);
      if (attribute === EthNftPostComponent.SORT_BY_PRICE) {
        return sortDescending * lastAcceptedBidDiff || serialNumDiff || usernameDiff;
      } else if (attribute === EthNftPostComponent.SORT_BY_USERNAME) {
        return sortDescending * usernameDiff || lastAcceptedBidDiff || serialNumDiff;
      } else if (attribute === EthNftPostComponent.SORT_BY_EDITION) {
        return sortDescending * serialNumDiff || lastAcceptedBidDiff || usernameDiff;
      }
    });
  }

  compareLastAcceptedBidAmount(a: NFTEntryResponse, b: NFTEntryResponse): number {
    return a.LastAcceptedBidAmountNanos - b.LastAcceptedBidAmountNanos;
  }
  compareNFTEntryUsername(a: NFTEntryResponse, b: NFTEntryResponse): number {
    const aUsername = a.ProfileEntryResponse?.Username || a.OwnerPublicKeyBase58Check;
    const bUsername = b.ProfileEntryResponse?.Username || b.OwnerPublicKeyBase58Check;
    if (aUsername < bUsername) {
      return -1;
    }
    if (bUsername < aUsername) {
      return 1;
    }
    return 0;
  }

  selectHighestBids(): void {
    let highestNFTMap: { [k: number]: NFTBidEntryResponse } = {};
    this.bids.forEach((bid) => {
      const highestBid = highestNFTMap[bid.SerialNumber];
      if (
        (!highestBid || highestBid.BidAmountNanos < bid.BidAmountNanos) &&
        bid.BidderBalanceNanos >= bid.BidAmountNanos
      ) {
        highestNFTMap[bid.SerialNumber] = bid;
      }
    });
    this.bids.forEach((bid) => {
      const highestBid = highestNFTMap[bid.SerialNumber];
      bid.selected =
        highestBid.PublicKeyBase58Check === bid.PublicKeyBase58Check &&
        highestBid.BidAmountNanos === bid.BidAmountNanos &&
        highestBid.SerialNumber === bid.SerialNumber;
      if (this.nftPost.NumNFTCopies === 1 && bid.selected) {
        this.selectedBid = highestBid;
      }
    });
    this.sellNFTDisabled = false;
  }

  cancelBid(bidEntry: NFTBidEntryResponse): void {
    this.triggerBidCancellation(this.nftPost.PostHashHex, bidEntry.SerialNumber, 0);
  }

  reloadingThread = false;
  incrementCommentCounter(): void {
    this.nftPost.CommentCount += 1;
    setTimeout(() => (this.reloadingThread = true));
    setTimeout(() => (this.reloadingThread = false));
  }
  openRepostsModal(event, isQuote: boolean = false): void {
    // Prevent the post navigation click from occurring.
    event.stopPropagation();

    if (!this.globalVars.loggedInUser) {
      // Check if the user has an account.
      this.globalVars.logEvent("alert : reply : account");
      SharedDialogs.showCreateAccountToPostDialog(this.globalVars);
    } else if (!this.globalVars.doesLoggedInUserHaveProfile()) {
      // Check if the user has a profile.
      this.globalVars.logEvent("alert : reply : profile");
      SharedDialogs.showCreateProfileToPostDialog(this.router);
    } else {
      const initialState = {
        // If we are quoting a post, make sure we pass the content so we don't reclout a reclout.
        parentPost: this.nftPost,
        afterCommentCreatedCallback: this.prependPostToFeed.bind(this),
        isQuote,
      };

      // If the user has an account and a profile, open the modal so they can comment.
      this.modalService.show(CommentModalComponent, {
        class: "modal-dialog-centered rt_popups",
        initialState,
      });
    }
  }
  // prependPostToFeed(postEntryResponse) {
  //   EthNftPostComponent.prependPostToFeed(this.refreshPosts(), postEntryResponse);
  // }

  prependPostToFeed(postEntryResponse) {
    this.refreshPosts();
  }
  getEncryptedText() {
    const list = this.nftBidData.NFTEntryResponses.filter(
      (nftEntryResponse) => nftEntryResponse.EncryptedUnlockableText
    );
    return list[0]?.EncryptedUnlockableText ? list[0]?.EncryptedUnlockableText : "";
  }

  configureMetaTags(): void {
    // this.refreshPosts();
    console.log("------------------------------ configureMetaTags function hit ------------------------------");
    const imageUrl = this.mapImageURLs(this.nftPost.ImageURLs[0]);
    // const imageUrl = "https://arweave.net/yYQkx4IrwflWfPfx-P2fnCUHOL1mGK5Mdgfw8ntoohc";

    // console.log(`------------------------------ The imageUrl is ${imageUrl} ------------------------------`);

    // this.metaService.updateTag({ property: "twitter:image", content: `${imageUrl}` }, "property='twitter:image'");
    // this.metaService.updateTag(
    //   { property: "og:image:secure_url", content: `${imageUrl}` },
    //   "property='og:image:secure_url'"
    // );
    // this.metaService.updateTag({ property: "og:image", content: `${imageUrl}` }, "property='og:image'");

    // document.querySelector("meta[property='og:image']").setAttribute("content", `${imageUrl}`);
    // document.querySelector("meta[name='twitter:image']").setAttribute("content", `${imageUrl}`);

    this.metaService.updateTag({ property: "og:image", content: imageUrl });
    this.metaService.updateTag({ name: "twitter:image", content: imageUrl });
  }

  onSingleBidCancellation(event: CancelEvent): void {
    const { postHashHex, serialNumber, bidAmountNanos } = event;
    this.triggerBidCancellation(postHashHex, serialNumber, bidAmountNanos);
  }
  triggerBidCancellation(postHashHex: string, serialNumber: number, bidAmountNanos: number): void {
    const confirmationModalDetails = this.modalService.show(ConfirmationModalComponent, {
      class: "modal-dialog-centered close_auction_pop rt_popups",
      initialState: {
        title: "Cancel Bid",
        text: "Proceeding will cancel your bid...",
        buttonText: "Cancel bid",
      },
    });
    const onHiddenEvent = confirmationModalDetails.onHidden.pipe(take(1));
    onHiddenEvent.subscribe((response) => {
      if (response === "confirmed") {
        this.backendApi
          .CreateNFTBid(
            this.globalVars.localNode,
            this.globalVars.loggedInUser.PublicKeyBase58Check,
            postHashHex,
            serialNumber,
            bidAmountNanos,
            this.globalVars.defaultFeeRateNanosPerKB
          )
          .subscribe(
            () => {
              this.refreshBidData();
            },
            (err) => {
              console.error(err);
            }
          );
      }
    });
  }

  isRepost(post: any): boolean {
    return post.Body === "" && (!post.ImageURLs || post.ImageURLs?.length === 0) && post.RepostedPostEntryResponse;
  }
  isQuotedClout(post: any): boolean {
    return (post.Body !== "" || post.ImageURLs?.length > 0) && post.RepostedPostEntryResponse;
  }
  isRegularPost(post: any): boolean {
    return !this.isRepost(post) && !this.isQuotedClout(post);
  }

  configurePostType(post: any): void {
    if (this.isRepost(post)) {
      this.postContent = post.RepostedPostEntryResponse;
      this.reposterProfile = post.ProfileEntryResponse;
      if (this.isQuotedClout(post?.RepostedPostEntryResponse)) {
        this.quotedContent = this.postContent.RepostedPostEntryResponse;
      }
    } else if (this.isQuotedClout(post)) {
      this.postContent = post;
      this.quotedContent = post.RepostedPostEntryResponse;
    } else {
      this.postContent = post;
    }
    this.setEmbedURLForPostContent();
  }

  onMultipleBidsCancellation(event: any): void {
    console.log(event);
    const modalDetails = this.modalService.show(CancelBidModalComponent, {
      class: "modal-dialog-centered nft_placebid_modal_bx nft_placebid_modal_bx_right  modal-lg",
      initialState: {
        bidEntryResponses: event.cancellableBids,
        postHashHex: event.postHashHex,
      },
    });
    let onHidden = modalDetails.onHidden.pipe(take(1));
    onHidden.subscribe((response) => {
      if ((response = "Bids cancelled")) {
        this.refreshBidData();
        this.feedPost.getNFTEntries();
      }
    });
  }

  counter(i: number) {
    return new Array(i);
  }

  delayLoading(): void {
    setTimeout(() => {
      this.loading = false;
    }, 1000);
  }
}
