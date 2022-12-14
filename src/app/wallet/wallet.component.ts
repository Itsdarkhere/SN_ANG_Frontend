import { Component, HostListener, Input, OnDestroy, OnInit } from "@angular/core";
import { GlobalVarsService } from "../global-vars.service";
import { AppRoutingModule, RouteNames } from "../app-routing.module";
import { BackendApiService, BalanceEntryResponse, ProfileEntryResponse, TutorialStatus } from "../backend-api.service";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { InfiniteScroller } from "../infinite-scroller";
import { IAdapter, IDatasource } from "ngx-ui-scroll";
import { Subscription } from "rxjs";
import { SwalHelper } from "../../lib/helpers/swal-helper";
import { environment } from "src/environments/environment";
import { animate, style, transition, trigger } from "@angular/animations";
import { MixpanelService } from "../mixpanel.service";

import { Link, ImmutableXClient, ImmutableMethodResults, ETHTokenType, ImmutableRollupStatus } from "@imtbl/imx-sdk";
import { ethers } from "ethers";
import { BsModalService } from "ngx-bootstrap/modal";
import { GeneralSuccessModalComponent } from "../general-success-modal/general-success-modal.component";

@Component({
  selector: "wallet",
  templateUrl: "./wallet.component.html",
  styleUrls: ["./wallet.component.scss"],
  animations: [
    trigger("tabChangeAnimation", [
      transition(":enter", [style({ opacity: 0.2 }), animate("500ms linear", style({ opacity: 1 }))]),
      transition(":leave", [style({ opacity: 1 }), animate("0ms ease", style({ opacity: 0 }))]),
    ]),
  ],
})
export class WalletComponent implements OnInit, OnDestroy {
  static PAGE_SIZE = 20;
  static BUFFER_SIZE = 10;
  static WINDOW_VIEWPORT = true;
  static PADDING = 0.5;

  // Tab selector
  tabDeso = false;
  tabCreatorCoin = true;
  tabEarnings = false;

  showYouDontOwnCreatorCoins = false;
  @Input() inTutorial: boolean;

  globalVars: GlobalVarsService;
  AppRoutingModule = AppRoutingModule;
  hasUnminedCreatorCoins: boolean;
  showTransferredCoins: boolean = false;

  publicKeyCopied = false;

  sortedUSDValueFromHighToLow: number = 0;
  sortedPriceFromHighToLow: number = 0;
  sortedUsernameFromHighToLow: number = 0;

  usersYouReceived: BalanceEntryResponse[] = [];
  usersYouPurchased: BalanceEntryResponse[] = [];

  static coinsPurchasedTab: string = "Coins Purchased";
  static coinsReceivedTab: string = "Coins Received";
  tabs = [WalletComponent.coinsPurchasedTab, WalletComponent.coinsReceivedTab];
  activeTab: string = WalletComponent.coinsPurchasedTab;
  tutorialUsername: string;
  tutorialStatus: TutorialStatus;
  TutorialStatus = TutorialStatus;
  balanceEntryToHighlight: BalanceEntryResponse;

  nextButtonText: string;

  mobile = false;

  //   immutable x vars
  link = new Link(environment.imx.MAINNET_LINK_URL);
  //   end of immutable x vars

  constructor(
    private appData: GlobalVarsService,
    private titleService: Title,
    private router: Router,
    private route: ActivatedRoute,
    private backendApi: BackendApiService,
    private modalService: BsModalService,
    private mixPanel: MixpanelService
  ) {
    this.globalVars = appData;
    this.route.params.subscribe((params) => {
      if (params.username) {
        this.tutorialUsername = params.username.toLowerCase();
      }
    });
  }

  subscriptions = new Subscription();
  tutorialHeaderText: string = "";
  tutorialStepNumber: number;

  imxBalanceFull: string;

