import { Injectable } from "@angular/core";
import mixpanel from "mixpanel-browser";

// or with require() syntax:
// const mixpanel = require('mixpanel-browser');

// Enabling the debug mode flag is useful during implementation,
// but it's recommended you remove it for production
mixpanel.init("28e1ccdde0bc00420d6819f0b695f62b", { debug: false });

@Injectable({
  providedIn: "root",
})
export class MixpanelService {
  constructor() {}

  // "Sign-up clicked"
  track(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Login clicked"
  track2(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Landing page viewed"
  track3(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Viewed Feed"
  track4(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Image Mint Selected"
  track5(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Video Mint Selected"
  track6(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Audio Mint Selected"
  track7(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Open Auction Selected"
  track8(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Buy Now Selected"
  track9(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Mint Continued"
  track10(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Minted NFT"
  track11(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Submit Post"
  track12(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Buy Now"
  track13(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Cancel Bid"
  track14(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Open Place a Bid Modal"
  track15(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Bid Placed"
  track16(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Update profile type"
  track17(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Marketplace Viewed"
  track18(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Update email"
  track19(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Update profile"
  track20(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Submit Post on Feed"
  track21(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Email address clicked"
  track22(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // Creates alias
  alias(name: string) {
    mixpanel.alias(name);
    console.log(name);
  }
  // "Verify Email clicked"
  track23(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Creator Selected"
  track24(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Collector Selected"
  track25(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Validate Username"
  track26(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // Identify
  identify(name: string) {
    mixpanel.identify(name);
    console.log(name);
  }
  // "Verify phone clicked"
  track27(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Onboarding - Verify profile clicked"
  track28(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Onboarding - Profile created clicked"
  track29(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Onboarding - Buy Creator Coin"
  track30(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Onboarding - Contact Support"
  track31(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Onboarding - Buy DeSo"
  track32(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Post Clicked"
  track33(name: string, data) {
    mixpanel.track(name, data);
    console.log(name);
  }
  // "Activity page viewed"
  track34(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Messages page viewed"
  track35(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Wallet page viewed"
  track36(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Get Create Profile Message"
  track37(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Landing page - login clicked"
  track38(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Landing page - Signup clicked"
  track39(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Liked"
  track40(name: string, data) {
    mixpanel.track(name, data);
    console.log(name);
  }
  // "Send diamonds"
  track41(name: string, data) {
    mixpanel.track(name, data);
    console.log(name);
  }
  // "Send diamonds"
  track42(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  // "Discovery viewed"
  track44(event) {
    mixpanel.track(event);
    console.log(event);
  }
  // People Set
  peopleset(name) {
    mixpanel.people.set(name, {
      $name: name,
    });
  }
  // People Set - ref
  peoplesetRef(name) {
    mixpanel.people.set_once(name, {
      name: name,
    });
  }
  // This tracks referrals
  trackRefer(referrer: string) {
    mixpanel.track("Referral", {
      referrer: referrer,
    });
  }
}
