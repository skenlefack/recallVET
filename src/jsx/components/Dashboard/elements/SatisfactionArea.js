import React from "react";
import ReactApexChart from "react-apexcharts";

const  SatisfactionArea = () => {
    const   series = [
        {
            name: 'series1',
            data: [200, 400, 300, 400]
        }, {
            name: 'series2',
            data: [500, 300, 400, 200]
        }            
    ];
    const  options = {
        chart: {
            type: 'area',
            height: 250,            
            toolbar: {
                show: false
            },            
        },
        colors:["var(--primary-light)","#DCDFE5"],
        dataLabels: {
            enabled: false
        },
        legend:{
			show:false
		},
        stroke: {
            curve: 'smooth',
            width:3,
            colors:["var(--primary-light)","#DCDFE5"],
        },
        grid:{
			show:false,
			strokeDashArray: 6,
			borderColor: '#dadada',
		},
        yaxis: {
            labels: {
              style: {
                  colors: '#B5B5C3',
                  fontSize: '12px',
                  fontFamily: 'Poppins',
                  fontWeight: 400
                  
              },
              formatter: function (value) {
                return value + "k";
              }
            },
        },
        xaxis: {
            categories: ["Week 01","Week 02","Week 03","Week 04"],
            labels:{
                style: {
                  colors: '#B5B5C3',
                  fontSize: '12px',
                  fontFamily: 'Poppins',
                  fontWeight: 400
                  
              },
            }
        },
        fill:{
			type:'solid',
			opacity:0.9
		},
        tooltip: {
            x: {
              format: 'dd/MM/yy HH:mm'
            },
        },
      
    } 
    
    return (
        <div id="customerChart">
            <ReactApexChart
                options={options}
                series={series}
                type="area"
                height={250}
            />
        </div>
    );
  
}
export default SatisfactionArea;
