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
export class BottomBarMobileComponent implements OnInit {
  @Input() showPostButton = false;
  lastScrollTop = 0;
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
  ngOnInit() {
    if(document.querySelector('.global__bottom-bar-mobile')){
      document.querySelector('.global__bottom-bar-mobile').classList.add('scrolled');
    }    
    let handle = null;
    document.onscroll = () => {
      var st = window.pageYOffset || document.documentElement.scrollTop;
      if (st > this.lastScrollTop) {
        // scroll down
        if (document.querySelector('.global__bottom-bar-mobile') && document.querySelector('.global__bottom-bar-mobile').classList.contains('scrolled')) {
          document.querySelector('.global__bottom-bar-mobile').classList.remove('scrolled');
        }
      } else {
        // scroll up
        if (document.querySelector('.global__bottom-bar-mobile') && !document.querySelector('.global__bottom-bar-mobile').classList.contains('scrolled')) {
          document.querySelector('.global__bottom-bar-mobile').classList.add('scrolled');
        }
      }
      this.lastScrollTop = st <= 0 ? 0 : st;
      if (handle) {
        clearTimeout(handle);
      }
      handle = setTimeout(()=>{ // callback when user stops scroll
        if(document.querySelector('.global__bottom-bar-mobile')){
          document.querySelector('.global__bottom-bar-mobile').classList.add('scrolled');
        }
      }, 200); // default 200 ms
    }
  }
}
