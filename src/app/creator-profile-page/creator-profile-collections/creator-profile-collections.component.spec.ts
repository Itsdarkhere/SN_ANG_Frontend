import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CreatorProfileCollectionsComponent } from "./creator-profile-collections.component";

describe("CreatorProfileCollectionsComponent", () => {
  let component: CreatorProfileCollectionsComponent;
  let fixture: ComponentFixture<CreatorProfileCollectionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreatorProfileCollectionsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatorProfileCollectionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
