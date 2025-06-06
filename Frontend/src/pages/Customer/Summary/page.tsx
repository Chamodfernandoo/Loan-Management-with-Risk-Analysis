import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DataTable } from "@/components/default/data-table"
import { BorrowedLoanColumns, UpcomingPaymentColumns } from "./column"
import { LoanStatCard } from "./loan-stat-card"
import { CalendarClock, CheckCircle, Clock, CreditCard, DollarSign, Shield, Loader2 } from "lucide-react"
import { loanService } from "@/services/api"
import { useToast } from "@/hooks/use-toast"

export default function BorrowerLoanSummaryPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
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
  const { toast } = useToast()

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

  // Filter active and completed loans
  const activeLoans = borrowerData.loans.filter((loan: any) => loan.status === "active")
  const completedLoans = borrowerData.loans.filter((loan: any) => loan.status === "completed")

  // Calculate days until next payment
  const today = new Date()
  const nextPaymentDate = borrowerData.stats.nextPaymentDue
  const daysUntilNextPayment = nextPaymentDate ? 
    Math.ceil((nextPaymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) : 0

  if (loading) {
    return (
      <div className="container mx-auto flex justify-center items-center h-screen">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p>Loading loan summary...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">My Loan Summary</h1>
        <Button onClick={() => navigate("/borrower/ads/all-ads")}>Find New Lenders</Button>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-3 w-full max-w-md mx-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="loans">Loans</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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

          {nextPaymentDate && borrowerData.stats.nextPaymentAmount > 0 && (
            <Card className="bg-white border shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Next Payment Due</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                  <div className="space-y-1 col-span-2">
                    <div className="flex items-center">
                      <CalendarClock className="h-5 w-5 text-amber-500 mr-2" />
                      <span className="font-medium">{format(nextPaymentDate, "MMMM dd, yyyy")}</span>
                    </div>
                    <div className="flex items-center">
                      <DollarSign className="h-5 w-5 text-amber-500 mr-2" />
                      <span className="font-medium">Rs {borrowerData.stats.nextPaymentAmount.toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{daysUntilNextPayment} days remaining</p>
                  </div>
                  <div className="flex justify-end">
                    <Button onClick={() => navigate("/payments/make-payment", {
                      state: {
                        loanId: activeLoans.length > 0 ? activeLoans[0].id : null,
                        amount: borrowerData.stats.nextPaymentAmount,
                      }
                    })}>Pay Now</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Loan Summary Card */}
          <Card className="bg-white border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Loan Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Borrowed</p>
                  <p className="text-lg font-semibold">Rs {borrowerData.stats.totalBorrowed.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Total Paid</p>
                  <p className="text-lg font-semibold">Rs {borrowerData.stats.totalPaid.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Current Balance</p>
                  <p className="text-lg font-semibold">Rs {borrowerData.stats.currentBalance.toLocaleString()}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Loan Health</p>
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 text-green-500 mr-1" />
                    <p className="text-lg font-semibold text-green-600">Good</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Loans Preview */}
          {activeLoans.length > 0 && (
            <Card className="bg-white border shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-lg">Active Loans</CardTitle>
                  <Button variant="link" onClick={() => setActiveTab("loans")} className="p-0 h-auto">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable columns={BorrowedLoanColumns} data={activeLoans.slice(0, 2)} />
              </CardContent>
            </Card>
          )}

          {/* Upcoming Payments Preview */}
          {borrowerData.upcomingPayments.length > 0 && (
            <Card className="bg-white border shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex justify-between">
                  <CardTitle className="text-lg">Upcoming Payments</CardTitle>
                  <Button variant="link" onClick={() => setActiveTab("payments")} className="p-0 h-auto">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <DataTable columns={UpcomingPaymentColumns} data={borrowerData.upcomingPayments.slice(0, 3)} />
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Loans Tab */}
        <TabsContent value="loans" className="space-y-6">
          <Card className="bg-white border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Active Loans</CardTitle>
            </CardHeader>
            <CardContent>
              {activeLoans.length > 0 ? (
                <DataTable columns={BorrowedLoanColumns} data={activeLoans} />
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">You have no active loans</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Completed Loans</CardTitle>
            </CardHeader>
            <CardContent>
              {completedLoans.length > 0 ? (
                <DataTable columns={BorrowedLoanColumns} data={completedLoans} />
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">You have no completed loans</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payments Tab */}
        <TabsContent value="payments" className="space-y-6">
          <Card className="bg-white border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Upcoming Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {borrowerData.upcomingPayments.length > 0 ? (
                <DataTable columns={UpcomingPaymentColumns} data={borrowerData.upcomingPayments} />
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">You have no upcoming payments</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
              {borrowerData.recentPayments.length > 0 ? (
                <div className="overflow-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4">ID</th>
                        <th className="text-left py-3 px-4">Loan</th>
                        <th className="text-left py-3 px-4">Paid Date</th>
                        <th className="text-left py-3 px-4">Amount</th>
                        <th className="text-left py-3 px-4">Method</th>
                        <th className="text-left py-3 px-4">Lender</th>
                      </tr>
                    </thead>
                    <tbody>
                      {borrowerData.recentPayments.map((payment: any) => (
                        <tr key={payment.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{payment.id}</td>
                          <td className="py-3 px-4">{payment.loanId}</td>
                          <td className="py-3 px-4">{format(payment.paidDate, "MMM dd, yyyy")}</td>
                          <td className="py-3 px-4">Rs {payment.amount.toLocaleString()}</td>
                          <td className="py-3 px-4 capitalize">{payment.method.replace("_", " ")}</td>
                          <td className="py-3 px-4">{payment.lender}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">You have no recent payments</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
