import { Component, OnInit } from "@angular/core";
import { GlobalVarsService } from "../global-vars.service";

@Component({
  selector: "app-offline-info",
  templateUrl: "./offline-info.component.html",
  styleUrls: ["./offline-info.component.scss"],
})
export class OfflineInfoComponent implements OnInit {
  constructor(public globalVars: GlobalVarsService) {}

  ngOnInit(): void {}
}
