import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, User, Bell, Shield, Database } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground mt-1">Configure application preferences and security.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-4 h-4"/> Profile Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <p className="text-sm font-medium">Username</p>
              <p className="text-sm text-muted-foreground">admin_relief</p>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <p className="text-sm font-medium">Email</p>
              <p className="text-sm text-muted-foreground">admin@drras.gov</p>
            </div>
            <Button variant="outline" className="w-full">Edit Profile</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-4 h-4"/> Security & Roles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between py-2 border-b">
              <p className="text-sm font-medium">Current Role</p>
              <p className="text-sm text-primary font-bold">System Administrator</p>
            </div>
            <Button variant="outline" className="w-full">Manage Roles</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-4 h-4"/> Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between py-2 border-b">
              <p className="text-sm font-medium">Push Alerts</p>
              <p className="text-sm text-green-600 font-medium">Enabled</p>
            </div>
            <Button variant="outline" className="w-full">Configure Alerts</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Database className="w-4 h-4"/> Database Connectivity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between py-2 border-b">
              <p className="text-sm font-medium">Supabase Status</p>
              <p className="text-sm text-yellow-600 font-medium">Mock Data Active</p>
            </div>
            <Button variant="destructive" className="w-full">Force Sync</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
