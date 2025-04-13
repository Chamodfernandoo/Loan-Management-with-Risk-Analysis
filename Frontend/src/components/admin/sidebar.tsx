import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { LayoutDashboard, Users, CreditCard, Settings, BarChart, HelpCircle, LogOut, BrainCircuit } from "lucide-react"

export function AdminSidebar() {
  return (
    <div className="hidden border-r bg-gray-100/40 lg:block dark:bg-gray-800/40 w-64">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4">
          <Link to="/admin" className="flex items-center gap-2 font-semibold">
            <CreditCard className="h-6 w-6" />
            <span>PAYME Admin</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <nav className="grid items-start px-2 text-sm font-medium">
            <Link
              to="/admin"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-900 transition-all hover:text-gray-900 dark:text-gray-50 dark:hover:text-gray-50"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
            <Link
              to="/admin/users"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            >
              <Users className="h-4 w-4" />
              Users
            </Link>
            <Link
              to="/admin/loans"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            >
              <CreditCard className="h-4 w-4" />
              Loans
            </Link>
            <Link
              to="/admin/risk-model"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            >
              <BrainCircuit className="h-4 w-4" />
              Risk Model
            </Link>
            <Link
              to="/admin/reports"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            >
              <BarChart className="h-4 w-4" />
              Reports
            </Link>
            <Link
              to="/admin/support"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            >
              <HelpCircle className="h-4 w-4" />
              Support
            </Link>
            <Link
              to="/admin/settings"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-50"
            >
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </nav>
        </div>
        <div className="mt-auto p-4">
          <Button variant="outline" className="w-full justify-start gap-2">
            <LogOut className="h-4 w-4" />
            Log Out
          </Button>
        </div>
      </div>
    </div>
  )
}