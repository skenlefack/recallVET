import React from "react";
import ReactApexChart from "react-apexcharts";
import chartmg2 from './../../../../images/pt-2.png'


const ExpensesBarChart = () =>{
    const  series = [
        {
            name: 'Running',
            data: [50, 90, 90],
        }, 
        {
          name: 'Cycling',
          data: [50, 60, 55]
        }, 
    ];
      
   const options = {
        chart: {
            type: 'bar',
            height: 120,
            toolbar: {
                show: false,
            },            
        },
        plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: '90%',
              endingShape: "rounded",
              borderRadius: 3,
            },            
        },
        states: {
            hover: {
              filter: 'none',
            }
        },
        colors:['#81A4F9'],
        dataLabels: {
            enabled: false,
            offsetY: -10
        },        
		legend: {
            show: false,
            fontSize: '12px',
            labels: {
                colors: '#000000',                
            },
            markers: {
                width: 18,
                height: 18,
                strokeWidth: 8,
                strokeColor: '#000',
                fillColors: undefined,
                radius: 12,	
            }
        },
        stroke: {
            show: true,
            width:14,
            curve: 'smooth',
            lineCap: 'round',
            colors: ['transparent']
        },
        grid: {
            show: false,
            xaxis: {
                lines: {
                    show: false,
                }
            },
             yaxis: {
                lines: {
                    show: false
                }
            },  				
        },
        xaxis: {
            categories: ['JAN', 'FEB', 'MAR'],
            labels: {
                show: false,
                style: {
                    colors: '#A5AAB4',
                    fontSize: '14px',
                    fontWeight: '500',
                    fontFamily: 'poppins',
                    cssClass: 'apexcharts-xaxis-label',
                },
            },
            crosshairs: {
                show: false,
            },
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
            }, 			
        },
        yaxis: {
            labels: {
            show: false,
            offsetX:-16,
            style: {
                colors: '#000000',
                fontSize: '13px',
                fontFamily: 'poppins',
                fontWeight: 100,
                cssClass: 'apexcharts-xaxis-label',
            },
          },
        },
        fill: {			  
            type: 'image',
            opacity:1,
            image: {
              src: [chartmg2],
               width: undefined,
               height: undefined
            },            
        }
   }   
    return (
      <div id="expensesChart" className="chartBar">
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={120}          
        />
      </div>
    );
  
}
export default ExpensesBarChart;
