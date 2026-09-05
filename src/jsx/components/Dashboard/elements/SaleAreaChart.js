import React from "react";
import ReactApexChart from "react-apexcharts";

const SaleAreaChart = (props) =>{
    const  series = [
        {
          name: "Net Profit",
          data: [100,300, 100, 400, 200, 400],
        },
    ];
      
   const options = {
        chart: {
            type: 'line',
			height: props.height,
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
        colors:['var(--primary)'],
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
		  colors:['var(--primary)'],
		},
		grid: {
			show:false,
			borderColor: '#eee',
			padding: {
				top: 0,
				right: 0,
				bottom: 0,
				left: 0,
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
			categories: ['Jan', 'feb', 'Mar', 'Apr', 'May', 'June'],
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
      <div id="SalesChart">
        <ReactApexChart
          options={options}
          series={series}
          type="line"
          height={props.height}
        />
      </div>
    );
  
}

export default SaleAreaChart;

