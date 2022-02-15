import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PostEntryResponse } from "../../backend-api.service";

@Component({
  selector: 'app-create-collection',
  templateUrl: './create-collection.component.html',
  styleUrls: ['./create-collection.component.scss']
})
export class CreateCollectionComponent implements OnInit {
  constructor(private fb: FormBuilder) { }

  createCollectionForm: FormGroup;
  selectedNftData = {}

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
          selectedNfts: this.fb.array([], [Validators.required, Validators.minLength(2)])
        })
      ])
    });
    console.log(this.collectionSelections.get("selectedNfts"));
    // this.selectedNfts = this.createCollectionForm.controls.views["controls"][1].controls.selectedNfts.value;
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

  selectedNfts(): FormArray {
    return this.collectionSelections.get("selectedNfts") as FormArray;
  }

  addNftToFormArray($event: object) {
    // console.log($event["i"]);
    if(!this.selectedNfts()["controls"].includes($event["post"])) {
      this.selectedNfts().insert($event["i"], this.fb.control($event["post"]));
    }
    
    console.log(this.selectedNfts().value);
    // if($event instanceof nftControls) {
    //   console.log(this.selectedNfts);
    // }
  
    
   
    // if(!this.selectedNfts.contains(post)) {
    // }
    // console.log(this.selectedNfts);
  }

  removeNftFromFormArray(post: object) {
    // if(this.selectedNfts.includes(post)) {
      
    // }
    // console.log(this.selectedNfts);
  }

  submit(): void {
    console.log(this.createCollectionForm.value);
  }
}
