import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NftCardPostComponent } from './nft-card-post.component';

describe('NftCardPostComponent', () => {
  let component: NftCardPostComponent;
  let fixture: ComponentFixture<NftCardPostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NftCardPostComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NftCardPostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
