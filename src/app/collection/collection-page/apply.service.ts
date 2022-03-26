import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { GlobalVarsService } from "src/app/global-vars.service";
@Injectable({
  providedIn: "root",
})
export class ApplyService {
  // Base states
  marketType = "all";
  status = "all";
  orderByType = "most recent first";

  private sortSource = new BehaviorSubject({
    marketType: this.marketType,
    status: this.status,
    orderByType: this.orderByType,
    offset: this.globalVars.collectionOffset,
    loadMore: false,
  });
  currentSort = this.sortSource.asObservable();
  constructor(private globalVars: GlobalVarsService) {}

  applyPress(status: string, marketType: string) {
    // Set Vars
    this.status = status;
    this.marketType = marketType;
    // Offset back to 0
    this.globalVars.collectionOffset = 0;
    // Apply
    this.sortSource.next({
      marketType: this.marketType,
      status: this.status,
      orderByType: this.orderByType,
      offset: this.globalVars.collectionOffset,
      loadMore: false,
    });
  }
  orderByChange(orderByType: string) {
    if (this.orderByType != orderByType) {
      this.orderByType = orderByType;
      // Offset back to 0
      this.globalVars.collectionOffset = 0;
      // Apply
      this.sortSource.next({
        marketType: this.marketType,
        status: this.status,
        orderByType: this.orderByType,
        offset: this.globalVars.collectionOffset,
        loadMore: false,
      });
    }
  }
  onScroll() {
    // Apply
    if (this.globalVars.collectionNFTsLoading) {
      return;
    }
    this.globalVars.collectionOffset = this.globalVars.collectionOffset + 30;
    this.sortSource.next({
      marketType: this.marketType,
      status: this.status,
      orderByType: this.orderByType,
      offset: this.globalVars.collectionOffset,
      loadMore: true,
    });
  }
}
