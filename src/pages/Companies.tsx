
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/layout/Navbar";
import CompanyCard from "@/components/companies/CompanyCard";
import { Building2 } from "lucide-react";

export default function Companies() {
  const { data: companies, isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');
        
      if (error) throw error;
      return data || [];
    }
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-6">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-6 w-6 text-hilite-dark-red" />
            <h1 className="text-2xl font-bold">Companies</h1>
          </div>
          <p className="text-muted-foreground">
            Discover companies and organizations in the Hi-lite network
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-lg"></div>
            ))}
          </div>
        ) : companies && companies.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companies.map(company => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">No companies found</h3>
            <p className="text-sm text-muted-foreground">Companies will appear here as they join the platform</p>
          </div>
        )}
      </main>
    </div>
  );
}
