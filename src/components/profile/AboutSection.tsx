
import { useState } from "react";
import { Edit } from "lucide-react";

interface AboutSectionProps {
  isCurrentUser?: boolean;
  initialBio?: string;
}

export default function AboutSection({ 
  isCurrentUser = false, 
  initialBio = "Full-stack developer with a passion for creating intuitive and performant web applications. Focused on React, TypeScript, and Node.js. Currently exploring AI and ML integration in web apps." 
}: AboutSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(initialBio);
  const [editedBio, setEditedBio] = useState(initialBio);

  const handleSave = () => {
    setBio(editedBio);
    setIsEditing(false);
  };

  return (
    <div className="hilite-card mb-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-xl font-bold">About</h2>
        {isCurrentUser && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="text-muted-foreground hover:text-foreground"
          >
            <Edit className="h-4 w-4" />
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            value={editedBio}
            onChange={(e) => setEditedBio(e.target.value)}
            className="hilite-input w-full h-32 resize-none"
            placeholder="Write something about yourself..."
          />
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="hilite-btn-secondary text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="hilite-btn-primary text-sm"
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <p className="text-muted-foreground whitespace-pre-wrap">{bio}</p>
      )}
    </div>
  );
}
