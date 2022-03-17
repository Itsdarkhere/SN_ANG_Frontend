import { Component, Input, OnInit } from "@angular/core";
import { BackendApiService, PostEntryResponse } from "src/app/backend-api.service";
import { GlobalVarsService } from "src/app/global-vars.service";

@Component({
  selector: "app-top-sales",
  templateUrl: "./top-sales.component.html",
  styleUrls: ["./top-sales.component.scss"],
})
export class TopSalesComponent implements OnInit {
  @Input() posts: PostEntryResponse[];
  constructor(private globalVars: GlobalVarsService, private backendApi: BackendApiService) {}

  ngOnInit(): void {}
}
