import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { 
  LogOut, 
  FileText, 
  Users, 
  History, 
  AlertTriangle, 
  Bell, 
  Settings, 
  HelpCircle,
  PlusCircle,
  BarChart3,
  Search,
  Menu,
  X
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { authService } from "@/services/api"

// Dashboard stat card component
const StatCard = ({ title, value, icon, trend, color }: { 
  title: string, 
  value: string, 
  icon: React.ReactNode, 
  trend?: { value: string, positive: boolean },
  color: "blue" | "green" | "amber" | "red"
}) => {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
  }

  const iconColorClasses = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    amber: "bg-amber-100 text-amber-600",
    red: "bg-red-100 text-red-600",
  }

  return (
    <Card className={cn("border", colorClasses[color])}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <div className={cn("p-2 rounded-full", iconColorClasses[color])}>
            {icon}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {trend && (
          <div className="flex items-center mt-1">
            <span className={trend.positive ? "text-green-600" : "text-red-600"}>
              {trend.positive ? "↑" : "↓"} {trend.value}
            </span>
            <span className="text-xs text-muted-foreground ml-1">vs last month</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Feature card component
const FeatureCard = ({ icon, title, description, href, color }: { 
  icon: React.ReactNode, 
  title: string, 
  description: string, 
  href: string,
  color: "default" | "blue" | "green" | "amber"
}) => {
  const colorClasses = {
    default: "bg-card hover:bg-accent",
    blue: "bg-blue-50 hover:bg-blue-100 border-blue-200",
    green: "bg-green-50 hover:bg-green-100 border-green-200",
    amber: "bg-amber-50 hover:bg-amber-100 border-amber-200",
  }

  const iconColorClasses = {
    default: "bg-primary/10 text-primary",
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    amber: "bg-amber-100 text-amber-600",
  }

  return (
    <Link to={href}>
      <Card className={cn("h-full transition-all hover:shadow-md", colorClasses[color])}>
        <CardHeader className="pb-2">
          <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center mb-2", iconColorClasses[color])}>
            {icon}
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>{description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  )
}

const Lender_dashbord = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [user, setUser] = useState<any>(null)
  const [_loading, setLoading] = useState(true)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await authService.getCurrentUser()
        setUser(userData)
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
    })
    navigate("/login")
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user || !user.full_name) return "LN"
    
    const nameParts = user.full_name.split(" ")
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
    }
    return nameParts[0].substring(0, 2).toUpperCase()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden mr-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </Button>
            <h1 className="text-xl font-bold text-blue-700">PayMe Lender Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative">
              <Bell size={20} />
              <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 md:flex" 
              asChild
            >
              <Link to="/lender/profile">
                <Settings size={16} />
                <span>My Profile</span>
              </Link>
            </Button>
            
            <div className="hidden md:flex items-center gap-2">
              {user && (
                <div className="text-right mr-2">
                  <p className="text-sm font-medium">{user.full_name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
              )}
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback className="bg-blue-100 text-blue-700">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2" 
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col gap-2">
              <Link to="/lender/profile" className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
                <Settings size={18} className="text-blue-600" />
                <span>My Profile</span>
              </Link>
              <Link to="/create_loan" className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
                <PlusCircle size={18} className="text-blue-600" />
                <span>Create Loan</span>
              </Link>
              <Link to="/view_loan" className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
                <FileText size={18} className="text-blue-600" />
                <span>View Loans</span>
              </Link>
              <Link to="/customer-history" className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
                <History size={18} className="text-blue-600" />
                <span>Customer History</span>
              </Link>
              <Link to="/risk_profile" className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
                <AlertTriangle size={18} className="text-blue-600" />
                <span>Risk Analysis</span>
              </Link>
              <Link to="/lender/ads/all-ads" className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
                <Search size={18} className="text-blue-600" />
                <span>Advertisements</span>
              </Link>
              <Link to="/lender/support" className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
                <HelpCircle size={18} className="text-blue-600" />
                <span>Support</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="container mx-auto px-4 sm:px-6 py-6">
        {/* Welcome section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2">Welcome back, {user?.full_name?.split(' ')[0] || 'Lender'}</h2>
          <p className="text-muted-foreground">Here's an overview of your lending business</p>
        </div>

        {/* Stats section 
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard 
            title="Active Loans" 
            value="12" 
            icon={<FileText size={18} />} 
            trend={{ value: "8%", positive: true }}
            color="blue"
          />
          <StatCard 
            title="Total Borrowers" 
            value="48" 
            icon={<Users size={18} />}
            trend={{ value: "12%", positive: true }}
            color="green"
          />
          <StatCard 
            title="Pending Approvals" 
            value="3" 
            icon={<AlertTriangle size={18} />}
            color="amber"
          />
          <StatCard 
            title="Overdue Payments" 
            value="2" 
            icon={<Bell size={18} />}
            trend={{ value: "5%", positive: false }}
            color="red"
          />
        </div>*/}

        {/* Quick actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Quick Actions</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link to="/create_loan">
                <PlusCircle size={16} className="mr-2" />
                Create New Loan
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/view_loan">
                <FileText size={16} className="mr-2" />
                View All Loans
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/lender/ads/create">
                <PlusCircle size={16} className="mr-2" />
                Create Advertisement
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/risk_profile">
                <BarChart3 size={16} className="mr-2" />
                Risk Analysis
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/lender/notifications">
                <Bell size={16} className="mr-2" />
                Notifications
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/lender/support">
                <HelpCircle size={16} className="mr-2" />
                Support
              </Link>
            </Button>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Features grid */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Manage Your Business</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard 
              icon={<FileText size={24} />}
              title="Create Loan"
              description="Create new loan applications for your customers"
              href="/create_loan"
              color="blue"
            />
            <FeatureCard 
              icon={<History size={24} />}
              title="View Loans"
              description="View and manage all your active and past loans"
              href="/view_loan"
              color="default"
            />
            <FeatureCard 
              icon={<Settings size={24} />}
              title="My Profile"
              description="Manage your account settings and personal information"
              href="/lender/profile"
              color="green"
            />
            <FeatureCard 
              icon={<Users size={24} />}
              title="Customer History"
              description="Access detailed history of all your borrowers"
              href="/customer-history"
              color="default"
            />
            <FeatureCard 
              icon={<AlertTriangle size={24} />}
              title="Risk Analysis"
              description="Analyze borrower profiles and assess lending risks"
              href="/risk_profile"
              color="amber"
            />
            <FeatureCard 
              icon={<Search size={24} />}
              title="Advertisements"
              description="Create and manage your loan service advertisements"
              href="/lender/ads/all-ads"
              color="default"
            />
            <FeatureCard 
              icon={<Bell size={24} />}
              title="Notifications"
              description="View and manage your payment and loan notifications"
              href="/lender/notifications"
              color="blue"
            />
            <FeatureCard 
              icon={<HelpCircle size={24} />}
              title="Support"
              description="Get help and support for any issues you encounter"
              href="/lender/support"
              color="default"
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12 py-6">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">© 2023 PayMe Loan Management. All rights reserved.</p>
            <div className="flex gap-4 mt-4 md:mt-0">
              <Link to="" className="text-sm text-muted-foreground hover:text-blue-600">Terms of Service</Link>
              <Link to="" className="text-sm text-muted-foreground hover:text-blue-600">Privacy Policy</Link>
              <Link to="/lender/support" className="text-sm text-muted-foreground hover:text-blue-600">Help Center</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Lender_dashbord
