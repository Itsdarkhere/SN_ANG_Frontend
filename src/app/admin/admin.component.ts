import { Component, OnInit, Input } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { GlobalVarsService } from "../global-vars.service";
import { BackendApiService, ProfileEntryResponse } from "../backend-api.service";
import { sprintf } from "sprintf-js";
import { SwalHelper } from "../../lib/helpers/swal-helper";
import * as _ from "lodash";
import { Title } from "@angular/platform-browser";
import { environment } from "src/environments/environment";

class Messages {
  static INCORRECT_PASSWORD = `The password you entered was incorrect.`;
  static CONNECTION_PROBLEM = `There is currently a connection problem. Is your connection to your node healthy?`;
  static INSUFFICIENT_BALANCE = `You don't have enough DeSo to process the transaction. Try reducing the fee rate.`;
  static SEND_DESO_MIN = `You must send a non-zero amount of DeSo`;
  static INVALID_PUBLIC_KEY = `The public key you entered is invalid`;
}

// TODO: Cleanup - separate this into multiple components
@Component({
  selector: "admin",
  templateUrl: "./admin.component.html",
  styleUrls: ["./admin.component.scss"],
})
export class AdminComponent implements OnInit {
  globalVars: GlobalVarsService;
  adminPosts = [];
  adminPostsByDESO = [];
  activePosts = [];
  activeTab: string;
  activePostTab: string;
  loadingPosts = false;
  loadingMorePosts = false;
  loadingMempoolStats = true;
  loadingGlobalParams = true;
  loadingPostsByDESO = false;
  searchingForPostsByDESO = false;
  @Input() isMobile = false;
  PKList = [
    "BC1YLh2U9osp9RKeCyojbwuFhwrHcAkM2J9Vg5HUNo1vvG95tHe6zNo",
    "BC1YLggVsegfVZTDq7PBUXD4Qms1JVwEhFZCbCFjA54kN4viNqKzW6n",
    "BC1YLiVEhWTDakuz5qE6qYWKc312eXxMVCgW5ArQvqgWSbQREifnqS1",
    "BC1YLg5JusZ1L1NDQpZ4zzZF4gjiFroxdpyA3EK84xCnDnWanMLeNtP",
    "BC1YLhtut56NZbYm2DVbn7srNWcxUzDXYcFaKGutQLBAvtbQzX4BWQM",
    "BC1YLjCFMF7TN8592grfcx3uf9t7TLtHhm2XToMgEoUurZ5wrsvXKnJ",
    "BC1YLhp7CtWBghCzt78QCDUNwv1sMWP52FVo3GvyEhdUZKgn92xn9sK",
    "BC1YLhLT1F4KFQtMCPPvWD8feE9YzFi4jZwwAvKHx8bhXBNkjeQJWWW",
    "BC1YLfgucuJF6n288pZNhfkTeXsFiWNEgfDoK6jw97jkdoGcKtEUDTW",
    "BC1YLhp5ybTTuKYVu3wucniDpU4h9vciLHqHZPazXgPMHcXHjTzh8bq",
    "BC1YLiJg3zmjxXJVxnmMXMDbJdWQwUstAWukeHcukv2ybUCxPVk1CEm",
    "BC1YLhfDPWiPEUB8G4wTxjnCQnbaZmkHi7N3J7Lxz6TM68fTUoN4xHW",
    "BC1YLheP7aY878Ya6WBdGRBWjq4eXCAmGgrrkX3nfEWZ5H4aTXrEv8U",
    "BC1YLiuKfzE6HjurKQi156kzhUo8LGQWDUvudhkEPuqDZWe1NrdeLmV",
    "BC1YLfgucuJF6n288pZNhfkTeXsFiWNEgfDoK6jw97jkdoGcKtEUDTW",
    "BC1YLjJfQefPubDPj4qBWcNcZNNUemFcE9a58s5GkNUC4dnCitfCzGS",
    "BC1YLgohYVi3irgF4GFJ35XBLnuC3X6U8J6Up5kpXxyqXFqAcJpSPYx",
    "BC1YLhZzadCheM7tsutf6FEJiXKv6G4qbjAc5KCddBrhTtZawaUUSW3",
    "BC1YLhMqfUmq2vGX3482Ci5nxkdt9Ch2fBAhJ3uvrJDYGPMbuxm8VmY",
    "BC1YLgeRLvH1EcbzpAo5Jyj2z2L1adK5UqjbVCRePnFJgFtvxrpqQHx",
    "BC1YLj4AeDLxx69DsSX3wagTKrmmR9XVUgeBcJ7rUm3VgWJ7yq6WWVS",
    "BC1YLj4Q4VxR9XFBz1hQnqEzCGKVVHNuoT2ncadjXKeihy1hXfTB6AX",
    "BC1YLh3BGzsoTi7cXFNE2TB7Tk3ZxMiECW9myhECa7AV6FXv52Ezhe8",
    "BC1YLhwZuEsEW21PLj3eV7H7wUxjzFwjeZEo2s9Z6J8M9d1HJLD36R7",
    "BC1YLitAkwNJbZtBXVQPszD5GvhSWDj88qE6FEDy7dofqGYhPxkAQQx",
    "BC1YLjLzxk3Ep3u6Ecar68KouZEiZu5f59FBb4o8YKEHHVysto8Pn4p",
    "BC1YLjKX5EgGE3PRosrnhkoKHnNwmcCnZL4vJD9bCz9piKHFqndc59M",
    "BC1YLhu5wFHRByK5Pa5Zy2z8tazovC7CAjoSpYNowCDNYi71bC4GJt2",
    "BC1YLhDnDudS5ucW6shMhN5HYptr56xNP4kM4TCVKSNzZHNdNpQZxwQ",
    "BC1YLiE7SC4vPJFeUdTeVQsbPVibKDPWWeNHLfHJn6r2a22y73Jc9KW",
    "BC1YLhUZGnRNraaiJp25YxCs1yo91MTAmhK9so7xjhU2inibt1S22Ad",
    "BC1YLhocSA7zKnroJGSCxDLm8aueLpvmKHTUUPa9PmsEY8rxTkGqiG8",
    "BC1YLixzDQdYiZW5nWLXP8KeB7Y5Vd4ePUiz3iwxQYV5xhownmf7CyT",
    "BC1YLhBRinK2k2Ky3fYgjoKQwkujeaE36KzBwenJi1DAtFesouJjMpP",
    "BC1YLhgpEbYAE6WADk1NoeSN19ophTJBbwkpMcJGV449cSjJ8MF5s5g",
    "BC1YLiPqxEXZHc2qyBrPgQ8bSUizfnVRwmy9LzJ8vXLxD5TNmBdH4CJ",
    "BC1YLgzShUm2oXVM3UfibujgALsQVf7iRWqwGPhxntY4gAXZLNAbnJ3",
    "BC1YLiUt3iQG4QY8KHLPXP8LznyFp3k9vFTg2mhhu76d1Uu2WMw9RVY",
    "BC1YLfzL4FNZJ8k1xCVvVAA3UeMoQApG9V7VW1aVW9yAQdRNzHfqSWg",
    "BC1YLfxjeHnUAJU1ra7Nppq32aez6RgR4G1CfgF1LLXGJJ8wynFYFdB",
    "BC1YLie57JvPKfu5363YFCcECFmsf3mN9cYV9UPjF5Y3Dxo4U9dHemv",
    "BC1YLjFTHgnSUaKcsNyacve9ShZgrKWooZjEpeaxAgxkWkxao83oysC",
    "BC1YLhy4jn8pWkNeBxkcPMs82YiiEMJcHZq9zyHfUyxaAsakRXFbp4y",
    "BC1YLiyekvzCpYRMw42AddtjGdu5AXaYZbzXdjVtetsKrMXEzDsZ84m",
    "BC1YLiQhHTPU1NTRAd7aoSrSdRS7bCrbfGbi41KRxiTPi5EgjRmeHVs",
    "BC1YLi5CZqjiiGJRhBhV5xCBXotziLfWfyeH8Bwg9FVXdsLxd9QrbaV",
    "BC1YLiAJ8tjML1yhrBn5Yr7fga5gRCHWN2PB5EfuGvzMdpNr5YfaeoN",
    "BC1YLitSD5wsbHteLyvKgAdnuBAQGzf1chqjAkng6t2uSaPQBkoaBNs",
    "BC1YLhZQHtkuXXaT4KkWFooUf84zmsLj3zsyqr3F4mMhXT3KKS28kTA",
    "BC1YLhAudSDm2c2wQE5FpeUEz6vfA2DYnDbMQ59ty4h1TRBznnbMEps",
    "BC1YLioH4bymMzn9uEz1cmhkmoQHHodTF22CWPi6A7m9ZX4cod8Hh44",
    "BC1YLh22xvrBkQZbxJWiF4G1X2bYHzRTvE8Cu3rHPNZQSHLUPnR8768",
    "BC1YLhzJXXWTUEvVS1wKsNAVPpKYt442Kigz43qvt8Ly6DFVrx6A2fp",
    "BC1YLgDLbGRMRttJ8NvCbHTwNQ2iaVpEQwd85NRPTMMmYCLVEijXgc2",
    "BC1YLjZCJi9bqfrBkptVAogg3Y87KXZQohNdFotp3c4EHEkCByqE97S",
    "BC1YLhBLE1834FBJbQ9JU23JbPanNYMkUsdpJZrFVqNGsCe7YadYiUg",
    "BC1YLfiUNarmxM7BAGAFHTvp6oDgjF4hMP3ZaNhkdn1LdDhncWzQT6w",
    "BC1YLh19ZrcdJmqBAfHXaDiFXS7FiybzQ7QwhEUGxBkoQp263rNCJGz",
    "BC1YLgwuSYXasawyfX5D8wiVSvC7qS1usfPA9QCnJ3ZRndyRcRmKdUG",
    "BC1YLh4nRz7oBCEPuqUkL87Qis8f813cbmDYZtVWdzTSCjqB7Niw3he",
    "BC1YLhKBG9dNrQJX2FPZwMgB7arQk1HHaFSdxDbA6arAzfbUdzUxthQ",
    "BC1YLhwpmWkgk2iM9yTSxzgUVhYjgessSPTiVHkkK9pMrhweqJnWrvK",
    "BC1YLgBwHxfYRiE6Tt4r8uqf2QcaMym4i5nQhstP9RTunt9bKBf2yGB",
    "BC1YLgfU6jFEoEW5FyDtBesygjyF6k5ULt2ycp5YKPLGuTMJhLb5qHo",
    "BC1YLhexTiUx6WjQhDc3tbZbGKnZXZZqvcVgyeNg58zUAz1rTTwW8tz",
    "BC1YLgeGfHDAz8PT82TsHDBbm59283yoYAE9DsGW4T2oaiasWZw11MW",
    "BC1YLg4g7XcwkVgkjXBN3ZYnwz9i8kpkz3ApoasypA3X3pRZbqg5HAV",
    "BC1YLgWvNXrrX5jDsdRpvbpGbpzRULy5k7a9VZrgf4KY7PsLysMpwiS",
    "BC1YLhQk8Fg2NEQmf3Db8XNmsAszTKS7Nc2hXR6aigvvqNWtLmAC8zx",
    "BC1YLfkHQcmZ2sTjgvNbn49x3QMBAArsaEHc1dBJP6P1iRbHU7jvQk3",
    "BC1YLi6x3nWAJjZ7JnsF35Bf2VSDnkZcBinWoARmau5vPshrrvgYbWU",
    "BC1YLjUVj2FFv2rrm1ajiUYNKrZrJnQ5pQd699xBLAPFQzMSA6jaqsc",
    "BC1YLhp9KcDoRpV8WfHm2vyyKRUgTLQs7EyCyxns43aHyyvjfY1kYin",
    "BC1YLfrLkPWRwkimKCtkXfGnfSpX7nHEbJQ1oQo3Ng2uTksRsKxtbkK",
    "BC1YLiQg4nEYG9UEpVt3JLoMgCSWrJaBWdx7Z7WpsoptucRJAJ3WPfp",
    "BC1YLjTWT4wYCKpyA4RBoyGoP2bYhNjGPH7yioHdyKsj6rDHy6yk554",
    "BC1YLimqUBGRYfPB5P5j6jShbmYsNAGoerra9WyueYR86YXwZSuDj6o",
    "BC1YLiBNXdJ42H7EYL3NQLJ2dMxY9D5VSq9hQSnHVstDHQP2PH5bHhA",
    "BC1YLi4gc51W9Y1QztdRBLJnMq9otSrSr3eu2tifAoJxfHZrbYiirrF",
    "BC1YLiC1ywGzRkEWBH9svqKckL6yiWgSFUrTewpf2xe2Dr1iBSESaZv",
    "BC1YLgxkpfMT5vjXRTmS11i4HUfjxryFxbkc9NGHXcmnVJf4FbveV3y",
    "BC1YLgnFFmJjz5uHE9pv8FjzX7FzNbLgpoXe5QThcnYZMCdMZpyBqLF",
    "BC1YLi7jfGV1z5Z3QmZeATNzwDrdfktKNBcp3NMijkAiP3S6xoiVtBB",
    "BC1YLiirPb2V6nLQsWfgazZvd7NF3JMC4vAq4SPsMRLHCX3j1MHR6wL",
    "BC1YLijQg1aGmqRDXBk294D7trnEaM6EKqvhsRCqrjWNcDap2Kh8JNw",
    "BC1YLgFCL9gxT9Cgc8ArQ3Z4Htiq1fhJH4cfshjBm3ufkQoB4pR6WaJ",
    "BC1YLj7KiTKx6x5RrPBJ8XTtTg4WQVgwe2ZJ3gncpsWntr83MnWwgDq",
    "BC1YLi739zxeTuy1ya9TSVFYH2DN1sTLwazx2ybR3j6tbYCK8GjPdRG",
    "BC1YLg2keK5JSEUqe453tSJQFP6JvLnBcNFUXEDFhYFKhuP9TuWc3ai",
    "BC1YLjBAV5hzxwGa6uUHQjtGpwK3MvzZAcriDdrKJYpo4fv5NB2xATE",
    "BC1YLjJGQbwDnxwFLB2B7LHrJekvxHcwLUdVapn94GWXTtf91xMJvDo",
    "BC1YLhkjdTXXXx1S96ykJierT3rSkmMhFB7RSz6Ey2nfj7uSg2P8tuB",
    "BC1YLgzcfyi5GZoMb9xoVzDCMy9KEzzvTqoJzRrVDfhWE2FfFubxaVm",
    "BC1YLi2Xrz9CAxwUuJuvvptNRkEXycCLMyePmPmhF33Q5t7Gtn1TgBm",
    "BC1YLhWsaqZBg4GkdbCFNuzJouamaJCihKWAtFHws4rSi1MJhcboN2A",
    "BC1YLjX1gG65NoDgsxShtyr9DuPiTYCCUoxf7emr4PW79a2pVYjiRbJ",
    "BC1YLiBPqQLv7jrRsUEqthPCfFa7Tx9ycCmKU3nEhbmuzM8T7eiyasS",
    "BC1YLg6bMvn4fzK1XwjSxFWtrqNYC5GkQjc9EnkgWNFD5JpoLXB9fDy",
    "BC1YLiTVut63jV92wmXD6VXE4hfkZHY9JFBfyeavbVwrkZW5VL2SRDf",
    "BC1YLfo5DCFGgHTrEkgvPKmgEC3koPS3h8hojsGh4od5BcFuBgQmPyT",
    "BC1YLgC1VSP4kQxsMjwWKU2d66qjVzo8PdYk3SwHnz91QP2aC54deLU",
    "BC1YLicppiYmX5jX6B9bWhCW1WYfdo4ccuJfEYCe7XcHqkcqkrdmUkE",
    "BC1YLj2wuNrmLHQTu5ND3FfqWrPu1hxVSRtuBYm4teGrjvCaq3ui5CY",
    "BC1YLi9HSo6VDuLHkKY9BeQrQUvAqWruAyHvnRAKPbnYwpfYKfTCeq7",
    "BC1YLhpw1VcByHvfvWtRdxFqTmEfvqU9LoXWPLu4jxRFGhsUtvAMaBL",
    "BC1YLhLZHnfyXpHbrsCmNfi5Psb3Sst1qVm6ZpLTHz9AtspQGaujVZu",
    "BC1YLjYcag3pydgHS9CLKdHnff43scwcZFUANnRvmXdwCQSgHWNenfZ",
    "BC1YLhnHxVvnszWbmvMyDA1ZK6TpQA6uDFToKZ3y6rcVdKAq5ttWZPi",
    "BC1YLiqrX7BzVwhHd9wMjsHifNpxWGtCwfXaS7LYqExatBNe8XSVc8L",
    "BC1YLgCuUCzDmLWGQU3qz1D61H9n9MDmxgfKD9xJGMxvnADGoQDoTXq",
    "BC1YLiSF3TnLBShtFp7vM6vfXwXkjmN8yCAZsW4ssLsAk33UUVvbPeW",
    "BC1YLjFdNkifQLVGtReBYvHjCFAQ7MGdC2Y9H7SowmegeFcG7Lzi3uw",
    "BC1YLjDaa15HVjxMKdUs5XsvatUKfK4zsahDHEbPXwEfbUT1x2cyR69",
    "BC1YLgjv3G9pDh7Ri2z52aij8PspFmG79D1zBDV7xVWLdvtZ1AuYe7Q",
    "BC1YLhtLZAC67GJfBJjvXH9Dyi7sJixjWQ1PJT4VPLPyVTpGZxKars5",
    "BC1YLhrS1Fpscb6H7tWsHF8pt3mLWa19eGWq1U8JT47gtuFqEtS4hs9",
    "BC1YLh19z9wFZPaWpjdT3v8MnJDQeWgpfdJTKJXQP4ZesLpAKxetxEu",
    "BC1YLfqSXtxr8PsV8Fu6CmvoZdgZPrphkepxSoi1enBxgiXRVPJkcDi",
    "BC1YLiCh8n9aCPFTc8eFHVMcUqQBpCTQoMY8TsdqkYJYoyo5Vrkw2XX",
    "BC1YLhzAfjWiUnTHjGSAH9WiTwuTW2unRJEv8VNSv6VsvXPFoGLo6LB",
    "BC1YLiu57SWqZ4ftWkq7mkSsrGMdpwfUfArz1fvMYf6fjaae4qEFten",
    "BC1YLgToU7dbhNYrkVgvxjUtw22zjoc3aF5XcBKktanyYkvWKxKUR71",
    "BC1YLiYGRp57vPVsXydYUHyXRwapZieuAxUBwcfaEfgNSsvcK7e9t2d",
    "BC1YLig3mdJwC6cFFWQ71tT32P29YewVUKxEBi8eqx2bsEdPHvoPr94",
    "BC1YLfh6m4TdzkvR3B7a5kh2CpkaP3faMFnqc67pkHyQ1s3184HeMqj",
    "BC1YLiPE7KoFFka1KzDdtQxCcUq7PrJ5nBWtbpUgU4srfn12s3FivWS",
    "BC1YLifPZfqrMBCiTKyG2F1aBdDjAFGighGvJEuBU6EfrWv4xkq9J4Q",
    "BC1YLfot6BPxdPVEGoZApD2vTrv4jhvnCjcembThUQ2FBEjMSFEjB1C",
    "BC1YLj242ji4P2Hrx3eQyBdFkTcAw4StDs7xFK6WmeLzS2Aee634gZh",
    "BC1YLfxJU6nqzLBoxEResWWm6aNjcw6ABj5kN1AErKkEe5vUAxBwJ6P",
    "BC1YLgMPPCLcWbWc9pCay3nH2y92ajv796sQahNz3LopMmUqi3Ta4wc",
    "BC1YLiht5mqahUmEpTKo9di7behHX5gziH9r71sPTLxsewcemNreupR",
    "BC1YLg1C1rPFLK3UgNvaCoZrYJsbV6RiAvXaWhnaYm5ncD5ZLFvmbAw",
    "BC1YLfwsosymok1BEFcxGeNSe847UpRaaVoMNnVyuRQpomQ9XfCNoLS",
    "BC1YLgwbcKeHLqe1yCjUZsYSxgVZGU4fjWz7tFVAdwTYR9nYXxsKhHk",
    "BC1YLidZdqCZuskpTnoW2JAS16EhBJv7TWcmFuDA22UHPz9ozuzcnNj",
    "BC1YLhwcXTi522mdKUSfEe5hqgLuUtAmDbkWwcGgjVYGUJHLjJaE93M",
    "BC1YLhaehvpM5bp5AzMpk9sPJjkyMevKBM6AHQRFdijVjbvfjuHTBRe",
    "BC1YLhVBZ3wcZHYR7btzkx3pk8BRPtWjLv58TsnYmrDdzjh1ruBcU66",
    "BC1YLftPFknxXmTc6RF3AfvxyeU7vFzx9DBVyGtYADmXM6YhgUz3xHv",
    "BC1YLieWJGQQD8vNoucgdzqEbgAZr2NvYwC7GweRbmcxm7eN6zKATZt",
    "BC1YLihnr65mmoSsAf8N1oMSQEuu1TmNmAMK17yAV8tZzhEjppWuYty",
    "BC1YLjPJM6mxd3GyrJ2SvcFA4jDRwVcpeQsgLoKn2jGbfpZFdTaFEmH",
    "BC1YLiAGMDv4YKaYSdv97YTC915ZdFD7EaogWP63YG4Jxd3kVXgA2Wi",
    "BC1YLjF1RJMdcfMv2D52ixTaSFtMvM1YvZHjvyrzSp4EJYfYQWaphd4",
    "BC1YLhF2p36rayKZdHBEtoJeBGnWf4mafbgWe2gA4kDUchCxQBES8tL",
    "BC1YLfuFvmoDWNyEV1y1ZHMqLqj77wfa2c5Wb1MpfjfYFavmuyKQGCz",
    "BC1YLhfu1q6REP62akjQL1WXCUHfFd19rzYEQ6jbAo3gqUkjBxQKnCE",
    "BC1YLh8ABTffGAn85oY1tuhXoxZXVdrgMbEYoJJFU4AtuV3jBjHusb7",
    "BC1YLh7EQSrnAUgbJfZQQpejP4QLvxbjNFCKzV2A7icAAkKxEHzBWhV",
    "BC1YLggbMp4ay4UpjVxGPLVCb6y7HsiSVbWH8wBkLMmwTTZzzC5JnyB",
    "BC1YLh25iX9NcFyE8fi5xPGnsUUsdfVk6mJuzp6SefUy25S1rc6tD1Q",
    "BC1YLg2FuHf3sARUvqeWVjjRh6P7BP3Bsr6m7RdiSZpkKRvE8USx836",
    "BC1YLgamJchswezVD3oHP6j5GRGEtN4u1Dd2pz4kwTVHLJbJQDHVtxd",
    "BC1YLhxCi4xWATD5GB13AEW8DtFm9c5ZaksoD9yJoik9FTbQAo8UX64",
    "BC1YLhqGVSyzBgnV6x7a2G8t61ze5Av7UHsiXWBnQdQU2uwZCToDN12",
    "BC1YLhxPGHczH3rA6zq1JarcD7kvpEQTYHBQkpzjEZA9DTjkJNkCDMd",
    "BC1YLjLTunpeXNPZo7BMwmANJafmVMeaCvG3TA86KhJoKCoPKEQCfvF",
    "BC1YLhKCGTsiaJ2tbNWUHWX4DTfSsGv9qwE5yKQtuZY5QHSbp6RuKjn",
    "BC1YLj9grBXf87F7UKmzkuaUr7Q1D78LFzEZrj8GUFXNkCqu7R5hXbj",
    "BC1YLjWtWztDRxoZJYjEahj89SjdqjzM5LASco9VsHNkR4tqzY9doP1",
    "BC1YLgVcAY39s7BK3MGrTWM1RzpJNMNS8L5uUVQc7dWLCrUqWddZb8K",
    "BC1YLgDnfUTyXk4JD6dnERiZFFJLXgUrWy5T1NLrRWPKedrzt6qXzxn",
    "BC1YLgmabmhDTrz2cnaAj3fM62KhnJbxTSRKJUnBUbL1speV621zj45",
    "BC1YLiwGmRPmTngqCkn3yPGB1dMfdVuz2tFm55PH2axr3KvzBdWPqos",
    "BC1YLiG3xMUyYv1ivRcDFakUA3tJKrXJg6jARSsUDVCAhoyFzc1a3DE",
    "BC1YLiV8xk65QG4TydDdxK9JZeQdpuWt2y1GgHdTzGaHSFVF3gULGSz",
    "BC1YLhb658f8pgrJwATNEMyfTK3r9hSsTJhTJd53sf7rXizvpLPztiu",
    "BC1YLhwTu5E8yy3h5WWSHywrpzhTqWdkD2yJEcUuKxMm4EMoD5krEQD",
    "BC1YLgTCEJkcE5UMVqytCrteUSuLwV97cbNywcCkG9wjZz2ZaM2oCe9",
    "BC1YLivi5QJBY2xNVyQx653RqgLc18n9umnk81urN364MezD4D76nni",
    "BC1YLht5CpLbafcN2rDKEqYeojg4SB4JiZF565V7rbm9Gt5u8y1voQh",
  ];

