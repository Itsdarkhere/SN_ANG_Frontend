import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NftCardMinimalComponent } from './nft-card-minimal.component';

describe('NftCardMinimalComponent', () => {
  let component: NftCardMinimalComponent;
  let fixture: ComponentFixture<NftCardMinimalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NftCardMinimalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NftCardMinimalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
