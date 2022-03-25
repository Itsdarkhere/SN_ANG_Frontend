import { Component, Input, OnInit } from "@angular/core";
import { BackendApiService, CollectionResponse, ProfileEntryResponse } from "src/app/backend-api.service";
import { GlobalVarsService } from "src/app/global-vars.service";
import { Router } from "@angular/router";
@Component({
  selector: "app-creator-profile-collections",
  templateUrl: "./creator-profile-collections.component.html",
  styleUrls: ["./creator-profile-collections.component.scss"],
})
export class CreatorProfileCollectionsComponent implements OnInit {
  @Input() username: string;
  @Input() profile: ProfileEntryResponse;
  @Input() collectionResponses: CollectionResponse[];

  loadingCollections: boolean;
  constructor(public globalVars: GlobalVarsService, private backendApi: BackendApiService, private router: Router) {}

  ngOnInit(): void {
    this.getAllUserCollections();
  }

  mapArweaveURLs(imgURL: string, w: number, h: number): string {
    if (imgURL.startsWith("https://arweave.net/")) {
      // Build cloudflare imageString
      imgURL =
        "https://supernovas.app/cdn-cgi/image/width=" + w + ",height=" + h + ",fit=scale-down,quality=85/" + imgURL;
    }
    return imgURL;
  }

  getAllUserCollections() {
    if (this.loadingCollections) {
      return;
    }
    this.loadingCollections = true;
    this.backendApi.GetAllUserCollections(this.globalVars.localNode, this.username.toLowerCase()).subscribe(
      (res) => {
        this.collectionResponses = res;
        this.loadingCollections = false;
      },
      (err) => {
        console.log(err);
        this.loadingCollections = false;
      }
    );
  }

  profileBelongsToLoggedInUser(): boolean {
    return (
      this.globalVars.loggedInUser?.ProfileEntryResponse &&
      this.globalVars.loggedInUser.ProfileEntryResponse.PublicKeyBase58Check === this.profile.PublicKeyBase58Check
    );
  }
  routeToCollection(collection: CollectionResponse) {
    this.router.navigate(["collection/" + collection.CollectionCreatorName + "/" + collection.Collection]);
  }
}
