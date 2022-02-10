import { Component, OnInit } from '@angular/core';
import { GlobalVarsService } from "../global-vars.service";
import { BackendApiService, DeSoNode, NFTEntryResponse, ProfileEntryResponse } from "../backend-api.service";

@Component({
  selector: 'app-nft-card-minimal',
  templateUrl: './nft-card-minimal.component.html',
  styleUrls: ['./nft-card-minimal.component.scss']
})
export class NftCardMinimalComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