  banlistPubKeyOrUsername = "";
  restrictPubKeyOrUsername = "";
  unrestrictPubKeyOrUsername = "";
  grantlistPubKeyOrUsername = "";
  ungrantlistPubKeyOrUsername = "";
  removePhonePubKeyorUsername = "";

  updateProfileSuccessType = "";
  grantlistUpdateSuccess = false;
  ungrantlistUpdateSuccess = false;

  clearSuccessTimeout: any;
  grantlistSuccessTimeout: any;
  ungrantlistSuccessTimeout: any;

  submittingProfileUpdateType = "";
  submittingBanlistUpdate = false;
  submittingRestrictUpdate = false;
  submittingUnrestrictUpdate = false;
  submittingGrantlistUpdate = false;
  submittingUngrantlistUpdate = false;
  submittingEvictUnminedBitcoinTxns = false;
  submittingUSDToDeSoReserveExchangeRateUpdate = false;
  submittingBuyDeSoFeeRate = false;

  submittingRemovePhone = false;
  dbDetailsOpen = false;
  dbDetailsLoading = false;
  userMetadataMap = {};
  usernameMap = {};
  userMetadataMapLength = 0;
  mempoolSummaryStats: any = {};
  mempoolTxnCount = 0;
  bitcoinExchangeRate: number;
  usdToDeSoReserveExchangeRate: number;
  buyDeSoFeeRate: number;
  updatingBitcoinExchangeRate = false;
  updatingGlobalParams = false;
  updatingUSDToBitcoin = false;
  updatingCreateProfileFee = false;
  updatingMinimumNetworkFee = false;
  updatingMaxCopiesPerNFT = false;
  updatingCreateNFTFeeNanos = false;
  feeRateDeSoPerKB = (1000 / 1e9).toFixed(9); // Default fee rate.
  bitcoinBlockHashOrHeight = "";
  evictBitcoinTxnHashes = "";
  usernameToVerify = "";
  usernameForWhomToRemoveVerification = "";
  usernameToFetchVerificationAuditLogs = "";
  removingNilPosts = false;
  submittingReprocessRequest = false;
  submittingRemovalRequest = false;
  submittingVerifyRequest = false;
  mempoolTotalBytes = 0;
  loadingNextBlockStats = false;
  nextBlockStats: any = {};
  globalParams: any = {};
  updateGlobalParamsValues = {
    USDPerBitcoin: 0,
    CreateProfileFeeNanos: 0,
    MinimumNetworkFeeNanosPerKB: 0,
    MaxCopiesPerNFT: 0,
    CreateNFTFeeNanos: 0,
  };
  verifiedUsers: any = [];
  usernameVerificationAuditLogs: any = [];
  loadingVerifiedUsers = false;
  loadingVerifiedUsersAuditLog = false;
  adminTabs = ["Posts", "Profiles", "NFTs", "Tutorial", "Network", "Mempool", "Wyre", "Jumio", "Referral Program"];

