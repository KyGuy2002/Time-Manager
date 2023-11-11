import "./projectDropdown.scss";
import chevronDownIcon from "data-base64:~assets/fontawesome/chevron-down-solid.svg";
import plusIcon from "data-base64:~assets/fontawesome/plus-solid.svg";

export default function ProjectDropdown(props) {
    return (
        <div className="project-dropdown" isopen={props.isDropdownOpen.toString()}>
            <div className="menu inverted">
              <p className="option add" onClick={() => props.setAddProject(true)}>ADD PROJECT <img className="icon" src={plusIcon}/></p>
              {(props.allProjects || []).map((data) => <p className="option" key={data.name} isselected={(props.currentProject == data.name.toLowerCase()).toString()} onClick={() => props.selectProject(data)}>{data.name}</p>)}
            </div>
            <button className="main-button inverted" onClick={() => props.setDropdownOpen(!props.isDropdownOpen)}>SWITCH PROJECT <img className="icon" src={chevronDownIcon}/></button>
        </div>
    )
}