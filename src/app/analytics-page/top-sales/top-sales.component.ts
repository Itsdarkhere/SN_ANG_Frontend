import { Component, OnInit } from "@angular/core";
import { BackendApiService, PostEntryResponse } from "src/app/backend-api.service";
import { GlobalVarsService } from "src/app/global-vars.service";

@Component({
  selector: "app-top-sales",
  templateUrl: "./top-sales.component.html",
  styleUrls: ["./top-sales.component.scss"],
})
export class TopSalesComponent implements OnInit {
  topSalesPosts: PostEntryResponse[];
  constructor(private globalVars: GlobalVarsService, private backendApi: BackendApiService) {}

  ngOnInit(): void {
    this.getCommunityFavourites();
  }

  getCommunityFavourites() {
    this.backendApi
      .GetCommunityFavourite(
        this.globalVars.localNode,
        this.globalVars?.loggedInUser?.PublicKeyBase58Check,
        "BC1YLiiQ36NSLSK2bpLqi4PsP85mzBaKRTLxBAoTdNELohuRdrSMX9w"
      )
      .subscribe((res) => {
        // For big image
        this.topSalesPosts = res["PostEntryResponse"];
      });
  }
}
