import { ComponentFixture, TestBed } from "@angular/core/testing";

import { CollectionPageContentComponent } from "./collection-page-content.component";

describe("CollectionPageContentComponent", () => {
  let component: CollectionPageContentComponent;
  let fixture: ComponentFixture<CollectionPageContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CollectionPageContentComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionPageContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
