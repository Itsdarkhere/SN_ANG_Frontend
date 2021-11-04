import { Component, OnInit, Input } from "@angular/core";
import { AppRoutingModule } from "../app-routing.module";
import { CreatePostComponent } from "../create-post/create-post.component";
import { CreatePostUploadMintComponent } from "../create-post-upload-mint/create-post-upload-mint.component";
import { GlobalVarsService } from "../global-vars.service";
import { MatDialog } from "@angular/material/dialog";
import { MintYourNftComponent } from "../mint-your-nft/mint-your-nft.component";
import { CreateYourNftComponent } from "../create-your-nft/create-your-nft.component";
import { PlaceABidComponent } from "../place-a-bid/place-a-bid.component";
import { Router } from "@angular/router";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"],
})
export class HeaderComponent implements OnInit {
  @Input() imgSrc: string;

  isNotificationOpen: boolean = false;
  isSearchOpen: boolean = false;

  AppRoutingModule = AppRoutingModule;

  constructor(public globalVars: GlobalVarsService, public dialog: MatDialog, private router: Router) {}

  createPostUploadMint(): void {
    const dialogRef = this.dialog.open(CreatePostUploadMintComponent, {
      width: "620px",
      panelClass: "popup-modal",
    });
  }

  createPost(): void {
    const dialogRef = this.dialog.open(CreatePostComponent, {
      width: "480px",
      panelClass: "popup-modal",
    });
  }

  mintYourNFT(): void {
    const dialogRef = this.dialog.open(MintYourNftComponent, {
      width: "620px",
      panelClass: "popup-modal",
    });
  }

  createYourNFT(): void {
    const dialogRef = this.dialog.open(CreateYourNftComponent, {
      width: "620px",
      panelClass: "popup-modal",
    });
  }

  placeBid(): void {
    const dialogRef = this.dialog.open(PlaceABidComponent, {
      width: "600px",
      panelClass: "popup-modal",
    });
  }

  ngOnInit(): void {}

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
