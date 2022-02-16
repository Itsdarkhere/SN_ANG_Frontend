import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActionResponseModalComponent } from './action-response-modal.component';

describe('ActionResponseModalComponent', () => {
  let component: ActionResponseModalComponent;
  let fixture: ComponentFixture<ActionResponseModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ActionResponseModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ActionResponseModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
