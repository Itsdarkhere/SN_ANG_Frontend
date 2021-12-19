import { Injectable } from "@angular/core";
import { GlobalVarsService } from "./global-vars.service";
import WebBundlr, { Bundlr } from "@bundlr-network/client";
import { Observable, of, from } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class ArweaveJsService {
  public isUploading: boolean = false;

  // Supernovas
  //private publicKey = "rHHkbrqEaVXqn3g-9L7MgTWDrL4h6tyM60_ctnCsRE0";
  private arKey = {
    kty: "RSA",
    e: "AQAB",
    n: "8N88HAupArFkJU4tYC9Q6mYZLuNySfU3hwC0EVaveYF9N3xPxzE1_8tcygPYEugVSMOE1j1qrPmb7kpTLQ6_XzJKTCO8vdkG_I6KmFnms8quE1Ov57V8wwtSlpbziGnSV4F3OyPQ4pDDgXgDFhVhaaheNyqKlPlUHRSV02pjZh3weVTeOHOeEsc3VbJhKDQvRn-7Yo4STqIi_SHXeqkUWcX6VgkWh-wp3HF6iL-qt4zL-IiIpnI1yBr0yXWSnagZaSTpR1pwgACr0_jcVpa7WDLvjMg6CNT2zFKuxHjEXqOVPbmG18WIOE0JPuZZtw5IP3CEcbk65ETXohPMeAzDGqClk9Xv-ornaSqEpo7HPBITio4PmYA_4Ns8D2UF44zw7feJc7u9lMBrZIjsU3CLfvS9aKFNGgx8V3OWOCCKPWRlBrjNx3LTkJYoZ2GHqs2pcWtYDqAU27r5O0jl-MDvtTTnvemx1dMJbnVx-ciUrsGnJia28ppyhhPDtJL45Ly3UkExLL-AHaknLO5om7nzN_l1WppjzZWXVamSJVfp8KxYMNAewMO8c204XA8-jHiCi6O8EwJtRjuAbA6ougzhSPpLwGSG11y0KcgmHUX-qkgqYtTk7LO0TT0J-iJpgNaXcip8WxTOip2VUTjzfWQlyd24NMLIezk8gMXcNOCv9rc",
    d: "IPMYoOmDbCfiACxqjp7KXdYrmbtpVe6icuhIuZp3FJL_EwkBTMlRjrU98zCFbUisKLD-SeRK5HCcwQMPz7kVuqsBeNrmpb27c-73zJF3up5-I4yuIm80KuYwnQL3O3DmYiwGqGNk3qlY5SwKmAnCspZilP9Px8M3m2bGfA4wnLZ5v885OtWuCPmRezqUidBhqy4r7vZqULFjQedQN6pLa2Bmt0A1AdDvhQVM8sntS4CKImxi7Qnwi3gMhkZ8EO7-0uBGvQkFHK1609tWIM4rwIvvMv3s2mpvfFHPMHcovZ14--GWLYwK71CydBVEroLYpTz6ESh6guFb8gLtVHrCcW0YQ60dNhb41VTIzB6-MqML0WUbFNouC-ERgtmW70eKyDC304W0I46qOpR6bCOEYZwrx1K_gvGbQz38H8yGYKIajsGsW8GvLw4BJMy4oJk7fRo0L2Yc4966iTYIbiCuRdBL_G1rPkIJILZKnlVOdd_AeDa0e8xWzRn4mLWMctgIPC96XCiwttRCM-6Eghb8kZxIfS7wJW4xBKKsungxJDrmkefs0rEInPqZNaVCbTYTtbEF3KSP-8FCgXyDNxsfMSdEJnFdJVT6VkSR_sEdKps8WzVErntkei3_6Zvaa7aZIo1Ud1dbiijb1_wN6m_rG-_pIY-lyl_C1BgybmDKM2k",
    p: "_AtjDn82S1RYfunVaohqtadgtxZnblF_ExRuBTRSWbTrfjnj_wk5sZe3MfPgiQ64QlT0DPCogeUq5bVhmjl0-e5Kq5mhDXW61cs2nAPlCuwPb5_u1OObNvDD4zWpFWfjybWNBbs-yJaY5d3FIA2pidqmFi1evGgZNHdUD5MQU7vK-LfkctYkJEiMzluUHL_TobvQaFiXqYjeyqk05YHTOvNLmLWJE25IPQx9J3yNPlxfAF_N8A3jpCr7T5tUK7MtNUjkM3ZMth-tBJvS3Dd1e7jYpGe87d-ieipowomjhDsjAR1aO14PQqk0zhRFgQU2q2C_S2dxllTC-OXEXR9L9Q",
    q: "9Kb2HYKNBEujoLiwUN5YtQRooqy5pOFx06bKUesSK_N1MhB5u_jEZ5ysF3aIQ_a7qKGGEarWT3I6QPfGM3FGRlXtpVgWza50Xy8bh7VdQGj2kPh4l8F1LtcnHIovXuBMIkyyxyGwgR07aAUnRJbOcUVvCmDJNs15q--GD0IRKZZLArnFZk93rY9viB-EMAOon4Kr4PcgJzXu11UTJOO_jSCRTmfqOMNqzcOFoJ--2UM4z3Z-SOycjUZXgLIWoOSn6CeBUDr711VuCCbLR_Ew2LHkJmIuJJuKKnEDHiONrg59wDqwq6sXbZj2Pd8PvjB8CZ6bDTpuFC3Zab7wlDmYew",
    dp: "D8CmcEGDIzIiVcxHimD8Sl4rrUW5MSvmxUqBldGvU-v6y-jSVx48fNz-liCn5-kDmyG0HxrrbTLle3Xao8jzhqtd_1uatTymcLZCs32K0yPt0wwr4SJYkRZ7J7gy2SOlGPY_2hvZ0K-Y3sT9jQNNlVAVEU3EngHjkWPj3RVT7-fMx762iHbZy2q9YihXGXTjxTf3zo267N2hDwmERNPYX9bU4rZ12sEJwscFC3K9YShkx6E1PcugbqJBEriiihiouqvTl2PNZ5STO7aBd0IAFbt3zs6tADD59qiv43i2v4zyox8yhINccM4ifr7FmUq6H_vr-Mp-Tub9SJETtL5AAQ",
    dq: "Limq2tqdXSggkd0Hd9rchht02u0YgmH_pl4cYuSmIyDnBjFRpwRDmwFW_35gK-LMef8wWvkPQyJcl5GpFl_TUMY59y7t7pVyY9txqGOyWsrza1tW9duNDu-N87anRZGxC-_I9AYJVfN8GB6Q0EJcZcciMqUcknim8qhZdVuT_XLcaIFBHBL2lAsykk7QFHc8RAzV_bbjnEJy9LKa0CUhKbHxeQfmjBtjdbvk5O__hONIPu0u2ve6enXBYQk5d9ZtUELUBZ17k6ANCQC47rQ18U1vrUZtSn8GzQdR_UfcHfGiDLmGSH4aB5YLMJV8VPi1DuOcghx6VNhp46ghoPZVLQ",
    qi: "eL6kkB0Qvcv6uxGKf7157qyKCOPGdoPzJENLTCSThOlUK8KGOvfjc06NAwboG30u5kluD2ZolmONU2ZM7QkKghwNkMJ5zZ3V5q6slsYkhpAbLafFbj83jLJlvB8kGIpvqefKVThgQkxz_FcJyfkpNOhpYqO-ieB2Q_2VF6tqeD1VSWr-h_AyR6-2iyWoosbFqjl7H11-yJimT2lXQYGf3eljNjNhS-X9YX-Wb6rQoMMvtbbejyG46-8_oBOdq9OTHta-m8KZ37Pzwf5BYM0nz4tUIy-3j7h0h6-Mc2nYFSW_7bMua3CUi_oJmIm6w_OR8JcJBrLyebvwapcE7q700A",
  };

  globalVars: GlobalVarsService;
  GlobalVarsService = GlobalVarsService;
  bundlr = new Bundlr("https://node1.bundlr.network", "arweave", this.arKey);
  constructor(private appState: GlobalVarsService) {
    this.globalVars = appState;
  }
  startUpload(file: File): Observable<any> {
    return from(
      file
        .arrayBuffer()
        .then((data) =>
          this.bundlr.uploader.upload(Buffer.from(data), [
            {
              name: "Content-Type",
              value: file.type,
            },
          ])
        )
        .then((res) => {
          if (res.status === 200) {
            console.log(res);
            return res.data.id;
          }
          return of("");
        })
    );
  }

  UploadImage(file: File): Observable<any> {
    if (this.globalVars.loggedInUser?.ProfileEntryResponse?.IsVerified) {
      return this.startUpload(file);
    } else {
      console.log("Uploading blocked for " + this.globalVars.loggedInUser.PublicKeyBase58Check + " - NOT VERIFIED.");
      return;
    }
  }
  async fundBundlr() {
    let resp2 = this.bundlr.getBalance(this.bundlr.address);
    let resp3 = this.bundlr.getLoadedBalance();
    console.log(resp2);
    console.log(resp3);
  }
  // Down from here is the js-client package for arbundles-network
  // Done by hand since it does not work with newest version of arbundles, which I need
}
