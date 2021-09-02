import { Component, Input, OnInit } from "@angular/core";
import { GlobalVarsService } from "../global-vars.service";
import { AppRoutingModule } from '../app-routing.module';
import { CreatePostUploadMintComponent } from "../create-post-upload-mint/create-post-upload-mint.component";
import { CreateYourNftComponent } from "../create-your-nft/create-your-nft.component";
import { MintYourNftComponent } from "../mint-your-nft/mint-your-nft.component";
import { MatDialog } from "@angular/material/dialog";
import { PlaceABidComponent } from "../place-a-bid/place-a-bid.component";

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
    const dialogRef = this.dialog.open(CreatePostUploadMintComponent, {
      width: '620px',
      panelClass: 'popup-modal'
    });
  }

  mintYourNFT(): void {
    const dialogRef = this.dialog.open(MintYourNftComponent, {
      width: '500px',
      panelClass: 'popup-modal'
    });
  }

  createYourNFT(): void {
    const dialogRef = this.dialog.open(CreateYourNftComponent, {
      width: '500px',
      panelClass: 'popup-modal'
    });
  }

  placeBid(): void {
    const dialogRef = this.dialog.open(PlaceABidComponent, {
      width: '600px',
      panelClass: 'popup-modal'
    });
  }
}
