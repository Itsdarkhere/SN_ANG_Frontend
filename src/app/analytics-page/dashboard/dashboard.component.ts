import { Component, OnInit } from "@angular/core";
import { Console } from "console";
import { BackendApiService } from "src/app/backend-api.service";
import { GlobalVarsService } from "src/app/global-vars.service";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  marketCapArray: [];
  salesCapArray: [];
  uniqueCreatorsArray: [];
  uniqueCollectorsArray: [];
  constructor(private backendApi: BackendApiService, private globalVars: GlobalVarsService) {}

  ngOnInit(): void {
    this.getDesoNFTMarketCapGraph();
    this.getDesoNFTSalesCapGraph();
    this.getUniqueCollectors();
    this.getUniqueCreators();
  }

  getDesoNFTMarketCapGraph() {
    this.backendApi
      .GetDesoMarketCapGraph(this.globalVars.localNode, this.globalVars.loggedInUser.PublicKeyBase58Check)
      .subscribe(
        (res) => {
          this.marketCapArray = res.Response;
        },
        (err) => {
          console.log(err);
        }
      );
  }
  getDesoNFTSalesCapGraph() {
    this.backendApi
      .GetDesoSalesCapGraph(this.globalVars.localNode, this.globalVars.loggedInUser.PublicKeyBase58Check)
      .subscribe(
        (res) => {
          this.salesCapArray = res.Response;
        },
        (err) => {
          console.log(err);
        }
      );
  }
  getUniqueCollectors() {
    this.backendApi
      .GetUniqueCollectors(this.globalVars.localNode, this.globalVars.loggedInUser.PublicKeyBase58Check)
      .subscribe(
        (res) => {
          this.uniqueCollectorsArray = res.Response;
        },
        (err) => {
          console.log(err);
        }
      );
  }
  getUniqueCreators() {
    this.backendApi
      .GetUniqueCreators(this.globalVars.localNode, this.globalVars.loggedInUser.PublicKeyBase58Check)
      .subscribe(
        (res) => {
          this.uniqueCreatorsArray = res.Response;
        },
        (err) => {
          console.log(err);
        }
      );
  }
}
