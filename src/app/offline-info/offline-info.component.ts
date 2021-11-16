import { Component, OnInit } from "@angular/core";
import { GlobalVarsService } from "../global-vars.service";
import { GoogleAnalyticsService } from "../google-analytics.service";

@Component({
  selector: "app-offline-info",
  templateUrl: "./offline-info.component.html",
  styleUrls: ["./offline-info.component.scss"],
})
export class OfflineInfoComponent implements OnInit {
  constructor(public globalVars: GlobalVarsService, private analyticsService: GoogleAnalyticsService) {}

  ngOnInit(): void {}

  SendLoginEvent() {
    this.analyticsService.eventEmitter("login", "engagement", "conversion", "click", 10);
  }
  SendSignUpEvent() {
    this.analyticsService.eventEmitter("sign_up", "engagement", "conversion", "click", 10);
  }
  login() {
    this.globalVars.launchLoginFlow();
    this.SendLoginEvent();
  }
  signUp() {
    this.globalVars.launchSignupFlow();
    this.SendSignUpEvent();
  }
}
