import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-activity-left-bar",
  templateUrl: "./activity-left-bar.component.html",
  styleUrls: ["./activity-left-bar.component.scss"],
})
export class ActivityLeftBarComponent implements OnInit {
  // Creators
  creatorsVerified = true;
  creatorsAll = false;
  // Events
  eventsAll = true;
  eventsMints = false;
  eventsBids = false;
  eventsSales = false;
  eventsListings = false;

  constructor() {}

  ngOnInit(): void {}
}
