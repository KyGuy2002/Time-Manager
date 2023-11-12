import "./popup.scss";
import { useStorage } from "@plasmohq/storage/hook"
import { useState } from "react";
import { Storage } from "@plasmohq/storage";
import { useEffect } from "react";
import { getIcon } from "../utils";
import 'react-dropdown/style.css';
import playIcon from "data-base64:~assets/fontawesome/play-solid.svg";
import pauseIcon from "data-base64:~assets/fontawesome/pause-solid.svg";
import chevronDownIcon from "data-base64:~assets/fontawesome/chevron-down-solid.svg";
import AddProjectForm from "./addProjectForm/addProjectForm";
import Project from "./project/project";
import SelectProjectList from "./selectProjectList/selectProjectList";

export default function IndexPopup() {
  const [currentProject, setCurrentProject] = useStorage("currentProject");
  const [currentSessionStartTime, setCurrentSessionStartTime] = useStorage("currentSessionStartTime", 0);
  const [isActive, setIsActive] = useStorage("isActive", false);
  const [allProjects, setAllProjects] = useStorage({key: "allProjects", instance: new Storage({area: "local"})}, []);
  const [appState, setAppState] = useState("NORMAL");


  // Init tasks on open
  const [totalToday, setTotalToday] = useState(0);
  useEffect(() => {
    async function handle() {
      setTotalToday(await getOtherTotalToday());
      chrome.action.setIcon({imageData: await getIcon(await new Storage().get("isActive"))}); // Refetch state so it doesn't use the default for a second while loading
    }
    handle();
  }, []);


  // Rerender screen
  const [refresh, setRefresh] = useState(false);
  useEffect(() => {
    const i = setInterval(() => {
      setRefresh(!refresh);
    }, 1000);

    return () => {
      clearInterval(i);
    }
  })


  return (
    <div className="popup" active={isActive.toString()}>

      {/* Welcome Modal/Landing */}
      {allProjects.length == 0 &&
        <div className="modal welcome-modal">

          <h1>Welcome</h1>
          <p>To get started using Time Manager, please add a project.</p>

          <AddProjectForm buttonText="Get started" isInitial={true} done={(p) => setCurrentProject(p)}/>

        </div>
      }

      {/* Add Project Modal */}
      {appState == "ADD PROJECT" &&
        <div className="modal add-project-modal">

          <h1>Add Project</h1>

          <AddProjectForm buttonText="Save" done={(p) => {
            setAppState("NORMAL");
            setCurrentProject(p);
          }} isInitial={false}/>

        </div>
      }

      {/* Select Project Modal */}
      {appState == "SELECT PROJECT" &&
        <div className="modal select-project-modal">

          <h1>Select Project</h1>

          <SelectProjectList
            setAppState={(s) => setAppState(s)}
          />

        </div>
      }

      <div className="inner-box">

        <h1 className="title">Time Manager</h1>

        <div className="status" active={isActive.toString()}>
          <h1>{(isActive ? "active" : "paused")}</h1>
          <Project project={currentProject}/>
        </div>

        <div className="timers">

          <p>Session</p>
          <p>Today</p>

          <h3>{(isActive ? getTimeStr(Date.now() - currentSessionStartTime) : "--:--:--")}</h3>
          <h3>{getTimeStr(totalToday + (isActive ? (Date.now() - currentSessionStartTime) : 0))}</h3>

        </div>

        <button className="play-button" onClick={() => toggle()}>{(isActive ? "pause" : "start")} <img className="icon" src={(isActive ? pauseIcon : playIcon)}/></button>

        {(!isActive ?
          <button className="switch-project-button inverted" onClick={() => setAppState("SELECT PROJECT")}>SWITCH PROJECT <img className="icon" src={chevronDownIcon}/></button>
        :
        <></>)}

        <a onClick={() => chrome.runtime.openOptionsPage()}>View Statistics</a>

      </div>

    </div>
  )


  // Toggle isActive
  async function toggle() {

    // Now active (inverse cuz react ¯\_(ツ)_/¯)
    if (!isActive) {

      setIsActive(true);
      chrome.action.setIcon({imageData: await getIcon(true)});

      // Start new session
      setCurrentSessionStartTime(Date.now());

    }

    // Now paused
    else {

      setIsActive(false);
      chrome.action.setIcon({imageData: await getIcon(false)});

      // Save prev session
      const storage = new Storage()
      let data = await storage.get("history");
      if (!data) data = [];

      data.push({
        startTime: currentSessionStartTime,
        endTime: Date.now(),
        project: currentProject
      })

      await storage.set("history", data);

      // Refresh total today
      setTotalToday(await getOtherTotalToday());

    }

  }


}


// Gets the total time today minus current session.
async function getOtherTotalToday() {
  let total = 0;

  let data = await new Storage().get("history");
  if (!data) data = [];

  const lastNightTs = new Date().setHours(3, 0, 0, 0); // 3am is midnight cuz I stay up late
  for (let i = 0; i < data.length; i++) {
    const obj = data[i];
    if (obj.endTime < lastNightTs) continue; // Skip if before 3am
    
    total = total + (obj.endTime - obj.startTime);
  }

  return total;

}


// Gets a pretty string format for a timestammp
function getTimeStr(duration) {

  // Calculate time
  const totalSeconds = Math.floor(duration / 1000);
  const diffInSeconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const diffInMinutes = totalMinutes % 60;
  const diffInHours = Math.floor(totalMinutes / 60);

  return `${diffInHours.toString().padStart(2, '0')}:${diffInMinutes.toString().padStart(2, '0')}:${diffInSeconds.toString().padStart(2, '0')}`;

}