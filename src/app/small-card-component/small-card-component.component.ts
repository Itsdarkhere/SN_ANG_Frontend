import { Component, Input, OnInit } from "@angular/core";
import { NFTEntryResponse, PostEntryResponse } from "../backend-api.service";
import { GlobalVarsService } from "../global-vars.service";
import { BackendApiService } from "../backend-api.service";
import { Router } from "@angular/router";
import _ from "lodash";
import { EmbedUrlParserService } from "src/lib/services/embed-url-parser-service/embed-url-parser-service";

@Component({
  selector: "app-small-card-component",
  templateUrl: "./small-card-component.component.html",
  styleUrls: ["./small-card-component.component.scss"],
})
export class SmallCardComponentComponent implements OnInit {
  @Input() post: PostEntryResponse;
  // For create-collection form – see collection-selections.component.html
  @Input() index: number;
  @Input() selectedBorder: boolean;
  constructor(public globalVars: GlobalVarsService, private backendApi: BackendApiService, private router: Router) {}
  nftEntryResponses: NFTEntryResponse[];
  availableSerialNumbers: NFTEntryResponse[];
  myAvailableSerialNumbers: NFTEntryResponse[];
  serialNumbersDisplay: string;
  isForSale: boolean;
  showPlaceABid: boolean;
  constructedEmbedURL: any;
  highBid: number = null;
  lowBid: number = null;
  minBid: number = null;
  lastSalePrice: number = null;

  ngOnInit(): void {
    if (!this.post.RepostCount) {
      this.post.RepostCount = 0;
    }
    this.setEmbedURLForPostContent();
    this.getNFTEntries();
  }
  setEmbedURLForPostContent(): void {
    EmbedUrlParserService.getEmbedURL(
      this.backendApi,
      this.globalVars,
      this.post.PostExtraData["EmbedVideoURL"]
    ).subscribe((res) => (this.constructedEmbedURL = res));
  }
  getNFTEntries() {
    this.backendApi
      .GetNFTEntriesForNFTPost(
        this.globalVars.localNode,
        this.globalVars.loggedInUser?.PublicKeyBase58Check,
        this.post.PostHashHex
      )
      .subscribe((res) => {
        this.nftEntryResponses = res.NFTEntryResponses;
        this.nftEntryResponses.sort((a, b) => a.SerialNumber - b.SerialNumber);
        this.availableSerialNumbers = this.nftEntryResponses.filter((nftEntryResponse) => nftEntryResponse.IsForSale);
        this.isForSale = this.availableSerialNumbers.length > 0;
        this.highBid = _.maxBy(this.availableSerialNumbers, "HighestBidAmountNanos")?.HighestBidAmountNanos || 0;
        this.lowBid = _.minBy(this.availableSerialNumbers, "HighestBidAmountNanos")?.HighestBidAmountNanos || 0;
        this.minBid = _.maxBy(this.availableSerialNumbers, "MinBidAmountNanos")?.MinBidAmountNanos || 0;
        this.myAvailableSerialNumbers = this.availableSerialNumbers.filter(
          (nftEntryResponse) =>
            nftEntryResponse.OwnerPublicKeyBase58Check === this.globalVars.loggedInUser?.PublicKeyBase58Check
        );
        this.showPlaceABid = !!(this.availableSerialNumbers.length - this.myAvailableSerialNumbers.length);
        if (!this.showPlaceABid) {
          if (this.nftEntryResponses[0]?.LastAcceptedBidAmountNanos >= 0) {
            this.lastSalePrice = this.nftEntryResponses[0]?.LastAcceptedBidAmountNanos;
          } else {
            this.lastSalePrice = 0;
          }
        }
      });
  }
  compareBit(minBid, maxBid, showPlaceABid): string {
    if (!showPlaceABid && !!this.nftEntryResponses) {
      return this.nftEntryResponses[0]?.IsForSale === false ? "Last sold for" : "Minimum Bid";
    } else {
      if (Number(maxBid) > 0) {
        return "Highest Bid";
      } else if (Number(maxBid) === 0) {
        return "Minimum Bid";
      }
    }
  }
  mapImageURLs(imgURL: string): string {
    if (imgURL.startsWith("https://i.imgur.com")) {
      return imgURL.replace("https://i.imgur.com", "https://images.bitclout.com/i.imgur.com");
    } else if (imgURL.startsWith("https://arweave.net/")) {
      // Build cloudflare imageString
      imgURL = "https://supernovas.app/cdn-cgi/image/width=300,height=300,fit=scale-down,quality=80/" + imgURL;
    }
    return imgURL;
  }
  onPostClicked(event) {
    // don't navigate if the user is selecting text
    // from https://stackoverflow.com/questions/31982407/prevent-onclick-event-when-selecting-text
    const selection = window.getSelection();
    if (selection.toString().length !== 0) {
      return true;
    }
    // don't navigate if the user clicked a link
    if (event.target.tagName.toLowerCase() === "a") {
      return true;
    }
    const route = this.globalVars.RouteNames.NFT;
    // identify ctrl+click (or) cmd+clik and opens feed in new tab
    if (event.ctrlKey) {
      const url = this.router.serializeUrl(
        this.router.createUrlTree(["/" + route, this.post.PostHashHex], {
          queryParamsHandling: "merge",
        })
      );
      window.open(url, "_blank");
      // don't navigate after new tab is opened
      return true;
    }
    this.router.navigate(["/" + route, this.post.PostHashHex], {
      queryParamsHandling: "merge",
    });
  }
  activateOnHover(event, play) {
    console.log("lol");
  }
  activateOnHoverAudio(play) {
    console.log("lol");
  }
  getEmbedHeight(): number {
    return EmbedUrlParserService.getEmbedHeight(this.post.PostExtraData["EmbedVideoURL"]);
  }
  getEmbedWidth(): string {
    return EmbedUrlParserService.getEmbedWidth(this.post.PostExtraData["EmbedVideoURL"]);
  }
}
