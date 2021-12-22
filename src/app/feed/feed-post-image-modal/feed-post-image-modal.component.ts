import { Component, Input } from "@angular/core";
import { GlobalVarsService } from "../../global-vars.service";
import { BsModalRef } from "ngx-bootstrap/modal";



@Component({
  selector: "feed-post-image-modal",
  templateUrl: "./feed-post-image-modal.component.html",
  styleUrls: ["./feed-post-image-modal.component.scss"],
})
export class FeedPostImageModalComponent {
  @Input() imageURL: string;

  constructor(
    public globalVars: GlobalVarsService,
    public bsModalRef: BsModalRef,) 
    
    {}


    closeThisWindow(){
      this.bsModalRef.hide(); 
    }
}
