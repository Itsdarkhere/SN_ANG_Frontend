import { Component, OnInit, Input, HostListener } from "@angular/core";
import { AppRoutingModule } from "../app-routing.module";
import { CreatePostComponent } from "../create-post/create-post.component";
import { GlobalVarsService } from "../global-vars.service";
import { MatDialog } from "@angular/material/dialog";
import { PlaceABidComponent } from "../place-a-bid/place-a-bid.component";
import { Router } from "@angular/router";
import { MixpanelService } from "../mixPanel.service";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit {
  @Input() imgSrc: string;

  mobile = false;
  isNotificationOpen: boolean = false;
  isSearchOpen: boolean = false;

  AppRoutingModule = AppRoutingModule;

  constructor(
    public globalVars: GlobalVarsService,
    public dialog: MatDialog,
    private router: Router,
    private mixPanel: MixpanelService
  ) {}

  createPost(): void {
    const dialogRef = this.dialog.open(CreatePostComponent, {
      width: "480px",
      panelClass: "popup-modal",
    });
  }
  placeBid(): void {
    const dialogRef = this.dialog.open(PlaceABidComponent, {
      width: "600px",
      panelClass: "popup-modal",
    });
  }
  setMobileBasedOnViewport() {
    this.mobile = this.globalVars.isMobile();
  }
  login() {
    this.router.navigate(["/" + this.globalVars.RouteNames.SIGNUP]);
    this.mixPanel.track2("Login clicked");
  }
  signUp() {
    this.router.navigate(["/" + this.globalVars.RouteNames.SIGNUP]);
    this.mixPanel.track("Sign-up clicked");
  }
  @HostListener("window:resize")
  onResize() {
    this.setMobileBasedOnViewport();
  }

  ngOnInit() {
    this.setMobileBasedOnViewport();
  }

  showNotification() {
    this.isNotificationOpen = !this.isNotificationOpen;
  }

  showSearchBar() {
    //debugger
    this.isSearchOpen = !this.isSearchOpen;
    // document.getElementById('mb-inp-searchbar').focus();
    //console.log(document.getElementById('mb-inp-searchbar'));
  }

  homeLink(): string {
    if (this.globalVars.showLandingPage()) {
      return "/" + this.globalVars.RouteNames.LANDING;
    } else {
      return "/" + this.globalVars.RouteNames.BROWSE;
    }
  }
  closeDropdown() {
    this.isNotificationOpen = false;
  }
  clickOutside() {
    this.isNotificationOpen = false;
  }
  hasProfile() {
    if (this.globalVars?.loggedInUser?.ProfileEntryResponse?.Username) {
      this.router.navigate(["/u/" + this.globalVars?.loggedInUser?.ProfileEntryResponse.Username]);
    } else {
      this.router.navigate(["/update-profile"]);
    }
  }
}