  POSTS_TAB = "Posts";
  POSTS_BY_DESO_TAB = "Posts By DESO";
  adminPostTabs = [this.POSTS_TAB, this.POSTS_BY_DESO_TAB];

  // Fields for SwapIdentity
  submittingSwapIdentity = false;
  swapIdentityFromUsernameOrPublicKey = "";
  swapIdentityToUsernameOrPublicKey = "";

  // Fields for UpdateUsername
  submittingUpdateUsername = false;
  changeUsernamePublicKey = "";
  usernameTarget = "";
  userMetadataToUpdate = null;
  userProfileEntryResponseToUpdate: ProfileEntryResponse = null;
  searchedForPubKey = false;

  // These are the options used to populate the dropdown for selecting a time window over which we want to fetch
  // posts ordered by deso.
  timeWindowOptions = {
    "15m": 15,
    "30m": 30,
    "60m": 60,
  };
  // This is a variable to track the currently selected time window.
  selectedTimeWindow = 60;

  // Fields for getting user admin data
  submittingGetUserAdminData = false;
  getUserAdminDataPublicKey = "";
  getUserAdminDataResponse = null;

  constructor(
    private _globalVars: GlobalVarsService,
    private router: Router,
    private route: ActivatedRoute,
    private backendApi: BackendApiService,
    private titleService: Title
  ) {
    this.globalVars = _globalVars;
  }

