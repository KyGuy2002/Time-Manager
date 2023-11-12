import "./options.scss";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from "chart.js";
import { useEffect } from "react";
import { Bar } from "react-chartjs-2";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { useState } from "react";
import { Storage } from "@plasmohq/storage";
import { DateTime } from "luxon";
import _ from "lodash";
import { useStorage } from "@plasmohq/storage/hook";
import ProjectFilter from "./projectFilter/ProjectFilter";

export default function Options() {
  const [ chartData, setChartData ] = useState();
  const [isActive, setIsActive] = useStorage({key: "isActive", instance: new Storage({area: "local"})}, false);
  const [filteredProjects, setFilteredProjects] = useStorage({key: "filteredProjects", instance: new Storage({area: "local"})}, []);
  const [filtersOpen, setFiltersOpen] = useState(false);


  // Initial tasks
  useEffect(() => {
    registerChartJsConfig();
  }, []);


  // Rerender screen every second
  useEffect(() => {
    const i = setInterval(() => {
      handle();
    }, 1000);

    handle();
    async function handle() {
      setChartData(await getHistoryData());
    }

    return () => {
      clearInterval(i);
    }
  }, [])


  return (
    <div className="stats dynamic-background" active={isActive.toString()}>

      <div className="main-box">

        <div className="header">

          <h1>Statistics</h1>

          <div className="buttons">
            <button className="inverted filters" onClick={() => setFiltersOpen(!filtersOpen)}>Filters</button>
            <button className="export">Export</button>
            {filtersOpen && <ProjectFilter/>}
          </div>

        </div>

        <div className="bar-container">
          {(chartData ? 
            <Bar
              data={{
                labels: getDateLabels(),
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
                      type: 'linear',
                      position: 'left',
                      ticks: {
                        maxTicksLimit: 10,
                        stepSize: 60000,
                        callback: value => {
                          if (getHoursStr(value) == "0 hr") return getMinutesStr(value);
                          else return getHoursStr(value);
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

    const data = await new Storage({area: "local"}).get("history");
    if (!data) data = []; // TODO at least include current session

    let currentNightTs = new Date().setHours(3, 0, 0, 0); // 3am is midnight cuz I stay up late

    let currentDayTotal = 0;

    // Add current session if active
    if (await new Storage({area: "local"}).get("isActive"))
      currentDayTotal = Date.now() - await new Storage({area: "local"}).get("currentSessionStartTime");

    for (let i = (data.length-1); i >= 0; i--) {
      const obj = data[i];

      // If end time is greater than current days 3am, add.  (Also if filters are empty or includes this)
      if (obj.endTime > currentNightTs && (filteredProjects.length == 0 || filteredProjects.includes(obj.project))) { // TODO the filters dont work
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

  async function getBiggestValue(array) {
    let largest = 0;
    for (let i = 0; i < array.length; i++) {
      if (largest < array[i]) largest = array[i];
    }
    return largest;
  }

  function getDateLabels() {
    const labels = ["Yesterday", "Today"];

    for (let i = 2; i < 5+2; i++) {
      labels.unshift(DateTime.now().plus({ days: -i }).toFormat("LLL d") + getNumberSuffix(_.toInteger(DateTime.now().plus({ days: -i }).toFormat("d"))));
    }

    function getNumberSuffix(num) {
      const th = 'th'
      const rd = 'rd'
      const nd = 'nd'
      const st = 'st'
    
      if (num === 11 || num === 12 || num === 13) return th
    
      let lastDigit = num.toString().slice(-1)
    
      switch (lastDigit) {
        case '1': return st
        case '2': return nd
        case '3': return rd
        default:  return th
      }
    }

    return labels;
  }

}

function getHoursMinutesChartStr(duration) {
  return `${getHoursStr(duration)} \n ${getMinutesStr(duration)}`
}

function getHoursStr(duration) {
  const totalSeconds = Math.floor(duration / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const diffInHours = Math.floor(totalMinutes / 60);

  return `${diffInHours} hr`
}

function getMinutesStr(duration) {
  const totalSeconds = Math.floor(duration / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const diffInMinutes = totalMinutes % 60;

  return `${diffInMinutes} min`
}