import { Component, NgModule, OnInit, Input } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { ProfileEntryResponse, BackendApiService } from "../backend-api.service";
import { SearchBarComponent } from "../search-bar/search-bar.component";
import { GlobalVarsService } from "../global-vars.service";

@Component({
  selector: "app-transfer-modal",
  templateUrl: "./transfer-modal.component.html",
  styleUrls: ["./transfer-modal.component.scss"],
})
export class TransferModalComponent implements OnInit {
  @Input() postHashHex: string;
  transferToPublicKey = "";
  transferToCreator: ProfileEntryResponse;
  startingSearchText = "";

  constructor(
    public bsModalRef: BsModalRef,
    public backendApi: BackendApiService,
    public globalVars: GlobalVarsService
  ) {}

  ngOnInit(): void {}

  _handleCreatorSelectedInSearch(creator: ProfileEntryResponse) {
    this.transferToCreator = creator;
    this.transferToPublicKey = creator?.Username || creator?.PublicKeyBase58Check || "";
  }
  transfer() {
    console.log(this.transferToCreator.PublicKeyBase58Check);
    this.backendApi
      .TransferNFT(
        this.globalVars.localNode,
        this.globalVars.loggedInUser?.PublicKeyBase58Check,
        this.transferToCreator.PublicKeyBase58Check,
        this.postHashHex,
        1,
        "text",
        this.globalVars.defaultFeeRateNanosPerKB
      )
      .subscribe(
        (res: any) => {
          console.log(res);
        },
        (error) => {
          this.globalVars._alertError(error.error.error);
        }
      );
  }
}
