
import { Calendar, Edit, GraduationCap, Plus } from "lucide-react";

interface EducationProps {
  isCurrentUser?: boolean;
}

export default function EducationSection({ isCurrentUser = false }: EducationProps) {
  const education = [
    {
      id: 1,
      degree: "Master of Computer Science",
      school: "Stanford University",
      location: "Stanford, CA",
      startDate: "Sep 2016",
      endDate: "Jun 2018",
      description: "Specialized in Human-Computer Interaction and Machine Learning. Thesis on 'Improving User Experience through Predictive AI Models'."
    },
    {
      id: 2,
      degree: "Bachelor of Science in Computer Science",
      school: "UC Berkeley",
      location: "Berkeley, CA",
      startDate: "Sep 2012",
      endDate: "May 2016",
      description: "Graduated with honors. Relevant coursework: Data Structures, Algorithms, Web Development, Database Systems."
    }
  ];

  return (
    <div className="hilite-card mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Education</h2>
        {isCurrentUser && (
          <button className="hilite-btn-secondary text-sm flex items-center">
            <Plus className="h-4 w-4 mr-1" /> Add
          </button>
        )}
      </div>

      <div className="space-y-6">
        {education.map((edu) => (
          <div key={edu.id} className="relative border-l-2 border-hilite-blue pl-4 pb-2">
            {isCurrentUser && (
              <button className="absolute right-0 top-0 text-muted-foreground hover:text-foreground">
                <Edit className="h-4 w-4" />
              </button>
            )}
            
            <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-hilite-blue"></div>
            
            <div className="flex items-start justify-between">
              <h3 className="font-bold">{edu.degree}</h3>
            </div>
            
            <div className="text-muted-foreground">
              <div className="flex items-center">
                <GraduationCap className="h-4 w-4 mr-1" />
                <span>{edu.school}</span>
                <span className="mx-2">•</span>
                <span>{edu.location}</span>
              </div>
              
              <div className="flex items-center mt-1">
                <Calendar className="h-4 w-4 mr-1" />
                <span>{edu.startDate} - {edu.endDate}</span>
              </div>
            </div>
            
            <p className="mt-2 text-sm">{edu.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
