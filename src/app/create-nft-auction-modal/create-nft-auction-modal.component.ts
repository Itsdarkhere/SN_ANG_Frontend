import { Component, Input } from "@angular/core";
import { BsModalRef } from "ngx-bootstrap/modal";
import { BsModalService } from "ngx-bootstrap/modal";
import { GlobalVarsService } from "../global-vars.service";
import { BackendApiService, NFTEntryResponse, PostEntryResponse } from "../backend-api.service";
import { concatMap, last, map } from "rxjs/operators";
import { of } from "rxjs";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";

import { Link, ImmutableXClient, ImmutableMethodResults, MintableERC721TokenType } from "@imtbl/imx-sdk";

@Component({
  selector: "create-nft-auction",
  templateUrl: "./create-nft-auction-modal.component.html",
  styleUrls: ["./create-nft-auction.component.scss"],
})
export class CreateNftAuctionModalComponent {
  @Input() postHashHex: string;
  @Input() post: PostEntryResponse;
  @Input() nftEntryResponses: NFTEntryResponse[];
  @Input() isEthNFT: boolean;
  @Input() tokenId: any;

  loading = false;
  minBidAmountUSD: string;
  minBidAmountDESO: number;
  selectedSerialNumbers: boolean[] = [];
  selectAll: boolean = false;
  creatingAuction: boolean = false;

  sellingPriceETH: any;
  link = new Link(environment.imx.ROPSTEN_LINK_URL);
  createEthNFTSuccess: boolean = false;

  constructor(
    private backendApi: BackendApiService,
    public globalVars: GlobalVarsService,
    public bsModalRef: BsModalRef,
    private modalService: BsModalService,
    private router: Router
  ) {}

  updateMinBidAmountUSD(desoAmount) {
    this.minBidAmountUSD = this.globalVars.nanosToUSDNumber(desoAmount * 1e9).toFixed(2);
  }

  updateMinBidAmountDESO(usdAmount) {
    this.minBidAmountDESO = Math.trunc(this.globalVars.usdToNanosNumber(usdAmount)) / 1e9;
  }

  updateSellingPriceETH(price) {
    this.sellingPriceETH = price;
  }

  async sellEthNFT() {
    if (this.sellingPriceETH === 0 || this.sellingPriceETH === undefined) {
      this.globalVars._alertError("The selling price must be greater then 0.");
    }

    console.log(` ---------------- tokenId is ${this.tokenId}`);

    const sellOrderId = await this.link.sell({
      amount: this.sellingPriceETH,
      tokenId: this.tokenId,
      tokenAddress: environment.imx.TOKEN_ADDRESS,
    });

    console.log(sellOrderId);

    this.createEthNFTSuccess = true;
  }

  closeEthSaleSuccess() {
    this.bsModalRef.hide();
    location.reload();
  }

  auctionTotal: number;
  auctionCounter: number = 0;
  createAuction() {
    this.auctionTotal = this.selectedSerialNumbers.filter((res) => res).length;
    this.creatingAuction = true;
    of(...this.selectedSerialNumbers.map((isSelected, index) => (isSelected ? index : -1)))
      .pipe(
        concatMap((val) => {
          if (val >= 0) {
            return this.backendApi
              .UpdateNFT(
                this.globalVars.localNode,
                this.globalVars.loggedInUser.PublicKeyBase58Check,
                this.post.PostHashHex,
                val,
                true,
                Math.trunc(this.minBidAmountDESO * 1e9),
                this.globalVars.defaultFeeRateNanosPerKB
              )
              .pipe(
                map((res) => {
                  this.auctionCounter++;
                  return res;
                })
              );
          } else {
            return of("");
          }
        })
      )
      .pipe(last((res) => res))
      .subscribe(
        (res) => {
          //this.router.navigate(["/" + this.globalVars.RouteNames.NFT + "/" + this.post.PostHashHex]);
          this.bsModalRef.hide();
          this.modalService.setDismissReason("nft auction started");
        },
        (err) => {
          console.error(err);
          this.globalVars._alertError(this.backendApi.parseMessageError(err));
        }
      )
      .add(() => (this.creatingAuction = false));
  }

  mySerialNumbersNotForSale(): NFTEntryResponse[] {
    return this.nftEntryResponses.filter(
      (nftEntryResponse) =>
        !nftEntryResponse.IsForSale &&
        nftEntryResponse.OwnerPublicKeyBase58Check === this.globalVars.loggedInUser?.PublicKeyBase58Check
    );
  }

  toggleSelectAll(val: boolean) {
    this.mySerialNumbersNotForSale().forEach(
      (nftEntryResponse) => (this.selectedSerialNumbers[nftEntryResponse.SerialNumber] = val)
    );
  }

  createAuctionDisabled(): boolean {
    console.log(!this.selectedSerialNumbers.filter((isSelected) => isSelected)?.length);
    return !this.selectedSerialNumbers.filter((isSelected) => isSelected)?.length;
  }

  selectSerialNumber(idx: number): void {
    console.log(idx);
    this.selectAll = false;
    for (let ii = 0; ii < this.selectedSerialNumbers.length; ii++) {
      this.selectedSerialNumbers[ii] = ii === idx;
    }
  }
}
