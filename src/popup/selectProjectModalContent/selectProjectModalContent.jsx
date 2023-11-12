import { useStorage } from "@plasmohq/storage/hook";
import "./selectProjectModalContent.scss";
import plusIcon from "data-base64:~assets/fontawesome/plus-solid.svg";
import trashIcon from "data-base64:~assets/fontawesome/trash-solid.svg";
import { Storage } from "@plasmohq/storage";
import Project from "../project/project";
import { useModal } from "../modal/ModalContext";
import AddProjectForm from "../addProjectForm/addProjectForm";

export default function SelectProjectModalContent() {
  const [allProjects, setAllProjects] = useStorage({key: "allProjects", instance: new Storage({area: "local"})}, []);
  const [currentProject, setCurrentProject] = useStorage("currentProject");

  const {openModal, closeModal} = useModal();

  return (
    <div className="select-project-modal">

      <h1>Select Project</h1>

      <div className="list">

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
          onClick={() => addProject()}
        >
          <img className="icon" src={plusIcon}/>
          ADD PROJECT
        </div>

      </div>
    </div>
  )


  async function addProject() {
    openModal(
      <div className="add-project-modal">
        <h1>Add Project</h1>

        <AddProjectForm/>
      </div>
    );
  }


  async function deleteProject(project) {
    openModal(
      <>
        <h1>Confirm</h1>
        <p>Are you sure you want to delete <span>{project.name}</span>?  Deleting this project will also delete all historic data, and remove it from your total.</p>

        <button className="inverted" onClick={() => closeModal()}>Cancel</button>
        <button onClick={() => {
          const newProjects = allProjects.filter(p => p !== project);
          setAllProjects(newProjects);
          closeModal();
        }}>Delete</button>
      </>
    );
  }


  async function selectProject(project) {
    setCurrentProject(project);
    closeModal();
  }


}
