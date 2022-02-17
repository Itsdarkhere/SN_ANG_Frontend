import { Component, ComponentFactoryResolver, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';

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
        // This group may seem extraneous, but is actually beneficial for our UI structure
        this.fb.group({
          collectionNfts: this.fb.array([], [Validators.required, Validators.minLength(3)])
        })
      ])
    });
    console.log(this.createCollectionForm)
    this.createCollectionForm.valueChanges.subscribe(console.info);
  }

  get views(): AbstractControl {
    return this.createCollectionForm.get("views");
  }

  get collectionDetails(): AbstractControl {
    return this.createCollectionForm.controls.views["controls"][0] as FormGroup;
  }

  get collectionSelections(): AbstractControl {
    return this.createCollectionForm.controls.views["controls"][1] as FormGroup;
  }

  // Not sure if this function will be needed – consider removing later
  get collectionNfts(): AbstractControl {
    return this.collectionSelections["controls"] as FormArray;
  }

  submit(): void {
    console.log(this.createCollectionForm.value);
  }
}
