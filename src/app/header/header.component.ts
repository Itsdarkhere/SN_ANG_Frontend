import { Component, OnInit,Input } from '@angular/core';
import { AppRoutingModule } from '../app-routing.module';
import { GlobalVarsService } from '../global-vars.service';

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

  constructor(public globalVars: GlobalVarsService) {}

  ngOnInit(): void {
  }

  showNotification(){
    this.isNotificationOpen = !this.isNotificationOpen;
  }

  showSearchBar(){
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
