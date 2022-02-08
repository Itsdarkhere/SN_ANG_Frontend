import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-create-collection',
  templateUrl: './create-collection.component.html',
  styleUrls: ['./create-collection.component.scss']
})
export class CreateCollectionComponent implements OnInit {
  constructor(private fb: FormBuilder) { }

  createCollectionForm: FormGroup;

  ngOnInit(): void {
    this.createCollectionForm = this.fb.group({
      views: this.fb.array([
        this.fb.group({
          collectionName: ["", Validators.required],
          collectionDescription: [""],
          collectionBannerImage: [""], 
        }),
        this.fb.group({
          
        })
      ])
    });
  }

  get views(): AbstractControl {
    return this.createCollectionForm.get("views");
  }
}
