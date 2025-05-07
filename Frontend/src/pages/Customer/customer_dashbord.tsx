import { ButtonCard } from "@/components/default/card"
import { Button } from "@/components/ui/button"
import { Bell, CheckCircle, CreditCard, DollarSign, HelpCircle, History, Loader2, LogOut, Search, Settings, Users } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { LoanStatCard } from "./Summary/loan-stat-card"
import { useState, useEffect } from "react"
import { loanService } from "@/services/api"




const Customer_dashbord = () => {
  const { logout } = useAuth()
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { toast } = useToast()
  const [borrowerData, setBorrowerData] = useState<any>({
      stats: {
        activeLoans: 0,
        completedLoans: 0,
        totalBorrowed: 0,
        currentBalance: 0,
        totalPaid: 0,
        nextPaymentDue: new Date(),
        nextPaymentAmount: 0,
      },
      loans: [],
      upcomingPayments: [],
      recentPayments: []
    })

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
    })
    navigate("/login")
  }

  useEffect(() => {
      const fetchLoanSummary = async () => {
        setLoading(true)
        try {
          const summaryData = await loanService.getBorrowerLoanSummary()
          
          // Format dates for the data
          if (summaryData.stats.nextPaymentDue) {
            summaryData.stats.nextPaymentDue = new Date(summaryData.stats.nextPaymentDue)
          }
          
          if (summaryData.loans) {
            summaryData.loans = summaryData.loans.map((loan: any) => ({
              ...loan,
              startDate: new Date(loan.startDate),
              endDate: new Date(loan.endDate)
            }))
          }
          
          if (summaryData.upcomingPayments) {
            summaryData.upcomingPayments = summaryData.upcomingPayments.map((payment: any) => ({
              ...payment,
              dueDate: new Date(payment.dueDate)
            }))
          }
          
          if (summaryData.recentPayments) {
            summaryData.recentPayments = summaryData.recentPayments.map((payment: any) => ({
              ...payment,
              paidDate: new Date(payment.paidDate)
            }))
          }
          
          setBorrowerData(summaryData)
        } catch (error) {
          console.error("Error fetching loan summary:", error)
          toast({
            title: "Error",
            description: "Failed to load loan summary data. Please try again.",
            variant: "destructive"
          })
        } finally {
          setLoading(false)
        }
      }
      
      fetchLoanSummary()
    }, [toast])


  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex justify-end p-4">
        <Button 
          variant="outline" 
          className="flex items-center gap-2 bg-red-500 text-white" 
          onClick={handleLogout}
        >
          <LogOut size={16} />
          Logout
        </Button>
      </div>
      <div>
        <h1 className="text-4xl font-bold text-center">Lender Dashbord</h1>
        <h1 className="text-2xl text-center mt-4 text-gray-600">Welcome to the lender Dashboard</h1>
        {loading && (
          <div className="flex justify-center items-center h-screen">
            <Loader2 className="animate-spin h-10 w-10 text-blue-500" />
          </div>
        )}
      </div>
      
      {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 m-10">
                  <LoanStatCard
                    title="Active Loans"
                    value={borrowerData.stats.activeLoans.toString()}
                    icon={<CreditCard className="h-5 w-5" />}
                    color="blue"
                  />
                  <LoanStatCard
                    title="Completed Loans"
                    value={borrowerData.stats.completedLoans.toString()}
                    icon={<CheckCircle className="h-5 w-5" />}
                    color="green"
                  />
                  <LoanStatCard
                    title="Current Balance"
                    value={`Rs ${borrowerData.stats.currentBalance.toLocaleString()}`}
                    icon={<DollarSign className="h-5 w-5" />}
                    color="amber"
                  />
                </div>
      <div className="grid grid-cols-1 gap-6 p-10 md:grid-cols-2 lg:grid-cols-3">
        <ButtonCard icon={<History size={40} />} title="My Loans" href="/borrower/loans" description="View and manage all your active and completed loan applications in one place"/>
        <ButtonCard icon={<Settings size={40} />} title="My Profile" href="/borrower/profile" description="Update your personal information, contact details, and account settings." />
        <ButtonCard icon={<HelpCircle size={40} />} title="Support" href="/borrower/support" description="Get help, find answers to your questions, or contact our support team" />
        <ButtonCard icon={<Search size={40} />} title="Find Lenders" href="/borrower/ads/all-ads" description="Browse available lenders and compare loan offers that match your needs."/>
        <ButtonCard icon={<Bell size={40} />} title="Notification" href="/borrower/notifications" description="Stay updated with important alerts, reminders, and loan activity notifications"/>
        <ButtonCard icon={<Users size={40} />} title="Loans Summary" href="/borrower/loan-summary" description="View overview of your loans, including total borrowed and repayment status" />
      </div>
    </div>
  )
}

export default Customer_dashbord
