import { Component, Input, OnInit } from "@angular/core";
import { GlobalVarsService } from "../global-vars.service";
import { BackendApiService } from "../backend-api.service";
import { Router } from "@angular/router";
import { map } from "rxjs/operators";

export class RightBarTabOption {
  name: string;
  width: number;
  poweredBy: {
    name: string;
    link: string;
  };
}

@Component({
  selector: "right-bar-creators",
  templateUrl: "./right-bar-creators.component.html",
  styleUrls: ["./right-bar-creators.component.sass"],
})
export class RightBarCreatorsComponent implements OnInit {
  @Input() inTutorial: boolean = false;
  @Input() smallerFont: boolean;
  followerCount: number;

  constructor(public globalVars: GlobalVarsService, private backendApi: BackendApiService, private router: Router) {}

  activeTab: string;
  selectedOptionWidth: string;
  activeRightTabOption: RightBarTabOption;

  RightBarCreatorsComponent = RightBarCreatorsComponent;
  static RightBarTabKey = "RightBarTab";

  static GAINERS: RightBarTabOption = {
    name: "Top Daily Gainers",
    width: 175,
    poweredBy: { name: "Bitclout Pulse", link: "https://desopulse.com" },
  };
  static DIAMONDS: RightBarTabOption = {
    name: "Top Daily Diamonded Creators",
    width: 275,
    poweredBy: { name: "Altumbase", link: "https://altumbase.com/tools" },
  };
  static COMMUNITY: RightBarTabOption = {
    name: "Top Community Projects",
    width: 225,
    poweredBy: { name: "BitHunt", link: "https://bithunt.com" },
  };

  static ALL_TIME: RightBarTabOption = {
    name: "Top Creators All Time",
    width: 210,
    poweredBy: null,
  };

  static chartMap = {
    [RightBarCreatorsComponent.GAINERS.name]: RightBarCreatorsComponent.GAINERS,
    [RightBarCreatorsComponent.DIAMONDS.name]: RightBarCreatorsComponent.DIAMONDS,
    [RightBarCreatorsComponent.COMMUNITY.name]: RightBarCreatorsComponent.COMMUNITY,
    [RightBarCreatorsComponent.ALL_TIME.name]: RightBarCreatorsComponent.ALL_TIME,
  };

  ngOnInit() {
    // const defaultTab = this.backendApi.GetStorage(RightBarCreatorsComponent.RightBarTabKey);
    // this.activeTab =
    //   defaultTab in RightBarCreatorsComponent.chartMap ? defaultTab : RightBarCreatorsComponent.COMMUNITY.name;
    // this.selectTab(true);
    this.refreshFollowers();
  }

  selectTab(skipStorage: boolean = false) {
    const rightTabOption = RightBarCreatorsComponent.chartMap[this.activeTab];
    this.activeRightTabOption = rightTabOption;
    this.selectedOptionWidth = rightTabOption.width + "px";
    if (!skipStorage) {
      this.backendApi.SetStorage(RightBarCreatorsComponent.RightBarTabKey, this.activeTab);
    }
  }
  refreshFollowers() {
    this.backendApi
      .GetFollows(
        this.globalVars.localNode,
        this.globalVars.loggedInUser?.ProfileEntryResponse?.Username,
        "" /* PublicKeyBase58Check */,
        true /* get followers */,
        "" /* GetEntriesFollowingUsername */,
        0 /* NumToFetch */
      )
      .subscribe(
        (res) => {
          this.followerCount = res.NumFollowers;
        },
        (err) => {
          console.log(err);
        }
      );
  }
}
