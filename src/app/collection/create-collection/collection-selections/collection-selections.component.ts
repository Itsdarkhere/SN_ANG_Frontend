import { Component, OnInit } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';
import { PostEntryResponse } from 'src/app/backend-api.service';

@Component({
  selector: 'app-collection-selections',
  templateUrl: './collection-selections.component.html',
  styleUrls: ['./collection-selections.component.scss'],
  viewProviders: [ { provide: ControlContainer, useExisting: NgForm } ]
})
export class CollectionSelectionsComponent implements OnInit {
  constructor() {}

  collectionNfts: Array<PostEntryResponse> = [];

  ngOnInit(): void {
  }
  
  getUserNfts($event: PostEntryResponse[]) {
    this.collectionNfts = $event;
    console.log($event);
  }
  
}
