import { animate, query, stagger, style, transition, trigger } from "@angular/animations";
import { Component, Input, OnInit } from "@angular/core";
import { GlobalVarsService } from "src/app/global-vars.service";

@Component({
  selector: "app-creator-list",
  templateUrl: "./creator-list.component.html",
  styleUrls: ["./creator-list.component.scss"],
  animations: [
    trigger("listAnimation", [
      transition("* => *", [
        // each time the binding value changes
        query(":enter", [style({ opacity: 0 }), stagger(100, [animate("0.3s", style({ opacity: 1 }))])]),
      ]),
    ]),
  ],
})
export class CreatorListComponent implements OnInit {
  @Input() userList: [];
  @Input() label: string;
  @Input() label2: string;
  @Input() label3: string;
  constructor(public globalVars: GlobalVarsService) {}

  ngOnInit(): void {}
}
