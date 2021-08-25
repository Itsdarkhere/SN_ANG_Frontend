import { Component, OnInit, Input } from '@angular/core';
import { AppRoutingModule } from '../app-routing.module';
import { CreatePostComponent } from '../create-post/create-post.component';
import { GlobalVarsService } from '../global-vars.service';
import { MatDialog } from '@angular/material/dialog';
import { MintYourNftComponent } from '../mint-your-nft/mint-your-nft.component';
import { CreateYourNftComponent } from '../create-your-nft/create-your-nft.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

  @Input() imgSrc: string;


  isNotificationOpen: boolean = false;
  isSearchOpen: boolean = false;

  AppRoutingModule = AppRoutingModule;

  constructor(public globalVars: GlobalVarsService, public dialog: MatDialog) { }

  createPost(): void {
    const dialogRef = this.dialog.open(CreatePostComponent, {
      width: '420px',
    });
  }

  mintYourNFT(): void {
    const dialogRef = this.dialog.open(MintYourNftComponent, {
      width: '500px',
    });
  }

  createYourNFT(): void {
    const dialogRef = this.dialog.open(CreateYourNftComponent, {
      width: '500px',
    });
  }

  ngOnInit(): void {
  }

  showNotification() {
    this.isNotificationOpen = !this.isNotificationOpen;
  }

  showSearchBar() {
    this.isSearchOpen = !this.isSearchOpen;
  }


  homeLink(): string {
    if (this.globalVars.showLandingPage()) {
      return "/" + this.globalVars.RouteNames.LANDING;
    } else {
      return "/" + this.globalVars.RouteNames.BROWSE;
    }
  }

}