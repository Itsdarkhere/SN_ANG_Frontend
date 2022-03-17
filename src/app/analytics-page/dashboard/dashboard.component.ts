import { Component, OnInit } from "@angular/core";
import { Console } from "console";
import { BackendApiService, PostEntryResponse } from "src/app/backend-api.service";
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

  // QUICK FACTS
  AvgCoinRoyalty: number;
  AvgCreatorRoyalty: number;
  TotalNFTsSold: number;
  AvgSalesPrice: number;
  // TOP NFT SALES
  topNFTSales: PostEntryResponse[];
  // Top earning / investing
  userListCreators: [];
  userListCollectors: [];
  // Top Bids today
  topBidsToday: [];

  constructor(private backendApi: BackendApiService, private globalVars: GlobalVarsService) {}

  ngOnInit(): void {
    this.getDesoNFTMarketCapGraph();
    this.getDesoNFTSalesCapGraph();
    this.getUniqueCollectors();
    this.getUniqueCreators();
    this.getTopBidsToday();
    this.getQuickFacts();
    this.getTopNFTSales();
  }

  getWhales() {
    this.getTopEarningCollectors();
    this.getTopEarningCreators();
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
  getTopNFTSales() {
    this.backendApi
      .GetTopNFTSales(this.globalVars.localNode, this.globalVars.loggedInUser.PublicKeyBase58Check)
      .subscribe(
        (res) => {
          this.topNFTSales = res.PostEntryResponse;
        },
        (err) => {
          console.log(err);
        }
      );
  }
  getTopBidsToday() {
    this.backendApi
      .GetTopBidsToday(this.globalVars.localNode, this.globalVars.loggedInUser.PublicKeyBase58Check)
      .subscribe(
        (res) => {
          this.topBidsToday = res.Response;
        },
        (err) => {
          console.log(err);
        }
      );
  }
  getTopEarningCollectors() {
    this.backendApi
      .GetTopEarningCollectors(this.globalVars.localNode, this.globalVars.loggedInUser.PublicKeyBase58Check)
      .subscribe(
        (res) => {
          this.userListCollectors = res.Response;
        },
        (err) => {
          console.log(err);
        }
      );
  }
  getTopEarningCreators() {
    this.backendApi
      .GetTopEarningCreators(this.globalVars.localNode, this.globalVars.loggedInUser.PublicKeyBase58Check)
      .subscribe(
        (res) => {
          console.log(res.Response);
          this.userListCreators = res.Response;
        },
        (err) => {
          console.log(err);
        }
      );
  }
  getQuickFacts() {
    this.backendApi
      .GetQuickFacts(this.globalVars.localNode, this.globalVars.loggedInUser.PublicKeyBase58Check)
      .subscribe(
        (res) => {
          this.AvgCoinRoyalty = res.AverageCoinRoyalty;
          this.AvgCreatorRoyalty = res.AverageCreatorRoyalty;
          this.AvgSalesPrice = res.AverageSalesPrice;
          this.TotalNFTsSold = res.TotalNFTsSold;
        },
        (err) => {
          console.log(err);
        }
      );
  }
}
