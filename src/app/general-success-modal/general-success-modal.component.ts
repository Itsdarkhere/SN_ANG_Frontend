import { Component, OnInit, Input, Output, EventEmitter } from "@angular/core";
import { BsModalRef, BsModalService } from "ngx-bootstrap/modal";
import { GlobalVarsService } from "../global-vars.service";
import { BackendApiService, NFTEntryResponse, PostEntryResponse } from "../backend-api.service";
import * as _ from "lodash";
import { Router } from "@angular/router";
// import { InfiniteScroller } from "../infinite-scroller";
import { IAdapter, IDatasource } from "ngx-ui-scroll";
import { GoogleAnalyticsService } from "../google-analytics.service";
import { Location } from "@angular/common";
import { ToastrService } from "ngx-toastr";
import { CommentModalComponent } from "../comment-modal/comment-modal.component";

@Component({
  selector: "app-general-success-modal",
  templateUrl: "./general-success-modal.component.html",
  styleUrls: ["./general-success-modal.component.scss"],
})
export class GeneralSuccessModalComponent implements OnInit {
  static PAGE_SIZE = 50;
  static BUFFER_SIZE = 10;
  static WINDOW_VIEWPORT = false;
  static PADDING = 0.5;

  @Input() header: string;
  @Input() text: string;
  @Input() buttonText: string;

  constructor(
    private analyticsService: GoogleAnalyticsService,
    public globalVars: GlobalVarsService,
    private backendApi: BackendApiService,
    private modalService: BsModalService,
    public bsModalRef: BsModalRef,
    private router: Router,
    private toastr: ToastrService,
    private location: Location
  ) {}

  ngOnInit(): void {
    this.SendBidModalOpenedEvent();
  }

  SendBidModalOpenedEvent() {
    this.analyticsService.eventEmitter("bid_modal_opened", "usage", "activity", "click", 10);
  }

  generalSuccessModalButtonClicked() {
    this.router.navigate(["/u/" + this.globalVars?.loggedInUser?.ProfileEntryResponse.Username]);
    this.bsModalRef.hide();
  }
}
