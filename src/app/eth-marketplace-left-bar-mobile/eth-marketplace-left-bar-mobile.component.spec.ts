import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EthMarketplaceLeftBarMobileComponent } from './eth-marketplace-left-bar-mobile.component';

describe('EthMarketplaceLeftBarMobileComponent', () => {
  let component: EthMarketplaceLeftBarMobileComponent;
  let fixture: ComponentFixture<EthMarketplaceLeftBarMobileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EthMarketplaceLeftBarMobileComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EthMarketplaceLeftBarMobileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
