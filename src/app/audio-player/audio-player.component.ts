import { Component, HostListener, Input, OnChanges, OnInit } from "@angular/core";
import Amplitude from "amplitudejs/dist/amplitude.js";
import { GlobalVarsService } from "../global-vars.service";
import { parse } from "path/posix";

@Component({
  selector: "app-audio-player",
  templateUrl: "./audio-player.component.html",
  styleUrls: ["./audio-player.component.scss"],
})
export class AudioPlayerComponent implements OnInit {
  constructor(private globalVars: GlobalVarsService) {}
  @Input() songName: any;
  @Input() creator: any;
  @Input() audioSrc: any;

  mobile = false;

  ngOnInit(): void {
    this.setMobileBasedOnViewport();
    // Sets volume color correctly on init
    Amplitude.init({
      songs: [
        {
          name: this.songName,
          artist: this.creator,
          url: this.audioSrc,
        },
      ],
    });
    // The conditional rendering makes this not work without timeout
    setTimeout(() => {
      this.volumeColor();
    }, 100);
  }
  volumeColor() {
    let volumeRange = document.getElementById("volume-slider") as HTMLInputElement;
    var value = (parseFloat(volumeRange.value) / 100) * 100;
    volumeRange.style.background =
      "linear-gradient(to right, #3A3A3A 0%, #3A3A3A " + value + "%, #EEEEEE " + value + "%, #EEEEEE 100%)";
  }
  setMobileBasedOnViewport() {
    this.mobile = this.globalVars.isMobile();
  }

  @HostListener("window:resize")
  onResize() {
    this.setMobileBasedOnViewport();
  }
}
