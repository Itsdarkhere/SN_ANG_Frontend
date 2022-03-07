import { Component, Input, OnInit } from "@angular/core";
import "@google/model-viewer";

@Component({
  selector: "app-model",
  templateUrl: "./model.component.html",
  styleUrls: ["./model.component.scss"],
})
export class ModelComponent implements OnInit {
  @Input() postModelArweaveSrc: string;

  constructor() {}

  ngOnInit(): void {
    console.log(this.postModelArweaveSrc);
  }
}
