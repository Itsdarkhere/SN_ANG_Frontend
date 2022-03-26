import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EthMarketplaceLeftBarComponent } from './eth-marketplace-left-bar.component';

describe('EthMarketplaceLeftBarComponent', () => {
  let component: EthMarketplaceLeftBarComponent;
  let fixture: ComponentFixture<EthMarketplaceLeftBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EthMarketplaceLeftBarComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EthMarketplaceLeftBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
