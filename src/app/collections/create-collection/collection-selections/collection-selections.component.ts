import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-collection-selections',
  templateUrl: './collection-selections.component.html',
  styleUrls: ['./collection-selections.component.scss'],
})
export class CollectionSelectionsComponent implements OnInit {
  constructor() {}

  @Input() collectionSelections: FormGroup;
  @Input() selectedNfts: FormArray;

  ngOnInit(): void {
  }
}
