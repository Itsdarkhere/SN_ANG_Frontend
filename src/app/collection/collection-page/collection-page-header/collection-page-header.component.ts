import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-collection-page-header",
  templateUrl: "./collection-page-header.component.html",
  styleUrls: ["./collection-page-header.component.scss"],
})
export class CollectionPageHeaderComponent implements OnInit {
  @Input() collectionBannerLocation: string;
  @Input() collectionCreatorPK: string;
  @Input() collectionName: string;
  constructor() {}

  ngOnInit(): void {}
}
