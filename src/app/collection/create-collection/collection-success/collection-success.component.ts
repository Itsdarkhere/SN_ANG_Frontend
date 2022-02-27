import { Component, OnInit } from "@angular/core";
import { GlobalVarsService } from "src/app/global-vars.service";

@Component({
  selector: "app-collection-success",
  templateUrl: "./collection-success.component.html",
  styleUrls: ["./collection-success.component.scss"],
})
export class CollectionSuccessComponent implements OnInit {
  constructor(public globalVars: GlobalVarsService) {}

  ngOnInit(): void {}
}
