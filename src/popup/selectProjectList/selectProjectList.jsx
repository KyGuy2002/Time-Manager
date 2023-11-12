import { useStorage } from "@plasmohq/storage/hook";
import "./selectProjectList.scss";
import plusIcon from "data-base64:~assets/fontawesome/plus-solid.svg";
import trashIcon from "data-base64:~assets/fontawesome/trash-solid.svg";
import { Storage } from "@plasmohq/storage";
import Project from "../project/project";

export default function SelectProjectList(props) {
  const [allProjects, setAllProjects] = useStorage({key: "allProjects", instance: new Storage({area: "local"})}, []);
  const [currentProject, setCurrentProject] = useStorage("currentProject");

  return (
    <div className="select-project-list">

      {(allProjects || []).map((p) => 

        <>

          <div className="item project"
            key={p.name + " name"}
            isselected={(currentProject == p).toString()}
            onClick={() => selectProject(p)}
          >
            <Project project={p}/>
          </div>

          <div className="delete-button"
            key={p.name + " delete"}
            onClick={() => deleteProject(p)}
          >
            <img className="icon" src={trashIcon}/>
          </div>

        </>

      )}

      <div className="item add"
        onClick={() => props.setAppState("ADD PROJECT")}
      >
        <img className="icon" src={plusIcon}/>
        ADD PROJECT
      </div>

    </div>
  )


  async function deleteProject(project) {
    const newProjects = allProjects.filter(p => p !== project);
    setAllProjects(newProjects);
  }


  async function selectProject(project) {
    setCurrentProject(project);
    props.setAppState("NORMAL");
  }


}
