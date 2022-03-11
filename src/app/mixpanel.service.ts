import { Injectable } from "@angular/core";
import mixpanel from "mixpanel-browser";

// or with require() syntax:
// const mixpanel = require('mixpanel-browser');

// Enabling the debug mode flag is useful during implementation,
// but it's recommended you remove it for production
mixpanel.init("28e1ccdde0bc00420d6819f0b695f62b", { debug: true });

@Injectable({
  providedIn: "root",
})
export class MixpanelService {
  constructor() {}

  track(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  track2(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  track3(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  track4(name: string) {
    mixpanel.track(name);
    console.log(name);
  }
  track5(name: String) {
    mixpanel.track(name);
    console.log(name);
  }
  track6(name: String) {
    mixpanel.track(name);
    console.log(name);
  }
  track7(name: String) {
    mixpanel.track(name);
    console.log(name);
  }
  track8(name: String) {
    mixpanel.track(name);
    console.log(name);
  }
  track9(name: String) {
    mixpanel.track(name);
    console.log(name);
  }
  track10(name: String) {
    mixpanel.track(name);
    console.log(name);
  }
  track11(name: String) {
    mixpanel.track(name);
    console.log(name);
  }
  track12(name: String) {
    mixpanel.track(name);
    console.log(name);
  }
  track13(name: String) {
    mixpanel.track(name);
    console.log(name);
  }
  track14(name: String) {
    mixpanel.track(name);
    console.log(name);
  }
  track15(name: String) {
    mixpanel.track(name);
    console.log(name);
  }
  track16(name: String) {
    mixpanel.track(name);
    console.log(name);
  }
  track17(name: String) {
    mixpanel.track(name);
    console.log(name);
  }
  track18(name: String) {
    mixpanel.track(name);
    console.log(name);
  }
  track19(name: String) {
    mixpanel.track(name);
    console.log(name);
  }
  track20(name: String) {
    mixpanel.track(name);
    console.log(name);
  }
  track21(name: String) {
    mixpanel.track(name);
    console.log(name);
  }
  track22(name: String) {
    mixpanel.track(name);
    console.log(name);
  }
  alias(name: String) {
    mixpanel.alias(name);
    console.log(name);
  }
  track23(name: String) {
    mixpanel.track(name);
    console.log(name);
  }
  track24(name: String) {
    mixpanel.track(name);
    console.log(name);
  }
  track25(name: String) {
    mixpanel.track(name);
    console.log(name);
  }
  track26(name: String) {
    mixpanel.track(name);
    console.log(name);
  }
  identify(name: String) {
    mixpanel.identify(name);
    console.log(name);
  }
  track27(name: String) {
    mixpanel.track(name);
    console.log(name);
  }
  track28(name: String) {
    mixpanel.track(name);
    console.log(name);
  }
  track29(name: String) {
    mixpanel.track(name);
    console.log(name);
  }
  track30(name: String) {
    mixpanel.track(name);
    console.log(name);
  }
  track31(name: String) {
    mixpanel.track(name);
    console.log(name);
  }
  track32(name: String) {
    mixpanel.track(name);
    console.log(name);
  }
  track33(name: String, data) {
    mixpanel.track(name, data);
    console.log(name);
  }
  track34(name: String) {
    mixpanel.track(name);
    console.log(name);
  }
  track35(name: String) {
    mixpanel.track(name);
    console.log(name);
  }
  track36(name: String) {
    mixpanel.track(name);
    console.log(name);
  }
  track37(name: String) {
    mixpanel.track(name);
    console.log(name);
  }
  track38(name: String) {
    mixpanel.track(name);
    console.log(name);
  }
  track44(event) {
    mixpanel.track(event);
    console.log(event);
  }
  // This tracks referrals
  trackRefer(referrer: String) {
    mixpanel.track("Referral", {
      referrer: referrer,
    });
  }
}
