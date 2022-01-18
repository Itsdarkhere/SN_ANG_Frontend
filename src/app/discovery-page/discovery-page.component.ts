import { Component, HostListener, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { NFTEntryResponse, PostEntryResponse } from "../backend-api.service";
import { BackendApiService } from "../backend-api.service";
import { GlobalVarsService } from "../global-vars.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-discovery-page",
  templateUrl: "./discovery-page.component.html",
  styleUrls: ["./discovery-page.component.scss"],
})
// GlobalVars are used to disable loading if user allready has stuff loaded
export class DiscoveryPageComponent implements OnInit {
  mobile = false;
  postsLoading = false;
  fakeArray = [1, 2, 3, 4, 5, 6, 7, 8];
  constructor(private backendApi: BackendApiService, public globalVars: GlobalVarsService, public router: Router) {}

  ngOnInit(): void {
    this.setMobileBasedOnViewport();
    if (
      !this.globalVars.discoveryUserArray &&
      !this.globalVars.discoveryDataToShow &&
      !this.globalVars.discoveryDataToShow2
    ) {
      this.getCommunityFavourites();
      this.getFreshDrops();
      this._loadVerifiedUsers();
    }
  }
  setMobileBasedOnViewport() {
    this.mobile = this.globalVars.isMobile();
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
        this.globalVars.loggedInUser?.PublicKeyBase58Check,
        this.globalVars.loggedInUser?.PublicKeyBase58Check
      )
      .subscribe((res) => {
        this.globalVars.discoveryMainNftResponse = res["PostEntryResponse"][0];
        this.globalVars.discoveryDataToShow = res["PostEntryResponse"].slice(1, 9);
        setTimeout(() => {
          this.postsLoading = false;
        }, 300);
      });
  }
  routeViewAll(category) {
    this.router.navigate([this.globalVars.RouteNames.NFT_PAGE], {
      queryParams: {
        category: category,
      },
      queryParamsHandling: "merge",
    });
  }
  /*loadTest() {
    this.backendApi
      .GetPostsForPublicKey(
        this.globalVars.localNode,
        "",
        "juvonen",
        this.globalVars.loggedInUser?.PublicKeyBase58Check,
        "",
        10000,
        false
      )
      .toPromise()
      .then((res) => {
        this.mainNftResponse = res["Posts"][3];
      });
  }*/
  _loadVerifiedUsers() {
    this.backendApi
      .AdminGetVerifiedUsers(this.globalVars.localNode, this.globalVars.loggedInUser.PublicKeyBase58Check)
      .subscribe(
        (res) => {
          var arrayHolder = res.VerifiedUsers.sort(() => Math.random() - 0.5);
          this.globalVars.discoveryUserArray = arrayHolder.slice(0, 8);
          // Some of the users might have deleted their profiles
          // So if fetch in creatorCard fails, we can try again with an additional profile
          this.globalVars.discoveryExtraUserArray = arrayHolder.slice(8, 10);
        },
        (err) => {
          console.log(err);
        }
      );
  }
  /*
  loadData() {
    this.backendApi
      .GetNFTsByCategory(this.globalVars.localNode, this.globalVars.loggedInUser?.PublicKeyBase58Check, "video", 0)
      .subscribe(
        (res: any) => {
          this.mainNftResponse = res["PostEntryResponse"][0];
        },
        (error) => {
          this.globalVars._alertError(error.error.error);
        }
      );
  }*/
  scrollTo(id: string) {
    document.getElementById(id).scrollIntoView({ behavior: "smooth", block: "start" });
  }
  getFreshDrops() {
    this.backendApi
      .GetFreshDrops(
        this.globalVars.localNode,
        this.globalVars.loggedInUser?.PublicKeyBase58Check,
        this.globalVars.loggedInUser?.PublicKeyBase58Check
      )
      .subscribe((res) => {
        this.globalVars.discoveryDataToShow2 = res["PostEntryResponse"].slice(0, 8);
      });
  }
  appendCommentAfterParentPost(postEntryResponse) {
    console.log("nice");
  }
}
