import { Component } from '@angular/core';
import { CdkStepper } from '@angular/cdk/stepper';

@Component({
  selector: 'app-collection-stepper',
  templateUrl: './collection-stepper.component.html',
  styleUrls: ['./collection-stepper.component.scss'],
  providers: [{ provide: CdkStepper, useExisting: CollectionStepperComponent}]
})
export class CollectionStepperComponent extends CdkStepper {

  isNextButtonHidden() {
    return !(this.steps.length === this.selectedIndex + 1);
  }
}
