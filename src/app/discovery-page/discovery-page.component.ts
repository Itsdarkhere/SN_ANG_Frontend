/* eslint-disable prettier/prettier */
import { Component, ElementRef, HostListener, OnInit, ViewChild } from "@angular/core";
import { BackendApiService, NFTEntryResponse, PostEntryResponse } from "../backend-api.service";
import { GlobalVarsService } from "../global-vars.service";
import KeenSlider, { KeenSliderInstance } from "keen-slider"
import { MixpanelService } from "../mixpanel.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-discovery-page",
  templateUrl: "./discovery-page.component.html",
  styleUrls: ["./discovery-page.component.scss", "../../../node_modules/keen-slider/keen-slider.min.css",],
})
// GlobalVars are used to disable loading if user allready has stuff loaded
export class DiscoveryPageComponent implements OnInit {
  @ViewChild("sliderRef2") sliderRef2: ElementRef<HTMLElement>
  @ViewChild("sliderRef5") sliderRef5: ElementRef<HTMLElement>


  slider2: KeenSliderInstance = null
  slider5: KeenSliderInstance = null

  discoveryDataToShow: { NFTEntryResponses: NFTEntryResponse[]; PostEntryResponse: PostEntryResponse }[];
  discoveryDataToShow2: { NFTEntryResponses: NFTEntryResponse[]; PostEntryResponse: PostEntryResponse }[];
  discoveryDataToShow3: { NFTEntryResponses: NFTEntryResponse[]; PostEntryResponse: PostEntryResponse }[];
  discoveryDataToShow4: { NFTEntryResponses: NFTEntryResponse[]; PostEntryResponse: PostEntryResponse }[];
  discoveryDataToShow5: { NFTEntryResponses: NFTEntryResponse[]; PostEntryResponse: PostEntryResponse }[];

  postsLoading = true;
  postsLoading2 = true;
  postsLoading3 = true;
  postsLoading4 = true;
  postsLoading5 = true;


  discoveryMainNftResponse: PostEntryResponse;
  discoveryUserArray: string[];
  discoveryExtraUserArray: string[];

  mobile = false;
  usersLoading = false;
  fakeArray = [1, 2, 3, 4, 5, 6, 7, 8];
  constructor(private backendApi: BackendApiService, private mixPanel: MixpanelService, public globalVars: GlobalVarsService, public router: Router) {}

