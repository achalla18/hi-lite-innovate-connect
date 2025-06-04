
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, MessageCircle, Lightbulb, TrendingUp } from "lucide-react";

export default function Index() {
  const { user, profile } = useAuth();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please log in to continue</h1>
          <Button onClick={() => window.location.href = '/login'}>
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1 container py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Welcome back, {profile?.name || user.email}!</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Stay connected with the innovation community. Share your ideas, 
                  collaborate on projects, and discover breakthrough innovations.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Users className="h-8 w-8 mx-auto mb-2 text-hilite-dark-red" />
                    <p className="text-sm font-medium">Network</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <MessageCircle className="h-8 w-8 mx-auto mb-2 text-hilite-dark-red" />
                    <p className="text-sm font-medium">Messages</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Lightbulb className="h-8 w-8 mx-auto mb-2 text-hilite-dark-red" />
                    <p className="text-sm font-medium">Ideas</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-hilite-dark-red" />
                    <p className="text-sm font-medium">Trending</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Create Post Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex space-x-4">
                  <div className="h-10 w-10 rounded-full bg-hilite-light-blue flex items-center justify-center">
                    <span className="text-sm font-medium text-hilite-dark-red">
                      {profile?.name?.charAt(0) || user.email?.charAt(0)}
                    </span>
                  </div>
                  <div className="flex-1">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start text-muted-foreground"
                    >
                      What's on your mind? Share your innovation...
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sample Posts */}
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No posts yet</h3>
                  <p className="text-muted-foreground">
                    Start connecting with innovators and share your ideas to see posts in your feed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="h-4 w-4 mr-2" />
                  Find Connections
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start Conversation
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Lightbulb className="h-4 w-4 mr-2" />
                  Join Clubs
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Complete Your Profile</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Add more information to help others find and connect with you.
                </p>
                <Button className="w-full">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
