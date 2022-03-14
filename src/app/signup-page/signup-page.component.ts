import { Component, ComponentFactoryResolver, HostListener, OnInit } from "@angular/core";
import { GlobalVarsService } from "../global-vars.service";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable } from "rxjs";
import { BackendApiService } from "../backend-api.service";
import { AppRoutingModule, RouteNames } from "../app-routing.module";
import { SwalHelper } from "src/lib/helpers/swal-helper";
import { isNil } from "lodash";
import { MixpanelService } from "../mixpanel.service";

export type ProfileUpdates = {
  usernameUpdate: string;
  descriptionUpdate: string;
  profilePicUpdate: string;
};

export type ProfileUpdateErrors = {
  usernameError: boolean;
  descriptionError: boolean;
  profilePicError: boolean;
  founderRewardError: boolean;
};

@Component({
  selector: "app-signup-page",
  templateUrl: "./signup-page.component.html",
  styleUrls: ["./signup-page.component.scss"],
})
export class SignupPageComponent implements OnInit {
  RouteNames = RouteNames;
  stepNum = 1;
  creator = false;
  collector = false;
  mobile = false;
  usernameInput: string;
  profilePicInput: string = "/assets/img/nappi.png";
  updateProfileBeingCalled = false;
  founderRewardInput: number = 100;
  loggedInUserPublicKey = "";
  profileCardUrl: any = "";
  emailAddress = "";
  invalidEmailEntered = true;
  startedEnteringEmail = false;
  uploadProgress: Observable<number>;
  usernameValidationError: string;
  profileUpdates: ProfileUpdates = {
    usernameUpdate: "",
    descriptionUpdate: "",
    profilePicUpdate: "",
  };
  profileUpdateErrors: ProfileUpdateErrors = {
    usernameError: false,
    descriptionError: false,
    profilePicError: false,
    founderRewardError: false,
  };
  profileUpdated = false;

  constructor(
    public globalVars: GlobalVarsService,
    private route: ActivatedRoute,
    private mixPanel: MixpanelService,
    private router: Router,
    private backendApi: BackendApiService
  ) {
    this.route.queryParams.subscribe((params) => {
      this.stepNum = params.stepNum ? parseInt(params.stepNum) : 1;
    });
  }

  emailAddressInputClicked() {
    this.mixPanel.track22("Email address clicked");
    console.log(` -------------- email address clicked --------------- `);
  }

  verifyEmailClicked() {
    this.mixPanel.alias(this.globalVars.loggedInUser?.PublicKeyBase58Check);
    this.mixPanel.track23("Verify Email clicked");
    this.startedEnteringEmail = true;
    var emailAddressElement = <HTMLInputElement>document.getElementById("step3EmailAddress");
    var emailAddress = emailAddressElement.value;

    if (this.globalVars.emailRegExTest.test(emailAddress)) {
      this.invalidEmailEntered = false;
      this.nextStep();
    } else {
      this.invalidEmailEntered = true;
      emailAddressElement.style.border = "1px solid red";
      return;
    }
  }

  setMobileBasedOnViewport() {
    this.mobile = this.globalVars.isMobile();
  }

