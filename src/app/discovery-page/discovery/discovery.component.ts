import { Component, Input, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { PostEntryResponse } from "src/app/backend-api.service";
import { GlobalVarsService } from "src/app/global-vars.service";
import { BsModalService } from "ngx-bootstrap/modal";
import { FeedPostImageModalComponent } from "src/app/feed/feed-post-image-modal/feed-post-image-modal.component";

@Component({
  selector: "app-discovery",
  templateUrl: "./discovery.component.html",
  styleUrls: ["./discovery.component.scss"],
})
export class DiscoveryComponent implements OnInit {
  @Input() post: PostEntryResponse;
  hasImageLoaded = false;
  constructor(
    //private route: DiscoveryRoute,
    private router: Router,
    public modalService: BsModalService,
    public globalVars: GlobalVarsService
  ) {}
  imageLoaded() {
    this.hasImageLoaded = true;
  }
  ngOnInit(): void {}

  openImgModal(event, imageURL) {
    event.stopPropagation();
    this.modalService.show(FeedPostImageModalComponent, {
      class: "modal-dialog-centered img_popups modal-lg",
      initialState: {
        imageURL,
      },
    });
  }
}
