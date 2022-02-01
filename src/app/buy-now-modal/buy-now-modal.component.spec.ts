import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyNowModalComponent } from './buy-now-modal.component';

describe('BuyNowModalComponent', () => {
  let component: BuyNowModalComponent;
  let fixture: ComponentFixture<BuyNowModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuyNowModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyNowModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