  _updateEmail() {
    this.mixPanel.track19("Update email");
    this.backendApi
      .UpdateUserGlobalMetadata(
        this.globalVars.localNode,
        this.globalVars.loggedInUser.PublicKeyBase58Check /*UpdaterPublicKeyBase58Check*/,
        this.emailAddress /*EmailAddress*/,
        null /*MessageReadStateUpdatesByContact*/
      )
      .subscribe(
        (res) => {},
        (err) => {
          // Analytics this
        }
      );
  }
  urlToObject = async () => {
    const response = await fetch("/assets/img/default_profile_pic.png");
    // here image is url/location of image
    const blob = await response.blob();
    const file = new File([blob], "image.png", { type: blob.type });
    this._readImageFileToProfilePicInput(file);
  };
  _readImageFileToProfilePicInput(file: Blob | File) {
    const reader = new FileReader();
    reader.readAsBinaryString(file);
    reader.onload = (event: any) => {
      const base64Image = btoa(event.target.result);
      this.profilePicInput = `data:${file.type};base64,${base64Image}`;
    };
  }
  updateProfileType() {
    this.mixPanel.track17("Update profile type");
    if (this.globalVars.loggedInUser.PublicKeyBase58Check) {
      return this.backendApi
        .UpdateCollectorOrCreator(
          this.globalVars.localNode,
          this.globalVars.loggedInUser?.PublicKeyBase58Check,
          this.creator,
          this.collector
        )
        .subscribe(
          (res) => {
            console.log(res);
          },
          (err) => {
            console.log(err);
          }
        );
      /*
      How the above was with firebase:

      return new Promise<any>((resolve, reject) => {
        this.firestore
          .collection("profile-details")
          .doc(this.globalVars.loggedInUser?.PublicKeyBase58Check)
          .set({
            twitter: "",
            website: "",
            discord: "",
            instagram: "",
            name: "",
            photoLocation: "",
            creator: this.creator,
            collector: this.collector,
          })
          .then(
            (res) => {},
            (err) => reject(err)
          );
      });*/
    }
  }
  _validateUsername(username) {
    this.mixPanel.track26("Validate Username");
    if (username === "") {
      return;
    }
    this.usernameValidationError = null;
    // Make sure username matches acceptable pattern
    const regex = new RegExp("^[a-zA-Z0-9_]*$", "g");
    if (!regex.test(username)) {
      this.usernameValidationError = "Username must only use letters, numbers, or underscores";
      return;
    }
    if (username !== this.globalVars.loggedInUser?.ProfileEntryResponse?.Username) {
      this.backendApi.GetSingleProfile(this.globalVars.localNode, "", username).subscribe(
        (res) => {
          if (!isNil(res)) {
            this.usernameValidationError = `${username} is already in use`;
          }
        },
        (err) => {
          console.log(err);
        }
      );
    }
  }
  @HostListener("window:resize")
  onResize() {
    this.setMobileBasedOnViewport();
  }
  ngOnInit() {
    this.setMobileBasedOnViewport();
    // Sets default profile picture for the user
    this.urlToObject();

    if (this.globalVars.needToPickCreatorOrCollector) {
      this.stepNum = 2;
      console.log(` -------------------- the user needs to pick creator or collector ----------------- `);
    }
  }
  login() {
    this.globalVars.launchLoginFlow();
  }
  signUp() {
    this.globalVars.launchSignupFlow();
  }
  nextStep() {
    if (this.stepNum === 2) {
      console.log(` ----------------- on step ${this.stepNum}`);
      this.updateProfileType();
      this.stepNum++;

      this.globalVars.needToPickCreatorOrCollector = false;
      if (this.creator) {
        this.globalVars.isCreator = true;
        this.globalVars.isCollector = false;
      }
      if (this.collector) {
        this.globalVars.isCreator = false;
        this.globalVars.isCollector = true;
      }

      return;
    }
    if (this.stepNum === 3) {
      console.log(` ----------------- on step ${this.stepNum}`);
      // if the email is valid then update the email
      if (!this.invalidEmailEntered) {
        this._updateEmail();
      }

      this.stepNum++;

      return;
    }
    if (this.stepNum === 4) {
      this.updateProfileType();
      if (this.globalVars.wantToVerifyPhone === false) {
        //   close nav bar because it will open on mobile
        if (this.globalVars.isMobileIphone()) {
          this.globalVars.closeLeftBarMobile();
        }

        this.router.navigate([RouteNames.COMPLETE_PROFILE]);
      }

      return;
    }
  }
  creatorSelected() {
    this.mixPanel.track24("Creator Selected");
    this.creator = true;
    this.collector = false;
  }
  collectorSelected() {
    this.mixPanel.track25("Collector Selected");
    this.collector = true;
    this.creator = false;
  }
  _setProfileErrors(): boolean {
    let hasErrors = false;
    if (this.usernameInput.length == 0) {
      this.profileUpdateErrors.usernameError = true;
      hasErrors = true;
    } else {
      this.profileUpdateErrors.usernameError = false;
    }

    if (
      this.profilePicInput == null ||
      this.profilePicInput.length == 0 ||
      this.profilePicInput.length > 5 * 1024 * 1024 //
    ) {
      this.profileUpdateErrors.profilePicError = true;
      hasErrors = true;
    } else {
      this.profileUpdateErrors.profilePicError = false;
    }

    if (typeof this.founderRewardInput != "number" || this.founderRewardInput < 0 || this.founderRewardInput > 100) {
      this.profileUpdateErrors.founderRewardError = true;
      hasErrors = true;
    } else {
      this.profileUpdateErrors.founderRewardError = false;
    }

    return hasErrors;
  }
  _setProfileUpdates() {
    const profileEntryResponse = this.globalVars.loggedInUser.ProfileEntryResponse;
    this.profileUpdates.usernameUpdate =
      profileEntryResponse?.Username !== this.usernameInput ? this.usernameInput : "";
    this.profileUpdates.profilePicUpdate =
      profileEntryResponse?.ProfilePic !== this.profilePicInput ? this.profilePicInput : "";
  }
  _callBackendUpdateProfile() {
    return this.backendApi.UpdateProfile(
      this.globalVars.localNode,
      this.globalVars.loggedInUser.PublicKeyBase58Check /*UpdaterPublicKeyBase58Check*/,
      "" /*ProfilePublicKeyBase58Check*/,
      // Start params
      this.profileUpdates.usernameUpdate /*NewUsername*/,
      this.profileUpdates.descriptionUpdate /*NewDescription*/,
      this.profileUpdates.profilePicUpdate /*NewProfilePic*/,
      this.founderRewardInput * 100 /*NewCreatorBasisPoints*/,
      1.25 * 100 * 100 /*NewStakeMultipleBasisPoints*/,
      false /*IsHidden*/,
      // End params
      this.globalVars.feeRateDeSoPerKB * 1e9 /*MinFeeRateNanosPerKB*/
    );
  }

