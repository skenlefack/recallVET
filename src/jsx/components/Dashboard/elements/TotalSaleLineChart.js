import React from "react";
import ReactApexChart from "react-apexcharts";

const  TotalSaleLineChart = (props) => {
    const   series = [
        {
            name: 'Net Profit',
            data: [21, 9, 36, 12, 44, 25, 59, 41, 66, 25],           
        }, 	       
    ];
    const  options = {
        chart: {
          type: "line",
          height: 50,
           toolbar: {
                show: false,
            },
            zoom: {
                enabled: false
            },
            sparkline: {
                enabled: true
            }
        },
        colors:[props.colorTheme],

        dataLabels: {
            enabled: false,           
        },
          
        legend: {
            show: false,            
        },
        stroke: {
            show: true,
            width: 2,
            curve:'smooth',
            // colors:['var(--primary)'],
            colors:[props.colorTheme],
        },
        grid: {
			show:false,
			borderColor: '#eee',
			padding: {
				top: 0,
				right: 0,
				bottom: 0,
				left: 0
			}
		},
        markers: {
            size: [3],
            strokeWidth: [2],
            strokeColors: ['#fff'],
            border:3,
            radius: 4,
            colors:[props.colorTheme],
            hover: {
              size: 10,
            }
        },
        states: {
            normal: {
                filter: {
                    type: 'none',
                    value: 0
                }
            },
            hover: {
                filter: {
                    type: 'none',
                    value: 0
                }
            },
            active: {
                allowMultipleDataPointsSelection: false,
                filter: {
                    type: 'none',
                    value: 0
                }
            }
        },
        xaxis: {
			categories: ['Jan', 'feb', 'Mar', 'Apr', 'May', 'June', 'July','August', 'Sept','Oct'],
			axisBorder: {
				show: false,
			},
			axisTicks: {
				show: false
			},
			labels: {
				show: false,
				style: {
					fontSize: '12px',
				}
			},
			crosshairs: {
				show: false,
				position: 'front',
				stroke: {
					width: 1,
					dashArray: 3
				}
			},
			tooltip: {
				enabled: true,
				formatter: undefined,
				offsetY: 0,
				style: {
					fontSize: '12px',
				}
			}
		},
		yaxis: {
			show: false,
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
        <div id="totalSale">
            <ReactApexChart
                options={options}
                series={series}
                type="line"
                height={50}
            />
        </div>
    );
  
}
export default TotalSaleLineChart;
