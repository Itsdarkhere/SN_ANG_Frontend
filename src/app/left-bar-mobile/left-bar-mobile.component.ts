import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { trigger, state, style, animate, transition } from "@angular/animations";
import { GlobalVarsService } from "../global-vars.service";

@Component({
  selector: "left-bar-mobile",
  templateUrl: "./left-bar-mobile.component.html",
  styleUrls: ["./left-bar-mobile.component.scss"],
  animations: [
    trigger("leftBarAnimation", [
      transition(":enter", [
        style({ transform: "scale(0)" }),
        animate("400ms ease", style({ transform: "scale(1)" })),
      ]),
      transition(":leave", [
        style({ transform: "scale(1)" }),
        animate("400ms ease", style({ transform: "scale(0)" })),
      ]),
    ]),
    trigger("translucentBackgroundAnimation", [
      transition(":enter", [
        style({ "background-color": "rgba(0, 0, 0, 0)" }),
        animate("10ms ease", style({ "background-color": "rgba(0, 0, 0, 0)" })),
      ]),
      transition(":leave", [
        style({ "background-color": "rgba(0, 0, 0, 0)" }),
        animate("10ms ease", style({ "background-color": "rgba(0, 0, 0, 0)" })),
      ]),
    ]),
  ],
})
export class LeftBarMobileComponent {
  @Input() inTutorial: boolean = false;

  constructor(public globalVars: GlobalVarsService) {}

  _closeMenu() {
    this.globalVars.isLeftBarMobileOpen = false;
  }
}
