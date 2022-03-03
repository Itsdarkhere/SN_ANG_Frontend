import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { BackendApiService } from "src/app/backend-api.service";
import { GlobalVarsService } from "src/app/global-vars.service";

@Component({
  selector: "app-collection-page-header",
  templateUrl: "./collection-page-header.component.html",
  styleUrls: ["./collection-page-header.component.scss"],
})
export class CollectionPageHeaderComponent implements OnChanges {
  @Input() collectionBannerLocation: string;
  @Input() collectionCreatorPK: string;
  @Input() collectionName: string;
  @Input() collectionCreator: string;
  collectionData: collectionInfoResponse;
  constructor(private backendApi: BackendApiService, public globalVars: GlobalVarsService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.collectionName) {
      if (this.collectionName != "") {
        this.getCollectionInfo();
      }
    }
  }

  getCollectionInfo() {
    this.backendApi.GetCollectionInfo(this.globalVars.localNode, this.collectionName, this.collectionCreator).subscribe(
      (res) => {
        this.collectionData = res;
      },
      (err) => {
        console.log(err);
      }
    );
  }
  // Use this to load / resize / speed up arweavve images, add params to url for additional benefits
  mapArweaveURLs(imgURL: string): string {
    if (imgURL.startsWith("https://arweave.net/")) {
      // Build cloudflare imageString
      imgURL = "https://supernovas.app/cdn-cgi/image/width=500,height=200,fit=scale-down,quality=85/" + imgURL;
    }
    return imgURL;
  }
}
class collectionInfoResponse {
  FloorPrice: number;
  OwnersAmount: number;
  Pieces: number;
  TradingVolume: number;
}
