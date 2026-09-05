import React from "react";
import ReactApexChart from "react-apexcharts";

class CrmExtranalChart extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			series: [{
				name: 'Sent',
				data: [40, 55, 15,40,55, 15,40,50]
			}, {
				name: 'Answered',
				data: [55, 55, 35,60,55, 35,60,30]
			}, {
				name: 'Hired',
				data: [20, 17, 55, 45,17, 55, 45,20]
			}],
			options: {
				chart: {
					type: 'bar',
					height: 250,
					stacked: true,
					toolbar: {
						show: false,
					}
				},
				plotOptions: {
					bar: {						
                        horizontal: false,
                        columnWidth: '40%',                        
                        endingShape: "rounded",
                        startingShape: "rounded",
                        backgroundRadius: 10,
                        colors: {
                            backgroundBarColor: '#fff',
                            backgroundBarOpacity: 1,
                            backgroundBarRadius: 10,
                        },
					},
				},
				colors:['var(--secondary)', 'var(--primary-light)', '#58bad7'],
				stroke: {
					width: 5,
					colors: ['#fff'],					
				},
				xaxis: {
					show: false,
					axisBorder: {
						show: false,
					},
					axisTicks: {
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
					show: false,					
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
				}],				
			}, 
		};
	}

	render() {
		return (
			<div id="volumeChart" className="VolumeChart">
				<ReactApexChart
				  options={this.state.options}
				  series={this.state.series}
				  type="bar"
				  height={250} 
				  
				/>
			</div>
		);
	}
}

export default CrmExtranalChart;