import { Component, OnInit } from "@angular/core";

@Component({
  selector: "app-deposit-eth",
  templateUrl: "./deposit-eth.component.html",
  styleUrls: ["./deposit-eth.component.scss"],
})
export class DepositEthComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
  openLink(link: string) {
    window.open(link, "_blank");
  }
}
