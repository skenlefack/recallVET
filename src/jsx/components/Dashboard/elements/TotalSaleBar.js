import React from "react";
import ReactApexChart from "react-apexcharts";

const TotalSaleBar = () =>{
    const  series = [
        {
            name: "Earning",
            data: [15, 10, 20, 8, 12, 18, 12, 5,18, 12, 5]
        }, {
            name: "Expense",
            data: [-7, -10, -7, -12, -6, -9, -5, -8,-9, -5, -8]
        }
    ];
      
   const options = {
        chart: {
            type: 'bar',
            height: 150,        
            stacked: true,   
            toolbar: {
                show: false,
            },
        },
        plotOptions: {
            bar: {
              horizontal: false,
              columnWidth: '25%',
              endingShape: "rounded",
              borderRadius: 5,
            },            
        },
        stroke:{
            width:5,
            colors:["#fff"]
        },
        colors:['var(--secondary)', 'var(--primary)', '#58bad7'],
        
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
            show: !1,
            padding: {
                top: -40,
                bottom: -20,
                left: -10,
                right: -2
            }
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
      <div id="TotalEarning">
        <ReactApexChart
          options={options}
          series={series}
          type="bar"
          height={150}          
        />
      </div>
    );
  
}
export default TotalSaleBar;
