import { ComponentFixture, TestBed } from "@angular/core/testing";

import { TradeCreatorBuyComponent } from "./trade-creator-buy.component";

describe("TradeCreatorBuyComponent", () => {
  let component: TradeCreatorBuyComponent;
  let fixture: ComponentFixture<TradeCreatorBuyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TradeCreatorBuyComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TradeCreatorBuyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
