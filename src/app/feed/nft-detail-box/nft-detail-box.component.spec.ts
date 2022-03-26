import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NftDetailBoxComponent } from './nft-detail-box.component';

describe('NftDetailBoxComponent', () => {
  let component: NftDetailBoxComponent;
  let fixture: ComponentFixture<NftDetailBoxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NftDetailBoxComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NftDetailBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
