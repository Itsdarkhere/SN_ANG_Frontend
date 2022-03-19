import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { MixpanelService } from "../mixpanel.service";
@Component({
  selector: "app-signup-page-referrals",
  templateUrl: "./signup-page-referrals.component.html",
  styleUrls: ["./signup-page-referrals.component.scss"],
})
export class SignupPageReferralsComponent implements OnInit {
  referrerUsername: string;
  constructor(private route: ActivatedRoute, private mixPanel: MixpanelService) {
    console.log("LOOGGGGG 2");
    this.route.params.subscribe((params) => {
      this.referrerUsername = params.username;
    });
    this.mixPanel.trackRefer(this.referrerUsername);
    this.mixPanel.peoplesetRef({
      Referrer: this.referrerUsername,
    });
    console.log("LOGGGGG");
  }

  ngOnInit(): void {
    console.log("LOOGGGGG 2");
  }
}
