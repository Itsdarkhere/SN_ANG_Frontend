import { Component, ElementRef, ViewChild, Input, Output, EventEmitter } from "@angular/core";
import { NFTEntryResponse } from "src/app/backend-api.service";

@Component({
  selector: "app-nft-edition-dropdown",
  templateUrl: "./nft-edition-dropdown.component.html",
  styleUrls: ["./nft-edition-dropdown.component.scss"],
})
export class NftEditionDropdownComponent {
  @ViewChild("changeAccountSelectorRoot", { static: true }) accountSelectorRoot: ElementRef;
  @Output() editionSelected = new EventEmitter();
  @Input() nftEntryResponses: NFTEntryResponse[];
  @Input() editionNumber: number;
  selectorOpen: boolean;
  hoverRow: number;

  constructor() {
    this.selectorOpen = false;
  }

  _switchToEdition(edition: number) {
    this.editionSelected.emit(edition);
  }
}
