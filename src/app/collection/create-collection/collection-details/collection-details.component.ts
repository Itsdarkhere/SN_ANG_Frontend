import { Component } from '@angular/core';

@Component({
  selector: 'app-collection-details',
  templateUrl: './collection-details.component.html',
  styleUrls: ['./collection-details.component.scss']
})
export class CollectionDetailsComponent {
  constructor() {}

  collectionName: string = "";
  collectionDescription: string = "";
  collectionBannerImage: File = null;
  collectionDisplayImage: File = null;

  onKeyUp() {
    console.log();
  }
}