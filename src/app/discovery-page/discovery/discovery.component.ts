import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { PostEntryResponse } from "src/app/backend-api.service";
import { GlobalVarsService } from "src/app/global-vars.service";

@Component({
  selector: "app-discovery",
  templateUrl: "./discovery.component.html",
  styleUrls: ["./discovery.component.scss"],
})
export class DiscoveryComponent implements OnInit {
  @Input() post: PostEntryResponse;
  hasImageLoaded = false;
  constructor(
    //private route: DiscoveryRoute,
    private router: Router,
    public globalVars: GlobalVarsService
  ) {}
  imageLoaded() {
    this.hasImageLoaded = true;
  }
  ngOnInit(): void {}
}
