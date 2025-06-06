
import { Link } from "react-router-dom";
import { Building2, MapPin, Users } from "lucide-react";

interface Company {
  id: string;
  name: string;
  description: string | null;
  industry: string | null;
  location: string | null;
  logo_url: string | null;
  employee_count: string | null;
}

interface CompanyCardProps {
  company: Company;
}

export default function CompanyCard({ company }: CompanyCardProps) {
  return (
    <Link to={`/company/${company.id}`} className="block">
      <div className="hilite-card hover:shadow-md transition-shadow">
        <div className="flex items-start gap-4">
          <div className="h-12 w-12 rounded-lg bg-hilite-gray overflow-hidden flex-shrink-0">
            {company.logo_url ? (
              <img src={company.logo_url} alt={company.name} className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-hilite-purple flex items-center justify-center text-white font-bold">
                <Building2 className="h-6 w-6" />
              </div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg truncate">{company.name}</h3>
            
            {company.industry && (
              <p className="text-sm text-hilite-purple font-medium">{company.industry}</p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
              {company.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>{company.location}</span>
                </div>
              )}
              
              {company.employee_count && (
                <div className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{company.employee_count} employees</span>
                </div>
              )}
            </div>
            
            {company.description && (
              <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                {company.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