  ngOnInit() {
    if (this.globalVars.showSuperAdminTools()) {
      this.adminTabs.push("Super");
      this.adminTabs.push("Node Fees");
    }

    this.route.queryParams.subscribe((queryParams) => {
      if (queryParams.adminTab) {
        this.activeTab = queryParams.adminTab;
      } else {
        this.activeTab = "Posts";
      }
    });
    // load data
    this._updateNodeInfo();

    // Get some posts to show the user.
    this.loadingPosts = true;
    this.activePostTab = this.POSTS_TAB;
    this._loadPosts();
    this._loadPostsByDESO();

    // Get the latest mempool stats.
    this._loadMempoolStats();
    this._loadNextBlockStats();
    this._loadGlobalParams();

    // Get current fee percentage and reserve USD to DeSo exchange price.
    this._loadBuyDeSoFeeRate();
    this._loadUSDToDeSoReserveExchangeRate();

    this.titleService.setTitle(`Admin - ${environment.node.name}`);
  }

  _updateNodeInfo() {
    if (!this.globalVars.loggedInUser) {
      return;
    }
    this.backendApi
      .NodeControl(this.globalVars.localNode, this.globalVars.loggedInUser.PublicKeyBase58Check, "", "get_info")
      .subscribe(
        (res: any) => {
          if (res == null || res.DeSoStatus == null) {
            return;
          }

          this.globalVars.nodeInfo = res;
        },
        (error) => {
          console.error(error);
          this.globalVars.nodeInfo = null;
        }
      );
  }

