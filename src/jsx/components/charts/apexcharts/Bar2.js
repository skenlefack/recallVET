import React from "react";

import ReactApexChart from "react-apexcharts";

class ApexBar2 extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [
        {
          name: "Cycling",
          data: [80, 40, 55, 20, 45, 30, 80, 90, 85, 90, 30],
        },
      ],
      options: {
        chart: {
          type: "bar",
          height: 230,
          toolbar: {
            show: false,
          },
        },
        plotOptions: {
          bar: {
            horizontal: false,
            dataLabels: {
              position: "top",
            },
          },
        },
        colors: ["var(--primary)"],
        legend: {
          show: false,
          position: "top",
          horizontalAlign: "left",
        },
        dataLabels: {
          enabled: false,
          offsetX: -6,
          style: {
            fontSize: "12px",
            // colors: ["#fff"],
          },
        },
        stroke: {
          show: false,
        },
        yaxis: {
          lines: {
            show: false,
          },
        },
        xaxis: {
          show: false,
          categories: [2013, 2014, 2015,2016,2017,2018,2019,2020,2021,2022,2023],
        },
      },
    };
  }

  render() {
    return (
      <div id="chart" className="line-chart-style bar-chart">
        <ReactApexChart
          options={this.state.options}
          series={this.state.series}
          type="bar"
          height={300}
        />
      </div>
    );
  }
}
export default ApexBar2;
