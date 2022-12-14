import { Component, HostListener, Input, OnInit } from "@angular/core";
import { GlobalVarsService } from "../global-vars.service";

@Component({
  selector: "app-page-small-nav-new",
  templateUrl: "./page-small-nav-new.component.html",
  styleUrls: ["./page-small-nav-new.component.scss"],
})
export class PageSmallNavNewComponent implements OnInit {
  @Input() isNFTProfile: boolean;
  @Input() noBottomBar: boolean;
  mobile = false;
  constructor(public globalVars: GlobalVarsService) {}

  ngOnInit() {
    this.setMobileBasedOnViewport();
  }

  setMobileBasedOnViewport() {
    this.mobile = this.globalVars.isMobile();
  }
  @HostListener("window:resize") onResize() {
    this.setMobileBasedOnViewport();
  }
}
