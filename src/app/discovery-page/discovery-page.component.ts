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
export class DiscoveryPageComponent implements OnInit {
  mobile = false;
  dataToShow: { NFTEntryResponses: NFTEntryResponse[]; PostEntryResponse: PostEntryResponse }[];
  dataToShow2: { NFTEntryResponses: NFTEntryResponse[]; PostEntryResponse: PostEntryResponse }[];
  mainNftResponse: PostEntryResponse;
  postsLoading = false;
  fakeArray = [1, 2, 3, 4, 5, 6, 7, 8];
  constructor(private backendApi: BackendApiService, public globalVars: GlobalVarsService, public router: Router) {}

  ngOnInit(): void {
    this.getCommunityFavourites();
    this.getFreshDrops();
    this.setMobileBasedOnViewport();
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
        console.log(res);
        this.mainNftResponse = res["PostEntryResponse"][1];
        this.dataToShow = res["PostEntryResponse"].slice(1, 9);
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
        this.dataToShow2 = res["PostEntryResponse"].slice(0, 8);
      });
  }
  appendCommentAfterParentPost(postEntryResponse) {
    console.log("nice");
  }
}
