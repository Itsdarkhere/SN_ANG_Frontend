import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeCreatorTransferComponent } from './trade-creator-transfer.component';

describe('TradeCreatorTransferComponent', () => {
  let component: TradeCreatorTransferComponent;
  let fixture: ComponentFixture<TradeCreatorTransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TradeCreatorTransferComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TradeCreatorTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
