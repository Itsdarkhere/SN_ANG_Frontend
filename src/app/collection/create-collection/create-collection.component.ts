import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-create-collection',
  templateUrl: './create-collection.component.html',
  styleUrls: ['./create-collection.component.scss']
})
export class CreateCollectionComponent implements OnInit {
  constructor() { }

  ngOnInit(): void {
  }

  onSubmit(value: any): void {
    console.log(value);
  }
}
