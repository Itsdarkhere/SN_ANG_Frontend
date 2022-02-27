import { Component, Input, OnInit } from "@angular/core";
import { PostEntryResponse } from "src/app/backend-api.service";
import { GlobalVarsService } from "src/app/global-vars.service";
import { ApplyService } from "../../apply.service";
import { InfiniteScroller } from "src/app/infinite-scroller";

@Component({
  selector: "app-collection-page-nft-view",
  templateUrl: "./collection-page-nft-view.component.html",
  styleUrls: ["./collection-page-nft-view.component.scss"],
})
export class CollectionPageNftViewComponent implements OnInit {
  lastPage: number;
  static PAGE_SIZE = 40;
  static WINDOW_VIEWPORT = true;
  static BUFFER_SIZE = 20;
  static PADDING = 0.5;
  @Input() collectionNFTs: PostEntryResponse[];
  viewTypeCard = true;

  infiniteScroller: InfiniteScroller = new InfiniteScroller(
    CollectionPageNftViewComponent.PAGE_SIZE,
    this.getPage.bind(this),
    CollectionPageNftViewComponent.WINDOW_VIEWPORT,
    CollectionPageNftViewComponent.BUFFER_SIZE,
    CollectionPageNftViewComponent.PADDING
  );

  constructor(public globalVars: GlobalVarsService, private applyService: ApplyService) {}

  ngOnInit(): void {}

  counter(i: number) {
    return new Array(i);
  }
  // Infinite scroll
  getPage(page: number) {
    if (this.lastPage != null && page > this.lastPage) {
      return [];
    }

    const startIdx = page * CollectionPageNftViewComponent.PAGE_SIZE;
    const endIdx = (page + 1) * CollectionPageNftViewComponent.PAGE_SIZE;

    return new Promise((resolve, reject) => {
      resolve(this.collectionNFTs.slice(startIdx, Math.min(endIdx, this.collectionNFTs.length)));
    });
  }
  onScrollNFTs() {
    this.applyService.onScroll();
  }
}
