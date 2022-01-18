import { Component, OnInit } from "@angular/core";
import { RouteNames } from "../../app-routing.module";
import { GlobalVarsService } from "../../global-vars.service";
import { GoogleAnalyticsService } from "src/app/google-analytics.service";
import { ActivatedRoute, Router } from "@angular/router";
import { AngularFirestore } from "@angular/fire/firestore";
import { isNull } from "lodash";

@Component({
  selector: "app-complete-profile",
  templateUrl: "./complete-profile.component.html",
  styleUrls: ["./complete-profile.component.scss"],
})
export class CompleteProfileComponent {
  RouteNames = RouteNames;
  profileData: any;
  proto: any;
  isCreator: boolean;
  isVerified: boolean;
  username: any;
  isNullUsername: boolean;

  constructor(
    public globalVars: GlobalVarsService,
    private analyticsService: GoogleAnalyticsService,
    private router: Router,
    private firestore: AngularFirestore
  ) {}

  async ngOnInit(): Promise<void> {
    await this.checkCreatorStatus();
    this.checkNullUsername();
    this.checkIsVerified();

    this.checkOnboardingStatus();
  }

  checkOnboardingStatus() {
    // this.isVerified = true;

    console.log("---------------------- onboarding function hit");
    console.log(this.isCreator);
    console.log(this.isNullUsername);
    console.log(this.isVerified);

    //   if they are a creator, have a profile and are verified then onboarding is complete
    if (this.isCreator === true && this.isNullUsername === false && this.isVerified === true) {
      this.router.navigate([RouteNames.UPDATE_PROFILE]);
    }
  }

  checkNullUsername() {
    let isNullUsernameRes = JSON.stringify(this.globalVars.loggedInUser?.ProfileEntryResponse);
    if (isNullUsernameRes === "null") {
      this.isNullUsername = true;
    } else {
      this.isNullUsername = false;
    }
  }

  checkIsVerified() {
    let isVerifiedRes = JSON.stringify(this.globalVars.loggedInUser.ProfileEntryResponse["IsVerified"]);

    if (isVerifiedRes === "true") {
      this.isVerified = true;
    } else {
      this.isVerified = false;
    }
  }

  getCircularReplacer = () => {
    const seen = new WeakSet();
    return (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (seen.has(value)) {
          return;
        }
        seen.add(value);
      }
      return value;
    };
  };

  async checkCreatorStatus(): Promise<void> {
    const publicKey = this.globalVars.loggedInUser.PublicKeyBase58Check;
    const firebaseRes = await this.firestore.collection("profile-details").doc(publicKey).get().toPromise();
    let firebaseResData = JSON.stringify(
      firebaseRes["_document"]["proto"]["fields"]["creator"]["booleanValue"],
      this.getCircularReplacer()
    );

    // put profile response into profile data

    // const proto = JSON.stringify(firebaseResData["proto"], this.getCircularReplacer());
    // const firebase4 = JSON.parse(firebaseResData["_document"]);
    // const firebase5 = JSON.stringify(firebase4);

    if (firebaseResData === "false") {
      this.isCreator = false;
    } else {
      this.isCreator = true;
    }
  }

  // rounded to nearest integer
  SendCreateProfileVisitEvent() {
    //this.analyticsService.eventEmitter("create_profile_visit", "usage", "activity", "event", 10);
  }
  minPurchaseAmountInUsdRoundedUp() {
    /*const satoshisPerBitcoin = 1e8;
    let minimumInBitcoin = this.globalVars.minSatoshisBurnedForProfileCreation / satoshisPerBitcoin;
    return Math.ceil(this.globalVars.usdPerBitcoinExchangeRate * minimumInBitcoin);*/
  }

  getCreateProfileMessage(): string {
    return this.globalVars.showPhoneNumberVerification
      ? `You need to verify a phone number or purchase DeSo with Bitcoin in order to create a profile.
  This helps prevent spam.`
      : `You need to buy DeSo with Bitcoin in order to create a profile.  This helps prevent spam.`;
  }

  buyDESO() {
    window.open("https://buy.deso.org/", "_blank");
  }

  buyCreatorCoin() {
    if (this.isNullUsername === true) {
      alert("You must create a username for your profile in order to buy your creator coin.");
    } else {
      this.username = JSON.stringify(this.globalVars.loggedInUser.ProfileEntryResponse["Username"]);
      this.username = this.username.replace(/['"]+/g, "");
      window.open(`https://supernovas.app/u/${this.username}/buy`, "_blank");
    }
  }

  createProfile() {
    this.router.navigate([RouteNames.UPDATE_PROFILE]);
  }

  verifyProfile() {
    window.open("https://form.typeform.com/to/sv1kaUT2", "_blank");
  }

  contactSupport() {
    window.open("https://intercom.help/supernovas/en", "_blank");
  }
}
