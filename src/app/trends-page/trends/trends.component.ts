import { Component, OnInit } from "@angular/core";
import {
  BackendApiService,
  NFTCollectionResponse,
  NFTEntryResponse,
  PostEntryResponse,
} from "../../backend-api.service";
import { GlobalVarsService } from "../../global-vars.service";
import { InfiniteScroller } from "../../infinite-scroller";
import { IAdapter, IDatasource } from "ngx-ui-scroll";
import { uniqBy } from "lodash";
import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";

@Component({
  selector: "trends",
  templateUrl: "./trends.component.html",
  styleUrls: ["./trends.component.scss"],
})
export class TrendsComponent implements OnInit {
  globalVars: GlobalVarsService;
  loading: boolean = false;
  nftCollections: NFTCollectionResponse[];
  lastPage: number;
  static PAGE_SIZE = 50;
  static WINDOW_VIEWPORT = true;
  static BUFFER_SIZE = 20;
  static PADDING = 0.5;
  startIndex = 0;
  endIndex = 20;
  dataToShow: NFTCollectionResponse[];
  selectedOptionWidth: string;
  pagedRequestsByTab = {};
  lastPageByTab = {};
  loadingNextPage = false;
  index = 0;
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

  tempNFTResponse: { NFTEntryResponses: NFTEntryResponse[]; PostEntryResponse: PostEntryResponse }[];
  nftResponse: { NFTEntryResponses: NFTEntryResponse[]; PostEntryResponse: PostEntryResponse }[];

  infiniteScroller: InfiniteScroller = new InfiniteScroller(
    TrendsComponent.PAGE_SIZE,
    this.getPage.bind(this),
    TrendsComponent.WINDOW_VIEWPORT,
    TrendsComponent.BUFFER_SIZE,
    TrendsComponent.PADDING
  );

  datasource: IDatasource<IAdapter<any>> = this.infiniteScroller.getDatasource();

  constructor(
    private _globalVars: GlobalVarsService,
    private backendApi: BackendApiService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.globalVars = _globalVars;
  }

  ngOnInit(): void {
    // code to remove extra query param if not required
    // this.router.navigate(
    //   ['.'],
    //   { relativeTo: this.route, queryParams: { } }
    // );
    // this.router.events.subscribe(resp=>{
    //   if(resp instanceof NavigationEnd){
    //     this.loadData();
    //   }
    // })
    this.nftResponse = [];
    this.loadNext();
    this.loadNext();
  }

  getPage(page: number) {
    const startIdx = page * TrendsComponent.PAGE_SIZE;
    const endIdx = (page + 1) * TrendsComponent.PAGE_SIZE;

    return new Promise((resolve, reject) => {
      resolve(this.nftResponse.slice(startIdx, Math.min(endIdx, this.nftResponse.length)));
    });
  }

  onScroll() {
    console.log("scrolling..!!");
    this.loadNext();
  }
  /*getNftsForUsers(showmore: boolean = false) {
    if (!showmore) {
      this.loading = true;
    }
    this.tempNFTResponse = [];
    this.nftResponse = [];
    for (let PK of this.PKList) {
      this.backendApi
        .GetNFTsForUser(this.globalVars.localNode, PK, this.globalVars.loggedInUser?.PublicKeyBase58Check, true)
        .subscribe(
          (res: {
            NFTsMap: { [k: string]: { PostEntryResponse: PostEntryResponse; NFTEntryResponses: NFTEntryResponse[] } };
          }) => {
            for (const k in res.NFTsMap) {
              const responseElement = res.NFTsMap[k];
              if (!responseElement.NFTEntryResponses[0]["IsPending"]) {
                this.tempNFTResponse.push(responseElement);
                console.log(responseElement);
              }
            }
            console.log(PK);
          }
        )
        .add(() => {
          this.loading = false;
        });
    }
    this.nftResponse = this.tempNFTResponse;
  }*/

  loadNext(showmore: boolean = false, responseSize: number = 0) {
    if (!showmore && this.index === 0) {
      this.loading = true;
    }

    return this.backendApi
      .GetNFTsForUser(
        this.globalVars.localNode,
        this.PKList[this.index],
        this.globalVars.loggedInUser?.PublicKeyBase58Check,
        true,
        false
      )
      .subscribe(
        (res: {
          NFTsMap: { [k: string]: { PostEntryResponse: PostEntryResponse; NFTEntryResponses: NFTEntryResponse[] } };
        }) => {
          for (const k in res.NFTsMap) {
            responseSize++;
            const responseElement = res.NFTsMap[k];
            this.nftResponse.push(responseElement);
            // dont load more than 20 per creator to not overflow the marketplace
            if (responseSize > 25) {
              break;
            }
          }
        },
        (error) => {
          this.globalVars._alertError(error.error.error);
        }
      )
      .add(() => {
        this.loading = false;
        this.index++;
        if (responseSize < 15) {
          this.loadNext(false, responseSize);
        }
      });
  }

  loadData(showmore: boolean = false) {
    if (!showmore) {
      this.loading = true;
    }
    this.backendApi
      .GetNFTShowcase(
        this.globalVars.localNode,
        this.globalVars.loggedInUser?.PublicKeyBase58Check,
        this.globalVars.loggedInUser?.PublicKeyBase58Check
      )
      .subscribe(
        (res: any) => {
          this.nftCollections = res.NFTCollections;
          if (this.nftCollections) {
            this.nftCollections.sort((a, b) => b.PostEntryResponse.TimestampNanos - a.PostEntryResponse.TimestampNanos);
            this.nftCollections = uniqBy(
              this.nftCollections,
              (nftCollection) => nftCollection.PostEntryResponse.PostHashHex
            );
          }
          this.dataToShow = this.nftCollections.slice(this.startIndex, this.endIndex);
          this.lastPage = Math.floor(this.nftCollections.length / TrendsComponent.PAGE_SIZE);
          if (showmore) {
            document.body.scrollTop = 0; // For Safari
            document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
          }
        },
        (error) => {
          this.globalVars._alertError(error.error.error);
        }
      )
      .add(() => {
        this.loading = false;
      });
  }
  showRecent() {
    //this.loadData(true);
  }
}
