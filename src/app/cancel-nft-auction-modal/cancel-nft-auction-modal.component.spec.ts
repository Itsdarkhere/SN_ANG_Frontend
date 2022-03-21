import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelNftAuctionModalComponent } from './cancel-nft-auction-modal.component';

describe('CancelNftAuctionModalComponent', () => {
  let component: CancelNftAuctionModalComponent;
  let fixture: ComponentFixture<CancelNftAuctionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CancelNftAuctionModalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelNftAuctionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
