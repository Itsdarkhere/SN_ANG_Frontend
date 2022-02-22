import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-analytics-page",
  templateUrl: "./analytics-page.component.html",
  styleUrls: ["./analytics-page.component.scss"],
})
export class AnalyticsPageComponent implements OnInit {
  tabDashboard = false;
  tabActivity = true;
  constructor() {}

  ngOnInit(): void {}

  changeTab(dashBoard: boolean) {
    if (dashBoard) {
      this.tabDashboard = true;
      this.tabActivity = false;
    } else {
      this.tabActivity = true;
      this.tabDashboard = false;
    }
  }
}
