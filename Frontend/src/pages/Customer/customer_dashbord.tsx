import { ButtonCard } from "@/components/default/card"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"

const Customer_dashbord = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
    })
    navigate("/login")
  }

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex justify-end p-4">
        <Button 
          variant="outline" 
          className="flex items-center gap-2" 
          onClick={handleLogout}
        >
          <LogOut size={16} />
          Logout
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-6 p-10 md:grid-cols-2 lg:grid-cols-3">
        <ButtonCard icon="" title="My Loans" href="/borrower/loans" />
        <ButtonCard icon="" title="My Profile" href="/borrower/profile" />
        <ButtonCard icon="" title="Support" href="/borrower/support" />
        <ButtonCard icon="" title="Find Lenders" href="/borrower/ads/all-ads" />
        <ButtonCard icon="" title="Notification" href="/borrower/notifications" />
        <ButtonCard icon="" title="Loans Summary" href="/borrower/loan-summary" />
      </div>
    </div>
  )
}

export default Customer_dashbord
