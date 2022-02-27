import { Component, HostListener, Input, OnChanges, OnDestroy, OnInit } from "@angular/core";
import Amplitude from "amplitudejs/dist/amplitude.js";
import { GlobalVarsService } from "../global-vars.service";
import { parse } from "path/posix";

@Component({
  selector: "app-audio-player",
  templateUrl: "./audio-player.component.html",
  styleUrls: ["./audio-player.component.scss"],
})
export class AudioPlayerComponent implements OnInit, OnDestroy {
  constructor(private globalVars: GlobalVarsService) {}
  @Input() songName: any;
  @Input() creator: any;
  @Input() audioSrc: any;

  mobile = false;

  ngOnInit(): void {
    this.setMobileBasedOnViewport();
    // Sets volume color correctly on init
    Amplitude.init({
      songs: [{
          name: this.songName,
          artist: this.creator,
          url: this.audioSrc,
      }],
      volume: 35,
      debug: true
    });
    Amplitude.setDebug(true);
    // The conditional rendering makes this not work without timeout
    setTimeout(() => {
      this.volumeColor();
    }, 100);
  }

  // Stop audio after navigating away from post page
  ngOnDestroy(): void {
    Amplitude.stop();
    console.log("destroyed");
  }

  // Set player volume level from slider on desktop
  setVolume($event: Event) {
    const playerVolume = $event.target as HTMLInputElement;
    Amplitude.setVolume(playerVolume.value);
    console.log(playerVolume.value);
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
