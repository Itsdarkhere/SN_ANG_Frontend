import { Component, OnInit } from "@angular/core";
import { GlobalVarsService } from "../global-vars.service";
import { RouteNames } from "../app-routing.module";
import { Router } from "@angular/router";
import { MixpanelService } from "../mixpanel.service";

@Component({
  selector: "app-offline-info",
  templateUrl: "./offline-info.component.html",
  styleUrls: ["./offline-info.component.scss"],
})
export class OfflineInfoComponent implements OnInit {
  RouteNames = RouteNames;
  constructor(public globalVars: GlobalVarsService, private mixPanel: MixpanelService, private router: Router) {}

  ngOnInit(): void {}

  login() {
    this.router.navigate(["/" + this.RouteNames.SIGNUP]);
    this.mixPanel.track2("Login clicked");
  }
  signUp() {
    this.router.navigate(["/" + this.RouteNames.SIGNUP]);
    this.mixPanel.track("Sign-up clicked");
  }
}
