import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-create-collection',
  templateUrl: './create-collection.component.html',
  styleUrls: ['./create-collection.component.scss']
})
export class CreateCollectionComponent implements OnInit {

  createCollectionForm = new FormGroup({
    
  });

  ngOnInit(): void {
    this.generateCreateCollectionForm();
  }

  public generateCreateCollectionForm(): void {

  }

  // For Debugging
  public submitCreateCollectionForm(): void {
    console.log(this.createCollectionForm.value);
  }
}
