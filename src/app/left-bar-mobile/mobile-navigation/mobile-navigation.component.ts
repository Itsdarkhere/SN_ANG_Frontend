import { Component, EventEmitter, OnInit, Output } from "@angular/core";
import { GlobalVarsService } from "src/app/global-vars.service";
import { AppRoutingModule } from "src/app/app-routing.module";
import { Router } from "@angular/router";
@Component({
  selector: "app-mobile-navigation",
  templateUrl: "./mobile-navigation.component.html",
  styleUrls: ["./mobile-navigation.component.scss"],
})
export class MobileNavigationComponent implements OnInit {
  @Output() closeMobile = new EventEmitter<boolean>();
  AppRoutingModule = AppRoutingModule;
  constructor(public globalVars: GlobalVarsService, private router: Router) {}

  ngOnInit(): void {}

  hasProfile() {
    //   close nav bar because it will open on mobile
    if (this.globalVars.isMobileIphone()) {
      this.globalVars.isLeftBarMobileOpen = false;
    }

    if (this.globalVars?.loggedInUser?.ProfileEntryResponse?.Username) {
      this.router.navigate(["/u/" + this.globalVars?.loggedInUser?.ProfileEntryResponse.Username]);
      this.globalVars.isLeftBarMobileOpen = false;
    } else {
      this.router.navigate(["/update-profile"]);
      this.globalVars.isLeftBarMobileOpen = false;
    }
  }
  closeMobileNav() {
    this.globalVars.isLeftBarMobileOpen = false;
  }
  routeToSupport() {
    window.open("https://intercom.help/supernovas/en", "_blank");
  }
}
