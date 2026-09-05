import React from "react";

import ReactApexChart from "react-apexcharts";

function generateDayWiseTimeSeries(baseval, count, yrange) {
    var i = 0;
    var series = [];
    while (i < count) {
        var x = baseval;
        var y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;
        series.push([x, y]);
        baseval += 86400000;
        i++;
    }
    return series;
}

const  SalesStatisticsArea = () => {
    const   series = [
        {
            name: 'Order',
            data: generateDayWiseTimeSeries(new Date('11 Feb 2017 GMT').getTime(), 20, {
              min: 10,
              max: 5287
            })
        },
        {
            name: 'Profit',
            data: generateDayWiseTimeSeries(new Date('11 Feb 2017 GMT').getTime(), 20, {
                min: 10,
                max: 5658
            })
        },
        {
            name: 'Last Month',
            data: generateDayWiseTimeSeries(new Date('11 Feb 2017 GMT').getTime(), 20, {
                min: 10,
                max: 8554
            })
        }	       
    ];
    const  options = {
        chart: {
            type: 'area',
            height: 350,
            stacked: true,
            events: {
              selection: function (chart, e) {
                console.log(new Date(e.xaxis.min))
              }
            },
            toolbar: {
                show: false,
            },
        },
        colors: ['var(--primary-light)', '#DCDFE5', '#FFCCC0'],

        dataLabels: {
            enabled: false
          },
        stroke: {
            curve: 'smooth'
        },
        fill: {
            type: 'gradient',
            gradient: {
                opacityFrom: 0.9,
                opacityTo: 0.5,
            }
        },
        legend: {
            position: 'top',
            horizontalAlign: 'left'
        },
        xaxis: {
            type: 'datetime'
        },      
    } 
    
    return (
        <div id="VisitorsChart">
            <ReactApexChart
                options={options}
                series={series}
                type="area"
                height={350}
            />
        </div>
    );
  
}
export default SalesStatisticsArea;
