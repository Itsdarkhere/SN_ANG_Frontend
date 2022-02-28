import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-collection-failure',
  templateUrl: './collection-failure.component.html',
  styleUrls: ['./collection-failure.component.scss']
})
export class CollectionFailureComponent implements OnInit {
  @Input() error: string;
  constructor() { }

  ngOnInit(): void {
  }

}
