import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DepositEthComponent } from './deposit-eth.component';

describe('DepositEthComponent', () => {
  let component: DepositEthComponent;
  let fixture: ComponentFixture<DepositEthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DepositEthComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DepositEthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
