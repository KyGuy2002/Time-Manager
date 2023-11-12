import "./project.scss";

export default function Project(props) {
    if (props.project) {
        return (
            <div className="project-item"><div className="img" style={{backgroundImage: `url(${props.project.icon})`}}></div><p>{props.project.name}</p></div>
        )
    }
    else {
        return (
            <div className="project-item"><p>SELECT PROJECT</p></div>
        )
    }
}