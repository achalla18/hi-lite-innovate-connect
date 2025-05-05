
import { Code, ExternalLink, Edit, Plus } from "lucide-react";

interface ProjectsProps {
  isCurrentUser?: boolean;
}

export default function ProjectsSection({ isCurrentUser = false }: ProjectsProps) {
  const projects = [
    {
      id: 1,
      title: "AI-Powered Task Management System",
      technologies: ["React", "TypeScript", "TensorFlow.js"],
      startDate: "Jan 2023",
      endDate: "Present",
      description: "Building an intelligent task management system that uses machine learning to prioritize tasks and suggest optimal work schedules based on user habits and productivity patterns.",
      link: "https://github.com/janethompson/ai-task-manager",
    },
    {
      id: 2,
      title: "Quantum Computing Visualization Tool",
      technologies: ["Three.js", "WebGL", "Python"],
      startDate: "Mar 2022", 
      endDate: "Dec 2022",
      description: "Created an interactive web-based visualization tool for quantum computing concepts, making complex quantum principles more accessible to students and researchers.",
      link: "https://github.com/janethompson/quantum-viz",
    },
    {
      id: 3,
      title: "Open Source Contribution Tracker",
      technologies: ["Node.js", "MongoDB", "GraphQL"],
      startDate: "Jun 2021",
      endDate: "Feb 2022",
      description: "Developed a platform for developers to track their open source contributions across multiple platforms and generate comprehensive portfolio reports.",
      link: "https://github.com/janethompson/oss-tracker",
    }
  ];

  return (
    <div className="hilite-card mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Projects</h2>
        {isCurrentUser && (
          <button className="hilite-btn-secondary text-sm flex items-center">
            <Plus className="h-4 w-4 mr-1" /> Add
          </button>
        )}
      </div>

      <div className="space-y-6">
        {projects.map((project) => (
          <div key={project.id} className="relative border-l-2 border-hilite-blue pl-4 pb-2">
            {isCurrentUser && (
              <button className="absolute right-0 top-0 text-muted-foreground hover:text-foreground">
                <Edit className="h-4 w-4" />
              </button>
            )}
            
            <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-hilite-blue"></div>
            
            <div className="flex items-start justify-between">
              <h3 className="font-bold">{project.title}</h3>
            </div>
            
            <div className="text-muted-foreground flex items-center mt-1">
              <Code className="h-4 w-4 mr-1" />
              <span>{project.startDate} - {project.endDate}</span>
            </div>
            
            <div className="mt-2 flex flex-wrap gap-2">
              {project.technologies.map((tech, index) => (
                <span 
                  key={index} 
                  className="text-xs bg-accent px-2 py-1 rounded-full font-mono"
                >
                  {tech}
                </span>
              ))}
            </div>
            
            <p className="mt-2 text-sm">{project.description}</p>
            
            {project.link && (
              <a 
                href={project.link} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="mt-2 flex items-center text-hilite-purple hover:underline text-sm"
              >
                View project
                <ExternalLink className="h-3 w-3 ml-1" />
              </a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
