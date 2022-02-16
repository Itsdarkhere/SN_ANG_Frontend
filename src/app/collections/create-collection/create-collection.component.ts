import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PostEntryResponse } from "../../backend-api.service";

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
          selectedNfts: this.fb.array([this.mapUserNftsToFormControls([])], [Validators.required, Validators.minLength(2)])
        })
      ])
    });
    console.log(this.collectionSelections.get("selectedNfts"));
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
  get selectedNfts(): AbstractControl {
    return this.collectionSelections.get("selectedNfts") as FormArray;
  }

  mapUserNftsToFormControls($event: PostEntryResponse[]){
    const nftFormControlArray = $event.map(element => {
      return this.fb.control(false);
    })
    console.log($event);
    return this.fb.array(nftFormControlArray);
  }

  submit(): void {
    console.log(this.createCollectionForm.value);
  }
}
