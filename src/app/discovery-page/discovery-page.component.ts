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
  @ViewChild("sliderRef1") sliderRef1: ElementRef<HTMLElement>
  @ViewChild("sliderRef2") sliderRef2: ElementRef<HTMLElement>
  @ViewChild("sliderRef3") sliderRef3: ElementRef<HTMLElement>
  @ViewChild("sliderRef4") sliderRef4: ElementRef<HTMLElement>
  @ViewChild("sliderRef5") sliderRef5: ElementRef<HTMLElement>

  slider1: KeenSliderInstance = null
  slider2: KeenSliderInstance = null
  slider3: KeenSliderInstance = null
  slider4: KeenSliderInstance = null
  slider5: KeenSliderInstance = null

  discoveryDataToShow: { NFTEntryResponses: NFTEntryResponse[]; PostEntryResponse: PostEntryResponse }[];
  discoveryDataToShow2: { NFTEntryResponses: NFTEntryResponse[]; PostEntryResponse: PostEntryResponse }[];
  discoveryMainNftResponse: PostEntryResponse;
  discoveryUserArray: string[];
  discoveryExtraUserArray: string[];

  mobile = false;
  postsLoading = false;
  posts2Loading = false;
  usersLoading = false;
  fakeArray = [1, 2, 3, 4, 5, 6, 7, 8];
  constructor(private backendApi: BackendApiService, private mixPanel: MixpanelService, public globalVars: GlobalVarsService, public router: Router) {}

  ngOnInit(): void {
    this.setMobileBasedOnViewport();
    // We could use this to not load again coming from nfts-page but It still seems to have some issues
    // So for now we load everytime
    /*if (
      !this.globalVars.discoveryUserArray &&
      !this.globalVars.discoveryDataToShow &&
      !this.globalVars.discoveryDataToShow2
    ) {
      this.getCommunityFavourites();
      this.getFreshDrops();
      this._loadVerifiedUsers();
    }*/
    this.getCommunityFavourites();
    this.getFreshDrops();
    this._loadVerifiedUsers();

    this.mixPanel.track44("Discovery viewed");
  }
  setMobileBasedOnViewport() {
    this.mobile = this.globalVars.isMobile();
  }
  ngAfterViewInit() {
    if (this.mobile) {
      this.slider1 = new KeenSlider(this.sliderRef1.nativeElement, {
        loop: false,
        mode: "free-snap",
        slides: { perView: "auto", spacing: 20  },
      })
      this.slider3 = new KeenSlider(this.sliderRef3.nativeElement, {
        loop: false,
        mode: "free-snap",
        slides: { perView: "auto", spacing: 20  },
      })
      this.slider4 = new KeenSlider(this.sliderRef4.nativeElement, {
        loop: true,
        mode: "free-snap",
        slides: { perView: "auto", spacing: 10  },
      })
    } 
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
    if (this.mobile) {
      if (this.slider1) this.slider1.destroy();
      if (this.slider3) this.slider3.destroy();
      if (this.slider4) this.slider4.destroy();
    }
    if (this.slider2) this.slider2.destroy();
    if (this.slider5) this.slider5.destroy();
  }
  @HostListener("window:resize")
  onResize() {
    this.setMobileBasedOnViewport();
  }
  getCommunityFavourites() {
    this.postsLoading = true;
    this.backendApi
      .GetCommunityFavourite(
        this.globalVars.localNode,
        this.globalVars?.loggedInUser?.PublicKeyBase58Check,
        "BC1YLiiQ36NSLSK2bpLqi4PsP85mzBaKRTLxBAoTdNELohuRdrSMX9w",
      )
      .subscribe((res) => {
        // For big image
        this.discoveryMainNftResponse = res["PostEntryResponse"][0];
        this.discoveryDataToShow = res["PostEntryResponse"].slice(1, 9);
        setTimeout(() => {
          this.postsLoading = false;
        }, 300);
      });
  }
  routeViewAll(category: string) {
    this.router.navigate([this.globalVars.RouteNames.NFT_PAGE], {
      queryParams: {
        category: category,
      },
      queryParamsHandling: "merge",
    });
  }
  _loadVerifiedUsers() {
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
    this.posts2Loading = true;
    this.backendApi
      .GetFreshDrops(
        this.globalVars.localNode,
        this.globalVars?.loggedInUser?.PublicKeyBase58Check,
        "BC1YLiiQ36NSLSK2bpLqi4PsP85mzBaKRTLxBAoTdNELohuRdrSMX9w"
      )
      .subscribe((res) => {
        this.discoveryDataToShow2 = res["PostEntryResponse"].slice(0, 8);
        setTimeout(() => {
          this.posts2Loading = false;
        }, 300);
      });
  }
  appendCommentAfterParentPost(postEntryResponse) {
    console.log("nice");
  }
}
