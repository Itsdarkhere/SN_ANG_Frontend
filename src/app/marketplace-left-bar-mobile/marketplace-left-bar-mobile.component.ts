import { Component, Input } from "@angular/core";
import { trigger, style, animate, transition } from "@angular/animations";
import { GlobalVarsService } from "../global-vars.service";

@Component({
  selector: "app-marketplace-left-bar-mobile",
  templateUrl: "./marketplace-left-bar-mobile.component.html",
  styleUrls: ["./marketplace-left-bar-mobile.component.scss"],
  animations: [
    trigger("leftBarAnimation", [
      transition(":enter", [style({ opacity: "0" }), animate("400ms ease", style({ opacity: "1" }))]),
      transition(":leave", [style({ opacity: "1" }), animate("400ms ease", style({ opacity: "0" }))]),
    ]),
    trigger("translucentBackgroundAnimation", [
      transition(":leave", [
        style({ "background-color": "rgba(0, 0, 0, 0.35)" }),
        animate("0.3s ease-out", style({ "background-color": "rgba(0, 0, 0, 0)" })),
      ]),
    ]),
  ],
})
export class MarketplaceLeftBarMobileComponent {
  @Input() inTutorial: boolean = false;

  constructor(public globalVars: GlobalVarsService) {}
}
