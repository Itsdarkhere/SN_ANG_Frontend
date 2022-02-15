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
  selectedNfts: Array<object> = [];

  ngOnInit(): void {
    this.createCollectionForm = this.fb.group({
      views: this.fb.array([
        this.fb.group({
          collectionName: ["", Validators.required],
          collectionDescription: [""],
          collectionBannerImage: [""], 
        }),
        // This group may seem extraneous, but is actually necessary because of the way the FormBuilder API works
        this.fb.group({
          selectedNfts: ([[], [Validators.required, Validators.minLength(2)]])
        })
      ])
    });
    this.selectedNfts = this.createCollectionForm.controls.views["controls"][1].controls.selectedNfts.value;
    console.log(this.createCollectionForm.controls.views["controls"][1].controls.selectedNfts);
    // console.log(this.createCollectionForm.controls.views["controls"][1]["controls"][0]);
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

  addNftToFormArray(post: object) {
    if(!this.selectedNfts.includes(post)) {
      this.selectedNfts.push(post);
    }
    console.log(this.selectedNfts);
  }

  removeNftFromFormArray() {
    // if()
    // this.selectedNfts.removeAt()
  }

  onChange() {
    // console.log(this.selectedNfts["controls"][0]);
  }

  submit(): void {
    console.log(this.createCollectionForm.value);
  }
}
