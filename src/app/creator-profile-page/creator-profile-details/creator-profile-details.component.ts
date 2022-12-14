import { ChangeDetectorRef, Component, EventEmitter, OnDestroy, OnInit, Output, ViewChild } from "@angular/core";
import { BackendApiService, ProfileEntryResponse, CollectionResponse } from "../../backend-api.service";
import { GlobalVarsService } from "../../global-vars.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Location, NumberSymbol } from "@angular/common";
import { SwalHelper } from "../../../lib/helpers/swal-helper";
import { CreatorProfileTopCardComponent } from "../creator-profile-top-card/creator-profile-top-card.component";
import { Title } from "@angular/platform-browser";
import { environment } from "src/environments/environment";
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from "@angular/fire/storage";
import { Observable } from "rxjs";
import { AngularFirestore } from "@angular/fire/firestore";

@Component({
  selector: "creator-profile-details",
  templateUrl: "./creator-profile-details.component.html",
  styleUrls: ["./creator-profile-details.component.scss"],
})
export class CreatorProfileDetailsComponent implements OnInit {
  @ViewChild(CreatorProfileTopCardComponent, { static: false }) childTopCardComponent;

  static TABS = {
    posts: "Posts",
    // Leaving this one in so old links will direct to the Coin Purchasers tab.
    "creator-coin": "Creator Coin",
    "coin-purchasers": "Creator Coin",
    collected: "Collected",
    created: "Created",
    collections: "Collections",
  };
  static TABS_LOOKUP = {
    Posts: "posts",
    "Creator Coin": "creator-coin",
    Collected: "collected",
    Created: "created",
    Collections: "collections",
  };

  tab_selector_tabs = ["Posts", "Created", "Collected", "Creator Coin"];
  tab_selector_icons = [
    "/assets/icons/profile_posts_icon.svg",
    "/assets/icons/profile_created_icon.svg",
    "/assets/icons/profile_collected_icon.svg",
    "/assets/icons/profile_cc_icon.svg",
  ];
  // "Collections",
  //  "/assets/icons/profile_collections_icon.svg",
  appData: GlobalVarsService;
  userName: string;
  profile: ProfileEntryResponse;
  activeTab: string;
  loading: boolean;
  profileCardUrl: any = "";
  showDefaultImage: boolean = false;
  // Firebase
  ref: AngularFireStorageReference;
  task: AngularFireUploadTask;
  uploadProgress: Observable<number>;

  profileData: any;

  collectionResponses: CollectionResponse[];
  loadingCollections = false;
  // emits the UserUnblocked event
  @Output() userUnblocked = new EventEmitter();

  constructor(
    private afStorage: AngularFireStorage,
    private globalVars: GlobalVarsService,
    private backendApi: BackendApiService,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private location: Location,
    private titleService: Title,
    private firestore: AngularFirestore
  ) {
    this.route.params.subscribe((params) => {
      this.userName = params.username;
      this.titleService.setTitle(this.userName + ` on ${environment.node.name}`);
      this.profileCardUrl = "";
      this._refreshContent();
    });
    this.route.queryParams.subscribe((params) => {
      this.activeTab =
        params.tab && params.tab in CreatorProfileDetailsComponent.TABS
          ? CreatorProfileDetailsComponent.TABS[params.tab]
          : "Posts";
    });
  }

  ngOnInit() {
    this.profileCardUrl = "";
    this.titleService.setTitle(this.userName + ` on ${environment.node.name}`);
  }
  userBlocked() {
    this.childTopCardComponent._unfollowIfBlocked();
  }

