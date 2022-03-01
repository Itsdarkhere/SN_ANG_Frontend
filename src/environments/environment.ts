// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  uploadImageHostname: "node.deso.org",
  verificationEndpointHostname: "https://node.deso.org",
  uploadVideoHostname: "node.deso.org",
  identityURL: "https://identity.deso.org",
  supportEmail: "",
  dd: {
    apiKey: "DCEB26AC8BF47F1D7B4D87440EDCA6",
    jsPath: "https://bitclout.com/tags.js",
    ajaxListenerPath: "bitclout.com/api",
    endpoint: "https://bitclout.com/js/",
  },
  amplitude: {
    key: "",
    domain: "",
  },
  node: {
    id: 9,
    name: "Supernovas",
    url: "https://supernovas.app",
    logoAssetDir: "/assets/deso/",
  },
  imx: {
    ROPSTEN_LINK_URL: "https://link.ropsten.x.immutable.com",
    ROPSTEN_ENV_URL: "https://api.ropsten.x.immutable.com/v1",
    ALCHEMY_API_KEY: "3DzfK-p8b3h4OBuZoAlwXEHf50apfpkG",
    MINTER_PK: "707ea93fae5d6d311d09f2619bf49c9851210d0a3ec20d6798eb77da1beb1b47",
    ROPSTEN_STARK_CONTRACT_ADDRESS: "0x4527be8f31e2ebfbef4fcaddb5a17447b27d2aef",
    ROPSTEN_REGISTRATION_ADDRESS: "0x6C21EC8DE44AE44D0992ec3e2d9f1aBb6207D864",
    TOKEN_ADDRESS: "0xb027E9BC2ee4eDcb2E01646c4B01224f54AAa566",
    ROYALTY_ADDRESS: "0x8E923EE9057Fb6468bD62922a09cED67F1603c62",
  },
};
