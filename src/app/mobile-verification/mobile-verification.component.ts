import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { CountryISO } from "ngx-intl-tel-input";
import { GlobalVarsService } from "../global-vars.service";
import { BackendApiService } from "../backend-api.service";
import { MessagesInboxComponent } from "../messages-page/messages-inbox/messages-inbox.component";
import { animate, style, transition, trigger } from "@angular/animations";

import { IdentityService } from "../identity.service";

import { ActivatedRoute, Router } from "@angular/router";
import { AppRoutingModule, RouteNames } from "../app-routing.module";

@Component({
  selector: "app-mobile-verification",
  templateUrl: "./mobile-verification.component.html",
  styleUrls: ["./mobile-verification.component.scss"],
})
export class MobileVerificationComponent implements OnInit {
  static CREATE_PHONE_NUMBER_VERIFICATION_SCREEN = "create_phone_number_verification_screen";
  static SUBMIT_PHONE_NUMBER_VERIFICATION_SCREEN = "submit_phone_number_verification_screen";
  static COMPLETED_PHONE_NUMBER_VERIFICATION_SCREEN = "completed_phone_number_verification_screen";

  @Input() displayForSignupFlow = false;
  @Output() backToPreviousSignupStepClicked = new EventEmitter();
  @Output() phoneNumberVerified = new EventEmitter();
  @Output() skipButtonClicked = new EventEmitter();

  @Output("nextStep") nextStep: EventEmitter<any> = new EventEmitter();
  @Input() stepNum: number;

  MessagesInboxComponent = MessagesInboxComponent;

  phoneForm = new FormGroup({
    phone: new FormControl(undefined, [Validators.required]),
  });
  verificationCodeForm = new FormGroup({
    verificationCode: new FormControl(undefined, [Validators.required]),
  });

  CountryISO = CountryISO;
  sendingPhoneNumberVerificationText = false;
  submittingPhoneNumberVerificationCode = false;
  verificationStep = false;
  screenToShow = null;
  //screenToShow = SignUpGetStarterDeSoComponent.SUBMIT_PHONE_NUMBER_VERIFICATION_SCREEN;
  SignUpGetStarterDeSoComponent = MobileVerificationComponent;
  phoneNumber: string;
  phoneNumberCountryCode: string = null;
  resentVerificationCode = false;
  sendPhoneNumberVerificationTextServerErrors = new SendPhoneNumberVerificationTextServerErrors();
  submitPhoneNumberVerificationCodeServerErrors = new SubmitPhoneNumberVerificationCodeServerErrors();

  digitElementFullId: any;
  digitElementId: string;
  digitNumberString: string;
  digitNumberInt: number;
  firstDigitEntered: boolean;
  digitOneValue: string;
  digitTwoValue: string;
  digitThreeValue: string;
  digitFourValue: string;
  //   inputValue: any;
  //   digitCounter: number;
  //   digitCounterString: string;
  verificationCodeString: string;
  verificationCodeCorrectLength: boolean;

  isPhoneNumberVerificationTextServerErrorFree: boolean;

  constructor(
    public globalVars: GlobalVarsService,
    private backendApi: BackendApiService,
    private identityService: IdentityService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this._setScreenToShow();

    // this.digitCounter = 1;
    this.firstDigitEntered = false;
    this.digitNumberString = "1";
    this.verificationCodeString = "";
    this.verificationCodeCorrectLength = false;
  }

  _nextStep(verify: boolean) {
    if (verify) {
      this.globalVars.wantToVerifyPhone = true;
    } else {
      this.globalVars.wantToVerifyPhone = false;
    }

    this.nextStep.emit();
  }

