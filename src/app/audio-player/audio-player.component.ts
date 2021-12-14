import { Component, Input, OnChanges, OnInit } from "@angular/core";
import Amplitude from "amplitudejs/dist/amplitude.js";
import { parse } from "path/posix";

@Component({
  selector: "app-audio-player",
  templateUrl: "./audio-player.component.html",
  styleUrls: ["./audio-player.component.scss"],
})
export class AudioPlayerComponent implements OnInit {
  constructor() {}
  @Input() songName: any;
  @Input() creator: any;
  @Input() audioSrc: any;

  ngOnInit(): void {
    console.log(this.songName + " " + this.creator + " " + this.audioSrc);
    // Sets volume color correctly on init
    this.volumeColor();
    Amplitude.init({
      songs: [
        {
          name: this.songName,
          artist: this.creator,
          url: this.audioSrc,
        },
      ],
    });
  }
  volumeColor() {
    let volumeRange = document.getElementById("volume-slider") as HTMLInputElement;
    var value = (parseFloat(volumeRange.value) / 100) * 100;
    volumeRange.style.background =
      "linear-gradient(to right, #3A3A3A 0%, #3A3A3A " + value + "%, #EEEEEE " + value + "%, #EEEEEE 100%)";
  }
}
