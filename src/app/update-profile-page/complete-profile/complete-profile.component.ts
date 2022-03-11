import { Component } from "@angular/core";
import { RouteNames } from "../../app-routing.module";
import { GlobalVarsService } from "../../global-vars.service";
import { GoogleAnalyticsService } from "src/app/google-analytics.service";
import { Router } from "@angular/router";
import { AngularFirestore } from "@angular/fire/firestore";
import { MixpanelService } from "src/app/mixPanel.service";

@Component({
  selector: "app-complete-profile",
  templateUrl: "./complete-profile.component.html",
  styleUrls: ["./complete-profile.component.scss"],
})
export class CompleteProfileComponent {
  RouteNames = RouteNames;
  profileData: any;
  isCreator: boolean;
  isVerified: boolean;
  username: any;
  isNullUsername: boolean;

  constructor(
    public globalVars: GlobalVarsService,
    private analyticsService: GoogleAnalyticsService,
    private router: Router,
    private mixPanel: MixpanelService,
    private firestore: AngularFirestore
  ) {}

  async ngOnInit(): Promise<void> {
    await this.globalVars.checkOnboardingStatus();

    if (this.globalVars.isOnboardingComplete === true) {
      this.router.navigate([RouteNames.UPDATE_PROFILE]);
    }

    // if (this.globalVars.isMobileIphone()) {
    //   // testing closing the mobile nav on page load
    //   this.globalVars.isLeftBarMobileOpen = false;
    // }
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
    this.mixPanel.track37("Get Create Profile Message");
    return this.globalVars.showPhoneNumberVerification
      ? `You need to verify a phone number or purchase DeSo with Bitcoin in order to create a profile.
  This helps prevent spam.`
      : `You need to buy DeSo with Bitcoin in order to create a profile.  This helps prevent spam.`;
  }

  buyDESO() {
    this.mixPanel.track32("Onboarding - Buy DeSo");
    window.open("https://buy.deso.org/", "_blank");
  }

  buyCreatorCoin() {
    this.mixPanel.track30("Onboarding - Buy Creator Coin");
    if (this.globalVars.isNullUsername === true) {
      this.globalVars._alertError("You must create a username for your profile in order to buy your creator coin.");
      //   alert("You must create a username for your profile in order to buy your creator coin.");
    } else {
      window.open(`https://supernovas.app/u/${this.username}/buy`, "_blank");
    }
  }

  createProfile() {
    this.mixPanel.track29("Onboarding - Profile created clicked");
    this.router.navigate([RouteNames.UPDATE_PROFILE]);
  }

  verifyProfile() {
    this.mixPanel.track28("Onboarding - Verify profile clicked");
    window.open("https://form.typeform.com/to/sv1kaUT2", "_blank");
  }

  contactSupport() {
    this.mixPanel.track31("Onboarding - Contact Support");
    window.open("https://intercom.help/supernovas/en", "_blank");
  }
}
