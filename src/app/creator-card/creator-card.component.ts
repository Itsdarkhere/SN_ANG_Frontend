import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import { ProfileEntryResponse } from "../backend-api.service";
import { GlobalVarsService } from "../global-vars.service";
import { BackendApiService } from "../backend-api.service";
import { throwMatDialogContentAlreadyAttachedError } from "@angular/material/dialog";
import { Console } from "console";

@Component({
  selector: "app-creator-card",
  templateUrl: "./creator-card.component.html",
  styleUrls: ["./creator-card.component.scss"],
})
export class CreatorCardComponent implements OnInit {
  constructor(public globalVars: GlobalVarsService, public backendApi: BackendApiService) {}
  @Input() username: string;
  @Input() extraUserNames: string[];
  @Input() ImageURLs: string[];
  @Input() sizeSmall: boolean;
  failedFetchStep = 0;
  creatorProfile: ProfileEntryResponse;
  profileDeleted = false;

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.username) {
      this.loadProfile(this.username);
    }
  }
  mapImageURLs(imgURL: string): string {
    if (imgURL.startsWith("https://i.imgur.com")) {
      return imgURL.replace("https://i.imgur.com", "https://images.bitclout.com/i.imgur.com");
    } else if (imgURL.startsWith("https://arweave.net/")) {
      // Build cloudflare imageString
      imgURL = "https://supernovas.app/cdn-cgi/image/width=300,height=300,fit=scale-down,quality=80/" + imgURL;
    }
    return imgURL;
  }
  loadProfile(username) {
    this.backendApi.GetSingleProfile(this.globalVars.localNode, "", username).subscribe(
      (res) => {
        this.creatorProfile = res.Profile;
      },
      (error) => {
        if (this.failedFetchStep < 2) {
          this.loadProfile(this.extraUserNames[this.failedFetchStep]);
          this.failedFetchStep++;
        } else {
          this.profileDeleted = true;
        }
      }
    );
  }
}