  onKey(event: any) {
    this.onVerificationCodeInputChanged();

    let digitString = "digit";
    this.digitElementId = event.target.id;
    this.digitNumberString = this.digitElementId.split("digit")[1];
    console.log(`--------------- digitNumberString is ${this.digitNumberString}`);

    if (event.code === "Backspace") {
      console.log(` -------------- backspace was clicked ---------------`);
      if (this.digitNumberString === "1") {
        this.digitOneValue = "";
        this.verificationCodeString = "";
        console.log(` ---------------- digitOneValue is ${this.digitOneValue}`);
        this.verificationCodeCorrectLength = false;
        return;
      } else if (this.digitNumberString === "2") {
        this.digitTwoValue = "";
        this.verificationCodeString = "";
        console.log(` ---------------- digitTwoValue is ${this.digitTwoValue}`);
        this.verificationCodeCorrectLength = false;
        return;
      } else if (this.digitNumberString === "3") {
        this.digitThreeValue = "";
        this.verificationCodeString = "";
        console.log(` ---------------- digitThreeValue is ${this.digitThreeValue}`);
        this.verificationCodeCorrectLength = false;
        return;
      } else {
        this.digitFourValue = "";
        this.verificationCodeString = "";
        console.log(` ---------------- digitFourValue is ${this.digitFourValue}`);
        this.verificationCodeCorrectLength = false;
        return;
      }
    }

    // if digitNumberString is 1 you know the user has entered in the first number and you need to enable the next digit to be focused
    if (this.digitNumberString === "1") {
      // if the other 3 digits are filled out then skip to digit 4
      if (this.digitTwoValue && this.digitThreeValue && this.digitFourValue) {
        this.digitNumberString = "4";
      } else {
        document.getElementById("digit2").style.pointerEvents = "auto";
      }
      this.digitOneValue = event.target.value;
    }

    if (this.digitNumberString === "2") {
      // if the other 3 digits are filled out then skip to digit 4
      if (this.digitOneValue && this.digitThreeValue && this.digitFourValue) {
        this.digitNumberString = "4";
      } else {
        document.getElementById("digit3").style.pointerEvents = "auto";
      }
      this.digitTwoValue = event.target.value;
    }

    if (this.digitNumberString === "3") {
      // if the other 3 digits are filled out then skip to digit 4
      if (this.digitOneValue && this.digitTwoValue && this.digitFourValue) {
        this.digitNumberString = "4";
      } else {
        document.getElementById("digit4").style.pointerEvents = "auto";
      }
      this.digitThreeValue = event.target.value;
    }

    if (this.digitNumberString === "4") {
      document.getElementById("digit2").style.pointerEvents = "auto";
      document.getElementById("digit3").style.pointerEvents = "auto";
      document.getElementById("digit4").style.pointerEvents = "auto";
      this.digitFourValue = (<HTMLInputElement>document.getElementById("digit4")).value;

      console.log(` ------------ is on 4th digit `);
      console.log(` ------------------ digit 1 ${this.digitOneValue}`);
      console.log(` ------------------ digit 2 ${this.digitTwoValue}`);
      console.log(` ------------------ digit 3 ${this.digitThreeValue}`);
      console.log(` ------------------ digit 4 ${this.digitFourValue}`);

      this.verificationCodeString = this.verificationCodeString.concat(
        this.digitOneValue,
        this.digitTwoValue,
        this.digitThreeValue,
        this.digitFourValue
      );
      console.log(` ------------------ this.verificationCodeString ${this.verificationCodeString}`);

      if (this.verificationCodeString.length === 4) {
        console.log(` --------------- full verification code entered ------------------ `);
        this.verificationCodeCorrectLength = true;
        return;
      } else {
        this.verificationCodeCorrectLength = false;
        return;
      }
    }

    this.digitNumberInt = parseInt(this.digitNumberString) + 1;
    this.digitNumberString = this.digitNumberInt.toString(); //'2'
    this.digitElementFullId = digitString.concat(this.digitNumberString);
    console.log(document.getElementById(this.digitElementFullId));

    document.getElementById(this.digitElementFullId).focus();

    // this.inputValue = event.target.value;
    // this.digitCounter = this.digitCounter + 1;
    // this.digitCounterString = this.digitCounter.toString();

    // this.verificationCodeString = this.verificationCodeString.concat(this.inputValue.toString());

    // if (this.digitCounterString === "5") {
    //   console.log(
    //     ` ---------------------- verification code string ${this.verificationCodeString} ----------------------- `
    //   );

    //   return;
    // }

    // document.getElementById(`digit${this.digitCounterString}`).focus();
  }

  completeVerificationButtonClicked() {
    this.router.navigate([RouteNames.COMPLETE_PROFILE]);
  }

  _setScreenToShow() {
    // TODO: refactor silly setInterval
    let interval = setInterval(() => {
      if (this.globalVars.loggedInUser.HasPhoneNumber == null) {
        // Wait until we've loaded the HasPhoneNumber boolean from the server
        return;
      }

      if (this.globalVars.loggedInUser.HasPhoneNumber) {
        this.screenToShow = MobileVerificationComponent.COMPLETED_PHONE_NUMBER_VERIFICATION_SCREEN;
      } else {
        this.screenToShow = MobileVerificationComponent.CREATE_PHONE_NUMBER_VERIFICATION_SCREEN;
      }

      clearInterval(interval);
    }, 50);
  }
  backToPreviousSignupStepOnClick() {
    this.backToPreviousSignupStepClicked.emit();
  }

