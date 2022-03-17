import { Component, Input, OnChanges, SimpleChanges } from "@angular/core";
import { ApexChart, ApexAxisChartSeries, ApexYAxis, ApexXAxis, ApexDataLabels } from "ng-apexcharts";

@Component({
  selector: "app-small-graph",
  templateUrl: "./small-graph.component.html",
  styleUrls: ["./small-graph.component.scss"],
})
export class SmallGraphComponent implements OnChanges {
  @Input() graphArray: [];
  @Input() collectors: boolean;
  @Input() label: string;
  series: ApexAxisChartSeries;
  chart: ApexChart;
  yaxis: ApexYAxis;
  xaxis: ApexXAxis;
  dataLabels: ApexDataLabels;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.graphArray && this.graphArray) {
      this.initChartData();
    }
  }

  initChartData(): void {
    let dates = [];

    if (this.collectors) {
      for (let i = 0; i < this.graphArray.length; i++) {
        console.log(this.graphArray[i]["CollectorsAmount"]);
        console.log(this.graphArray[i]["Timestamp"]);
        dates.push([this.graphArray[i]["Timestamp"], this.graphArray[i]["CollectorsAmount"]]);
      }
    } else {
      for (let i = 0; i < this.graphArray.length; i++) {
        //console.log(this.graphArray[i]["CreatorsAmount"]);
        //console.log(this.graphArray[i]["Timestamp"]);
        dates.push([this.graphArray[i]["Timestamp"], this.graphArray[i]["CreatorsAmount"]]);
      }
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
          return (val / 1).toFixed(0);
        },
      },
    };
  }
}
