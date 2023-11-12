import { useStorage } from "@plasmohq/storage/hook";
import "./projectFilter.scss";
import checkIcon from "data-base64:~assets/fontawesome/check-solid.svg";
import { Storage } from "@plasmohq/storage";
import Project from "../../project/project";

export default function ProjectFilter() {
  const [allProjects, setAllProjects] = useStorage({key: "allProjects", instance: new Storage({area: "local"})}, []);
  const [filteredProjects, setFilteredProjects] = useStorage({key: "filteredProjects", instance: new Storage({area: "local"})}, []);
  const [isActive, setIsActive] = useStorage({key: "isActive", instance: new Storage({area: "local"})}, false);

  // TODO not refreshing when filteredProjects has been loaded... (always resets on open)

  return (
    <div className="project-filter">

      <div className="bulk-actions">
        <p className="bulk-button" onClick={() => setFilteredProjects(allProjects)}>Select all</p>
        <div className="divider"></div>
        <p className="bulk-button" onClick={() => setFilteredProjects([])}>Deselct all</p>
      </div>

      <div className="project-cards">

        {(allProjects || []).map((p) => 

          <>

            <div className="card"
              key={p.name}
              isenabled={(filteredProjects.includes(p)).toString()}
              issystemactive={isActive.toString()}
              onClick={() => toggleEnabled(p)}
            >
              <Project project={p}/>
              {filteredProjects.includes(p) && <img className="icon" src={checkIcon}/>}
            </div>

          </>

        )}

      </div>

    </div>
  )


  async function toggleEnabled(project) {

    // Remove
    if (filteredProjects.includes(project)) setFilteredProjects(filteredProjects.filter(p => p.name !== project.name));

    // Add
    else setFilteredProjects([...filteredProjects, project]);

  }


}