import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormGroupDirective } from '@angular/forms';

@Component({
  selector: 'app-collection-details',
  templateUrl: './collection-details.component.html',
  styleUrls: ['./collection-details.component.scss']
})
export class CollectionDetailsComponent implements OnInit {
  constructor(private rootForm: FormGroupDirective) { }
  
  @Input() collectionDetailsGroup: {};
  
  createCollectionForm!: FormGroup;

  ngOnInit(): void {
    this.createCollectionForm = this.rootForm.control;
  }

}
