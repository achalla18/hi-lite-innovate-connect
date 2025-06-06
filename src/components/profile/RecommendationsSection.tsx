
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Plus } from "lucide-react";

interface RecommendationsSectionProps {
  userId: string;
  isCurrentUser?: boolean;
}

export default function RecommendationsSection({ userId, isCurrentUser = false }: RecommendationsSectionProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isWriting, setIsWriting] = useState(false);
  const [content, setContent] = useState("");
  const [relationship, setRelationship] = useState("");

  // Fetch recommendations for the user
  const { data: recommendations, isLoading } = useQuery({
    queryKey: ['recommendations', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('recommendations')
        .select(`
          *,
          recommender:profiles!recommendations_recommender_id_fkey(name, avatar_url)
        `)
        .eq('recommended_id', userId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      return data || [];
    }
  });

  // Write recommendation mutation
  const writeRecommendationMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('recommendations')
        .insert({
          recommender_id: user?.id,
          recommended_id: userId,
          content: content,
          relationship: relationship
        });
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recommendations', userId] });
      setContent("");
      setRelationship("");
      setIsWriting(false);
      toast.success("Recommendation submitted successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to submit recommendation: ${error.message}`);
    }
  });

  const handleSubmitRecommendation = () => {
    if (content.trim()) {
      writeRecommendationMutation.mutate();
    }
  };

  return (
    <div className="hilite-card mb-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Recommendations</h2>
        {!isCurrentUser && user && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsWriting(true)}
            className="text-hilite-purple"
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Write Recommendation
          </Button>
        )}
      </div>

      {isWriting && (
        <div className="border rounded-lg p-4 mb-4 space-y-3">
          <Input
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            placeholder="Your relationship (e.g., 'Direct manager', 'Colleague')"
          />
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your recommendation..."
            className="min-h-[120px]"
          />
          <div className="flex gap-2">
            <Button 
              onClick={handleSubmitRecommendation}
              disabled={writeRecommendationMutation.isPending || !content.trim()}
            >
              {writeRecommendationMutation.isPending ? "Submitting..." : "Submit"}
            </Button>
            <Button variant="outline" onClick={() => setIsWriting(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <div className="h-24 bg-muted animate-pulse rounded-md"></div>
          <div className="h-24 bg-muted animate-pulse rounded-md"></div>
        </div>
      ) : recommendations && recommendations.length > 0 ? (
        <div className="space-y-4">
          {recommendations.map(rec => (
            <div key={rec.id} className="border rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={rec.recommender?.avatar_url || ""} />
                  <AvatarFallback>
                    {rec.recommender?.name?.charAt(0) || "?"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{rec.recommender?.name || "Anonymous"}</h4>
                    {rec.relationship && (
                      <span className="text-sm text-muted-foreground">• {rec.relationship}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {new Date(rec.created_at).toLocaleDateString()}
                  </p>
                  <p className="whitespace-pre-wrap">{rec.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground italic">
          {isCurrentUser ? "No recommendations yet" : "Be the first to write a recommendation"}
        </p>
      )}
    </div>
  );
}
