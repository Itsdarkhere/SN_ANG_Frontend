import { Component } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';

@Component({
  selector: 'app-collection-details',
  templateUrl: './collection-details.component.html',
  styleUrls: ['./collection-details.component.scss'],
  viewProviders: [ { provide: ControlContainer, useExisting: NgForm } ]
})
export class CollectionDetailsComponent {
  constructor() {}

  collectionName: string = "";
  collectionDescription: string = "";

  onKeyUp() {
    console.log(this.collectionName, this.collectionDescription);
  }
}
