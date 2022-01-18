import { Component, OnInit } from "@angular/core";
import { RouteNames } from "../../app-routing.module";
import { GlobalVarsService } from "../../global-vars.service";
import { GoogleAnalyticsService } from "src/app/google-analytics.service";
import { ActivatedRoute, Router } from "@angular/router";
import { AngularFirestore } from "@angular/fire/firestore";

@Component({
  selector: "app-complete-profile",
  templateUrl: "./complete-profile.component.html",
  styleUrls: ["./complete-profile.component.scss"],
})
export class CompleteProfileComponent {
  RouteNames = RouteNames;
  profileData: any;
  proto: any;

  constructor(
    public globalVars: GlobalVarsService,
    private analyticsService: GoogleAnalyticsService,
    private router: Router,
    private firestore: AngularFirestore
  ) {}

  ngOnInit() {
    this.getUsername();
  }

  async getProfileSocials(): Promise<void> {
    const publicKey = this.globalVars.loggedInUser?.PublicKeyBase58Check;

    const firestoreRes = this.firestore
      .collection("profile-details")
      .doc(publicKey)
      .valueChanges()
      .subscribe((res) => (this.profileData = res));

    console.log(`---------------------------- ${this.profileData} ----------------------------`);
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

  async getUsername(): Promise<void> {
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

    console.log(`------------------------ ${firebaseResData} ------------------------`);

    if ((firebaseResData = "false")) {
      console.log(`false`);
    }

    let username1 = JSON.stringify(this.globalVars.loggedInUser.ProfileEntryResponse["Username"]);

    console.log(` -------------------------- ${username1} -------------------------- `);

    // console.log(
    //   `-------------------------- profile data ${JSON.stringify(
    //     firebaseRes,
    //     this.getCircularReplacer()
    //   )} --------------------------`
    // );

    // if there is no document, they haven't saved their profile data yet
    // if (!fields) {
    // console.log(
    //   `--------------------------- ${JSON.stringify(
    //     this.globalVars.loggedInUser?.ProfileEntryResponse["PublicKeyBase58Check"]
    //   )} --------------------------- `
    // );
    // }

    // console.log(
    //   `--------------------------------------- globalvars are ${JSON.stringify(
    //     this.globalVars["loggedInUser"]["ProfileEntryResponse"],
    //     this.getCircularReplacer()
    //   )} ---------------------------------------`
    // );
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

  buyCreatorCoin() {}

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
