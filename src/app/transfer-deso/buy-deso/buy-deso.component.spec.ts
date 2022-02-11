import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyDesoComponent } from './buy-deso.component';

describe('BuyDesoComponent', () => {
  let component: BuyDesoComponent;
  let fixture: ComponentFixture<BuyDesoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuyDesoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyDesoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
