import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-collection',
  templateUrl: './create-collection.component.html',
  styleUrls: ['./create-collection.component.scss']
})
export class CreateCollectionComponent {
  constructor(private fb: FormBuilder) { }

  createCollectionForm = this.fb.group({
    collectionName: ["", Validators.required],
    collectionDescription: [""],
    collectionBannerImage: [""], 
    collectionSelections: this.fb.array([

    ])
  });
}
