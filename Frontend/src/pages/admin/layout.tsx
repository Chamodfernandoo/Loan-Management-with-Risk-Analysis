import type React from "react"
import { AdminSidebar } from "@/components/admin/sidebar"

interface Metadata {
  title: string
  description: string
}

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Admin dashboard for loan management system",
}

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1">{children}</div>
    </div>
  )
}