import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NftCardRepostComponent } from './nft-card-repost.component';

describe('NftCardRepostComponent', () => {
  let component: NftCardRepostComponent;
  let fixture: ComponentFixture<NftCardRepostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NftCardRepostComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NftCardRepostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
