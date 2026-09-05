import React from "react";
import ReactApexChart from "react-apexcharts";

const TotalProfitBar = () =>{
    const  series = [
        {
            name: 'Sent',
            data: [40, 55, 15,40]
        }, {
            name: 'Answered',
            data: [55, 55, 35,60]
        }, {
            name: 'Hired',
            data: [20, 17, 55, 45]
        }
    ];
      
   const options = {
        chart: {
            type: 'bar',
            height: 160,        
            stacked: true,   
            toolbar: {
                show: false,
            },
        },
        plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: '30%',
              endingShape: "rounded",
              backgroundRadius: 10,
            //   borderRadius: 5,
                colors: {
                    backgroundBarColor: '#fff',
                    backgroundBarOpacity: 1,
                    backgroundBarRadius: 10,
                },
            },            
        },
        stroke:{
            width:4,
            colors:["#fff"]
        },
        colors:['#FEC64F', 'var(--secondary)', '#DBDBDB'],
        
        xaxis: {
            show: false,
            axisBorder: {
                show: false,
            },            
            labels: {
                show: false,	
                style: {
                    colors: '#828282',
                    fontSize: '14px',
                    fontFamily: 'Poppins',
                    fontWeight: 'light',
                    cssClass: 'apexcharts-xaxis-label',
                },
            },
            axisTicks: {
                show: false,
            },
            crosshairs: {
                show: false,
            },
            
        },
        yaxis: {
            show: false,
            labels: {
                style: {
                    colors: '#828282',
                    fontSize: '14px',
                    fontFamily: 'Poppins',
                    fontWeight: 'light',
                    cssClass: 'apexcharts-xaxis-label',
                },
            },
        },
        grid: {
            show: false,
            borderColor: '#DBDBDB',
            strokeDashArray: 10,
            position: 'back',
            xaxis: {
                lines: {
                    show: false
                }
            },   
            yaxis: {
                lines: {
                    show: true
                }
            },
        },
        toolbar: {
            enabled: false,
        },
        dataLabels: {
          enabled: false
        },
        legend: {
            show:false
        },
        fill: {
            opacity: 1
        },
        responsive: [{
            breakpoint: 1601,
            options: {
                plotOptions: {
                    bar: {
                        columnWidth: '60%',
                    },
                    
                },
            },
        }]
   }   
    return (
      <div id="columnChart">
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={160}          
        />
      </div>
    );
  
}
export default TotalProfitBar;