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
  activeTab = "one";
  mobile = false;
  dataToShow: { NFTEntryResponses: NFTEntryResponse[]; PostEntryResponse: PostEntryResponse }[];
  nftResponse: any[];
  constructor(private backendApi: BackendApiService, public globalVars: GlobalVarsService) {}

  ngOnInit(): void {
    this.getNFTs();
    this.setMobileBasedOnViewport();
  }
  setMobileBasedOnViewport() {
    this.mobile = this.globalVars.isMobile();
  }

  @HostListener("window:resize")
  onResize() {
    this.setMobileBasedOnViewport();
  }
  _handleTabClick(event) {
    this.activeTab = event.target.value;
  }
  getNFTs(isForSale: boolean | null = null): Subscription {
    return this.backendApi
      .GetNFTsForUser(
        this.globalVars.localNode,
        "BC1YLfgucuJF6n288pZNhfkTeXsFiWNEgfDoK6jw97jkdoGcKtEUDTW",
        this.globalVars.loggedInUser?.PublicKeyBase58Check
      )
      .subscribe(
        (res: {
          NFTsMap: { [k: string]: { PostEntryResponse: PostEntryResponse; NFTEntryResponses: NFTEntryResponse[] } };
        }) => {
          this.nftResponse = [];
          for (const k in res.NFTsMap) {
            const responseElement = res.NFTsMap[k];
            if (!responseElement.NFTEntryResponses[0].IsPending) {
              this.nftResponse.push(responseElement);
            }
          }
          this.dataToShow = this.nftResponse.slice(0, 8);
          console.log(this.dataToShow);
        }
      );
  }
  appendCommentAfterParentPost(postEntryResponse) {
    console.log("nice");
  }
}
