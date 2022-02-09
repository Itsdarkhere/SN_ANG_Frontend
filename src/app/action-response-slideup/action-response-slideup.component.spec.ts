import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionResponseSlideupComponent } from './action-response-slideup.component';

describe('ActionResponseSlideupComponent', () => {
  let component: ActionResponseSlideupComponent;
  let fixture: ComponentFixture<ActionResponseSlideupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionResponseSlideupComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionResponseSlideupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
