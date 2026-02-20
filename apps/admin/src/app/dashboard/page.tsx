"use client";

import { useAuth } from "@/contexts/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-accent">
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-primary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-primary">Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-muted-foreground">
                Welcome, {user?.name || user?.email}
              </span>
              <Button variant="outline" onClick={signOut} className="border-primary/30 hover:bg-primary/10">
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Welcome to the Dashboard</CardTitle>
              <CardDescription>
                You have successfully signed in to your account.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This is your protected dashboard. Only authenticated users can see this page.
              </p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">User Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">ID:</span> {user?.id}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Email:</span> {user?.email}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Name:</span> {user?.name || "Not set"}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-primary">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="outline" className="w-full border-primary/30 hover:bg-primary/10">
                  Manage Profile
                </Button>
                <Button variant="outline" className="w-full border-primary/30 hover:bg-primary/10">
                  Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
