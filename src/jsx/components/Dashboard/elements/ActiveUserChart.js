import React, { Component } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';


ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

class ActiveUserChart extends Component {
  render() {
    const data = {      
      labels: ["0", "1", "2", "3", "4", "5", "6", "0", "1", "2", "3", "4", "5", "6"],
      datasets: [
        {
          label: "My First dataset",
            data: [65, 59, 80, 81, 56, 55, 40, 65, 59, 80, 81, 56, 55, 40],
            backgroundColor: "rgba(88,186,215,1)",
		        strokeColor: "rgba(69,43,144,1)",
            pointColor: "rgba(0,0,0,0)",
            pointStrokeColor: "rgba(58,223,174,1)",
            pointHighlightFill: "rgba(58,223,174,1)",
            pointHighlightStroke: "rgba(58,223,174,1)",
            barThickness: 7
		   
        },
      ],
    };

    const options = {
     plugins:{
		legend: false,	
	 },
      scales: {
        y:
          {
            display: false,            
            grid:{
                display: false
            }
          },
        
        x: 
          {
           display : false,
            barPercentage: 1,
            grid:{
              display: false
            }
          },
        
      },
    };

    return (
      <div id="activeUser">
        <Bar data={data} height={120} options={options} />
      </div>
    );
  }
}

export default ActiveUserChart;
