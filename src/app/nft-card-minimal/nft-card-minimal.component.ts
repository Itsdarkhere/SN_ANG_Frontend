import { Component, Input, OnInit } from '@angular/core';
import { BackendApiService, NFTEntryResponse, PostEntryResponse } from '../backend-api.service';
import { GlobalVarsService } from "../global-vars.service";

@Component({
  selector: 'app-nft-card-minimal',
  templateUrl: './nft-card-minimal.component.html',
  styleUrls: ['./nft-card-minimal.component.scss']
})
export class NftCardMinimalComponent implements OnInit {

  @Input() nftData: PostEntryResponse;

  constructor(
    public globalVars: GlobalVarsService, 
    private backendApi: BackendApiService
  ) { }

  nftEntryResponse: NFTEntryResponse[];

  ngOnInit(): void {
  }
}
