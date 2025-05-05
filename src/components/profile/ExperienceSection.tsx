
import { Briefcase, Calendar, Edit, Plus } from "lucide-react";

interface ExperienceProps {
  isCurrentUser?: boolean;
}

export default function ExperienceSection({ isCurrentUser = false }: ExperienceProps) {
  const experiences = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      company: "TechFlow Inc",
      location: "San Francisco, CA",
      startDate: "Jan 2022",
      endDate: "Present",
      description: "Leading the frontend team in developing modern web applications using React, TypeScript, and Tailwind CSS. Implemented performance optimizations that increased page load speed by 45%."
    },
    {
      id: 2,
      title: "Full Stack Developer",
      company: "InnovateLabs",
      location: "Remote",
      startDate: "Mar 2020",
      endDate: "Dec 2021",
      description: "Developed and maintained full-stack web applications using the MERN stack. Collaborated with UI/UX designers to implement responsive designs and improve user experience."
    },
    {
      id: 3,
      title: "Junior Web Developer",
      company: "StartupHub",
      location: "Austin, TX",
      startDate: "Jun 2018",
      endDate: "Feb 2020",
      description: "Built and maintained client websites. Worked with technologies like React, Node.js, and PostgreSQL. Participated in daily stand-ups and sprint planning."
    }
  ];

  return (
    <div className="hilite-card mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Experience</h2>
        {isCurrentUser && (
          <button className="hilite-btn-secondary text-sm flex items-center">
            <Plus className="h-4 w-4 mr-1" /> Add
          </button>
        )}
      </div>

      <div className="space-y-6">
        {experiences.map((exp) => (
          <div key={exp.id} className="relative border-l-2 border-hilite-purple pl-4 pb-2">
            {isCurrentUser && (
              <button className="absolute right-0 top-0 text-muted-foreground hover:text-foreground">
                <Edit className="h-4 w-4" />
              </button>
            )}
            
            <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-hilite-purple"></div>
            
            <div className="flex items-start justify-between">
              <h3 className="font-bold">{exp.title}</h3>
            </div>
            
            <div className="text-muted-foreground">
              <div className="flex items-center">
                <Briefcase className="h-4 w-4 mr-1" />
                <span>{exp.company}</span>
                <span className="mx-2">•</span>
                <span>{exp.location}</span>
              </div>
              
              <div className="flex items-center mt-1">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{exp.startDate} - {exp.endDate}</span>
              </div>
            </div>
            
            <p className="mt-2 text-sm">{exp.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