  backButtonClickedOnSubmitVerificationScreen() {
    this.screenToShow = MobileVerificationComponent.CREATE_PHONE_NUMBER_VERIFICATION_SCREEN;
  }

  sendVerificationText() {
    if (this.phoneForm.invalid) {
      return;
    }
    this.verificationStep = true;
    this.globalVars.logEvent("account : create : send-verification-text");
    this._sendPhoneNumberVerificationText();
    if (this.isPhoneNumberVerificationTextServerErrorFree) {
      this._nextStep(true);
    } else {
      return;
    }

    // https://docs.deso.org/identity/window-api/endpoints#verify-phone-number
    // this.identityService
    //   .launchPhoneNumberVerification(this.globalVars?.loggedInUser?.PublicKeyBase58Check)
    //   .subscribe((res) => {
    //     if (res.phoneNumberSuccess) {
    //       this.globalVars.updateEverything().add(() => {
    //         // this.stepNum = 1;
    //         this.router.navigate([RouteNames.BROWSE]);
    //       });
    //     }
    //   });
  }

  resendVerificationCode(event) {
    event.stopPropagation();
    event.preventDefault();

    // Return if the user just resent the verification code (to prevent multiple unnecessary texts)
    if (this.resentVerificationCode) {
      return false;
    }

    // Clear any existing resend-related errors
    this.sendPhoneNumberVerificationTextServerErrors = new SendPhoneNumberVerificationTextServerErrors();

    this.globalVars.logEvent("account : create : resend-phone-number");
    this._sendPhoneNumberVerificationText();

    // Display a success indicator
    this.resentVerificationCode = true;
    setTimeout(() => (this.resentVerificationCode = false), 5000);

    return false;
  }

  submitVerificationCode() {
    // if (this.verificationCodeForm.invalid) {
    //   return;
    // }

    if (!this.verificationCodeCorrectLength) {
      return;
    }

    this.globalVars.logEvent("account : create : submit-verification-code");
    this._submitPhoneNumberVerificationCode();
  }

  onSkipButtonClicked() {
    this.skipButtonClicked.emit();
  }

  onPhoneNumberInputChanged() {
    this.sendPhoneNumberVerificationTextServerErrors = new SendPhoneNumberVerificationTextServerErrors();
  }

  onVerificationCodeInputChanged() {
    this.submitPhoneNumberVerificationCodeServerErrors = new SubmitPhoneNumberVerificationCodeServerErrors();
  }

  _sendPhoneNumberVerificationText() {
    this.phoneNumber = this.phoneForm.value.phone?.e164Number;
    this.phoneNumberCountryCode = this.phoneForm.value.phone?.countryCode;
    this.sendingPhoneNumberVerificationText = true;

    this.backendApi
      .SendPhoneNumberVerificationText(
        this.globalVars.localNode,
        this.globalVars.loggedInUser.PublicKeyBase58Check /*UpdaterPublicKeyBase58Check*/,
        this.phoneNumber /*PhoneNumber*/,
        this.phoneNumberCountryCode /*PhoneNumberCountryCode*/
      )
      .subscribe(
        (res) => {
          this.screenToShow = MobileVerificationComponent.SUBMIT_PHONE_NUMBER_VERIFICATION_SCREEN;
          this.globalVars.logEvent("account : create : send-verification-text: success");

          this.globalVars.wantToVerifyPhone = true;
          this.globalVars.phoneVerified = false;
          this.isPhoneNumberVerificationTextServerErrorFree = true;
        },
        (err) => {
          this._parseSendPhoneNumberVerificationTextServerErrors(err);
          this.isPhoneNumberVerificationTextServerErrorFree = false;
          console.log(
            ` -------------- phoneNumberAlreadyInUseVariable ${this.sendPhoneNumberVerificationTextServerErrors.phoneNumberAlreadyInUse} ------------- `
          );
          console.log(` ---------- errorFree? ${this.isPhoneNumberVerificationTextServerErrorFree}`);
        }
      )
      .add(() => {
        this.sendingPhoneNumberVerificationText = false;
      });
  }

