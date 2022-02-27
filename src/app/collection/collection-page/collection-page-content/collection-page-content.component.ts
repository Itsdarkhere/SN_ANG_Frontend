import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Title } from "@angular/platform-browser";
import { BackendApiService, PostEntryResponse } from "src/app/backend-api.service";
import { GlobalVarsService } from "src/app/global-vars.service";
import { ApplyService } from "../apply.service";

@Component({
  selector: "app-collection-page-content",
  templateUrl: "./collection-page-content.component.html",
  styleUrls: ["./collection-page-content.component.scss"],
})
export class CollectionPageContentComponent implements OnInit {
  collectionName: string;
  collectionCreator: string;
  collectionCollection = true;
  collectionOrderByType = "most recent first";
  @Input() collectionNFTs: PostEntryResponse[];
  @Input() collectionDescription: string;
  constructor(
    private route: ActivatedRoute,
    private titleService: Title,
    private backendApi: BackendApiService,
    public globalVars: GlobalVarsService,
    private applyService: ApplyService
  ) {}

  ngOnInit(): void {}

  // Choosing between a grid display of NFTs and Card display
  setDisplayType(display: string) {
    switch (display) {
      case "Card":
        this.globalVars.marketplaceViewTypeCard = true;
        break;
      case "Grid":
        this.globalVars.marketplaceViewTypeCard = false;
        break;
      default:
        break;
    }
  }
  // Choosing between a grid display of NFTs and Card display
  setCollectionContentType(collection: boolean) {
    switch (collection) {
      case true:
        this.collectionCollection = true;
        break;
      case false:
        this.collectionCollection = false;
        break;
      default:
        break;
    }
  }
  sortSelectChange(event) {
    if (this.collectionOrderByType != event) {
      this.collectionOrderByType = event;
      // Call sort
      this.applyService.orderByChange(this.collectionOrderByType);
    }
  }
}
