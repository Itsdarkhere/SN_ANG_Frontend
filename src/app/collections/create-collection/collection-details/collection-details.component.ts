import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';

@Component({
  selector: 'app-collection-details',
  templateUrl: './collection-details.component.html',
  styleUrls: ['./collection-details.component.scss']
})
export class CollectionDetailsComponent implements OnInit {
  // constructor(private rootForm: FormGroupDirective) { }
  
  // Nested child form group from root createCollectionForm
  // @Input() formGroupName: string;
  
  // collectionDetailsForm!: FormGroup;

  ngOnInit(): void {
    // this.collectionDetailsForm = this.rootForm.control.get(this.formGroupName) as FormGroup;
  }

}
