import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NftEditionDropdownComponent } from './nft-edition-dropdown.component';

describe('NftEditionDropdownComponent', () => {
  let component: NftEditionDropdownComponent;
  let fixture: ComponentFixture<NftEditionDropdownComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NftEditionDropdownComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NftEditionDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
