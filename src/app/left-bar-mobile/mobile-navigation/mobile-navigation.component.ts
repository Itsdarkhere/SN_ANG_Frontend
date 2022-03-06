import { Component, EventEmitter, OnInit, Output } from "@angular/core";

@Component({
  selector: "app-mobile-navigation",
  templateUrl: "./mobile-navigation.component.html",
  styleUrls: ["./mobile-navigation.component.scss"],
})
export class MobileNavigationComponent implements OnInit {
  @Output() closeMobile = new EventEmitter<boolean>();
  constructor() {}

  ngOnInit(): void {}
}
