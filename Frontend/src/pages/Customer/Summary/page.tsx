import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { DataTable } from "@/components/default/data-table"
import { BorrowedLoanColumns, UpcomingPaymentColumns } from "./column"
import { LoanStatCard } from "./loan-stat-card"
import { CalendarClock, CheckCircle, Clock, CreditCard, DollarSign, Shield } from "lucide-react"

// Sample data - in a real app, this would come from your API
const borrowerData = {
  stats: {
    activeLoans: 1,
    completedLoans: 2,
    totalBorrowed: 150000,
    currentBalance: 50000,
    totalPaid: 100000,
    nextPaymentDue: new Date("2023-06-25"),
    nextPaymentAmount: 5500,
  },
  loans: [
    {
      id: "LOAN-001",
      lender: "Sameera Finance",
      amount: 50000,
      startDate: new Date("2023-01-15"),
      endDate: new Date("2023-12-15"),
      installments: 12,
      installmentAmount: 5500,
      remainingInstallments: 6,
      status: "active",
      interestRate: 13.75,
    },
    {
      id: "LOAN-002",
      lender: "Capital Loans",
      amount: 30000,
      startDate: new Date("2022-06-10"),
      endDate: new Date("2022-12-10"),
      installments: 6,
      installmentAmount: 5500,
      remainingInstallments: 0,
      status: "completed",
      interestRate: 12.5,
    },
    {
      id: "LOAN-003",
      lender: "Hill Country Finance",
      amount: 70000,
      startDate: new Date("2022-03-20"),
      endDate: new Date("2022-10-20"),
      installments: 8,
      installmentAmount: 9625,
      remainingInstallments: 0,
      status: "completed",
      interestRate: 10.0,
    },
  ],
  upcomingPayments: [
    {
      id: "PAY-045",
      loanId: "LOAN-001",
      dueDate: new Date("2023-06-25"),
      amount: 5500,
      status: "upcoming",
      lender: "Sameera Finance",
    },
    {
      id: "PAY-046",
      loanId: "LOAN-001",
      dueDate: new Date("2023-07-25"),
      amount: 5500,
      status: "upcoming",
      lender: "Sameera Finance",
    },
    {
      id: "PAY-047",
      loanId: "LOAN-001",
      dueDate: new Date("2023-08-25"),
      amount: 5500,
      status: "upcoming",
      lender: "Sameera Finance",
    },
  ],
  recentPayments: [
    {
      id: "PAY-044",
      loanId: "LOAN-001",
      paidDate: new Date("2023-05-25"),
      amount: 5500,
      method: "cash",
      lender: "Sameera Finance",
    },
    {
      id: "PAY-043",
      loanId: "LOAN-001",
      paidDate: new Date("2023-04-25"),
      amount: 5500,
      method: "bank_transfer",
      lender: "Sameera Finance",
    },
    {
      id: "PAY-042",
      loanId: "LOAN-001",
      paidDate: new Date("2023-03-25"),
      amount: 5500,
      method: "card",
      lender: "Sameera Finance",
    },
  ],
}

export default function BorrowerLoanSummaryPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("overview")

  // Filter active and completed loans
  const activeLoans = borrowerData.loans.filter((loan) => loan.status === "active")
  const completedLoans = borrowerData.loans.filter((loan) => loan.status === "completed")

  // Calculate days until next payment
  const today = new Date()
  const nextPaymentDate = borrowerData.stats.nextPaymentDue
  const daysUntilNextPayment = Math.ceil((nextPaymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

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
              <DataTable columns={UpcomingPaymentColumns} data={borrowerData.upcomingPayments} />
            </CardContent>
          </Card>

          <Card className="bg-white border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Recent Payments</CardTitle>
            </CardHeader>
            <CardContent>
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
                    {borrowerData.recentPayments.map((payment) => (
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

