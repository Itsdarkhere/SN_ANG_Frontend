import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { ApexChart, ApexAxisChartSeries, ApexYAxis, ApexXAxis, ApexDataLabels, ApexTooltip } from "ng-apexcharts";
import { GlobalVarsService } from "src/app/global-vars.service";

@Component({
  selector: "app-big-graph",
  templateUrl: "./big-graph.component.html",
  styleUrls: ["./big-graph.component.scss"],
})
export class BigGraphComponent implements OnChanges {
  @Input() graphArray: [];
  series: ApexAxisChartSeries;
  chart: ApexChart;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;

  constructor(private globalVars: GlobalVarsService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.graphArray && this.graphArray) {
      this.initChartData();
    }
  }

  initChartData(): void {
    let dates = [];

    for (let i = 0; i < this.graphArray.length; i++) {
      console.log(this.globalVars.nanosToDeSo(this.graphArray[i]["WeeklyCap"], 4));
      dates.push([this.graphArray[i]["Timestamp"], this.graphArray[i]["WeeklyCap"]]);
    }

    this.series = [
      {
        name: "DESO NFT MARKET CAP",
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
