import { Component, Input, OnInit } from "@angular/core";
import { GlobalVarsService } from "src/app/global-vars.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-collection-success",
  templateUrl: "./collection-success.component.html",
  styleUrls: ["./collection-success.component.scss"],
})
export class CollectionSuccessComponent implements OnInit {
  @Input() collectionName: string;
  @Input() headingText: string;
  @Input() descriptionText: string;
  constructor(public globalVars: GlobalVarsService, private router: Router) {}

  ngOnInit(): void {}

  routeToCollection() {
    this.router.navigate([
      "/collection/" +
        this.globalVars.loggedInUser.ProfileEntryResponse.Username.toLowerCase() +
        "/" +
        this.collectionName,
    ]);
  }
}
