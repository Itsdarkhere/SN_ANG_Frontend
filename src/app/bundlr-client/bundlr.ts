import Api, { ApiConfig } from "arweave/node/lib/api";
import { JWKInterface } from "arweave/node/lib/wallet";
import Utils from "./utils";
import { withdrawBalance } from "./withdrawal";
import Uploader from "./uploader";
import Fund from "./fund";
import { AxiosResponse } from "axios";
// import Arweave from "arweave";
import { Currency } from "./currencies";
import { DataItemCreateOptions } from "arbundles";
import BundlrTransaction from "./transaction";

let currencies;

export let arweave;
export const keys: { [key: string]: { key: string, address: string } } = {};

export interface Config {
    wallet: JWKInterface,
    address?: string,
    APIConfig: ApiConfig,
    gatewayConfig: ApiConfig,
}


// export enum Currencies {
//     ARWEAVE = "arweave",
//     SOLANA = "solana",
//     AVALANCHE = "avalanche",
//     MATIC = "matic"
// }

// export interface ApiConfig {
//     host?: string;
//     protocol?: string;
//     port?: string | number;
//     timeout?: number;
//     logging?: boolean;
//     logger?: Function;
//   }

export default class Bundlr {
    public api: Api;
    public utils: Utils;
    public uploader: Uploader;
    public funder: Fund;
    public address;
    public currency;
    public wallet;
    public currencyConfig: Currency;

    /**
     * Constructs a new Bundlr instance, as well as supporting subclasses
     * @param url - URL to the bundler
     * @param wallet - JWK in JSON
     */
    constructor(url: string, currency: string, wallet?: any) {
        // hacky for the moment...
        // specifically about ordering - some stuff here seems silly but leave it for now it works
        this.currency = currency;
        if (!wallet) {
            wallet = "default";
        }
        keys[currency] = { key: wallet, address: undefined };
        this.wallet = wallet;
        const parsed = new URL(url);
        this.api = new Api({ ...parsed, host: parsed.hostname }); //borrow their nice Axios API :p
        // if (currency === "arweave") {
        //     //arweave = new Arweave(this.api.getConfig());
        //     arweave = Arweave.init({ host: "arweave.net", protocol: "https", port: 443 });
        // }
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        currencies = (require("./currencies/index")).currencies; //delay so that keys object can be properly constructed
        if (!currencies[currency]) {
            throw new Error(`Unknown/Unsuported currency ${currency}`);
        }
        this.currencyConfig = currencies[currency];

        if (!(wallet === "default")) {
            this.address = this.currencyConfig.ownerToAddress(this.currencyConfig.getPublicKey());
        }
        this.currencyConfig.account.address = this.address;
        //this.address = address;
        this.utils = new Utils(this.api, this.currency, this.currencyConfig, { address: this.address, wallet });
        // this.withdrawBalance = async (amount: number) => await withdrawBalance(this.utils, this.api, wallet, amount);
        this.uploader = new Uploader(this.api, currency, this.currencyConfig);
        // this.upload = this.uploader.upload; note to self: don't do this, this destorys 'this' scoping for instantiated subclasses
        this.funder = new Fund(this.utils);

    }
    async withdrawBalance(amount) {
        return await withdrawBalance(this.utils, this.api, amount);
    }

    /**
     * Gets the balance for the loaded wallet
     * @returns balance (in winston)
     */
    async getLoadedBalance(): Promise<number> {
        return this.utils.getBalance(this.address)
    }
    /**
     * Gets the balance for the specified address
     * @param address address to query for
     * @returns the balance (in winston)
     */
    async getBalance(address: string): Promise<number> {
        return this.utils.getBalance(address)
    }
    /**
     * Sends amount winston to the specified bundler
     * @param amount amount to send in winston
     * @returns Arweave transaction
     */
    async fund(amount: number, multiplier?: number): Promise<any> {
        return this.funder.fund(amount, multiplier)
    }
    /**
     * Upload a file at the specified path to the bundler
     * @param path path to the file to upload
     * @returns bundler response
     */
    async uploadFile(path: string): Promise<AxiosResponse<any>> {
        return this.uploader.uploadFile(path);
    };
    /**
     * Create a new BundlrTransactions (flex currency arbundles dataItem)
     * @param data 
     * @param opts - dataItemCreateOptions
     * @returns - a new BundlrTransaction instance
     */
    createTransaction(data: string | Uint8Array, opts?: DataItemCreateOptions): BundlrTransaction {
        return new BundlrTransaction(data, this, opts);
    }
}