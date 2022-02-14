import { Component, Input, OnInit } from "@angular/core";
import * as _ from "lodash";
import { PostEntryResponse } from "src/app/backend-api.service";
import { EmbedUrlParserService } from "src/lib/services/embed-url-parser-service/embed-url-parser-service";
import { BackendApiService } from "src/app/backend-api.service";
import { GlobalVarsService } from "src/app/global-vars.service";

@Component({
  selector: "app-nft-card-post",
  templateUrl: "./nft-card-post.component.html",
  styleUrls: ["./nft-card-post.component.scss"],
})
export class NftCardPostComponent implements OnInit {
  postContent: any;
  reposterProfile: any;
  _post: any;
  quotedContent: any;
  constructedEmbedURL: any;
  nftEntryResponses: any;
  @Input() afterCommentCreatedCallback: any = null;
  @Input() afterRepostCreatedCallback: any = null;
  @Input() parentPost: any;
  @Input()
  get post(): PostEntryResponse {
    return this._post;
  }
  set post(post: PostEntryResponse) {
    this._post = post;
    if (this.isRepost(post)) {
      this.postContent = post.RepostedPostEntryResponse;
      this.reposterProfile = post.ProfileEntryResponse;
      if (this.isQuotedClout(post.RepostedPostEntryResponse)) {
        this.quotedContent = this.postContent.RepostedPostEntryResponse;
      }
    } else if (this.isQuotedClout(post)) {
      this.postContent = post;
      this.quotedContent = post.RepostedPostEntryResponse;
    } else {
      this.postContent = post;
    }
    this.setEmbedURLForPostContent();
  }

  constructor(public globalVars: GlobalVarsService, public backendApi: BackendApiService) {}

  setEmbedURLForPostContent() {
    EmbedUrlParserService.getEmbedURL(
      this.backendApi,
      this.globalVars,
      this.postContent.PostExtraData["EmbedVideoURL"]
    ).subscribe((res) => {
      this.constructedEmbedURL = res;
    });
  }

  isRepost(post: any): boolean {
    return post.Body === "" && (!post.ImageURLs || post.ImageURLs?.length === 0) && post.RepostedPostEntryResponse;
  }
  isQuotedClout(post: any): boolean {
    return (post.Body !== "" || post.ImageURLs?.length > 0) && post.RepostedPostEntryResponse;
  }
  isRegularPost(post: any): boolean {
    return !this.isRepost(post) && !this.isQuotedClout(post);
  }

  ngOnInit(): void {}
}