  _updateProfile() {
    // Trim the username input in case the user added a space at the end. Some mobile
    // browsers may do this.
    this.usernameInput = this.usernameInput.trim();

    const hasErrors = this._setProfileErrors();
    if (hasErrors) {
      this.globalVars.logEvent("profile : update : has-errors", this.profileUpdateErrors);
      return;
    }

    this.updateProfileBeingCalled = true;
    this._setProfileUpdates();
    this._callBackendUpdateProfile().subscribe(
      (res) => {
        this.globalVars.profileUpdateTimestamp = Date.now();
        this.globalVars.logEvent("profile : update");
        // This updates things like the username that shows up in the dropdown.
        this.globalVars.updateEverything(res.TxnHashHex, this._updateProfileSuccess, this._updateProfileFailure, this);
      },
      (err) => {
        const parsedError = this.backendApi.parseProfileError(err);
        const lowBalance = parsedError.indexOf("insufficient");
        this.globalVars.logEvent("profile : update : error", { parsedError, lowBalance });
        this.updateProfileBeingCalled = false;
        SwalHelper.fire({
          target: this.globalVars.getTargetComponentSelector(),
          icon: "error",
          title: `An Error Occurred`,
          html: parsedError,
          showConfirmButton: true,
          focusConfirm: true,
          customClass: {
            confirmButton: "btn btn-light",
            cancelButton: "btn btn-light no",
          },
          confirmButtonText: lowBalance ? "Buy $DESO" : null,
          cancelButtonText: lowBalance ? "Later" : null,
          showCancelButton: !!lowBalance,
        }).then((res) => {
          if (lowBalance && res.isConfirmed) {
            this.router.navigate([RouteNames.BUY_DESO], { queryParamsHandling: "merge" });
          }
        });
      }
    );
  }
  _updateProfileSuccess(comp: SignupPageComponent) {
    this.mixPanel.track20("Update profile");
    comp.globalVars.celebrate();
    comp.updateProfileBeingCalled = false;
    comp.profileUpdated = true;
    comp.router.navigate([AppRoutingModule.profilePath(comp.globalVars.loggedInUser.ProfileEntryResponse.Username)]);
  }

  _updateProfileFailure(comp: SignupPageComponent) {
    comp.globalVars._alertError("Transaction broadcast successfully but read node timeout exceeded. Please refresh.");
    comp.updateProfileBeingCalled = false;
  }
}
