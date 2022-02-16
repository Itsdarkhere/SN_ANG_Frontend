import { animate, style, transition, trigger } from "@angular/animations";
import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";

@Component({
  selector: "app-action-response-slideup",
  templateUrl: "./action-response-slideup.component.html",
  styleUrls: ["./action-response-slideup.component.scss"],
  animations: [
    trigger("leftBarAnimation", [
      transition(":enter", [
        style({ transform: "translateY(100%)" }),
        animate("300ms cubic-bezier(0.175, 0.885, 0.32, 1.175)", style({ transform: "translateY(0%)" })),
      ]),
      transition(":leave", [
        style({ transform: "translateY(0%)" }),
        animate("300ms ease", style({ transform: "translateY(100%)" })),
      ]),
    ]),
    trigger("translucentBackgroundAnimation", [
      transition(":leave", [
        style({ "background-color": "rgba(0, 0, 0, 0.35)" }),
        animate("0.3s ease-out", style({ "background-color": "rgba(0, 0, 0, 0)" })),
      ]),
    ]),
  ],
})
// Techically this is very similar to action-response-modal
// But the animation just is much more difficult to pull off correctly in bsModalService
export class ActionResponseSlideupComponent implements OnInit {
  @Input() headingText: string;
  @Output() closeSlideUp = new EventEmitter();
  @Input() isOpen: boolean;
  @Input() mainText: string;
  @Input() buttonOneText: string;
  constructor() {}
  ngOnInit(): void {}

  dissmissReasonOne() {
    this.closeSlideUp.emit("routeToWallet");
  }
  dissmissReasonTwo() {
    this.closeSlideUp.emit("close");
  }
}
