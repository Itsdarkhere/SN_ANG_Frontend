import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralSuccessModalComponent } from './general-success-modal.component';

describe('GeneralSuccessModalComponent', () => {
  let component: GeneralSuccessModalComponent;
  let fixture: ComponentFixture<GeneralSuccessModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GeneralSuccessModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GeneralSuccessModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
