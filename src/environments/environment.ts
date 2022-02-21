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
  },
};
