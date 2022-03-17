import { Component, Input, OnInit } from "@angular/core";
import { GlobalVarsService } from "src/app/global-vars.service";

@Component({
  selector: "app-creator-list",
  templateUrl: "./creator-list.component.html",
  styleUrls: ["./creator-list.component.scss"],
})
export class CreatorListComponent implements OnInit {
  @Input() userList: [];
  @Input() label: string;
  @Input() label2: string;
  @Input() label3: string;
  constructor(public globalVars: GlobalVarsService) {}

  ngOnInit(): void {}
}
