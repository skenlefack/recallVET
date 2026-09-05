import React from "react";
import ReactApexChart from "react-apexcharts";

class ProfileChart extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        series: [30, 40, 20],

      options: {
        chart: {
          type: 'donut',
          width: 210,
        },
        stroke: {
            show: true,
            curve: 'smooth',
            lineCap: 'butt',
            colors: '#000',
            width: 1,
            dashArray: 0,      
        },
        legend: {
            show: false,
        },
        colors: ['#FFF37A', 'var(--primary-light)', '#FFD0C5'],
        labels: ["Male", "Female","Other"],
        dataLabels: {
            enabled: false,
        },
        plotOptions: {          
            pie: {
                donut: {
                    size: '75%',
                    labels: {
                        show: true,
                        name: {
                          show: true,
                          offsetY: 12,
                        },
                        value: {
                          show: false,
                          fontSize: '24px',
                          fontFamily:'Arial',
                          fontWeight:'500',
                          offsetY: -17,
                        },
                        total: {
                          show: false,
                          fontSize: '11px',
                          fontWeight:'500',
                          fontFamily:'Arial',
                          label: 'Total projects', 
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
      <div id="projectChart" className="project-chart">
        <ReactApexChart
          options={this.state.options}
          series={this.state.series}
          type="donut"
          width={210}
        />
      </div>
    );
  }
}

export default ProfileChart;
