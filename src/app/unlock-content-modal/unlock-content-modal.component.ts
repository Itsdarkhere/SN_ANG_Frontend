import { Component, Input, OnInit } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { NFTEntryResponse } from '../backend-api.service';

@Component({
  selector: 'app-unlock-content-modal',
  templateUrl: './unlock-content-modal.component.html',
  styleUrls: ['./unlock-content-modal.component.scss']
})
export class UnlockContentModalComponent implements OnInit {
  @Input() decryptableNFTEntryResponses: NFTEntryResponse[]

  constructor(
    public bsModalRef: BsModalRef
  ) { }

  ngOnInit(): void {
  }

  closeThisWindow(){
    this.bsModalRef.hide(); 
  }
 
}
