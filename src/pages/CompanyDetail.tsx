
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import { Building2, MapPin, Users, Globe, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CompanyDetail() {
  const { companyId } = useParams();

  const { data: company, isLoading } = useQuery({
    queryKey: ['company', companyId],
    queryFn: async () => {
      if (!companyId) return null;
      
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', companyId)
        .single();
        
      if (error) throw error;
      return data;
    },
    enabled: !!companyId
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-64 bg-muted rounded-lg"></div>
            <div className="h-20 bg-muted rounded-lg"></div>
            <div className="h-40 bg-muted rounded-lg"></div>
          </div>
        </main>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 container py-6">
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">Company not found</h3>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Company Header */}
          <div className="lg:col-span-3">
            <div className="hilite-card">
              <div className="flex items-start gap-6">
                <div className="h-24 w-24 rounded-lg bg-hilite-gray overflow-hidden flex-shrink-0">
                  {company.logo_url ? (
                    <img src={company.logo_url} alt={company.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-hilite-purple flex items-center justify-center text-white">
                      <Building2 className="h-12 w-12" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <h1 className="text-3xl font-bold mb-2">{company.name}</h1>
                  
                  {company.industry && (
                    <p className="text-hilite-purple font-medium mb-2">{company.industry}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
                    {company.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{company.location}</span>
                      </div>
                    )}
                    
                    {company.employee_count && (
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{company.employee_count} employees</span>
                      </div>
                    )}
                    
                    {company.founded_year && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <span>Founded {company.founded_year}</span>
                      </div>
                    )}
                    
                    {company.website && (
                      <div className="flex items-center gap-1">
                        <Globe className="h-4 w-4" />
                        <a 
                          href={company.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-hilite-purple hover:underline"
                        >
                          Website
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <Button className="bg-hilite-dark-red hover:bg-hilite-dark-red/90">
                    Follow Company
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Company Description */}
          <div className="lg:col-span-2">
            <div className="hilite-card">
              <h2 className="text-xl font-bold mb-4">About</h2>
              {company.description ? (
                <p className="text-muted-foreground whitespace-pre-wrap">{company.description}</p>
              ) : (
                <p className="text-muted-foreground italic">No description available</p>
              )}
            </div>
          </div>
          
          {/* Company Stats */}
          <div className="space-y-4">
            <div className="hilite-card">
              <h3 className="font-bold mb-3">Company Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Followers</span>
                  <span className="font-medium">0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Employees on Hi-lite</span>
                  <span className="font-medium">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
