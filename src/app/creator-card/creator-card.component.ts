import { Component, Input, OnInit, SimpleChanges } from "@angular/core";
import { ProfileEntryResponse } from "../backend-api.service";
import { GlobalVarsService } from "../global-vars.service";
import { BackendApiService } from "../backend-api.service";

@Component({
  selector: "app-creator-card",
  templateUrl: "./creator-card.component.html",
  styleUrls: ["./creator-card.component.scss"],
})
export class CreatorCardComponent implements OnInit {
  constructor(public globalVars: GlobalVarsService, public backendApi: BackendApiService) {}
  @Input() username: string;
  @Input() extraUsernames: string[];
  failedFetchStep = 0;
  creatorProfile: ProfileEntryResponse;
  profileDeleted = false;

  ngOnInit(): void {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.username) {
      this.loadProfile(this.username);
    }
  }

  loadProfile(username) {
    this.backendApi.GetSingleProfile(this.globalVars.localNode, "", username).subscribe(
      (res) => {
        this.creatorProfile = res.Profile;
      },
      (err) => {
        if (this.failedFetchStep < 2) {
          this.loadProfile(this.extraUsernames[this.failedFetchStep]);
          this.failedFetchStep++;
        } else {
          this.profileDeleted = true;
        }
      }
    );
  }
}
