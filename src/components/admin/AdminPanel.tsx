
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Shield, 
  User, 
  MessageSquare, 
  Flag,
  Check,
  X,
  Trash2
} from "lucide-react";

export default function AdminPanel() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("reports");

  // Check if user is admin
  const { data: isAdmin = false, isLoading: isCheckingAdmin } = useQuery({
    queryKey: ['isAdmin', user?.id],
    queryFn: async () => {
      if (!user) return false;
      
      const { data } = await supabase.rpc('is_admin', { user_id: user.id });
      return !!data;
    },
    enabled: !!user
  });

  // Fetch reports
  const { data: reports = [], isLoading: isLoadingReports } = useQuery({
    queryKey: ['adminReports'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // Get user profile data for reporters
      const userIds = [...new Set(data.map(report => report.user_id))];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, name')
        .in('id', userIds);
      
      return data.map(report => ({
        ...report,
        reporter_name: profilesData?.find(profile => profile.id === report.user_id)?.name || 'Unknown'
      }));
    },
    enabled: !!isAdmin
  });

  // Update report status mutation
  const updateReportMutation = useMutation({
    mutationFn: async ({ reportId, status }: { reportId: string, status: string }) => {
      const { error } = await supabase
        .from('reports')
        .update({ status })
        .eq('id', reportId);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
      toast.success("Report status updated");
    },
    onError: (error) => {
      toast.error(`Failed to update report: ${error.message}`);
    }
  });

  // Delete content mutation
  const deleteContentMutation = useMutation({
    mutationFn: async ({ contentType, contentId }: { contentType: string, contentId: string }) => {
      let table;
      
      switch (contentType) {
        case 'post':
          table = 'posts';
          break;
        case 'comment':
          table = 'post_comments';
          break;
        case 'reply':
          table = 'comment_replies';
          break;
        default:
          throw new Error(`Unknown content type: ${contentType}`);
      }
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', contentId);
        
      if (error) throw error;
      
      return { contentType };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['adminReports'] });
      
      // Also invalidate related queries
      switch (data.contentType) {
        case 'post':
          queryClient.invalidateQueries({ queryKey: ['posts'] });
          break;
        case 'comment':
          queryClient.invalidateQueries({ queryKey: ['comments'] });
          break;
        case 'reply':
          queryClient.invalidateQueries({ queryKey: ['commentReplies'] });
          break;
      }
      
      toast.success("Content removed successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete content: ${error.message}`);
    }
  });

  // Handle approve report
  const handleApproveReport = (reportId: string, contentType: string, contentId: string) => {
    if (confirm("Are you sure you want to approve this report and remove the reported content?")) {
      // First delete the content
      deleteContentMutation.mutate({ contentType, contentId }, {
        onSuccess: () => {
          // Then update report status
          updateReportMutation.mutate({ reportId, status: 'approved' });
        }
      });
    }
  };

  // Handle reject report
  const handleRejectReport = (reportId: string) => {
    if (confirm("Are you sure you want to reject this report? The content will remain published.")) {
      updateReportMutation.mutate({ reportId, status: 'rejected' });
    }
  };

  if (isCheckingAdmin) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Admin Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-40">
            <p>Checking admin status...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!isAdmin) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Admin Panel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col justify-center items-center h-40">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-1">Access Restricted</p>
            <p className="text-muted-foreground text-center">
              You need administrator permissions to view this panel.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader className="border-b">
        <CardTitle className="flex items-center">
          <Shield className="h-5 w-5 mr-2" />
          Admin Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 w-full">
            <TabsTrigger value="reports" className="flex items-center">
              <Flag className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center">
              <User className="h-4 w-4 mr-2" />
              Users
            </TabsTrigger>
          </TabsList>
          
          {/* Reports Tab */}
          <TabsContent value="reports" className="p-4">
            {isLoadingReports ? (
              <div className="animate-pulse space-y-4">
                <div className="h-8 bg-muted rounded"></div>
                <div className="h-20 bg-muted rounded"></div>
                <div className="h-20 bg-muted rounded"></div>
              </div>
            ) : reports.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Status</TableHead>
                      <TableHead>Reported By</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell>
                          <Badge 
                            variant={
                              report.status === 'pending' ? 'outline' : 
                              report.status === 'approved' ? 'default' : 'secondary'
                            }
                          >
                            {report.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{report.reporter_name}</TableCell>
                        <TableCell className="capitalize">{report.content_type}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{report.reason}</TableCell>
                        <TableCell className="text-right">
                          {report.status === 'pending' && (
                            <div className="flex justify-end gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleApproveReport(report.id, report.content_type, report.content_id)}
                                className="h-8 w-8 p-0"
                              >
                                <Check className="h-4 w-4" />
                                <span className="sr-only">Approve</span>
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleRejectReport(report.id)}
                                className="h-8 w-8 p-0"
                              >
                                <X className="h-4 w-4" />
                                <span className="sr-only">Reject</span>
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => handleApproveReport(report.id, report.content_type, report.content_id)}
                                className="h-8 w-8 p-0"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete Content</span>
                              </Button>
                            </div>
                          )}
                          {report.status !== 'pending' && (
                            <Badge variant="outline">Resolved</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <Flag className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-1">No reports found</p>
                <p className="text-muted-foreground text-center">
                  There are currently no reports that need your attention.
                </p>
              </div>
            )}
          </TabsContent>
          
          {/* Users Tab */}
          <TabsContent value="users" className="p-4">
            <div className="flex flex-col items-center justify-center py-10">
              <User className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-lg font-medium mb-1">User Management</p>
              <p className="text-muted-foreground text-center mb-4">
                This feature is coming soon. You'll be able to manage user roles and permissions here.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