  unblockUser() {
    this.unblock();
  }
  click() {
    console.log(this.profile);
  }
  unblock() {
    SwalHelper.fire({
      target: this.globalVars.getTargetComponentSelector(),
      title: "Unblock user",
      html: `This user will appear in your feed and on your threads again`,
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-light",
        cancelButton: "btn btn-light no",
      },
      reverseButtons: true,
    }).then((response: any) => {
      this.userUnblocked.emit(this.profile.PublicKeyBase58Check);
      if (response.isConfirmed) {
        delete this.globalVars.loggedInUser.BlockedPubKeys[this.profile.PublicKeyBase58Check];
        this.backendApi
          .BlockPublicKey(
            this.globalVars.localNode,
            this.globalVars.loggedInUser.PublicKeyBase58Check,
            this.profile.PublicKeyBase58Check,
            true /* unblock */
          )
          .subscribe(
            () => {
              this.globalVars.logEvent("user : unblock");
            },
            (err) => {
              console.log(err);
              const parsedError = this.backendApi.stringifyError(err);
              this.globalVars.logEvent("user : unblock : error", { parsedError });
              this.globalVars._alertError(parsedError);
            }
          );
      }
    });
  }

  _isLoggedInUserFollowing() {
    if (!this.appData.loggedInUser?.PublicKeysBase58CheckFollowedByUser) {
      return false;
    }

    return this.appData.loggedInUser.PublicKeysBase58CheckFollowedByUser.includes(this.profile.PublicKeyBase58Check);
  }

  blockUser() {
    SwalHelper.fire({
      target: this.globalVars.getTargetComponentSelector(),
      title: "Block user?",
      html: `This will hide all comments from this user on your posts as well as hide them from your view on other threads.`,
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-light",
        cancelButton: "btn btn-light no",
      },
      reverseButtons: true,
    }).then((response: any) => {
      if (response.isConfirmed) {
        this.globalVars.loggedInUser.BlockedPubKeys[this.profile.PublicKeyBase58Check] = {};
        Promise.all([
          this.backendApi
            .BlockPublicKey(
              this.globalVars.localNode,
              this.globalVars.loggedInUser.PublicKeyBase58Check,
              this.profile.PublicKeyBase58Check
            )
            .subscribe(
              () => {
                this.globalVars.logEvent("user : block");
              },
              (err) => {
                console.error(err);
                const parsedError = this.backendApi.stringifyError(err);
                this.globalVars.logEvent("user : block : error", { parsedError });
                this.globalVars._alertError(parsedError);
              }
            ),
          // Unfollow this profile if we are currently following it.
          this.childTopCardComponent._unfollowIfBlocked(),
        ]);
      }
    });
  }

  _refreshContent() {
    if (this.loading) {
      return;
    }

    let readerPubKey = "";
    if (this.globalVars.loggedInUser) {
      readerPubKey = this.globalVars.loggedInUser.PublicKeyBase58Check;
    }

    this.loading = true;
    this.backendApi.GetSingleProfile(this.globalVars.localNode, "", this.userName).subscribe(
      (res) => {
        if (!res || res.IsBlacklisted) {
          this.loading = false;
          this.router.navigateByUrl("/" + this.appData.RouteNames.NOT_FOUND, { skipLocationChange: true });
          return;
        }
        this.profile = res.Profile;
        // Load profile until request has gone trough
        this.getProfileSocialsBackendApiCall();
        this.checkIfAddCollections();
        try {
          this.getBannerImage().catch(() => console.log("Error"));
        } catch (error) {
          console.log("Error");
        }
      },
      (_) => {
        this.loading = false;
      }
    );
  }
  allowedPKs = [
    "BC1YLi2CCqL4ptq9zBZP9XFSJfrupjvNwFHQu4g5Nc6y5WckhSZWmNm",
    "BC1YLhocSA7zKnroJGSCxDLm8aueLpvmKHTUUPa9PmsEY8rxTkGqiG8",
    "BC1YLhTgAHqJJLwD84GAeu3G6wm2miK1enixN7cCVMYWR97kfiRGrM3",
    "BC1YLgBZL9X2GsE4WVNAaQcS6mEyDdAh5Jq4RkJ7aA8uM4DZuwzBsth",
    "BC1YLieqjbv3UpApWUgstoXMZJKBwsQhDRfRoSPKq1opA7mc4hvjvEN",
    "BC1YLiuQcvSqFzRUaoSChucEXWSrj68Kmaepnbj7iQfo7eFzpBFVYJ2",
    "BC1YLiJziwbto5Loxdgq72wpJdAxqK5NU8ngoxGrVF14jt5h5k8uRTV",
    "BC1YLgXj87QsqYEQMQMgcMKDHqnxcsonMmtoA6vJMg5N9fd5j6sHrez",
    "BC1YLfibiKTP1kgacxP6ks7uZ1Ygm9UjgVxH3BoK79S1kfqn1Hjog6k",
    "BC1YLfqYfh7cJRiR1ks1ZwQH16rFwhZfM9YfK4RZAAgAUzZsqLyEFPe",
  ];
  checkIfAddCollections() {
    if (this.profile?.PublicKeyBase58Check == this.globalVars?.loggedInUser?.PublicKeyBase58Check) {
      if (this.allowedPKs.includes(this.profile?.PublicKeyBase58Check)) {
        this.tab_selector_icons.push("/assets/icons/profile_collections_icon.svg");
        this.tab_selector_tabs.push("Collections");
      }
    }
  }
  // first get photo ID from db, then get photo from storage
  // This version gets it straight from user publickey, so dont need to make an extra roundtrip to db
  async getBannerImage() {
    try {
      this.afStorage
        .ref(this.profile?.PublicKeyBase58Check)
        .getDownloadURL()
        .toPromise()
        .then(function (url) {
          url = url.replace(
            "https://firebasestorage.googleapis.com",
            "https://ik.imagekit.io/s93qwyistj0/banner-image/tr:w-975,h-250"
          );

          document.getElementById("banner-image").setAttribute("src", url);
          //this.profileCardUrl = url;
          document.getElementById("banner-image-blurred").setAttribute("src", url);
          //this.profileCardUrl = url;
        })
        .catch(() => (this.loading = false))
        //.then((res) => (this.profileCardUrl = res))
        .then(() => (this.loading = false));
    } catch (error) {
      console.log("Error");
    }
    this.loading = false;
  }

  // Make profileData into a class
  getProfileSocialsBackendApiCall() {
    this.backendApi.GetPGProfileDetails(this.globalVars.localNode, this.profile.PublicKeyBase58Check).subscribe(
      (res) => {
        this.profileData = res;
        console.log(` -------------- eth pk is ${JSON.stringify(this.profileData["ETHPublicKey"])}`);
      },
      (err) => {
        console.log(err);
      }
    );
  }

  // This version would get stuff from db, making it slower / but would bust the cache
  async getProfileSocials() {
    try {
      this.firestore
        .collection("profile-details")
        .doc(this.profile?.PublicKeyBase58Check)
        .valueChanges()
        .subscribe((res) =>
          this.afStorage
            .ref(this.profile?.PublicKeyBase58Check)
            .child(res["photoLocation"])
            .getDownloadURL()
            .toPromise()
            .then(function (url) {
              url = url.replace(
                "https://firebasestorage.googleapis.com",
                "https://ik.imagekit.io/s93qwyistj0/banner-image/tr:w-915,h-250"
              );
              document.getElementById("banner-image").setAttribute("src", url);
              this.profileCardUrl = url;
            })
            .then(() => (this.loading = false))
            .catch(() => (this.loading = false))
        );
    } catch (error) {
      console.log("Error");
    }
    this.loading = false;
  }
  _handleTabClick(tabName: string) {
    console.log(tabName);
    this.activeTab = tabName;
    // Update query params to reflect current tab
    const urlTree = this.router.createUrlTree([], {
      queryParams: { tab: CreatorProfileDetailsComponent.TABS_LOOKUP[tabName] || "posts" },
      queryParamsHandling: "merge",
      preserveFragment: true,
    });
    this.location.go(urlTree.toString());
  }
  tweetToClaimLink() {
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `Just setting up my ${environment.node.name} ????????\n\n${environment.node.url}/u/${this.userName}?public_key=${this.globalVars.loggedInUser.PublicKeyBase58Check}`
    )}`;
  }

  showProfileAsReserved() {
    return this.profile.IsReserved && this.profile.IsVerified;
  }

  isPubKeyBalanceless(): boolean {
    return (
      !this.globalVars.loggedInUser?.ProfileEntryResponse?.Username &&
      this.globalVars.loggedInUser?.UsersYouHODL?.length === 0
    );
  }
}
