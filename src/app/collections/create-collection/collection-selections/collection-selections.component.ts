import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { GlobalVarsService } from "../../../global-vars.service";
import { BackendApiService, NFTBidEntryResponse, NFTEntryResponse, PostEntryResponse } from "../../../backend-api.service";
import { InfiniteScroller } from "../../../infinite-scroller";
import { IAdapter, IDatasource } from "ngx-ui-scroll";

@Component({
  selector: 'app-collection-selections',
  templateUrl: './collection-selections.component.html',
  styleUrls: ['./collection-selections.component.scss']
})
export class CollectionSelectionsComponent implements OnInit {
  constructor(
    private globalVars: GlobalVarsService,
    private backendApi: BackendApiService
  ) {}

  @Input() collectionSelections: FormGroup;

  nftIsSelected: boolean = false;
  nftCounter: number = 0;

  onClick() {
    this.nftIsSelected = !this.nftIsSelected;

    if(this.nftIsSelected) {
      this.nftCounter += 1;
      console.log(this.nftCounter);
      //increment counter
      //add css classes
      //emit event to parent to add to array
    } else {
      this.nftCounter <= 0 ? this.nftCounter === 0 : this.nftCounter -= 1;
      console.log(this.nftCounter);
      //decrement counter
      //remove css classes
      //emit event to parent to remove from array
    }
  }

  ngOnInit(): void {
  }
}
