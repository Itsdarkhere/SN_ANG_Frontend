import { Component, Input, OnInit } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-collection-details',
  templateUrl: './collection-details.component.html',
  styleUrls: ['./collection-details.component.scss']
})
export class CollectionDetailsComponent implements OnInit {

  @Input() createCollectionForm: FormGroup;
  @Input() views: FormArray;
  @Input() collectionDetails: FormGroup;

  ngOnInit(): void {  
  }

}