  _tabClicked(tabName: any) {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { adminTab: this.activeTab },
      queryParamsHandling: "merge",
    });
  }

  _postTabClicked(postTabName: string) {
    this.activePostTab = postTabName;
    if (postTabName === this.POSTS_BY_DESO_TAB) {
      this.activePosts = this.adminPostsByDESO;
    } else {
      this.activePosts = this.adminPosts;
    }
  }

  _searchPostsByDESO() {
    this.searchingForPostsByDESO = true;
    this._loadPostsByDESO();
  }

  _loadPostsByDESO() {
    this.loadingPostsByDESO = true;
    // Get the reader's public key for the request.
    let readerPubKey = "";
    if (this.globalVars.loggedInUser) {
      readerPubKey = this.globalVars.loggedInUser.PublicKeyBase58Check;
    }

    if (!this.selectedTimeWindow) {
      this.selectedTimeWindow = 60;
    }
    this.backendApi
      .GetPostsStateless(
        this.globalVars.localNode,
        "" /*PostHash*/,
        readerPubKey /*ReaderPublicKeyBase58Check*/,
        "" /*OrderBy*/,
        parseInt(this.globalVars.filterType) /*StartTstampSecs*/,
        "",
        50 /*NumToFetch*/,
        false /*FetchSubcomments*/,
        false /*GetPostsForFollowFeed*/,
        false /*GetPostsForGlobalWhitelist*/,
        true,
        false /*MediaRequired*/,
        this.selectedTimeWindow,
        true /*AddGlobalFeedBool*/
      )
      .subscribe(
        (res) => {
          this.adminPostsByDESO = res.PostsFound;
          if (this.activePostTab === this.POSTS_BY_DESO_TAB) {
            this.activePosts = this.adminPostsByDESO;
          }
        },
        (err) => {
          console.error(err);
          this.globalVars._alertError("Error loading posts: " + this.backendApi.stringifyError(err));
        }
      )
      .add(() => {
        this.loadingPostsByDESO = false;
        this.searchingForPostsByDESO = false;
      });
  }

  _loadPosts() {
    this.loadingMorePosts = true;

    // Get the reader's public key for the request.
    let readerPubKey = "";
    if (this.globalVars.loggedInUser) {
      readerPubKey = this.globalVars.loggedInUser.PublicKeyBase58Check;
    }

    // Get the last post hash in case this is a "load more" request.
    let lastPostHash = "";
    if (this.adminPosts.length > 0) {
      lastPostHash = this.adminPosts[this.adminPosts.length - 1].PostHashHex;
    }
    this.backendApi
      .GetPostsStateless(
        this.globalVars.localNode,
        lastPostHash /*PostHash*/,
        readerPubKey /*ReaderPublicKeyBase58Check*/,
        "newest" /*OrderBy*/,
        parseInt(this.globalVars.filterType) /*StartTstampSecs*/,
        "",
        50 /*NumToFetch*/,
        false /*FetchSubcomments*/,
        false /*GetPostsForFollowFeed*/,
        false /*GetPostsForGlobalWhitelist*/,
        false,
        false /*MediaRequired*/,
        0,
        true /*AddGlobalFeedBool*/
      )
      .subscribe(
        (res) => {
          if (lastPostHash != "") {
            this.adminPosts = this.adminPosts.concat(res.PostsFound);
          } else {
            this.adminPosts = res.PostsFound;
          }
          /*if (this.activePostTab === this.POSTS_TAB) {
            console.log(this.adminPosts);
            this.activePosts = this.adminPosts;
          }*/
          for (let x of this.adminPosts) {
            if (this.PKList.includes(x.PosterPublicKeyBase58Check) && x.IsNFT) {
              this.activePosts.push(x);
            }
          }
        },
        (err) => {
          console.error(err);
          this.globalVars._alertError("Error loading posts: " + this.backendApi.stringifyError(err));
        }
      )
      .add(() => {
        this.loadingMorePosts = false;
        this.loadingPosts = false;
      });
  }

  _loadMempoolStats() {
    console.log("Loading mempool stats...");
    this.loadingMempoolStats = true;
    this.backendApi
      .AdminGetMempoolStats(this.globalVars.localNode, this.globalVars.loggedInUser.PublicKeyBase58Check)
      .subscribe(
        (res) => {
          this.mempoolSummaryStats = res.TransactionSummaryStats;
          this.mempoolTxnCount = _.sumBy(Object.values(this.mempoolSummaryStats), (o) => {
            return o["Count"];
          });
          this.mempoolTotalBytes = _.sumBy(Object.values(this.mempoolSummaryStats), (o) => {
            return o["TotalBytes"];
          });
        },
        (err) => {
          console.log(err);
        }
      )
      .add(() => {
        this.loadingMempoolStats = true;
      });
  }

  _loadVerifiedUsers() {
    this.loadingVerifiedUsers = true;
    console.log("Loading verified users...");
    this.backendApi
      .AdminGetVerifiedUsers(this.globalVars.localNode, this.globalVars.loggedInUser.PublicKeyBase58Check)
      .subscribe(
        (res) => {
          this.verifiedUsers = res.VerifiedUsers;
        },
        (err) => {
          console.log(err);
        }
      )
      .add(() => {
        this.loadingVerifiedUsers = false;
      });
  }

  _loadVerifiedUsersAuditLog() {
    this.loadingVerifiedUsersAuditLog = true;
    console.log("Loading username verification audit log...");
    this.backendApi
      .AdminGetUsernameVerificationAuditLogs(
        this.globalVars.localNode,
        this.globalVars.loggedInUser.PublicKeyBase58Check,
        this.usernameToFetchVerificationAuditLogs
      )
      .subscribe(
        (res) => {
          this.usernameVerificationAuditLogs = res.VerificationAuditLogs;
          console.log(this.usernameVerificationAuditLogs);
        },
        (err) => {
          console.log(err);
        }
      )
      .add(() => {
        this.loadingVerifiedUsersAuditLog = false;
      });
  }

  _loadNextBlockStats() {
    console.log("Loading stats for next block...");
    this.loadingNextBlockStats = true;

    // The GetBlockTemplate endpoint requires a username so we have two randomly
    // generated pub keys to use as dummies in main / test net.
    let dummyPubKey = "BC1YLgqAkAJ4sX2YGD85j9rEpTqDrAkgLoXwv6oTzaCyZt3cDpqk8hy";
    if (this.globalVars.isTestnet) {
      dummyPubKey = "tBCKYKKdGQpCUYaG2pGy6LcNDeydSXYRHV4phywuc6bZANavsx3Y5f";
    }

    this.backendApi
      .GetBlockTemplate(this.globalVars.localNode, dummyPubKey)
      .subscribe(
        (res) => {
          this.nextBlockStats = res.LatestBlockTemplateStats;
        },
        (err) => {
          console.log(err);
        }
      )
      .add(() => {
        this.loadingNextBlockStats = false;
      });
  }

  _loadGlobalParams() {
    this.loadingGlobalParams = true;
    this.backendApi
      .GetGlobalParams(this.globalVars.localNode, this.globalVars.loggedInUser.PublicKeyBase58Check)
      .subscribe(
        (res) => {
          this.globalParams = {
            USDPerBitcoin: res.USDCentsPerBitcoin / 100,
            CreateProfileFeeNanos: res.CreateProfileFeeNanos / 1e9,
            MinimumNetworkFeeNanosPerKB: res.MinimumNetworkFeeNanosPerKB,
            MaxCopiesPerNFT: res.MaxCopiesPerNFT,
            CreateNFTFeeNanos: res.CreateNFTFeeNanos / 1e9,
          };
          this.updateGlobalParamsValues = this.globalParams;
        },
        (err) => {
          this.globalVars._alertError("Error global params: " + this.backendApi.stringifyError(err));
        }
      )
      .add(() => {
        this.loadingGlobalParams = false;
      });
  }

  _loadBuyDeSoFeeRate(): void {
    this.backendApi.GetBuyDeSoFeeBasisPoints(this.globalVars.localNode).subscribe(
      (res) => (this.buyDeSoFeeRate = res.BuyDeSoFeeBasisPoints / 100),
      (err) => console.log(err)
    );
  }

  _loadUSDToDeSoReserveExchangeRate(): void {
    this.backendApi.GetUSDCentsToDeSoReserveExchangeRate(this.globalVars.localNode).subscribe(
      (res) => (this.usdToDeSoReserveExchangeRate = res.USDCentsPerDeSo / 100),
      (err) => console.log(err)
    );
  }

  _toggleDbDetails() {
    if (this.dbDetailsLoading) {
      // If we are currently loading the db details, return.
      return;
    }

    if (this.dbDetailsOpen) {
      // If the db details are open close them and return.
      this.dbDetailsOpen = false;
      return;
    }

    // If we pass the above checks, load the db details.
    this.dbDetailsLoading = true;

    this.backendApi
      .AdminGetAllUserGlobalMetadata(
        this.globalVars.localNode,
        this.globalVars.loggedInUser.PublicKeyBase58Check,
        1000 // NumToFetch
      )
      .subscribe(
        (res) => {
          this.userMetadataMap = res.PubKeyToUserGlobalMetadata;
          this.usernameMap = res.PubKeyToUsername;
          this.userMetadataMapLength = Object.keys(this.userMetadataMap).length;
        },
        (err) => {
          this.globalVars._alertError(JSON.stringify(err.error));
        }
      )
      .add(() => {
        this.dbDetailsOpen = true;
        this.dbDetailsLoading = false;
      });
  }

  _removeNilPosts() {
    this.removingNilPosts = true;
    this.backendApi
      .AdminRemoveNilPosts(this.globalVars.localNode, this.globalVars.loggedInUser.PublicKeyBase58Check, 1000)
      .subscribe(
        () => {
          this.removingNilPosts = false;
        },
        (err) => {
          this.globalVars._alertError(JSON.stringify(err.error));
        }
      );
  }

  updateProfileModerationLevel(level: string) {
    let targetPubKeyOrUsername = "";
    let pubKey = "";
    let username = "";
    let removeEverywhere = false;
    let removeFromLeaderboard = false;
    this.updateProfileSuccessType = "";
    clearTimeout(this.clearSuccessTimeout);

    // Determine what variables to set based on the button pressed.
    if (level === "banlist") {
      console.log("Banlisting Pub Key: " + this.banlistPubKeyOrUsername);
      targetPubKeyOrUsername = this.banlistPubKeyOrUsername;
      removeEverywhere = true;
      removeFromLeaderboard = true;
      this.submittingBanlistUpdate = true;
    } else if (level === "restrict") {
      console.log("Restricting Pub Key: " + this.restrictPubKeyOrUsername);
      targetPubKeyOrUsername = this.restrictPubKeyOrUsername;
      removeEverywhere = false;
      removeFromLeaderboard = true;
      this.submittingRestrictUpdate = true;
    } else if (level === "unrestrict") {
      console.log("Unrestricting Pub Key: " + this.unrestrictPubKeyOrUsername);
      targetPubKeyOrUsername = this.unrestrictPubKeyOrUsername;
      removeEverywhere = false;
      removeFromLeaderboard = false;
      this.submittingUnrestrictUpdate = true;
    } else {
      console.log("Cannot set moderation level to: " + level);
      return;
    }

    // Decipher whether the target string is a pub key or username.
    if (this.globalVars.isMaybePublicKey(targetPubKeyOrUsername)) {
      pubKey = targetPubKeyOrUsername;
    } else {
      username = targetPubKeyOrUsername;
    }

    // Fire off the request.
    this.submittingProfileUpdateType = level;
    this.backendApi
      .AdminUpdateUserGlobalMetadata(
        this.globalVars.localNode,
        this.globalVars.loggedInUser.PublicKeyBase58Check,
        pubKey,
        username,
        true,
        removeEverywhere,
        removeFromLeaderboard,
        false,
        false,
        false
      )
      .subscribe(
        (res) => {
          this.updateProfileSuccessType = level;
          this.clearSuccessTimeout = setTimeout(() => {
            this.updateProfileSuccessType = "";
          }, 1000);
        },
        (err) => {
          this.globalVars._alertError(JSON.stringify(err.error));
        }
      )
      .add(() => {
        if (level === "banlist") {
          this.submittingBanlistUpdate = false;
          this.banlistPubKeyOrUsername = "";
        } else if (level === "restrict") {
          this.submittingRestrictUpdate = false;
          this.banlistPubKeyOrUsername = "";
        } else if (level === "unrestrict") {
          this.submittingUnrestrictUpdate = false;
          this.unrestrictPubKeyOrUsername = "";
        }
      });
  }

  grantlistClicked() {
    let pubKey = "";
    let username = "";
    this.submittingGrantlistUpdate = true;
    clearTimeout(this.grantlistSuccessTimeout);

    // Decipher whether the target string is a pub key or username.
    if (this.globalVars.isMaybePublicKey(this.grantlistPubKeyOrUsername)) {
      pubKey = this.grantlistPubKeyOrUsername;
    } else {
      username = this.grantlistPubKeyOrUsername;
    }

    this.backendApi
      .AdminUpdateUserGlobalMetadata(
        this.globalVars.localNode,
        this.globalVars.loggedInUser.PublicKeyBase58Check,
        pubKey,
        username,
        false,
        false,
        false,
        true,
        true,
        false
      )
      .subscribe(
        (res) => {
          this.grantlistUpdateSuccess = true;
          this.grantlistSuccessTimeout = setTimeout(() => {
            this.grantlistUpdateSuccess = false;
          }, 1000);
        },
        (err) => {
          this.globalVars._alertError(JSON.stringify(err.error));
        }
      )
      .add(() => {
        this.submittingGrantlistUpdate = false;
        this.grantlistPubKeyOrUsername = "";
      });
  }

  ungrantlistClicked() {
    let pubKey = "";
    let username = "";
    this.submittingUngrantlistUpdate = true;
    clearTimeout(this.ungrantlistSuccessTimeout);

    // Decipher whether the target string is a pub key or username.
    if (this.globalVars.isMaybePublicKey(this.ungrantlistPubKeyOrUsername)) {
      pubKey = this.ungrantlistPubKeyOrUsername;
    } else {
      username = this.ungrantlistPubKeyOrUsername;
    }

    this.backendApi
      .AdminUpdateUserGlobalMetadata(
        this.globalVars.localNode,
        this.globalVars.loggedInUser.PublicKeyBase58Check,
        pubKey,
        username,
        false,
        false,
        false,
        true,
        false,
        false
      )
      .subscribe(
        (res) => {
          this.ungrantlistUpdateSuccess = true;
          this.ungrantlistSuccessTimeout = setTimeout(() => {
            this.ungrantlistUpdateSuccess = false;
          }, 1000);
        },
        (err) => {
          this.globalVars._alertError(JSON.stringify(err.error));
        }
      )
      .add(() => {
        this.submittingUngrantlistUpdate = false;
        this.ungrantlistPubKeyOrUsername = "";
      });
  }

  submitRemovePhoneNumber() {
    const targetPubKeyOrUsername = this.removePhonePubKeyorUsername;
    let pubKey = "";
    let username = "";

    if (this.globalVars.isMaybePublicKey(targetPubKeyOrUsername)) {
      pubKey = targetPubKeyOrUsername;
    } else {
      username = targetPubKeyOrUsername;
    }

    this.submittingRemovePhone = true;

    this.backendApi
      .AdminUpdateUserGlobalMetadata(
        this.globalVars.localNode,
        this.globalVars.loggedInUser.PublicKeyBase58Check,
        pubKey,
        username,
        false,
        false,
        false,
        false,
        false,
        true
      )
      .subscribe(
        (res) => {
          this.updateProfileSuccessType = "phone";
          this.clearSuccessTimeout = setTimeout(() => {
            this.updateProfileSuccessType = "";
          }, 1000);
        },
        (err) => {
          this.globalVars._alertError(JSON.stringify(err.error));
        }
      )
      .add(() => {
        this.submittingRemovePhone = false;
      });
  }

  extractError(err: any): string {
    if (err.error != null && err.error.error != null) {
      // Is it obvious yet that I'm not a frontend gal?
      // TODO: Error handling between BE and FE needs a major redesign.
      const rawError = err.error.error;
      if (rawError.includes("password")) {
        return Messages.INCORRECT_PASSWORD;
      } else if (rawError.includes("not sufficient")) {
        return Messages.INSUFFICIENT_BALANCE;
      } else if (rawError.includes("RuleErrorTxnMustHaveAtLeastOneInput")) {
        return Messages.SEND_DESO_MIN;
      } else if (
        (rawError.includes("SendDeSo: Problem") && rawError.includes("Invalid input format")) ||
        rawError.includes("Checksum does not match")
      ) {
        return Messages.INVALID_PUBLIC_KEY;
      } else {
        return rawError;
      }
    }
    if (err.status != null && err.status !== 200) {
      return Messages.CONNECTION_PROBLEM;
    }
    // If we get here we have no idea what went wrong so just alert the
    // errorString.
    return JSON.stringify(err);
  }

  updateGlobalParamUSDPerBitcoin() {
    this.updatingUSDToBitcoin = true;
    this.updateGlobalParams(this.updateGlobalParamsValues.USDPerBitcoin, -1, -1, -1, -1);
  }

  updateGlobalParamCreateProfileFee() {
    this.updatingCreateProfileFee = true;
    this.updateGlobalParams(-1, this.updateGlobalParamsValues.CreateProfileFeeNanos, -1, -1, -1);
  }

  updateGlobalParamMinimumNetworkFee() {
    this.updatingMinimumNetworkFee = true;
    this.updateGlobalParams(-1, -1, this.updateGlobalParamsValues.MinimumNetworkFeeNanosPerKB, -1, -1);
  }

  updateGlobalParamMaxCopiesPerNFT() {
    this.updatingMaxCopiesPerNFT = true;
    this.updateGlobalParams(-1, -1, -1, this.updateGlobalParamsValues.MaxCopiesPerNFT, -1);
  }

  updateGlobalParamCreateNFTFeeNanos() {
    this.updatingCreateNFTFeeNanos = true;
    this.updateGlobalParams(-1, -1, -1, -1, this.updateGlobalParamsValues.CreateNFTFeeNanos);
  }

  updateUSDToDeSoReserveExchangeRate(): void {
    SwalHelper.fire({
      target: this.globalVars.getTargetComponentSelector(),
      title: "Are you ready?",
      html: `You are about to update the reserve exchange rate of USD to DeSo to be $${this.usdToDeSoReserveExchangeRate}`,
      showConfirmButton: true,
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-light",
        cancelButton: "btn btn-light no",
      },
      reverseButtons: true,
    }).then((res) => {
      if (res.isConfirmed) {
        this.submittingUSDToDeSoReserveExchangeRateUpdate = true;
        this.backendApi
          .SetUSDCentsToDeSoReserveExchangeRate(
            this.globalVars.localNode,
            this.globalVars.loggedInUser.PublicKeyBase58Check,
            this.usdToDeSoReserveExchangeRate * 100
          )
          .subscribe(
            (res: any) => {
              console.log(res);
              this.globalVars._alertSuccess(
                sprintf("Successfully updated the reserve exchange to $%d/DeSo", res.USDCentsPerDeSo / 100)
              );
            },
            (err: any) => {
              this.globalVars._alertError(this.extractError(err));
            }
          )
          .add(() => (this.submittingUSDToDeSoReserveExchangeRateUpdate = false));
      }
    });
  }

  updateBuyDeSoFeeRate(): void {
    SwalHelper.fire({
      target: this.globalVars.getTargetComponentSelector(),
      title: "Are you ready?",
      html: `You are about to update the Buy DeSo Fee to be ${this.buyDeSoFeeRate}%`,
      showConfirmButton: true,
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-light",
        cancelButton: "btn btn-light no",
      },
      reverseButtons: true,
    }).then((res) => {
      if (res.isConfirmed) {
        this.submittingBuyDeSoFeeRate = true;
        this.backendApi
          .SetBuyDeSoFeeBasisPoints(
            this.globalVars.localNode,
            this.globalVars.loggedInUser.PublicKeyBase58Check,
            this.buyDeSoFeeRate * 100
          )
          .subscribe(
            (res: any) => {
              console.log(res);
              this.globalVars._alertSuccess(
                sprintf("Successfully updated the Buy DeSo Fee to %d%", res.USDCentsPerDeSo / 100)
              );
            },
            (err: any) => {
              this.globalVars._alertError(this.extractError(err));
            }
          )
          .add(() => (this.submittingBuyDeSoFeeRate = false));
      }
    });
  }

  updateGlobalParams(
    usdPerBitcoin: number,
    createProfileFeeNanos: number,
    minimumNetworkFeeNanosPerKB: number,
    maxCopiesPerNFT: number,
    createNFTFeeNanos: number
  ) {
    const updateBitcoinMessage = usdPerBitcoin >= 0 ? `Update Bitcoin to USD exchange rate: ${usdPerBitcoin}\n` : "";
    const createProfileFeeNanosMessage =
      createProfileFeeNanos >= 0 ? `Create Profile Fee (in $DESO): ${createProfileFeeNanos}\n` : "";
    const minimumNetworkFeeNanosPerKBMessage =
      minimumNetworkFeeNanosPerKB >= 0 ? `Minimum Network Fee Nanos Per KB: ${minimumNetworkFeeNanosPerKB}\n` : "";
    const maxCopiesMessage = maxCopiesPerNFT >= 0 ? `Max Copies Per NFT: ${maxCopiesPerNFT}\n` : "";
    const createNFTFeeNanosMessage = createNFTFeeNanos >= 0 ? `Create NFT Fee (in $DESO): ${createNFTFeeNanos}\n` : "";
    SwalHelper.fire({
      target: this.globalVars.getTargetComponentSelector(),
      title: "Are you ready?",
      html: `${updateBitcoinMessage}${createProfileFeeNanosMessage}${minimumNetworkFeeNanosPerKBMessage}${maxCopiesMessage}${createNFTFeeNanosMessage}`,
      showConfirmButton: true,
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-light",
        cancelButton: "btn btn-light no",
      },
      reverseButtons: true,
    })
      .then((res: any) => {
        if (res.isConfirmed) {
          this.updatingGlobalParams = true;
          console.log(maxCopiesPerNFT);
          this.backendApi
            .UpdateGlobalParams(
              this.globalVars.localNode,
              this.globalVars.loggedInUser.PublicKeyBase58Check,
              usdPerBitcoin >= 0 ? usdPerBitcoin * 100 : -1,
              createProfileFeeNanos >= 0 ? createProfileFeeNanos * 1e9 : -1,
              minimumNetworkFeeNanosPerKB >= 0 ? minimumNetworkFeeNanosPerKB : -1,
              maxCopiesPerNFT >= 0 ? maxCopiesPerNFT : -1,
              createNFTFeeNanos >= 0 ? createNFTFeeNanos * 1e9 : -1,
              minimumNetworkFeeNanosPerKB >= 0
                ? minimumNetworkFeeNanosPerKB
                : this.globalParams.MinimumNetworkFeeNanosPerKB >= 0
                ? this.globalParams.MinimumNetworkFeeNanosPerKB
                : Math.floor(parseFloat(this.feeRateDeSoPerKB) * 1e9)
            )
            .subscribe(
              (res: any) => {
                if (res == null || res.FeeNanos == null) {
                  this.globalVars._alertError(Messages.CONNECTION_PROBLEM);
                  return null;
                }
                // Save the minimum network fee in case we update that value then update a different global param without
                // updating the minimum network fee.
                if (minimumNetworkFeeNanosPerKB >= 0) {
                  this.globalParams.MinimumNetworkFeeNanosPerKB = minimumNetworkFeeNanosPerKB;
                }
                const totalFeeDeSo = res.FeeNanos / 1e9;

                this.globalVars._alertSuccess(
                  sprintf(
                    "Successfully updated global params rate. TxID: %s for a fee of %d DeSo",
                    res.TransactionIDBase58Check,
                    totalFeeDeSo
                  )
                );
              },
              (error) => {
                console.error(error);
                this.globalVars._alertError(this.extractError(error));
              }
            )
            .add(() => {
              this.updatingGlobalParams = false;
            });
        }
      })
      .finally(() => {
        this.updatingUSDToBitcoin = false;
        this.updatingCreateProfileFee = false;
        this.updatingMinimumNetworkFee = false;
        this.updatingMaxCopiesPerNFT = false;
        this.updatingCreateNFTFeeNanos = false;
      });
  }

  reprocessBitcoinBlock() {
    if (this.bitcoinBlockHashOrHeight === "") {
      this.globalVars._alertError("Please enter either a Bitcoin block hash or a Bitcoin block height.");
      return;
    }

    this.submittingReprocessRequest = true;
    this.backendApi
      .AdminReprocessBitcoinBlock(
        this.globalVars.localNode,
        this.globalVars.loggedInUser.PublicKeyBase58Check,
        this.bitcoinBlockHashOrHeight
      )
      .subscribe(
        (res: any) => {
          if (res == null || res.Message == null) {
            this.globalVars._alertError(Messages.CONNECTION_PROBLEM);
            return null;
          }
          this.bitcoinBlockHashOrHeight = "";
          this.globalVars._alertSuccess(res.Message);
        },
        (error) => {
          console.error(error);
          this.globalVars._alertError(this.extractError(error));
        }
      )
      .add(() => {
        this.submittingReprocessRequest = false;
      });
  }

  evictBitcoinExchangeTxns(dryRun: boolean) {
    SwalHelper.fire({
      target: this.globalVars.getTargetComponentSelector(),
      title: "Are you ready?",
      html: `About to evict ${this.evictBitcoinTxnHashes} with DryRun=${dryRun}`,
      showConfirmButton: true,
      showCancelButton: true,
      customClass: {
        confirmButton: "btn btn-light",
        cancelButton: "btn btn-light no",
      },
      reverseButtons: true,
    })
      .then((res: any) => {
        if (res.isConfirmed) {
          this.submittingEvictUnminedBitcoinTxns = true;
          this.backendApi
            .EvictUnminedBitcoinTxns(
              this.globalVars.localNode,
              this.globalVars.loggedInUser.PublicKeyBase58Check,
              this.evictBitcoinTxnHashes.split(","),
              dryRun
            )
            .subscribe(
              (res: any) => {
                if (res == null) {
                  this.globalVars._alertError(Messages.CONNECTION_PROBLEM);
                  return null;
                }

                this.globalVars._alertSuccess(
                  `Success! Lost ${res.TotalMempoolTxns - res.MempoolTxnsLeftAfterEviction} mempool
                  txns with ${res.TotalMempoolTxns} total txns in the mempool before eviction.
                  Types: ${JSON.stringify(res.TxnTypesEvicted, null, 2)}.
                  Check the response of this request in the browser's inspector for more information.`
                );
              },
              (error) => {
                console.error(error);
                this.globalVars._alertError(this.extractError(error));
              }
            )
            .add(() => {
              this.submittingEvictUnminedBitcoinTxns = false;
            });
        }
      })
      .finally(() => {
        this.submittingEvictUnminedBitcoinTxns = false;
      });
  }

  grantVerificationBadge() {
    if (this.usernameToVerify === "") {
      this.globalVars._alertError("Please enter a valid username.");
      return;
    }

    this.submittingVerifyRequest = true;
    this.backendApi
      .AdminGrantVerificationBadge(
        this.globalVars.localNode,
        this.globalVars.loggedInUser.PublicKeyBase58Check,
        this.usernameToVerify
      )
      .subscribe(
        (res: any) => {
          this.globalVars._alertSuccess(res.Message);
        },
        (error) => {
          this.globalVars._alertError(this.extractError(error));
        }
      )
      .add(() => {
        this.submittingVerifyRequest = false;
      });
  }

  getUserAdminDataClicked() {
    if (this.getUserAdminDataPublicKey === "") {
      this.globalVars._alertError("Please enter a valid username.");
      return;
    }

    this.submittingGetUserAdminData = true;
    this.backendApi
      .AdminGetUserAdminData(
        this.globalVars.localNode,
        this.globalVars.loggedInUser.PublicKeyBase58Check,
        this.getUserAdminDataPublicKey
      )
      .subscribe(
        (res: any) => {
          this.getUserAdminDataResponse = res;
        },
        (error) => {
          this.globalVars._alertError(this.extractError(error));
        }
      )
      .add(() => {
        this.submittingGetUserAdminData = false;
      });
  }

  RemoveVerification() {
    if (this.usernameForWhomToRemoveVerification === "") {
      this.globalVars._alertError("Please enter a valid username.");
      return;
    }

    this.submittingRemovalRequest = true;
    this.backendApi
      .AdminRemoveVerificationBadge(
        this.globalVars.localNode,
        this.globalVars.loggedInUser.PublicKeyBase58Check,
        this.usernameForWhomToRemoveVerification
      )
      .subscribe(
        (res: any) => {
          this.globalVars._alertSuccess(res.Message);
        },
        (error) => {
          this.globalVars._alertError(this.extractError(error));
        }
      )
      .add(() => {
        this.submittingRemovalRequest = false;
      });
  }

  swapIdentity() {
    if (this.swapIdentityFromUsernameOrPublicKey === "") {
      this.globalVars._alertError("Please enter the username or public key of the user you are swapping *from*");
      return;
    }
    if (this.swapIdentityToUsernameOrPublicKey === "") {
      this.globalVars._alertError("Please enter the username or public key of the user you are swapping *to*");
      return;
    }

    this.submittingSwapIdentity = true;
    this.backendApi
      .SwapIdentity(
        this.globalVars.localNode,
        this.globalVars.loggedInUser.PublicKeyBase58Check,
        this.swapIdentityFromUsernameOrPublicKey,
        this.swapIdentityToUsernameOrPublicKey,
        Math.floor(parseFloat(this.feeRateDeSoPerKB) * 1e9) /*MinFeeRateNanosPerKB*/
      )
      .subscribe(
        (res: any) => {
          if (res == null) {
            this.globalVars._alertError(Messages.CONNECTION_PROBLEM);
            return null;
          }
          this.globalVars._alertSuccess("Identities successfully swapped!");
        },
        (error) => {
          console.error(error);
          this.globalVars._alertError(this.extractError(error));
        }
      )
      .add(() => {
        this.submittingSwapIdentity = false;
      });
  }

  // GetUserMetadata
  getUserMetadata() {
    this.backendApi
      .AdminGetUserGlobalMetadata(
        this.globalVars.localNode,
        this.globalVars.loggedInUser.PublicKeyBase58Check,
        this.changeUsernamePublicKey
      )
      .subscribe(
        (res) => {
          this.userMetadataToUpdate = res.UserMetadata;
          this.userProfileEntryResponseToUpdate = res.UserProfileEntryResponse;
          this.searchedForPubKey = true;
        },
        (err) => {
          console.log(err);
        }
      );
  }

  updateUsername() {
    if (!this.searchedForPubKey) {
      return SwalHelper.fire({
        target: this.globalVars.getTargetComponentSelector(),
        icon: "warning",
        title: "Search for public key before updating username",
      });
    }
    const infoMsg = this.userProfileEntryResponseToUpdate
      ? `Change ${this.userProfileEntryResponseToUpdate.Username} to ${this.usernameTarget}`
      : `Set username to ${this.usernameTarget} for public key ${this.changeUsernamePublicKey}`;
    SwalHelper.fire({
      target: this.globalVars.getTargetComponentSelector(),
      icon: "info",
      title: `Updating Username`,
      html: infoMsg,
      showCancelButton: true,
      showConfirmButton: true,
      focusConfirm: true,
      customClass: {
        confirmButton: "btn btn-light",
        cancelButton: "btn btn-light no",
      },
      reverseButtons: true,
    }).then((res: any) => {
      if (res.isConfirmed) {
        this.submittingUpdateUsername = true;
        const creatorCoinBasisPoints = this.userProfileEntryResponseToUpdate?.CoinEntry?.CreatorBasisPoints || 10 * 100;
        const stakeMultipleBasisPoints =
          this.userProfileEntryResponseToUpdate?.StakeMultipleBasisPoints || 1.25 * 100 * 100;
        return this.backendApi
          .UpdateProfile(
            this.globalVars.localNode,
            this.globalVars.loggedInUser.PublicKeyBase58Check /*UpdaterPublicKeyBase58Check*/,
            this.changeUsernamePublicKey /*ProfilePublicKeyBase58Check*/,
            // Start params
            this.usernameTarget /*NewUsername*/,
            "" /*NewDescription*/,
            "" /*NewProfilePic*/,
            creatorCoinBasisPoints /*NewCreatorBasisPoints*/,
            stakeMultipleBasisPoints /*NewStakeMultipleBasisPoints*/,
            false /*IsHidden*/,
            // End params
            this.globalVars.feeRateDeSoPerKB * 1e9 /*MinFeeRateNanosPerKB*/
          )
          .subscribe(
            () => {
              this.updateProfileSuccessType = "username";
              this.clearSuccessTimeout = setTimeout(() => {
                this.updateProfileSuccessType = "";
              }, 1000);
            },
            (err) => {
              this.globalVars._alertError(JSON.stringify(err.error));
            }
          )
          .add(() => {
            this.submittingUpdateUsername = false;
          });
      }
    });
  }
}
