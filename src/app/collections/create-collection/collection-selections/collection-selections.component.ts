import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-collection-selections',
  templateUrl: './collection-selections.component.html',
  styleUrls: ['./collection-selections.component.scss']
})
export class CollectionSelectionsComponent implements OnInit {

  @Input() createCollectionForm: FormGroup;
  @Input() views: FormArray;
  @Input() collectionSelections: FormGroup;

  ngOnInit(): void {
  }

}