  _parseSendPhoneNumberVerificationTextServerErrors(err) {
    if (err.error.error.includes("Phone number already in use")) {
      this.sendPhoneNumberVerificationTextServerErrors.phoneNumberAlreadyInUse = true;
    } else if (err.error.error.includes("Max send attempts reached")) {
      // https://www.twilio.com/docs/api/errors/60203
      this.sendPhoneNumberVerificationTextServerErrors.maxSendAttemptsReached = true;
    } else if (err.error.error.includes("VOIP number not allowed")) {
      this.sendPhoneNumberVerificationTextServerErrors.voipNumberNotAllowed = true;
    } else if (err.error.error.includes("Messages to China require use case vetting")) {
      // https://www.twilio.com/docs/api/errors/60220
      this.sendPhoneNumberVerificationTextServerErrors.chineseNumberNotAllowed = true;
    } else {
      this.globalVars._alertError(
        "Error sending phone number verification text: " + this.backendApi.stringifyError(err)
      );
    }
  }

  _parseSubmitPhoneNumberVerificationCodeServerErrors(err) {
    if (err.error.error.includes("Invalid parameter: Code")) {
      // https://www.twilio.com/docs/api/errors/60200
      this.submitPhoneNumberVerificationCodeServerErrors.invalidCode = true;
    } else if (err.error.error.includes("requested resource")) {
      // https://www.twilio.com/docs/api/errors/20404
      this.submitPhoneNumberVerificationCodeServerErrors.invalidCode = true;
    } else if (err.error.error.includes("Code is not valid")) {
      this.submitPhoneNumberVerificationCodeServerErrors.invalidCode = true;
    } else if (err.error.error.includes("Max check attempts reached")) {
      // https://www.twilio.com/docs/api/errors/60202
      this.submitPhoneNumberVerificationCodeServerErrors.maxCheckAttemptsReached = true;
    } else {
      this.globalVars._alertError(
        "Error submittting phone number verification code: " + this.backendApi.stringifyError(err)
      );
    }
  }

  _submitPhoneNumberVerificationCode() {
    this.submittingPhoneNumberVerificationCode = true;

    this.backendApi
      .SubmitPhoneNumberVerificationCode(
        this.globalVars.localNode,
        this.globalVars.loggedInUser.PublicKeyBase58Check /*UpdaterPublicKeyBase58Check*/,
        this.phoneNumber /*PhoneNumber*/,
        this.phoneNumberCountryCode /*PhoneNumberCountryCode*/,
        // this.verificationCodeForm.value.verificationCode
        this.verificationCodeString
      )
      .subscribe(
        (res) => {
          // Pull the CanCreateProfile boolean from the server
          this.globalVars.updateEverything(
            res.TxnHashHex,
            this._getStarterDeSoSuccess,
            this._getStarterDeSoFailure,
            this
          );
          this.globalVars.logEvent("account : create : submit-verification-code: success");
          //   this.globalVars.mobileVerified = true;
          this.globalVars.phoneVerified = true;
          this.router.navigate([RouteNames.BROWSE]);
        },
        (err) => {
          this._parseSubmitPhoneNumberVerificationCodeServerErrors(err);
          this.submittingPhoneNumberVerificationCode = false;
        }
      );
  }

  _getStarterDeSoSuccess(comp: any): void {
    comp.screenToShow = MobileVerificationComponent.COMPLETED_PHONE_NUMBER_VERIFICATION_SCREEN;
    comp.submittingPhoneNumberVerificationCode = false;
    comp.phoneNumberVerified.emit();
  }

  _getStarterDeSoFailure(comp: any): void {
    comp.globalVars._alertError(
      "Your starter DeSo is on it's way.  The transaction broadcast successfully but read node timeout exceeded. Please refresh."
    );
    comp.screenToShow = MobileVerificationComponent.COMPLETED_PHONE_NUMBER_VERIFICATION_SCREEN;
    comp.submittingPhoneNumberVerificationCode = false;
    comp.phoneNumberVerified.emit();
  }
}

// Helper class
class SendPhoneNumberVerificationTextServerErrors {
  phoneNumberAlreadyInUse: boolean;
  maxSendAttemptsReached: boolean;
  voipNumberNotAllowed: boolean;
  chineseNumberNotAllowed: boolean;
}

// Helper class
class SubmitPhoneNumberVerificationCodeServerErrors {
  invalidCode: boolean;
  maxCheckAttemptsReached: boolean;
}
