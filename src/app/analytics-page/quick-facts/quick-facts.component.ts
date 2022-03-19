import { Component, Input, OnInit } from "@angular/core";

@Component({
  selector: "app-quick-facts",
  templateUrl: "./quick-facts.component.html",
  styleUrls: ["./quick-facts.component.scss"],
})
export class QuickFactsComponent implements OnInit {
  @Input() label: string;
  @Input() value: number;
  constructor() {}

  ngOnInit(): void {}
}
