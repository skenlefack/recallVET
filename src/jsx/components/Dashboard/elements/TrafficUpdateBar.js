import React from "react";
import ReactApexChart from "react-apexcharts";

const TrafficUpdateBar = () =>{
    const  series = [
        {
            name: 'Income',
             data: [31, 40, 28,31, 40, 28,31, 40, 28,31, 40, 28]
        }, 
        {
          name: 'Expense',
           data: [11, 32, 45,38, 25, 20,36, 45, 15,11, 32, 45]
        },  
    ];
    
    const options = {
        chart: {
            type: 'bar',
            height: 300,
            toolbar: {
                show: false,
            },            
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '45%',
                endingShape: "rounded",
                borderRadius: 5,
            },            
        },
        // states: {
        //     hover: {
        //         filter: 'none',
        //     }
        // },
        colors:['var(--primary)', '#77248B'],
        // colors:['#f9c35c', 'var(--primary-light)'],
        dataLabels: {
            enabled: false,                
        },        
        markers: {
            shape: "circle",
        },
        legend: {
            show: false,
            fontSize: '12px',
            labels: {
                colors: '#000000',                
            },
            markers: {
                width: 30,
                height: 30,
                strokeWidth: 0,
                strokeColor: '#fff',
                fillColors: undefined,
                radius: 35,	
            }
        },
        
        stroke: {
            show: true,
            width:6,
            colors: ['transparent']
        },
        grid: {
			borderColor: 'rgba(252, 252, 252,0.2)',
		},
        
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar','Apr','May','Jun','Jul','Agu', 'Sep', 'Oct','Nev','Dec'],           
            labels: {                    
                style: {
                    colors: '#000',
                    fontSize: '13px',
                    fontFamily: 'poppins',
                    fontWeight: 100,
                    cssClass: 'apexcharts-xaxis-label',
                },
            },
            axisBorder: {
                show: false,
            },
            axisTicks: {
                show: false,
                borderType: 'solid',
                color: '#78909C',
                height: 6,
                offsetX: 0,
                offsetY: 0
            },
            crosshairs: {
              show: false,
            }             			
        },
        yaxis: {
            labels: {
				offsetX:-16,
			   style: {
				  colors: '#000',
				  fontSize: '13px',
				   fontFamily: 'poppins',
				  fontWeight: 100,
				  cssClass: 'apexcharts-xaxis-label',
               }
			},
        },
        fill: {
            opacity: 1,
            colors:['var(--primary)', '#FFD125'],
          },
        tooltip: {
            y: {
              formatter: function (val) {
                return "$ " + val + " thousands"
              }
            }
        },
        responsive: [{
			breakpoint: 575,
			options: {
				plotOptions: {
				  bar: {
					columnWidth: '1%',
					borderRadius: -1,
				  },
				},
				
				chart:{
					height:200,
				},
				series: [
					{
						name: 'Projects',
						 data: [31, 40, 28,31, 40]
					}, 
					{
					  name: 'Projects',
					   data: [11, 32, 45,31, 40]
					}, 
					
				],
				xaxis: {
				  categories: ['Jan', 'Feb', 'Mar','Apr','May','Jun','Jul'],
				},
			}
		}]
}   
return (
    <div id="chartBarRunning">
        <ReactApexChart
            options={options}
            series={series}
            type="bar"
            height={300}          
        />
    </div>
);    
}
export default TrafficUpdateBar;