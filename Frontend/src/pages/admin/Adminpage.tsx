import type { Metadata } from "next"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Overview } from "@/components/admin/overviwe"
import { UserManagement } from "@/components/admin/user-manegement"
import { SupportRequests } from "@/components/admin/support-req"
import { SystemSettings } from "@/components/admin/system-setting"
import { DashboardHeader } from "@/components/admin/dashbord-header"
import { DashboardShell } from "@/components/admin/dashbord-shell"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for loan management system",
}

export default function AdminDashboardPage() {
  return (
    <DashboardShell>
      <DashboardHeader heading="Admin Dashboard" text="Manage your loan management system">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm text-muted-foreground">System Online</span>
        </div>
      </DashboardHeader>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="support">Support</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <Overview />
        </TabsContent>
        <TabsContent value="users" className="space-y-4">
          <UserManagement />
        </TabsContent>
        <TabsContent value="support" className="space-y-4">
          <SupportRequests />
        </TabsContent>
        <TabsContent value="settings" className="space-y-4">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  )
}
