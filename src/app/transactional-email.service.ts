import { Injectable } from "@angular/core";
import { BackendApiService } from "./backend-api.service";
import { GlobalVarsService } from "./global-vars.service";

@Injectable({
  providedIn: "root",
})
// This service handles sending transactional emails to users
// So handle with a certain amount of care
// Also yes we dont care about what these return as long as its valid
export class TransactionalEmailService {
  constructor(private backendApi: BackendApiService, private globalVars: GlobalVarsService) {}

  SendVerifyEmailEmail(Username: string, Link: string, Email: string) {
    this.backendApi.SendVerifyEmailEmail(this.globalVars.localNode, Username, Link, Email).subscribe(
      (res) => {
        console.log(res);
      },
      (err) => {
        console.log(err);
      }
    );
  }
  SendLostNFTEmail(Username: string, ArtName: string, Email: string) {
    this.backendApi.SendLostNFTEmail(this.globalVars.localNode, Username, ArtName, Email).subscribe(
      (res) => {
        console.log(res);
      },
      (err) => {
        console.log(err);
      }
    );
  }
  SendNewNFTBidEmail(
    CreatorUsername: string,
    BidderUsername: string,
    BidAmount: number,
    LinkToNFT: string,
    Email: string
  ) {
    this.backendApi
      .SendNewNFTBidEmail(this.globalVars.localNode, CreatorUsername, BidderUsername, BidAmount, LinkToNFT, Email)
      .subscribe(
        (res) => {
          console.log(res);
        },
        (err) => {
          console.log(err);
        }
      );
  }
  SendInactiveUserEmail(Username: string, LinkToProfile: string, Email: string) {
    this.backendApi.SendInactiveUserEmail(this.globalVars.localNode, Username, LinkToProfile, Email).subscribe(
      (res) => {
        console.log(res);
      },
      (err) => {
        console.log(err);
      }
    );
  }
  SendWelcomeEmail(Username: string, LinkToProfile: string, Email: string) {
    this.backendApi.SendWelcomeEmail(this.globalVars.localNode, Username, LinkToProfile, Email).subscribe(
      (res) => {
        console.log(res);
      },
      (err) => {
        console.log(err);
      }
    );
  }
  SendBidAgainEmail(
    OutBiddedUsername: string,
    OutBidderUsername: string,
    NewBidAmount: number,
    LinkToNFT: string,
    Email: string
  ) {
    this.backendApi
      .SendBidAgainEmail(
        this.globalVars.localNode,
        OutBiddedUsername,
        OutBidderUsername,
        NewBidAmount,
        LinkToNFT,
        Email
      )
      .subscribe(
        (res) => {
          console.log(res);
        },
        (err) => {
          console.log(err);
        }
      );
  }
  SendWonNFTEmail(WinnerUsername: string, ArtName: string, WinningBidAmount: number, LinkToNFT: string, Email: string) {
    this.backendApi
      .SendWonNFTEmail(this.globalVars.localNode, WinnerUsername, ArtName, WinningBidAmount, LinkToNFT, Email)
      .subscribe(
        (res) => {
          console.log("Email sent successfully");
          console.log(res);
        },
        (err) => {
          console.log("Sending email failed: ", err);
          console.log(err);
        }
      );
  }
  SendBidPlacedEmail(Username: string, BidAmount: number, LinkToNFT: string, Email: string) {
    this.backendApi.SendBidPlacedEmail(this.globalVars.localNode, Username, BidAmount, LinkToNFT, Email).subscribe(
      (res) => {
        console.log(res);
      },
      (err) => {
        console.log(err);
      }
    );
  }
}
