import { Component, Input, OnInit } from "@angular/core";
import Amplitude from "amplitudejs/dist/amplitude.js";

@Component({
  selector: "app-audio-player",
  templateUrl: "./audio-player.component.html",
  styleUrls: ["./audio-player.component.scss"],
})
export class AudioPlayerComponent implements OnInit {
  @Input() songName: string;
  @Input() creator: string;
  @Input() audioSrc: string;
  constructor() {}

  ngOnInit(): void {
    Amplitude.init({
      songs: [
        {
          name: this.songName,
          artist: this.creator,
          url: "https://vffn2ikpzn353wl3p7bgvv32w2m6oebwrjt6wqfurswv6tpffj5a.arweave.net/qUrdIU_Ld93Ze3_Catd6tpnnEDaKZ-tAtIytX03lKno",
        },
      ],
    });
  }
}
