import { Component, EventEmitter, Input, Output } from "@angular/core";
import { ProfileEntryResponse } from "src/app/backend-api.service";
import { GlobalVarsService } from "src/app/global-vars.service";

@Component({
  selector: "app-transfer-deso",
  templateUrl: "./transfer-deso.component.html",
  styleUrls: ["./transfer-deso.component.scss"],
})
export class TransferDesoComponent {
  // Passing multiple variables is only ok inside an object
  amount: number;
  publicKey: string;
  payToCreator: ProfileEntryResponse;
  startingSearchText = "";
  @Input() sendingDeSo: boolean;
  @Output() sendDeso = new EventEmitter<{ amount: number; publicKey: string }>();
  constructor(public globalVars: GlobalVarsService) {}

  emitSendDeso() {
    this.sendDeso.emit({ amount: this.amount, publicKey: this.publicKey });
  }
  _handleCreatorSelectedInSearch(creator: ProfileEntryResponse) {
    this.payToCreator = creator;
    this.publicKey = creator?.Username || creator?.PublicKeyBase58Check || "";
  }
}
