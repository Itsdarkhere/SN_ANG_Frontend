import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyEthComponent } from './buy-eth.component';

describe('BuyEthComponent', () => {
  let component: BuyEthComponent;
  let fixture: ComponentFixture<BuyEthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BuyEthComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BuyEthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