  ngOnInit() {
    this.setMobileBasedOnViewport();
    this.mixPanel.track36("Wallet page viewed");
    if (this.inTutorial) {
      this.tabs = [WalletComponent.coinsPurchasedTab];
      this.tutorialStatus = this.globalVars.loggedInUser?.TutorialStatus;
      this.balanceEntryToHighlight = this.globalVars.loggedInUser?.UsersYouHODL.find((balanceEntry) => {
        return balanceEntry.ProfileEntryResponse.Username.toLowerCase() === this.tutorialUsername;
      });
      switch (this.tutorialStatus) {
        case TutorialStatus.INVEST_OTHERS_BUY: {
          this.tutorialHeaderText = "Invest in a Creator";
          this.tutorialStepNumber = 1;
          this.nextButtonText = `Sell ${this.balanceEntryToHighlight.ProfileEntryResponse.Username} coins`;
          break;
        }
        case TutorialStatus.INVEST_OTHERS_SELL: {
          this.tutorialHeaderText = "Sell a Creator";
          this.tutorialStepNumber = 2;
          this.nextButtonText = "Setup your profile";
          break;
        }
        case TutorialStatus.INVEST_SELF: {
          this.tutorialHeaderText = "Invest in Yourself";
          this.tutorialStepNumber = 4;
          this.nextButtonText = "Give a diamond";
          break;
        }
      }
    }
    this.globalVars.loggedInUser.UsersYouHODL.map((balanceEntryResponse: BalanceEntryResponse) => {
      if (balanceEntryResponse.NetBalanceInMempool != 0) {
        this.hasUnminedCreatorCoins = true;
      }
      this.usersYouPurchased.push(balanceEntryResponse);
      if (this.usersYouPurchased) {
        this.showYouDontOwnCreatorCoins = true;
      }
    });
    this.sortWallet("value");
    this._handleTabClick(WalletComponent.coinsPurchasedTab);
    if (this.inTutorial) {
      this.subscriptions.add(
        this.datasource.adapter.lastVisible$.subscribe((lastVisible) => {
          // Last Item of myItems is Visible => data-padding-forward should be zero.
          if (lastVisible.$index === 0) {
            this.correctDataPaddingForwardElementHeight(lastVisible.element.parentElement);
          }
        })
      );
    }
    this.titleService.setTitle(`Wallet - ${environment.node.name}`);

    // ran this function to highlight the deso tab first
    this.tabDesoClick();

    this.buildIMX();

    console.log(this.globalVars.loggedInUser);
  }

  //   -------------------- immutable x functions --------------------
  async buildIMX(): Promise<void> {
    const publicApiUrl: string = environment.imx.MAINNET_ENV_URL ?? "";
    this.globalVars.imxClient = await ImmutableXClient.build({ publicApiUrl });
    if (localStorage.getItem("address")) {
      console.log("local storage hit -------------------");
      this.globalVars.imxWalletAddress = localStorage.getItem("address") as string;
      this.globalVars.imxWalletConnected = true;
      await this.getImxBalance(this.globalVars.imxWalletAddress);
    }
    this.imxBalanceFull = this.globalVars.imxBalance + " ETH";
  }

  //   async linkSetup(): Promise<void> {
  //     console.log(` ----------------------- client is ${JSON.stringify(this.globalVars.imxClient)}`);
  //     const res = await this.link.setup({});
  //     this.globalVars.imxWalletConnected = true;
  //     this.globalVars.imxWalletAddress = res.address;
  //     console.log(
  //       ` ----------------------- walletConnected is ${this.globalVars.imxWalletConnected} ----------------------- `
  //     );
  //     console.log(` ----------------------- walletAddress ${this.globalVars.imxWalletAddress} ----------------------- `);

  //     await this.getImxBalance(this.globalVars.imxWalletAddress);

  //     localStorage.setItem("address", res.address);
  //   }

  async getImxBalance(walletAddressInput: string): Promise<void> {
    this.globalVars.imxBalance = await this.globalVars.imxClient.getBalance({
      user: walletAddressInput,
      tokenAddress: "eth",
    });
    this.globalVars.imxBalance = this.globalVars.imxBalance.balance.toString();
    this.globalVars.imxBalance = ethers.utils.formatEther(this.globalVars.imxBalance);
    console.log(` ----------------------- balance is ${this.globalVars.imxBalance} ETH ----------------------- `);
  }

  linkLogOut() {
    localStorage.removeItem("address");
    this.globalVars.imxWalletAddress = "undefined";
    this.globalVars.imxWalletConnected = false;
  }

  async depositETH() {
    await this.link.deposit({
      type: ETHTokenType.ETH,
      amount: "0.01",
    });
  }

