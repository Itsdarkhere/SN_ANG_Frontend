import { animate, query, stagger, style, transition, trigger } from "@angular/animations";
import { Component, Input, OnInit } from "@angular/core";
import { BackendApiService, PostEntryResponse } from "src/app/backend-api.service";
import { GlobalVarsService } from "src/app/global-vars.service";

@Component({
  selector: "app-top-sales",
  templateUrl: "./top-sales.component.html",
  styleUrls: ["./top-sales.component.scss"],
  animations: [
    trigger("listAnimation", [
      transition("* => *", [
        // each time the binding value changes
        query(":enter", [style({ opacity: 0 }), stagger(100, [animate("0.3s", style({ opacity: 1 }))])]),
      ]),
    ]),
  ],
})
export class TopSalesComponent implements OnInit {
  @Input() posts: PostEntryResponse[];
  orderList = ["st", "nd", "rd", "th", "th", "th", "th", "th", "th", "th"];
  constructor(private globalVars: GlobalVarsService, private backendApi: BackendApiService) {}

  ngOnInit(): void {}
}
