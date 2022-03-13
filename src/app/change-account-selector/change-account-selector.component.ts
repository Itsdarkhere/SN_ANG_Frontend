import { Component, ElementRef, ViewChild, OnDestroy } from "@angular/core";
import { GlobalVarsService } from "../global-vars.service";
import { BackendApiService } from "../backend-api.service";
import { Router } from "@angular/router";
import { IdentityService } from "../identity.service";
import { filter, get } from "lodash";
import { animate, style, transition, trigger } from "@angular/animations";
import { ChangeDetectorRef } from "@angular/core";
import { AppRoutingModule } from "../app-routing.module";
import { RouteNames } from "../app-routing.module";

@Component({
  selector: "change-account-selector",
  templateUrl: "./change-account-selector.component.html",
  styleUrls: ["./change-account-selector.component.scss"],
  animations: [
    trigger("casSwipeAnimation", [
      transition("void => prev", [
        style({ transform: "translateX(-100%)", opacity: "0" }),
        animate("500ms ease", style({ transform: "translateX(0%)", opacity: "1" })),
      ]),

      transition("prev => void", [
        style({ transform: "translateX(0%)", opacity: "1" }),
        animate("500ms ease", style({ transform: "translateX(100%)", opacity: "0" })),
      ]),
      transition("void => next", [
        style({ transform: "translateX(100%)", opacity: "0" }),
        animate("500ms ease", style({ transform: "translateX(0%)", opacity: "1" })),
      ]),
      transition("next => void", [
        style({ transform: "translateX(0%)", opacity: "1" }),
        animate("500ms ease", style({ transform: "translateX(-100%)", opacity: "0" })),
      ]),
    ]),
  ],
})
export class ChangeAccountSelectorComponent implements OnDestroy {
  @ViewChild("changeAccountSelectorRoot", { static: true }) accountSelectorRoot: ElementRef;
  selectorOpen: boolean;
  hoverRow: number;
  animationType: string;
  pageOne = true;

  RouteNames = RouteNames;

  interval: any;
  intervalClosed = true;

  AppRoutingModule = AppRoutingModule;

  constructor(
    public globalVars: GlobalVarsService,
    private backendApi: BackendApiService,
    private identityService: IdentityService,
    private router: Router,
    private changeRef: ChangeDetectorRef
  ) {
    this.selectorOpen = false;
  }

  launchLogoutFlow() {
    const publicKey = this.globalVars.loggedInUser.PublicKeyBase58Check;
    this.identityService.launch("/logout", { publicKey }).subscribe((res) => {
      this.globalVars.userList = filter(this.globalVars.userList, (user) => {
        return res?.users && user?.PublicKeyBase58Check in res?.users;
      });
      if (!res?.users) {
        this.globalVars.userList = [];
      }
      let loggedInUser = get(Object.keys(res?.users), "[0]");
      if (this.globalVars.userList.length === 0) {
        loggedInUser = null;
        this.globalVars.setLoggedInUser(null);
      }
      this.backendApi.setIdentityServiceUsers(res.users, loggedInUser);
      this.globalVars.updateEverything().add(() => {
        if (!this.globalVars.userInTutorial(this.globalVars.loggedInUser)) {
          this.router.navigate(["/" + this.globalVars.RouteNames.BROWSE]);
        }
      });
    });
    if (this.globalVars.isOnboardingComplete === false) {
      this.router.navigate(["/" + this.globalVars.RouteNames.BROWSE]);
    }
  }

  _switchToUser(user) {
    this.globalVars.setLoggedInUser(user);
    this.globalVars.messageResponse = null;

    // Now we call update everything on the newly logged in user to make sure we have the latest info this user.
    this.globalVars.updateEverything().add(() => {
      if (!this.globalVars.userInTutorial(this.globalVars.loggedInUser)) {
        const currentUrl = this.router.url;
        this.router.navigate(["/" + this.globalVars.RouteNames.BROWSE]).then(() => {
          this.router.navigateByUrl(currentUrl);
        });
      }
      this.globalVars.closeLeftBarMobile();
    });
  }
  clickSwitchProfile(event) {
    event.stopPropagation();
    this.animationType = "next";
    this.changeRef.detectChanges();
    this.pageOne = false;
  }
  clickBack(event) {
    event.stopPropagation();
    this.animationType = "prev";
    this.changeRef.detectChanges();
    this.pageOne = true;
  }
  // Starts an interval to check when dropdown is closed / opened
  // And shows either the hamburger or X
  detectDropdownClose() {
    let el = document.querySelector("#dropdown");
    this.interval = setInterval(() => {
      if (!el.classList.contains("show")) {
        this.intervalClosed = true;
        clearInterval(this.interval);
      } else if (this.intervalClosed) {
        this.intervalClosed = false;
      }
    }, 50);
  }
  ngOnDestroy(): void {
    clearInterval(this.interval);
  }
  createProfile() {
    this.router.navigate(["/" + this.RouteNames.SIGNUP]);
  }
  hasProfile() {
    if (this.globalVars?.loggedInUser?.ProfileEntryResponse?.Username) {
      this.router.navigate(["/u/" + this.globalVars?.loggedInUser?.ProfileEntryResponse.Username]);
    } else {
      this.router.navigate(["/update-profile"]);
    }
  }
}
