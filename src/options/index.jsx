import "./options.scss";

import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js";
import { useEffect } from "react";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useState } from "react";
import { Storage } from "@plasmohq/storage";

export default function Options() {
  const [ chartData, setChartData ] = useState();

  async function main() {
    registerChartJsConfig();
    setChartData(await getHistoryData());
  }

  useEffect(() => {
    main();
  }, []);

  return (
    <div className="stats">

      <div className="main-box">

        <div className="header">

          <h1>Statistics</h1>

          <button className="export">Export</button>

        </div>

        <div className="bar-container">
          {(chartData ? 
            <Bar
              data={{
                labels: ["11/1", "11/2", "11/3", "11/4", "11/5", "YESTERDAY", "TODAY"],
                datasets: [
                  {
                    label: 'FATHOMWERX GLS',
                    data: chartData,
                    backgroundColor: '#111111',
                    borderColor: '#ff0000',
                    borderWidth: "10px"
                  }
                ]
              }}
              options={{
                  scales: {
                      y: {
                          beginAtZero: true,
                          ticks: {
                              callback: function(value, index, values) {
                                return getHoursStr(value)
                            }
                          }
                      }
                  }
              }}
            />
          : <h1>Loading...</h1>)}
        </div>

      </div>

    </div>
  )

  function registerChartJsConfig() {
    ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title, ChartDataLabels);
    ChartJS.defaults.font.family = "Lexend";
    ChartJS.defaults.font.weight = 400;
    ChartJS.defaults.font.size = "15px";
    ChartJS.defaults.responsive = true;
    ChartJS.defaults.aspectRatio = false;
    // ChartJS.defaults.plugins.legend.position = 'bottom';
    ChartJS.defaults.plugins.legend.display = false;
    ChartJS.defaults.plugins.datalabels.color = "#ffffff";
    ChartJS.defaults.plugins.datalabels.align = "top";
    ChartJS.defaults.plugins.datalabels.formatter = (value, context) => {
      return getHoursMinutesChartStr(value);
    }
    ChartJS.defaults.plugins.datalabels.textAlign = "center";
  }

  async function getHistoryData() {
    let final = [];

    const data = await new Storage().get("history");
    if (!data) data = []; // TODO at least include current session

    let currentNightTs = new Date().setHours(3, 0, 0, 0); // 3am is midnight cuz I stay up late

    let currentDayTotal = 0;

    // Add current session if active
    if (await new Storage().get("isActive"))
      currentDayTotal = Date.now() - await new Storage().get("currentSessionStartTime");

    
    for (let i = (data.length-1); i >= 0; i--) {
      const obj = data[i];

      // If end time is greater than current days 3am, add.
      if (obj.endTime > currentNightTs) {
        currentDayTotal = currentDayTotal + (obj.endTime - obj.startTime);
      }

      // Preview next event.  If it is from a prev day
      if (data.length <= i+1) continue;
      const nextObj = data[i+1];
      if (nextObj.endTime < currentNightTs) {
        final.unshift(currentDayTotal);
        currentDayTotal = 0;
        currentNightTs = new Date(new Date().setDate(new Date(currentNightTs).getDate() - 1)).setHours(3, 0, 0, 0);
      }

    }

    final.unshift(currentDayTotal);

    const missing = 7 - final.length;
    if (missing >= 1) {
      for (let i = 0; i < missing; i++) {
        final.unshift(0);
      }
    }

    return final;

  }

}

function getHoursMinutesChartStr(duration) {
  const totalSeconds = Math.floor(duration / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const diffInMinutes = totalMinutes % 60;
  const diffInHours = Math.floor(totalMinutes / 60);

  return `${diffInHours} hr \n ${diffInMinutes} min`
}

function getHoursStr(duration) {
  const totalSeconds = Math.floor(duration / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const diffInHours = Math.floor(totalMinutes / 60);

  return `${diffInHours} hr`
}