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
    MAINNET_LINK_URL: "https://link.x.immutable.com",
    ROPSTEN_ENV_URL: "https://api.ropsten.x.immutable.com/v1",
    MAINNET_ENV_URL: "https://api.x.immutable.com/v1",
    ALCHEMY_API_KEY: "B73Y8wedJxBxKkxOXoyxaHYEEIFBaCJZ",
    ALCHEMY_ROPSTEN_URL: "https://eth-ropsten.alchemyapi.io/v2",
    ALCHEMY_MAINNET_URL: "https://eth-mainnet.alchemyapi.io/v2",
    MINTER_PK: "8e34107b9999da38b713490ee3489a2008bc0c173e3f78d09884e6d56c80d0ea",
    ROPSTEN_STARK_CONTRACT_ADDRESS: "0x4527be8f31e2ebfbef4fcaddb5a17447b27d2aef",
    MAINNET_STARK_CONTRACT_ADDRESS: "0x5FDCCA53617f4d2b9134B29090C87D01058e27e9",
    ROPSTEN_REGISTRATION_ADDRESS: "0x6C21EC8DE44AE44D0992ec3e2d9f1aBb6207D864",
    MAINNET_REGISTRATION_ADDRESS: "0x72a06bf2a1CE5e39cBA06c0CAb824960B587d64c",
    TOKEN_ADDRESS: "0x154c512B8A52FDC13C36BbFB36d909C3bC814bc1",
    ROYALTY_ADDRESS: "0x8E923EE9057Fb6468bD62922a09cED67F1603c62",
    ETH_CONTRACT_NUMBER: "2",
  },
};
