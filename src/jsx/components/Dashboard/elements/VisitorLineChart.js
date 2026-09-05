import React from "react";
import ReactApexChart from "react-apexcharts";

const VisitorLineChart = (props) =>{
    const  series = [
        {
            name: 'series1',
            data: [200, 400, 300, 400, 200, 400]
          },
          {
            name: 'series3',
            data: [100, 200, 500, 300, 100, 300]
          },{
            name: 'series2',
            data: [500, 300, 400, 200, 500, 200]
          }
    ];
      
   const options = {
        chart: {
            type: 'line',
			height: 190,
            toolbar: {
                show: false,
            },           
        },
        colors:["var(--primary-light)","var(--secondary)","#d7e2ff"],
		dataLabels: {
		  enabled: false,
            style: {
                colors: ['#000'],
            }
		},
        legend: {
			show: false,
		},
		stroke: {
            curve: 'smooth',
		    width: 3,		    
		    colors:["var(--primary-light)","var(--secondary)","#d7e2ff"],
		},
		grid: {
			show:false,
			strokeDashArray: 6,
			borderColor: '#dadada',
		},       
        xaxis: {
			categories: ["Week 01","Week 02","Week 03","Week 04","Week 05","Week 06"],
		    labels:{
			  style: {
				colors: '#B5B5C3',
				fontSize: '12px',
				fontFamily: 'Poppins',
				fontWeight: 400				
			},
		  }
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
        fill:{
			type:'solid',
			opacity:1
		},
        
        tooltip: {
			enabled:true,
			style: {
				fontSize: '12px',
			},
			y: {
				formatter: function(val) {
					return "$" + val + " thousands"
				}
			}   
		}
   }   
    return (
      <div id="marketChart">
        <ReactApexChart
          options={options}
          series={series}
          type="line"
          height={190}
        />
      </div>
    );
  
}

export default VisitorLineChart;

