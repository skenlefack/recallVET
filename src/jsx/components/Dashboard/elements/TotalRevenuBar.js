import React from "react";
import ReactApexChart from "react-apexcharts";

const TotalRevenuBar = () =>{
    const  series = [
        {
            name: 'Net Profit',
            data: [15, 55, 90, 80, 25, 15, 70,25, 15, 70],                
        }, 
        {
          name: 'Revenue',
          data: [60, 65, 15, 35, 30, 40, 30,35, 30, 5]
        }, 
    ];
    
const options = {
        chart: {
            type: 'bar',
            height: 220,
            toolbar: {
                show: false,
            },            
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '50%',
                endingShape: "rounded",
                // borderRadius: 3,
            },            
        },
        // states: {
        //     hover: {
        //         filter: 'none',
        //     }
        // },
        colors:['#f9c35c', 'var(--primary-light)'],
        dataLabels: {
            enabled: false,                
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
                strokeColor: '#fff',
                fillColors: undefined,
                radius: 12,	
            }
        },
        markers: {
            shape: "circle",
        },
        stroke: {
            show: true,
            width:1,
            // curve: 'smooth',
            // lineCap: 'round',
            colors: ['transparent']
        },
        // grid: {
        //     show: false,
        //     xaxis: {
        //         lines: {
        //             show: false,
        //         }
        //     },
        //     yaxis: {
        //         lines: {
        //             show: false
        //         }
        //     },  				
        // },
        xaxis: {
            categories: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
            grid: {
                color: "rgba(233,236,255,0.5)",
                drawBorder: true
            },
            labels: {                    
                style: {
                    colors: '#787878',
                    fontSize: '13px',
                    fontFamily: 'poppins',
                    fontWeight: 100,
                    cssClass: 'apexcharts-xaxis-label',
                },
            },
            crosshairs: {
                show: false,
            },
            // axisBorder: {
            //     show: false,
            // },
            // axisTicks: {
            //     show: false,
            // }, 			
        },
        yaxis: {
            labels: {                                        
                style: {
                    colors: '#787878',
                    fontSize: '13px',
                    fontFamily: 'poppins',
                    fontWeight: 100,
                    cssClass: 'apexcharts-xaxis-label',
                },
            },
        },
        fill: {			  
            opacity: 1,                          
        },
        tooltip: {
            y: {
              formatter: function (val) {
                return "$ " + val + " thousands"
              }
            }
          }
}   
return (
    <div id="chartBar" className="chartBar">
        <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={220}          
        />
    </div>
);    
}
export default TotalRevenuBar;