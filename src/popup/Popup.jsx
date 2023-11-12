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
import SelectProjectModalContent from "./selectProjectModalContent/selectProjectModalContent";
import { useModal } from "./modal/ModalContext";

export default function Popup() {
  const [currentProject, setCurrentProject] = useStorage({key: "currentProject", instance: new Storage({area: "local"})});
  const [currentSessionStartTime, setCurrentSessionStartTime] = useStorage({key: "currentSessionStartTime", instance: new Storage({area: "local"})}, 0);
  const [isActive, setIsActive] = useStorage({key: "isActive", instance: new Storage({area: "local"})}, false);
  const [allProjects, setAllProjects] = useStorage({key: "allProjects", instance: new Storage({area: "local"})}, []);

  const { openModal } = useModal();


  // Init tasks on open
  const [totalToday, setTotalToday] = useState(0);
  useEffect(() => {
    async function handle() {

      // Check if no projects set, if so open welcome modal
      const tempProjects = await new Storage({area: "local"}).get("allProjects");
      if (!tempProjects || tempProjects.length == 0) {
        openModal(getWelcomeModal());
      }

      // Calculate total today
      setTotalToday(await getOtherTotalToday());

      // Set icon
      chrome.action.setIcon({imageData: await getIcon(await new Storage({area: "local"}).get("isActive"))}); // Refetch state so it doesn't use the default for a second while loading
    }
    handle();
  }, []);


  // Rerender screen every second
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
    <div className="popup dynamic-background" active={isActive.toString()}>

      <div className="inner-box">

        <h1 className="title">Time Manager</h1>

        <div className="status dynamic-background" active={isActive.toString()}>
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
          <button className="switch-project-button inverted" onClick={() => openModal(<SelectProjectModalContent/>)}>SWITCH PROJECT <img className="icon" src={chevronDownIcon}/></button>
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
      const storage = new Storage({area: "local"})
      let data = await storage.get("history");
      if (!data) data = [];
      console.log(data);

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

  let data = await new Storage({area: "local"}).get("history");
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


export function getWelcomeModal() {
  return (
    <div className="welcome-modal">

      <h1>Welcome</h1>
      <p>To get started using Time Manager, please add a project.</p>

      <AddProjectForm isInitial={true}/>

    </div>
  )
}