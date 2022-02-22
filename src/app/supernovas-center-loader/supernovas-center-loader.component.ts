import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-supernovas-center-loader',
  templateUrl: './supernovas-center-loader.component.html',
  styleUrls: ['./supernovas-center-loader.component.scss']
})
export class SupernovasCenterLoaderComponent {
  @Input() height = 400;

  constructor() {}

  getHeight() {
    return `${this.height.toString()}px`;
  }

}