  async openGeneralSuccessModal() {
    if (!this.globalVars.isMobile()) {
      // if they have not connected before then show modal
      if (!localStorage.getItem("firstTimeEthWalletConnection")) {
        this.modalService.show(GeneralSuccessModalComponent, {
          class: "modal-dialog-centered nft_placebid_modal_bx  modal-lg",
          initialState: {
            header: "Connect your Ethereum wallet to Immutable X",
            text: "By connecting your wallet to Immutable X, you are able to mint and trade Ethereum NFT's with zero gas fees.",
            buttonText: "Connect with Immutable X",
            buttonClickedAction: "connectWallet",
          },
        });
      } else {
        await this.linkSetup();
      }
    } else {
      this.modalService.show(GeneralSuccessModalComponent, {
        class: "modal-dialog-centered nft_placebid_modal_bx  modal-lg",
        initialState: {
          header: "Error",
          text: "Please visit Supernovas on your desktop to interact with the Ethereum blockchain.",
          buttonText: "Ok",
          buttonClickedAction: "connectWalletMobileError",
        },
      });
    }
  }

  async linkSetup(): Promise<void> {
    const publicApiUrl: string = environment.imx.MAINNET_ENV_URL ?? "";
    this.globalVars.imxClient = await ImmutableXClient.build({ publicApiUrl });
    console.log(` ----------------------- client is ${JSON.stringify(this.globalVars.imxClient)}`);
    const res = await this.link.setup({});
    this.globalVars.imxWalletConnected = true;
    this.globalVars.imxWalletAddress = res.address;
    this.globalVars.ethWalletAddresShort = this.globalVars.imxWalletAddress.slice(0, 15) + "...";
    console.log(
      ` ----------------------- walletConnected is ${this.globalVars.imxWalletConnected} ----------------------- `
    );
    console.log(` ----------------------- walletAddress ${this.globalVars.imxWalletAddress} ----------------------- `);

    await this.getImxBalance(this.globalVars.imxWalletAddress);

    localStorage.setItem("address", res.address);

    // Add key to postgres
    // This should both create a new one or replace an existing one.
    this.addIMXPublicKeyToProfileDetails();
    // pass this.globalVars.imxWalletAddress into postgres function to associate with DESO public key this.globalVars.loggedInUser.PublicKeyBase58Check
    // for example, fetch(https://supernovas.app/api/updateDesoProfile, body)
    // body = {"desoPublicKey": "this.globalVars.loggedInUser.PublicKeyBase58Check", "imxWalletAddress": "this.globalVars.imxWalletAddress"}
  }

  addIMXPublicKeyToProfileDetails() {
    if (!this.globalVars.loggedInUser.PublicKeyBase58Check) {
      return;
    }
    this.backendApi
      .InsertOrUpdateIMXPK(
        this.globalVars.localNode,
        this.globalVars.loggedInUser.PublicKeyBase58Check,
        this.globalVars.imxWalletAddress
      )
      .subscribe(
        (res) => {
          console.log(res);
        },
        (err) => {
          console.log(err);
        }
      );
  }
  //   -------------------- end of immutable x functions --------------------

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  setMobileBasedOnViewport() {
    this.mobile = this.globalVars.isMobile();
  }

  @HostListener("window:resize")
  onResize() {
    this.setMobileBasedOnViewport();
  }
  copyPublicKey() {
    this.publicKeyCopied = true;
    this.globalVars._copyText(this.globalVars.loggedInUser.PublicKeyBase58Check);
    setTimeout(() => {
      this.publicKeyCopied = false;
    }, 1500);
  }

  // Thanks to @brabenetz for the solution on forward padding with the ngx-ui-scroll component.
  // https://github.com/dhilt/ngx-ui-scroll/issues/111#issuecomment-697269318
  correctDataPaddingForwardElementHeight(viewportElement: HTMLElement): void {
    const dataPaddingForwardElement: HTMLElement = viewportElement.querySelector(`[data-padding-forward]`);
    if (dataPaddingForwardElement) {
      dataPaddingForwardElement.setAttribute("style", "height: 0px;");
    }
  }

  // sort by USD value
  sortHodlingsCoins(hodlings: BalanceEntryResponse[], descending: boolean): void {
    this.sortedUsernameFromHighToLow = 0;
    this.sortedPriceFromHighToLow = 0;
    this.sortedUSDValueFromHighToLow = descending ? -1 : 1;
    hodlings.sort((a: BalanceEntryResponse, b: BalanceEntryResponse) => {
      return (
        this.sortedUSDValueFromHighToLow *
        (this.globalVars.desoNanosYouWouldGetIfYouSold(a.BalanceNanos, a.ProfileEntryResponse.CoinEntry) -
          this.globalVars.desoNanosYouWouldGetIfYouSold(b.BalanceNanos, b.ProfileEntryResponse.CoinEntry))
      );
    });
    console.log(hodlings);
  }

