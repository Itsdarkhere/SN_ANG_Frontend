import { Component, OnInit } from "@angular/core";
import { GlobalVarsService } from "../global-vars.service";

@Component({
  selector: "app-page-small-nav-new",
  templateUrl: "./page-small-nav-new.component.html",
  styleUrls: ["./page-small-nav-new.component.scss"],
})
export class PageSmallNavNewComponent implements OnInit {
  mobile = false;
  constructor(public globalVars: GlobalVarsService) {}

  ngOnInit() {
    this.setMobileBasedOnViewport();
  }

  setMobileBasedOnViewport() {
    this.mobile = this.globalVars.isMobile();
  }
  openMarketplaceMobileFiltering() {
    this.globalVars.isMarketplaceLeftBarMobileOpen = true;
  }
}
