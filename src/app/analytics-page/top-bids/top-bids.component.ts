import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { GlobalVarsService } from "src/app/global-vars.service";
import { BackendApiService } from "src/app/diamond-backend-api.service";

@Component({
  selector: "app-top-bids",
  templateUrl: "./top-bids.component.html",
  styleUrls: ["./top-bids.component.scss"],
})
export class TopBidsComponent implements OnChanges {
  @Input() bidDetails: any;
  creatorUsername: string;
  creatorPublicKey: string;
  postImage: string;
  postDescription: string;
  constructor(public globalVars: GlobalVarsService, private backendApi: BackendApiService) {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.bidDetails && this.bidDetails) {
      this.getBidderProfile();
    }
  }

  getBidderProfile() {
    this.backendApi
      .GetSinglePost(
        this.globalVars.localNode,
        this.bidDetails.PostHash /*PostHashHex*/,
        this.globalVars?.loggedInUser?.PublicKeyBase58Check /*ReaderPublicKeyBase58Check*/,
        false,
        0,
        0,
        this.globalVars.showAdminTools() /*AddGlobalFeedBool*/
      )
      .subscribe(
        (res) => {
          this.creatorUsername = res.PostFound?.ProfileEntryResponse?.Username;
          this.creatorPublicKey = res.PostFound?.PosterPublicKeyBase58Check;
          this.postImage = res.PostFound.ImageURLs;
          this.postDescription = res.PostFound.Description;
        },
        (err) => {
          console.log(err);
        }
      );
  }
}
