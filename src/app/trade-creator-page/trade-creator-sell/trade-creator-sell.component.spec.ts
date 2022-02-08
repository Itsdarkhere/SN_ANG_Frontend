import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeCreatorSellComponent } from './trade-creator-sell.component';

describe('TradeCreatorSellComponent', () => {
  let component: TradeCreatorSellComponent;
  let fixture: ComponentFixture<TradeCreatorSellComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TradeCreatorSellComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TradeCreatorSellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
