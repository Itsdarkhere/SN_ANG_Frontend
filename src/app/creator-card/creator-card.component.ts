import { Component, Input, OnInit } from "@angular/core";
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
  @Input() publicKey: string;
  creatorProfile: ProfileEntryResponse;

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile() {
    this.backendApi.GetSingleProfile(this.globalVars.localNode, this.publicKey, "").subscribe(
      (res) => {
        this.creatorProfile = res.Profile;
      },
      (err) => {
        this.globalVars._alertError(err);
      }
    );
  }
}
