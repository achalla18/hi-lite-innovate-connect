
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Shield, TrendingUp, Users, Eye, Search, LineChart, Sparkles } from "lucide-react";

export default function Premium() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        <div className="container py-6 max-w-6xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-3">Upgrade to Hi-Lite Premium</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Unlock advanced features to grow your professional network and gain valuable insights
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Plan */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Free</CardTitle>
                <CardDescription>Basic networking features</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-3 text-hilite-purple" />
                    <span>View your connections</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 mr-3 text-hilite-purple" />
                    <span>Basic profile customization</span>
                  </div>
                  <div className="flex items-center">
                    <Search className="h-5 w-5 mr-3 text-hilite-purple" />
                    <span>Standard search filters</span>
                  </div>
                </div>
                
                <div className="space-y-2 pt-4">
                  <div className="flex items-center text-muted-foreground">
                    <BarChart3 className="h-5 w-5 mr-3" />
                    <span>Advanced network analytics</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <Eye className="h-5 w-5 mr-3" />
                    <span>Profile view insights</span>
                  </div>
                  <div className="flex items-center text-muted-foreground">
                    <TrendingUp className="h-5 w-5 mr-3" />
                    <span>Search appearance data</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" disabled>Current Plan</Button>
              </CardFooter>
            </Card>
            
            {/* Premium Plan */}
            <Card className="border-hilite-dark-red shadow-lg">
              <CardHeader className="bg-gradient-to-r from-hilite-dark-red/10 to-hilite-light-blue/10 rounded-t-lg">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-2xl">Premium</CardTitle>
                  <span className="bg-hilite-dark-red text-white text-xs px-3 py-1 rounded-full font-medium flex items-center">
                    <Sparkles className="h-3 w-3 mr-1" />
                    RECOMMENDED
                  </span>
                </div>
                <CardDescription>Enhanced professional tools</CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold">$9.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-3 text-hilite-purple" />
                    <span>View your connections</span>
                  </div>
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 mr-3 text-hilite-purple" />
                    <span>Advanced profile customization</span>
                  </div>
                  <div className="flex items-center">
                    <Search className="h-5 w-5 mr-3 text-hilite-purple" />
                    <span>Advanced search filters</span>
                  </div>
                </div>
                
                <div className="space-y-2 pt-4">
                  <div className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-3 text-hilite-dark-red" />
                    <span className="font-semibold">Detailed network analytics</span>
                  </div>
                  <div className="flex items-center">
                    <Eye className="h-5 w-5 mr-3 text-hilite-dark-red" />
                    <span className="font-semibold">Who viewed your profile</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-3 text-hilite-dark-red" />
                    <span className="font-semibold">Search appearance insights</span>
                  </div>
                  <div className="flex items-center">
                    <LineChart className="h-5 w-5 mr-3 text-hilite-dark-red" />
                    <span className="font-semibold">Profile growth trends</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full bg-hilite-dark-red hover:bg-hilite-dark-red/90">
                  Upgrade Now
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Premium Network Analytics</h2>
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Eye className="h-5 w-5 mr-2 text-hilite-dark-red" />
                    Profile Views
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    See exactly who viewed your profile and when. Track views over time to measure your profile's visibility.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Search className="h-5 w-5 mr-2 text-hilite-dark-red" />
                    Search Appearances
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Understand how often you appear in search results and which keywords lead people to your profile.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <BarChart3 className="h-5 w-5 mr-2 text-hilite-dark-red" />
                    Engagement Analytics
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Track how people interact with your posts and content. Optimize your professional presence.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