  // sort by coin price
  sortHodlingsPrice(hodlings: BalanceEntryResponse[], descending: boolean): void {
    this.sortedUsernameFromHighToLow = 0;
    this.sortedPriceFromHighToLow = descending ? -1 : 1;
    this.sortedUSDValueFromHighToLow = 0;
    hodlings.sort((a: BalanceEntryResponse, b: BalanceEntryResponse) => {
      return (
        this.sortedPriceFromHighToLow *
        (a.ProfileEntryResponse.CoinEntry.DeSoLockedNanos - b.ProfileEntryResponse.CoinEntry.DeSoLockedNanos)
      );
    });
  }

  // sort by username
  sortHodlingsUsername(hodlings: BalanceEntryResponse[], descending: boolean): void {
    this.sortedUsernameFromHighToLow = descending ? -1 : 1;
    this.sortedPriceFromHighToLow = 0;
    this.sortedUSDValueFromHighToLow = 0;
    hodlings.sort((a: BalanceEntryResponse, b: BalanceEntryResponse) => {
      return (
        this.sortedUsernameFromHighToLow *
        b.ProfileEntryResponse.Username.localeCompare(a.ProfileEntryResponse.Username)
      );
    });
  }

  sortWallet(column: string) {
    let descending: boolean;
    switch (column) {
      case "username":
        // code block
        descending = this.sortedUsernameFromHighToLow !== -1;
        this.sortHodlingsUsername(this.usersYouPurchased, descending);
        this.sortHodlingsUsername(this.usersYouReceived, descending);
        break;
      case "price":
        descending = this.sortedPriceFromHighToLow !== -1;
        this.sortHodlingsPrice(this.usersYouPurchased, descending);
        this.sortHodlingsPrice(this.usersYouReceived, descending);
        break;
      case "value":
        descending = this.sortedUSDValueFromHighToLow !== -1;
        this.sortHodlingsCoins(this.usersYouPurchased, descending);
        this.sortHodlingsCoins(this.usersYouReceived, descending);
        break;
      default:
      // do nothing
    }
    this.scrollerReset();
  }

  totalValue() {
    let result = 0;

    for (const holding of this.globalVars.loggedInUser.UsersYouHODL) {
      result +=
        this.globalVars.desoNanosYouWouldGetIfYouSold(holding.BalanceNanos, holding.ProfileEntryResponse.CoinEntry) ||
        0;
    }

    return result;
  }
  tabDesoClick() {
    this.tabDeso = true;
    this.tabCreatorCoin = false;
    this.tabEarnings = false;
  }
  tabCreatorCoinClick() {
    this.tabCreatorCoin = true;
    this.tabDeso = false;
    this.tabEarnings = false;
  }
  tabEarningsClick() {
    this.tabEarnings = true;
    this.tabCreatorCoin = false;
    this.tabDeso = false;
  }
  unminedDeSoToolTip() {
    return (
      "Mining in progress. Feel free to transact in the meantime.\n\n" +
      "Mined balance:\n" +
      this.globalVars.nanosToDeSo(this.globalVars.loggedInUser.BalanceNanos, 9) +
      " DeSo.\n\n" +
      "Unmined balance:\n" +
      this.globalVars.nanosToDeSo(this.globalVars.loggedInUser.UnminedBalanceNanos, 9) +
      " DeSo."
    );
  }

  unminedCreatorCoinToolTip(creator: any) {
    return (
      "Mining in progress. Feel free to transact in the meantime.\n\n" +
      "Net unmined transactions:\n" +
      this.globalVars.nanosToDeSo(creator.NetBalanceInMempool, 9) +
      " DeSo.\n\n" +
      "Balance w/unmined transactions:\n" +
      this.globalVars.nanosToDeSo(creator.BalanceNanos, 9) +
      " DeSo.\n\n"
    );
  }

  usernameTruncationLength(): number {
    return this.globalVars.isMobile() ? 14 : 20;
  }

  emptyHodlerListMessage(): string {
    return this.showTransferredCoins
      ? "You haven't received coins from any creators you don't already hold."
      : "You haven't purchased any creator coins yet.";
  }

  _handleTabClick(tab: string) {
    this.showTransferredCoins = tab === WalletComponent.coinsReceivedTab;
    this.lastPage = Math.floor(
      (this.showTransferredCoins ? this.usersYouReceived : this.usersYouPurchased).length / WalletComponent.PAGE_SIZE
    );
    this.activeTab = tab;
    this.scrollerReset();
  }