  ngOnInit(): void {
    this.setMobileBasedOnViewport();
    // Get only trending on init, others we get through the observeVisibility directive
    // This is to reduce network load / postgres stress
    this.getTrendingAuctions();
    this.mixPanel.track44("Discovery viewed");
  }
  setMobileBasedOnViewport() {
    this.mobile = this.globalVars.isMobile();
  }
  ngAfterViewInit() {
    this.slider2 = new KeenSlider(this.sliderRef2.nativeElement, {
      loop: true,
      mode: "free-snap",
      slides: { perView: "auto", spacing: 20  },
    })
    this.slider5 = new KeenSlider(this.sliderRef5.nativeElement, {
      loop: true,
      mode: "free-snap",
      slides: { perView: "auto", spacing: 10  },
    })
  }
  ngOnDestroy() {
    if (this.slider2) this.slider2.destroy();
    if (this.slider5) this.slider5.destroy();
  }
  @HostListener("window:resize")
  onResize() {
    this.setMobileBasedOnViewport();
  }
  getCommunityFavourites() {
    // dont get if we have the data
    if (this.discoveryDataToShow) {
      return;
    }
    this.postsLoading = true;
    this.backendApi
      .GetCommunityFavourite(
        this.globalVars.localNode,
        this.globalVars?.loggedInUser?.PublicKeyBase58Check,
        "BC1YLiiQ36NSLSK2bpLqi4PsP85mzBaKRTLxBAoTdNELohuRdrSMX9w",
      )
      .subscribe((res) => {
        this.discoveryDataToShow = res["PostEntryResponse"].slice(0, 8);
        setTimeout(() => {
          this.postsLoading = false;
        }, 300);
      });
  }
  getTrendingAuctions() {
    // dont get if we have the data
    if (this.discoveryDataToShow3) {
      return;
    }
    this.postsLoading3 = true;
    this.backendApi.GetTrendingAuctions(this.globalVars.localNode, this.globalVars?.loggedInUser?.PublicKeyBase58Check).subscribe((res) => {
      this.discoveryMainNftResponse = res["PostEntryResponse"][0]
      if (res["PostEntryResponse"]?.length < 9) {
        this.discoveryDataToShow3 = res["PostEntryResponse"].slice(1, 4);
      } else {
        this.discoveryDataToShow3 = res["PostEntryResponse"].slice(1, 9);
      }
      setTimeout(() => {
        this.postsLoading3 = false;
      }, 350)
    },(err) => {
      console.log(err);
    })
  }
  getRecentSales() {
    // dont get if we have the data
    if (this.discoveryDataToShow4) {
      return;
    }
    this.postsLoading4 = true;
    this.backendApi.GetRecentSales(this.globalVars.localNode, this.globalVars?.loggedInUser?.PublicKeyBase58Check).subscribe((res) => {
      this.discoveryDataToShow4 = res["PostEntryResponse"];
      setTimeout(() => {
        this.postsLoading4 = false;
      }, 350)
    },(err) => {
      console.log(err);
    })
  }
  getSecondaryListings() {
    // dont get if we have the data
    if (this.discoveryDataToShow5) {
      return;
    }
    this.postsLoading5 = true;
    this.backendApi.GetSecondaryListings(this.globalVars.localNode, this.globalVars?.loggedInUser?.PublicKeyBase58Check).subscribe((res) => {
      this.discoveryDataToShow5 = res["PostEntryResponse"];
      setTimeout(() => {
        this.postsLoading5 = false;
      }, 350)
    },(err) => {
      console.log(err);
    })
  }
  routeViewAll(category: string) {
    switch (category) {
      case "trending":
        this.globalVars.desoMarketplace = true;
        this.globalVars.marketplaceVerifiedCreators = "verified";
        this.globalVars.marketplaceContentFormat = "all";
        this.globalVars.marketplaceNFTCategory = "all";
        this.globalVars.marketplaceLowPriceNanos = 0;
        this.globalVars.marketplaceHighPriceNanos = 0;
        this.globalVars.marketplaceLowPriceUSD = 0;
        this.globalVars.marketplaceHighPriceUSD = 0;
        this.globalVars.marketplacePriceRangeSet = false;
        this.globalVars.marketplaceMarketType = "all";
        this.globalVars.marketplaceSortType = "most recent first";
        // This is important others are set to default
        this.globalVars.marketplaceStatus = "has bids"
        break;
      case "art":
        this.globalVars.desoMarketplace = true;
        this.globalVars.marketplaceVerifiedCreators = "verified";
        this.globalVars.marketplaceContentFormat = "all";
        this.globalVars.marketplaceLowPriceNanos = 0;
        this.globalVars.marketplaceHighPriceNanos = 0;
        this.globalVars.marketplaceLowPriceUSD = 0;
        this.globalVars.marketplaceHighPriceUSD = 0;
        this.globalVars.marketplacePriceRangeSet = false;
        this.globalVars.marketplaceMarketType = "all";
        this.globalVars.marketplaceStatus = "all"
        this.globalVars.marketplaceSortType = "most recent first";
        // This is important others are set to default
        this.globalVars.marketplaceNFTCategory = "art"
        break;
      case "collectibles":
        this.globalVars.desoMarketplace = true;
        this.globalVars.marketplaceVerifiedCreators = "verified";
        this.globalVars.marketplaceContentFormat = "all";
        this.globalVars.marketplaceLowPriceNanos = 0;
        this.globalVars.marketplaceHighPriceNanos = 0;
        this.globalVars.marketplaceLowPriceUSD = 0;
        this.globalVars.marketplaceHighPriceUSD = 0;
        this.globalVars.marketplacePriceRangeSet = false;
        this.globalVars.marketplaceMarketType = "all";
        this.globalVars.marketplaceStatus = "all"
        this.globalVars.marketplaceSortType = "most recent first";
        // This is important others are set to default
        this.globalVars.marketplaceNFTCategory = "collectibles"
        break;
      case "generative":
        this.globalVars.desoMarketplace = true;
        this.globalVars.marketplaceVerifiedCreators = "verified";
        this.globalVars.marketplaceContentFormat = "all";
        this.globalVars.marketplaceLowPriceNanos = 0;
        this.globalVars.marketplaceHighPriceNanos = 0;
        this.globalVars.marketplaceLowPriceUSD = 0;
        this.globalVars.marketplaceHighPriceUSD = 0;
        this.globalVars.marketplacePriceRangeSet = false;
        this.globalVars.marketplaceMarketType = "all";
        this.globalVars.marketplaceStatus = "all"
        this.globalVars.marketplaceSortType = "most recent first";
        // This is important others are set to default
        this.globalVars.marketplaceNFTCategory = "generative art"
        break;
      case "metaverse":
        this.globalVars.desoMarketplace = true;
        this.globalVars.marketplaceVerifiedCreators = "verified";
        this.globalVars.marketplaceContentFormat = "all";
        this.globalVars.marketplaceLowPriceNanos = 0;
        this.globalVars.marketplaceHighPriceNanos = 0;
        this.globalVars.marketplaceLowPriceUSD = 0;
        this.globalVars.marketplaceHighPriceUSD = 0;
        this.globalVars.marketplacePriceRangeSet = false;
        this.globalVars.marketplaceMarketType = "all";
        this.globalVars.marketplaceStatus = "all"
        this.globalVars.marketplaceSortType = "most recent first";
        // This is important others are set to default
        this.globalVars.marketplaceNFTCategory = "metaverse"
        break;
      case "categorymusic":
        this.globalVars.desoMarketplace = true;
        this.globalVars.marketplaceVerifiedCreators = "verified";
        this.globalVars.marketplaceContentFormat = "all";
        this.globalVars.marketplaceLowPriceNanos = 0;
        this.globalVars.marketplaceHighPriceNanos = 0;
        this.globalVars.marketplaceLowPriceUSD = 0;
        this.globalVars.marketplaceHighPriceUSD = 0;
        this.globalVars.marketplacePriceRangeSet = false;
        this.globalVars.marketplaceMarketType = "all";
        this.globalVars.marketplaceStatus = "all"
        this.globalVars.marketplaceSortType = "most recent first";
        // This is important others are set to default
        this.globalVars.marketplaceNFTCategory = "music"
        break;
      case "profilepic":
        this.globalVars.desoMarketplace = true;
        this.globalVars.marketplaceVerifiedCreators = "verified";
        this.globalVars.marketplaceContentFormat = "all";
        this.globalVars.marketplaceLowPriceNanos = 0;
        this.globalVars.marketplaceHighPriceNanos = 0;
        this.globalVars.marketplaceLowPriceUSD = 0;
        this.globalVars.marketplaceHighPriceUSD = 0;
        this.globalVars.marketplacePriceRangeSet = false;
        this.globalVars.marketplaceMarketType = "all";
        this.globalVars.marketplaceStatus = "all"
        this.globalVars.marketplaceSortType = "most recent first";
        // This is important others are set to default
        this.globalVars.marketplaceNFTCategory = "profile picture"
        break;
      case "photography":
        this.globalVars.desoMarketplace = true;
        this.globalVars.marketplaceVerifiedCreators = "verified";
        this.globalVars.marketplaceContentFormat = "all";
        this.globalVars.marketplaceLowPriceNanos = 0;
        this.globalVars.marketplaceHighPriceNanos = 0;
        this.globalVars.marketplaceLowPriceUSD = 0;
        this.globalVars.marketplaceHighPriceUSD = 0;
        this.globalVars.marketplacePriceRangeSet = false;
        this.globalVars.marketplaceMarketType = "all";
        this.globalVars.marketplaceStatus = "all"
        this.globalVars.marketplaceSortType = "most recent first";
        // This is important others are set to default
        this.globalVars.marketplaceNFTCategory = "photography"
        break;
      case "fresh":
        this.globalVars.desoMarketplace = true;
        this.globalVars.marketplaceVerifiedCreators = "verified";
        this.globalVars.marketplaceContentFormat = "all";
        this.globalVars.marketplaceLowPriceNanos = 0;
        this.globalVars.marketplaceHighPriceNanos = 0;
        this.globalVars.marketplaceLowPriceUSD = 0;
        this.globalVars.marketplaceHighPriceUSD = 0;
        this.globalVars.marketplacePriceRangeSet = false;
        this.globalVars.marketplaceMarketType = "all";
        this.globalVars.marketplaceStatus = "all"
        this.globalVars.marketplaceNFTCategory = "all"
        // This is important others are set to default
        this.globalVars.marketplaceSortType = "most recent first"
        break;
      case "mostdiamonds":
        this.globalVars.desoMarketplace = true;
        this.globalVars.marketplaceVerifiedCreators = "verified";
        this.globalVars.marketplaceContentFormat = "all";
        this.globalVars.marketplaceLowPriceNanos = 0;
        this.globalVars.marketplaceHighPriceNanos = 0;
        this.globalVars.marketplaceLowPriceUSD = 0;
        this.globalVars.marketplaceHighPriceUSD = 0;
        this.globalVars.marketplacePriceRangeSet = false;
        this.globalVars.marketplaceMarketType = "all";
        this.globalVars.marketplaceStatus = "all"
        this.globalVars.marketplaceNFTCategory = "all"
        // This is important others are set to default
        this.globalVars.marketplaceSortType = "most diamonds first"
        break;
      case "recentsales":
        this.globalVars.desoMarketplace = true;
        this.globalVars.marketplaceVerifiedCreators = "verified";
        this.globalVars.marketplaceContentFormat = "all";
        this.globalVars.marketplaceLowPriceNanos = 0;
        this.globalVars.marketplaceHighPriceNanos = 0;
        this.globalVars.marketplaceLowPriceUSD = 0;
        this.globalVars.marketplaceHighPriceUSD = 0;
        this.globalVars.marketplacePriceRangeSet = false;
        this.globalVars.marketplaceMarketType = "all";
        this.globalVars.marketplaceNFTCategory = "all"
        // These are important others are set to default
        this.globalVars.marketplaceStatus = "sold"
        this.globalVars.marketplaceSortType = "most recent first"
        break;
      case "secondarylistings":
        this.globalVars.desoMarketplace = true;
        this.globalVars.marketplaceVerifiedCreators = "verified";
        this.globalVars.marketplaceContentFormat = "all";
        this.globalVars.marketplaceLowPriceNanos = 0;
        this.globalVars.marketplaceHighPriceNanos = 0;
        this.globalVars.marketplaceLowPriceUSD = 0;
        this.globalVars.marketplaceHighPriceUSD = 0;
        this.globalVars.marketplacePriceRangeSet = false;
        this.globalVars.marketplaceStatus = "all"
        this.globalVars.marketplaceNFTCategory = "all"
        this.globalVars.marketplaceSortType = "most recent first"
        // These are important others are set to default
        this.globalVars.marketplaceStatus = "for sale"
        this.globalVars.marketplaceMarketType = "secondary"
        break;
      case "image":
        this.globalVars.desoMarketplace = true;
        this.globalVars.marketplaceVerifiedCreators = "verified";
        this.globalVars.marketplaceLowPriceNanos = 0;
        this.globalVars.marketplaceHighPriceNanos = 0;
        this.globalVars.marketplaceLowPriceUSD = 0;
        this.globalVars.marketplaceHighPriceUSD = 0;
        this.globalVars.marketplacePriceRangeSet = false;
        this.globalVars.marketplaceStatus = "all"
        this.globalVars.marketplaceNFTCategory = "all"
        this.globalVars.marketplaceStatus = "all"
        this.globalVars.marketplaceMarketType = "all"
        this.globalVars.marketplaceSortType = "most recent first"
        // This is important others are set to default
        this.globalVars.marketplaceContentFormat = "images"
        break;
      case "video":
        this.globalVars.desoMarketplace = true;
        this.globalVars.marketplaceVerifiedCreators = "verified";
        this.globalVars.marketplaceLowPriceNanos = 0;
        this.globalVars.marketplaceHighPriceNanos = 0;
        this.globalVars.marketplaceLowPriceUSD = 0;
        this.globalVars.marketplaceHighPriceUSD = 0;
        this.globalVars.marketplacePriceRangeSet = false;
        this.globalVars.marketplaceStatus = "all"
        this.globalVars.marketplaceNFTCategory = "all"
        this.globalVars.marketplaceStatus = "all"
        this.globalVars.marketplaceMarketType = "all"
        this.globalVars.marketplaceSortType = "most recent first"
        // This is important others are set to default
        this.globalVars.marketplaceContentFormat = "video"
        break;
      case "formatmusic":
        this.globalVars.desoMarketplace = true;
        this.globalVars.marketplaceVerifiedCreators = "verified";
        this.globalVars.marketplaceLowPriceNanos = 0;
        this.globalVars.marketplaceHighPriceNanos = 0;
        this.globalVars.marketplaceLowPriceUSD = 0;
        this.globalVars.marketplaceHighPriceUSD = 0;
        this.globalVars.marketplacePriceRangeSet = false;
        this.globalVars.marketplaceStatus = "all"
        this.globalVars.marketplaceNFTCategory = "all"
        this.globalVars.marketplaceStatus = "all"
        this.globalVars.marketplaceMarketType = "all"
        this.globalVars.marketplaceSortType = "most recent first"
        // This is important others are set to default
        this.globalVars.marketplaceContentFormat = "music"
        break;
      case "model":
        this.globalVars.desoMarketplace = true;
        this.globalVars.marketplaceVerifiedCreators = "verified";
        this.globalVars.marketplaceLowPriceNanos = 0;
        this.globalVars.marketplaceHighPriceNanos = 0;
        this.globalVars.marketplaceLowPriceUSD = 0;
        this.globalVars.marketplaceHighPriceUSD = 0;
        this.globalVars.marketplacePriceRangeSet = false;
        this.globalVars.marketplaceStatus = "all"
        this.globalVars.marketplaceNFTCategory = "all"
        this.globalVars.marketplaceStatus = "all"
        this.globalVars.marketplaceMarketType = "all"
        this.globalVars.marketplaceSortType = "most recent first"
        // This is important others are set to default
        this.globalVars.marketplaceContentFormat = "3d"
        break;
      default: 
      break;
    }
    // Navigate to marketplace after setting what to search by
    this.router.navigate(["/" + this.globalVars.RouteNames.TRENDS])
  }
  _loadVerifiedUsers() {
    // Dont load if we have the content
    if (this.discoveryUserArray) {
      return;
    }
    this.usersLoading = true;
    this.backendApi
      .AdminGetVerifiedUsers(this.globalVars.localNode, "BC1YLiiQ36NSLSK2bpLqi4PsP85mzBaKRTLxBAoTdNELohuRdrSMX9w")
      .subscribe(
        (res) => {
          var arrayHolder = res.VerifiedUsers.sort(() => Math.random() - 0.5);
          this.discoveryUserArray = arrayHolder.slice(0, 8);

          // Some of the users might have deleted their profiles
          // So if fetch in creatorCard fails, we can try again with an additional profile
          this.discoveryExtraUserArray = arrayHolder.slice(8, 10);
          setTimeout(() => {
            this.usersLoading = false;
          }, 300);
        },
        (err) => {
          console.log(err);
          this.usersLoading = false;
        }
      );
  }
  scrollTo(id: string) {
    document.getElementById(id).scrollIntoView({ behavior: "smooth", block: "start" });
  }
  getFreshDrops() {
    // dont get if we have the data
    if (this.discoveryDataToShow2) {
      return;
    }
    this.postsLoading2 = true;
    this.backendApi
      .GetFreshDrops(
        this.globalVars.localNode,
        this.globalVars?.loggedInUser?.PublicKeyBase58Check,
        "BC1YLiiQ36NSLSK2bpLqi4PsP85mzBaKRTLxBAoTdNELohuRdrSMX9w"
      )
      .subscribe((res) => {
        this.discoveryDataToShow2 = res["PostEntryResponse"].slice(0, 8);
        setTimeout(() => {
          this.postsLoading2 = false;
        }, 300);
      });
  }
  appendCommentAfterParentPost(postEntryResponse) {
    console.log("nice");
  }
}
