import React from "react";

import ReactApexChart from "react-apexcharts";

function generateData(count, yrange, includeZ) {
    var i = 0;
    var series = [];
    if (!includeZ)
        includeZ = false;
    while (i < count) {
        var x = Math.floor(Math.random() * (750 - 1 + 1)) + 1;
        var y = Math.floor(Math.random() * (yrange.max - yrange.min + 1)) + yrange.min;
        var z = Math.floor(Math.random() * (75 - 15 + 1)) + 15;
        if (includeZ) {
            series.push([x, y, z]);
        } else {
            series.push([x, y]);
        }
        i++;
    }
    return series;
}

const  series = [
    {
        name: 'Dribble',
        data: generateData(18, {
            min: 0,
            max: 90
        })
    },
    {
        name: 'Facebook',
        data: generateData(18, {
            min: 0,
            max: 90
        })
    },
    {
        name: 'Meta',
        data: generateData(18, {
            min: 0,
            max: 90
        })
    },
    {
        name: 'Google',
        data: generateData(18, {
            min: 0,
            max: 90
        })  
    },     
];
const  options = {
    chart: {
        height: 250,            
        type: 'heatmap',
        toolbar: {
            show: false,
        }
    },
    plotOptions: {            
      bar: {
        columnWidth: "70%"        
      },
    },        
    stroke: {
        show: true,
        curve: 'smooth',
        lineCap: 'butt',
        colors: ['#fff'],
        width: 8,
        dashArray: 0,      
    },
    dataLabels: {
      enabled: false
    },
    colors: ['#452b90','#ffd125'],
    title: {
    //   text: ''
    },      
} 
const  SalesFigureChart = () => {
    
    return (
        <div id="salesFigures">
            <ReactApexChart
                options={options}
                series={series}
                type="heatmap"
                height={250}
            />
        </div>
    );
  
}
export default SalesFigureChart;
