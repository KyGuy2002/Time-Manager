import "./projectDropdown.scss";
import chevronDownIcon from "data-base64:~assets/fontawesome/chevron-down-solid.svg";
import plusIcon from "data-base64:~assets/fontawesome/plus-solid.svg";
import trashIcon from "data-base64:~assets/fontawesome/trash-solid.svg";
import Project from "../project/project";
import { useStorage } from "@plasmohq/storage/hook";
import { Storage } from "@plasmohq/storage";

export default function ProjectDropdown(props) {
    const [currentProject, setCurrentProject] = useStorage("currentProject");
    const [allProjects, setAllProjects] = useStorage({key: "allProjects", instance: new Storage({area: "local"})}, []);

    return (
        <div className="project-dropdown" isopen={props.isDropdownOpen.toString()}>
            <div className="menu inverted">
              <p className="item add" onClick={() => props.setAddProject(true)}>ADD PROJECT <img className="icon" src={plusIcon}/></p>
              {(allProjects || []).map((p) => 
                <div className="item" key={p.name} isselected={(currentProject == p).toString()}>
                    <div className="project" onClick={() => selectProject(p)}><Project project={p}/></div>
                    <div className="delete-button" onClick={() => deleteProject(p)}><img className="icon" src={trashIcon}/></div>
                </div>
              )}
            </div>
            <button className="main-button inverted" onClick={() => props.setDropdownOpen(!props.isDropdownOpen)}>SWITCH PROJECT <img className="icon" src={chevronDownIcon}/></button>
        </div>
    )

    async function deleteProject(project) {
        const newProjects = allProjects.filter(p => p !== project);
        setAllProjects(newProjects);
    }

    async function selectProject(project) {
        console.log("cliked!")
        setCurrentProject(project);
        props.setDropdownOpen(false);
    }
}