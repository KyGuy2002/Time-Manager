import { useStorage } from "@plasmohq/storage/hook";
import "./addProjectForm.scss";
import uploadIcon from "data-base64:~assets/fontawesome/upload-solid.svg";

export default function AddProjectForm(props) {
  const [allProjects, setAllProjects] = useStorage("allProjects", []);

  return (
    <div className="add-project-form">

      <form onSubmit={(event) => onSubmit(event)}>

        <div className="item">
          <label for="name">Project Name</label>
          <input id="name" type="text" placeholder="project name"/>
        </div>

        <div className="item">
          <label for="iconUpload">Project Icon/Logo</label>
          <div className="file-upload" onClick={() => document.getElementById('iconUpload').click()}>
            <input id="iconUpload" type="file"/>
            <div className="fake-icon">
              <img className="icon" src={uploadIcon}/>
            </div>
            <p><span>Click</span> to upload an icon or logo to identify this project.</p>
          </div>
        </div>

        <button type="submit">{props.buttonText}</button>
        {props.isInitial || <button className="inverted cancel" onClick={() => props.done()}>Cancel</button>}

      </form>

    </div>
  )

  async function onSubmit(event) {
    event.preventDefault();
    
    console.log("1")
    console.log(event.target.elements.iconUpload.value);
    console.log(event.target.elements.name.value);
    if (!event.target.elements.name.value || !event.target.elements.iconUpload.value) return;
    console.log("2")

    setAllProjects([...allProjects, {name: event.target.elements.name.value, icon: event.target.elements.iconUpload.value}]);
    event.target.reset();
    props.done?.run();
  }
}