import { Component, Input, OnInit } from "@angular/core";
import { GlobalVarsService } from "../global-vars.service";
import { AppRoutingModule } from '../app-routing.module';
import { CreatePostComponent } from "../create-post/create-post.component";
import { CreateYourNftComponent } from "../create-your-nft/create-your-nft.component";
import { MintYourNftComponent } from "../mint-your-nft/mint-your-nft.component";
import { MatDialog } from "@angular/material/dialog";

@Component({
  selector: "bottom-bar-mobile",
  templateUrl: "./bottom-bar-mobile.component.html",
  styleUrls: ["./bottom-bar-mobile.component.scss"],
})
export class BottomBarMobileComponent {
  @Input() showPostButton = false;
  
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
}
