import { Component, HostListener, OnInit } from "@angular/core";
import { Subscription } from "rxjs";
import { NFTEntryResponse, PostEntryResponse } from "../backend-api.service";
import { BackendApiService } from "../backend-api.service";
import { GlobalVarsService } from "../global-vars.service";

@Component({
  selector: "app-discovery-page",
  templateUrl: "./discovery-page.component.html",
  styleUrls: ["./discovery-page.component.scss"],
})
export class DiscoveryPageComponent implements OnInit {
  mobile = false;
  dataToShow: { NFTEntryResponses: NFTEntryResponse[]; PostEntryResponse: PostEntryResponse }[];
  mainNftResponse: PostEntryResponse;
  postsLoading = false;
  fakeArray = [1, 2, 3, 4, 5, 6, 7, 8];
  constructor(private backendApi: BackendApiService, public globalVars: GlobalVarsService) {}

  ngOnInit(): void {
    this.getCommunityFavourites();
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
        this.mainNftResponse = res["PostEntryResponse"][0];
        this.dataToShow = res["PostEntryResponse"].slice(1, 9);
        setTimeout(() => {
          this.postsLoading = false;
          console.log(this.postsLoading);
        }, 300);
      });
  }
  appendCommentAfterParentPost(postEntryResponse) {
    console.log("nice");
  }
}
