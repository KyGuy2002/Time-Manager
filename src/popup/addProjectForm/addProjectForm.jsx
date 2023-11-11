import { useStorage } from "@plasmohq/storage/hook";
import "./addProjectForm.scss";
import uploadIcon from "data-base64:~assets/fontawesome/upload-solid.svg";
import { useState } from "react";
import { useRef } from "react";
import { Storage } from "@plasmohq/storage";

export default function AddProjectForm(props) {
  const [allProjects, setAllProjects] = useStorage({key: "allProjects", instance: new Storage({area: "local"})}, [])
  const [projectName, setProjectName] = useState();
  const [iconFile, setIconFile] = useState();
  const fileInputRef = useRef();
  const [errorText, setErrorText] = useState();


  return (
    <div className="add-project-form">

      <form onSubmit={(event) => onSubmit(event)}>

        <div className="item">
          <label for="name">Project Name</label>
          <input id="name" type="text" placeholder="project name" maxLength={18} onChange={(event) => setProjectName(event.target.value.toUpperCase())}/>
        </div>

        <div className="item">
          <label for="iconUpload">Project Icon/Logo</label>
          <div className="file-upload" onClick={() => fileInputRef.current.click()}>
            <input id="iconUpload" ref={fileInputRef} type="file" onChange={(event) => scaleImage(event.target.files[0])}/>
            <div className="fake-icon">
              <img className="icon" src={uploadIcon}/>
            </div>
            <p><span>Click</span> to upload an icon or logo to identify this project.</p>
          </div>
        </div>

        <p className="error-text">{errorText}</p>

        <button type="submit">{props.buttonText}</button>
        {props.isInitial || <button className="inverted cancel" onClick={() => props.done()}>Cancel</button>}

      </form>

    </div>
  )


  async function onSubmit(event) {
    event.preventDefault();
    
    if (!projectName || !iconFile) {
      setErrorText("All fields required.");
      return;
    }

    if (await nameExists(projectName)) {
      setErrorText("Project name already exists.");
      return;
    }

    const newProject = {name: projectName, icon: iconFile};
    setAllProjects([...allProjects, newProject]);
    event.target.reset();
    if (props.done) props.done(newProject);
  }


  async function nameExists(name) {
    for (let i = 0; i < allProjects.length; i++) {
      if (allProjects[i].name.toLowerCase() == name.toLowerCase()) return true;
    }
  }


  async function scaleImage(file) {
    const reader = new FileReader();
  
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
  
        const maxWidth = 50; // Set your desired maximum width
        const scaleFactor = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * scaleFactor;
  
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  
        // Convert the canvas content to a data URL
        finalImageData = canvas.toDataURL('image/jpeg');
        setIconFile(finalImageData);
      };
  
      img.src = e.target.result;
    };
  
    reader.readAsDataURL(file);
  };


}
