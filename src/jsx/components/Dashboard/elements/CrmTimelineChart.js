import React from "react";
import ReactApexChart from "react-apexcharts";

const  CrmTimelineChart = () => {
    var p = ["React", "UI", "JS", "PHP", "CSS"];
    const   series = [
        {
            data: [
                {
                  x: 'James',
                  y: [
                    new Date('2019-02-27').getTime(),
                    new Date('2019-03-04').getTime()
                  ],
                  fillColor: 'var(--primary)'
                },
                {
                  x: 'Robert',
                  y: [
                    new Date('2019-03-04').getTime(),
                    new Date('2019-03-08').getTime()
                  ],
                  fillColor: 'var(--secondary)'
                },
                {
                  x: 'Mary',
                  y: [
                    new Date('2019-03-07').getTime(),
                    new Date('2019-03-10').getTime()
                  ],
                  fillColor: '#3a9b94'
                },
                {
                  x: 'Patricia',
                  y: [
                    new Date('2019-03-08').getTime(),
                    new Date('2019-03-12').getTime()
                  ],
                  fillColor: '#666cff'
                },
                {
                  x: 'Smith',
                  y: [
                    new Date('2019-03-12').getTime(),
                    new Date('2019-03-17').getTime()
                  ],
                  fillColor: '#FF4560'
                }
            ]
        }
    ];
    const  options = {
        chart: {
            height: 260,
            type: 'rangeBar',
            parentHeightOffset: 0,
             toolbar: {
                 show: false,
             }
        },
        plotOptions: {
          bar: {
            horizontal: !0,            			
            distributed: !0,         
            dataLabels: {
                hideOverflowingLabels: !1
            }         
          },
        },
         
        legend: {
            show: false,
        },
        dataLabels: {
            enabled: true,
            formatter: function(val, opts) {
              var label = opts.w.globals.labels[opts.dataPointIndex];
              // var a = 10;
              // var b = 20;
              var diff = 5;
              return label + ': ' + diff + (diff > 1 ? ' days' : ' day');
            },
            style: {
              colors: ['#f3f4f5', '#fff'],
              
            },
        },
        xaxis: {
            type: 'datetime',
            axisTicks: {
                show: !1
            },
            axisBorder: {
                show: !1
            },
            labels: {
                style: {
                    colors: '#ee'
                },
                datetimeFormatter: {
                    year: "MMM",
                    month: "MMM"
                }
            }
        },
        yaxis: {
            labels: {
               show: !0,
               align: "left",
               style: {
                  fontSize: "0.875rem",
                  colors: 'black'
               }
            }
        },
        grid: {
            strokeDashArray: 6,
            borderColor: '#eee',
            xaxis: {
              lines: {
                 show: !0
              }
           },
           yaxis: {
              lines: {
                 show: !1
              }
           },
           padding: {
              top: -32,
              left: 15,
              right: 18,
              bottom: 4
           },
       },
       responsive: [{
            breakpoint: 1920,
            options: {
            dataLabels: {
                formatter: function (e, t) {
                    return p[t.dataPointIndex]
                }
            }
            }
        }]
       
      
    } 
    
    return (
        <div id="ProjectChart ">
            <ReactApexChart
                options={options}
                series={series}
                type="rangeBar"
                height={260}
            />
        </div>
    );
  
}
export default CrmTimelineChart;