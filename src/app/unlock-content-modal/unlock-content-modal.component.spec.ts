import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnlockContentModalComponent } from './unlock-content-modal.component';

describe('UnlockContentModalComponent', () => {
  let component: UnlockContentModalComponent;
  let fixture: ComponentFixture<UnlockContentModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UnlockContentModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UnlockContentModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