  scrollerReset() {
    this.infiniteScroller.reset();
    this.datasource.adapter.reset().then(() => this.datasource.adapter.check());
  }

  isHighlightedCreator(balanceEntryResponse: BalanceEntryResponse): boolean {
    if (!this.inTutorial) {
      return false;
    }
    return (
      balanceEntryResponse.ProfileEntryResponse.Username.toLowerCase() ===
      this.balanceEntryToHighlight.ProfileEntryResponse.Username.toLowerCase()
    );
  }

  tutorialNext(): void {
    if (this.tutorialStatus === TutorialStatus.INVEST_OTHERS_BUY) {
      this.globalVars.logEvent("invest : others : buy : next");
      this.router.navigate([RouteNames.TUTORIAL, RouteNames.INVEST, RouteNames.SELL_CREATOR, this.tutorialUsername]);
    } else if (this.tutorialStatus === TutorialStatus.INVEST_OTHERS_SELL) {
      this.globalVars.logEvent("invest : others : sell : next");
      this.router.navigate([RouteNames.TUTORIAL, RouteNames.CREATE_PROFILE]);
    } else if (this.tutorialStatus === TutorialStatus.INVEST_SELF) {
      this.globalVars.logEvent("invest : self : buy : next");
      SwalHelper.fire({
        target: this.globalVars.getTargetComponentSelector(),
        icon: "info",
        title: `Allow others to invest in your coin`,
        html: `Click "ok" to allow others to purchase your coin. You will earn 10% of every purchase.`,
        showCancelButton: true,
        showConfirmButton: true,
        focusConfirm: true,
        customClass: {
          confirmButton: "btn btn-light",
          cancelButton: "btn btn-light no",
        },
        confirmButtonText: "Ok",
        cancelButtonText: "No thank you",
        reverseButtons: true,
        allowEscapeKey: false,
        allowOutsideClick: false,
      })
        .then((res: any) => {
          if (res.isConfirmed) {
            return this.backendApi
              .UpdateProfile(
                this.globalVars.localNode,
                this.globalVars.loggedInUser.PublicKeyBase58Check,
                "",
                "",
                "",
                "",
                10 * 100,
                1.25 * 100 * 100,
                false,
                this.globalVars.feeRateDeSoPerKB * 1e9 /*MinFeeRateNanosPerKB*/
              )
              .subscribe(
                () => {
                  this.globalVars.logEvent("set : founder-reward");
                },
                (err) => {
                  console.error(err);
                  const parsedError = this.backendApi.stringifyError(err);
                  this.globalVars.logEvent("set : founder-reward : error", { parsedError });
                }
              );
          } else {
            this.globalVars.logEvent("set : founder-reward : skip");
          }
        })
        .finally(() => this.router.navigate([RouteNames.TUTORIAL, RouteNames.DIAMONDS]));
    }
  }

  lastPage = null;
  infiniteScroller: InfiniteScroller = new InfiniteScroller(
    WalletComponent.PAGE_SIZE,
    this.getPage.bind(this),
    WalletComponent.WINDOW_VIEWPORT,
    WalletComponent.BUFFER_SIZE,
    WalletComponent.PADDING
  );
  datasource: IDatasource<IAdapter<any>> = this.infiniteScroller.getDatasource();

  getPage(page: number) {
    if (this.lastPage != null && page > this.lastPage) {
      return [];
    }
    if (this.inTutorial) {
      this.lastPage = 0;
      return new Promise((resolve, reject) => {
        resolve([this.balanceEntryToHighlight]);
      });
    }
    const startIdx = page * WalletComponent.PAGE_SIZE;
    const endIdx = (page + 1) * WalletComponent.PAGE_SIZE;

    return new Promise((resolve, reject) => {
      resolve(
        this.showTransferredCoins
          ? this.usersYouReceived.slice(startIdx, Math.min(endIdx, this.usersYouReceived.length))
          : this.usersYouPurchased.slice(startIdx, Math.min(endIdx, this.usersYouPurchased.length))
      );
    });
  }
  routeToSellCoin(creator: any) {
    this.router.navigate(["/u/" + creator.ProfileEntryResponse.Username + "/sell"]);
  }
  routeToBuyDeso() {
    this.router.navigate([RouteNames.DESO_PAGE]);
  }
  routeToImxPage() {
    this.router.navigate([RouteNames.IMX_PAGE]);
  }
}
