import { Component, Input, OnInit } from '@angular/core';
import "@google/model-viewer/dist/model-viewer";

@Component({
  selector: 'app-model',
  templateUrl: './model.component.html',
  styleUrls: ['./model.component.scss']
})
export class ModelComponent implements OnInit {

  @Input() postModelArweaveSrc = "postModelArweaveSrc";

  modelSrc: string = "https://arweave.net/7GcRfq04kq5IlAc_dBdAXFN17joZjliLa9pWWQE3_H0";

  constructor() { }

  ngOnInit(): void {
  }

}
