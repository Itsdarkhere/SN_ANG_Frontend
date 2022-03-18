import { NumberSymbol } from "@angular/common";
import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { toInteger } from "lodash";
import { ApexChart, ApexAxisChartSeries, ApexYAxis, ApexXAxis, ApexDataLabels, ApexTooltip } from "ng-apexcharts";
import { GlobalVarsService } from "src/app/global-vars.service";

@Component({
  selector: "app-big-graph",
  templateUrl: "./big-graph.component.html",
  styleUrls: ["./big-graph.component.scss"],
})
export class BigGraphComponent implements OnChanges {
  @Input() graphArray: any;
  @Input() label: string;
  series: ApexAxisChartSeries;
  chart: ApexChart;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;

  capDeso: string;
  capUSD: string;

  weeklyChangePercentage: string;

  constructor(private globalVars: GlobalVarsService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.graphArray && this.graphArray) {
      this.initChartData();
      this.capDeso = this.globalVars.nanosToDeSo(this.graphArray[0]["WeeklyCap"], 0);
      this.capUSD = this.globalVars.nanosToUSD(this.graphArray[0]["WeeklyCap"], 0);
      this.calculateChangeFromPrevWeek();
    }
  }
  calculateChangeFromPrevWeek() {
    let increase = this.graphArray[0]["WeeklyCap"] - this.graphArray[1]["WeeklyCap"];
    let divideIncrease = increase / this.graphArray[1]["WeeklyCap"];
    let changeLong = divideIncrease * 100;
    this.weeklyChangePercentage = changeLong.toLocaleString("fullwide", { maximumFractionDigits: 3 });
  }

  initChartData(): void {
    let dates = [];

    for (let i = 0; i < this.graphArray.length; i++) {
      dates.push([this.graphArray[i]["Timestamp"], this.graphArray[i]["WeeklyCap"]]);
    }

    this.series = [
      {
        name: "DESO NFT " + this.label + " CAP",
        data: dates,
      },
    ];
    this.chart = {
      toolbar: {
        show: false,
        offsetX: 0,
        offsetY: 0,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          customIcons: [],
        },
      },
      type: "area",
      stacked: false,
      height: 350,
      zoom: {
        type: "x",
        enabled: true,
        autoScaleYaxis: true,
      },
    };
    this.dataLabels = {
      enabled: false,
    };
    this.xaxis = {
      type: "datetime",
    };
    this.yaxis = {
      labels: {
        formatter: function (val) {
          // Nanos to deso
          return (val / 1000000000).toFixed(0);
        },
      },
    };
  }
}
