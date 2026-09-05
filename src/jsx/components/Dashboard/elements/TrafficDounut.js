import React from "react";
import ReactApexChart from "react-apexcharts";

class TrafficDounut extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      series: [12, 30, 20, 40,20],
      options: {
        chart: {
			type: 'donut',
			width: 270,
		},
        colors: ['#3AC977','#666cff',  '#000','var(--primary-light)', 'var(--secondary-light)'],
        labels: ["Html", "CSS", "SCSS","C++","JavaScript"],
        dataLabels: {
            enabled: false,
        },      
        
        legend: {
          show: false,
        },
        plotOptions: {          
            pie: {
                donut: {
                    size: '80%',
                    labels: {
                        show: true,
                        name: {
                          show: true,
                          offsetY: 12,
                        },
                        value: {
                          show: true,
                          fontSize: '22px',
                          fontFamily:'Arial',
                          fontWeight:'500',
                          offsetY: -17,
                        },
                        total: {
                          show: true,
                          fontSize: '11px',
                          fontWeight:'500',
                          fontFamily:'Arial',
                          label: 'SCSS', 
                        //   color: 'var(--primary)',                                            
                          formatter: function (w) {
                            return w.globals.seriesTotals.reduce((a, b) => {
                              return a + b
                            }, 0)
                          }
                        }
                    }
                }
            }

        },
       
      },
    };
  }

  render() {
    return (
      <div id="Traffic">
        <ReactApexChart
          options={this.state.options}
          series={this.state.series}
          type="donut"
          width={270}
        />
      </div>
    );
  }
}

export default TrafficDounut;
