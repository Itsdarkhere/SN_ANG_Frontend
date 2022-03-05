import { Component, Input, OnInit } from "@angular/core";
import "@google/model-viewer";

@Component({
  selector: "app-model",
  templateUrl: "./model.component.html",
  styleUrls: ["./model.component.scss"],
})
export class ModelComponent implements OnInit {
  @Input() postModelArweaveSrc: string;

  // modelSrc: string = "https://arweave.net/TE9t7DcyPA6bPU_lNx8tBzHzw7w5pt4-XaaFaXYemFc";

  // https://ipfs.io/ipfs/QmVLqaw72hFu2D4wii738ep4kXwbKZzQb4gutuJCUDMJxf/nft.glb

  constructor() {}

  ngOnInit(): void {
    console.log(this.postModelArweaveSrc);
  }
}
