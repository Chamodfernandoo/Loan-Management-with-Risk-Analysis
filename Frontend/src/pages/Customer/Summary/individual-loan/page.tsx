
import { useParams, useNavigate } from "react-router-dom"
import { format, addMonths } from "date-fns"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import { CalendarClock, ArrowLeft, CreditCard, Calendar, Percent, DollarSign, ReceiptText } from "lucide-react"

// Sample data - in a real app, this would come from your API
const loanDetailsData = {
  id: "LOAN-001",
  lender: {
    name: "Sameera Finance",
    contactNumber: "077-6653521",
    address: "190/3 Alavita Kegalle",
  },
  borrower: {
    name: "Chamud Fernando",
    id: "200129102613",
    contactNumber: "077-3556635",
    address: "Kegalle nethuwall",
  },
  details: {
    amount: 50000,
    startDate: new Date("2023-01-15"),
    endDate: new Date("2023-12-15"),
    installments: 12,
    installmentAmount: 5500,
    interestRate: 13.75,
    remainingInstallments: 6,
    totalPaid: 33000,
    remainingAmount: 33000,
    status: "active",
  },
  payments: [
    {
      id: "PAY-044",
      dueDate: new Date("2023-05-15"),
      paidDate: new Date("2023-05-12"),
      amount: 5500,
      status: "paid",
      method: "cash",
    },
    {
      id: "PAY-043",
      dueDate: new Date("2023-04-15"),
      paidDate: new Date("2023-04-15"),
      amount: 5500,
      status: "paid",
      method: "bank_transfer",
    },
    {
      id: "PAY-042",
      dueDate: new Date("2023-03-15"),
      paidDate: new Date("2023-03-18"),
      amount: 5500,
      status: "paid",
      method: "card",
    },
    {
      id: "PAY-041",
      dueDate: new Date("2023-02-15"),
      paidDate: new Date("2023-02-15"),
      amount: 5500,
      status: "paid",
      method: "cash",
    },
    {
      id: "PAY-040",
      dueDate: new Date("2023-01-15"),
      paidDate: new Date("2023-01-15"),
      amount: 5500,
      status: "paid",
      method: "cash",
    },
  ],
  nextPayment: {
    id: "PAY-045",
    dueDate: new Date("2023-06-15"),
    amount: 5500,
  },
}

export default function IndividualLoanPage() {
  const { loanId } = useParams()
  const navigate = useNavigate()

  // In a real app, you would fetch the loan details using the loanId
  const loan = loanDetailsData

  // Calculate progress
  const completedPercentage =
    ((loan.details.installments - loan.details.remainingInstallments) / loan.details.installments) * 100

  // Generate payment schedule
  const generatePaymentSchedule = () => {
    const schedule = []
    const startDate = loan.details.startDate

    for (let i = 0; i < loan.details.installments; i++) {
      const paymentDate = addMonths(startDate, i)

      // Find if there's a matching payment in the payments history
      const existingPayment = loan.payments.find(
        (p) => p.dueDate.getMonth() === paymentDate.getMonth() && p.dueDate.getFullYear() === paymentDate.getFullYear(),
      )

      schedule.push({
        installment: i + 1,
        dueDate: paymentDate,
        amount: loan.details.installmentAmount,
        status: existingPayment ? "paid" : paymentDate < new Date() ? "overdue" : "upcoming",
        paidDate: existingPayment?.paidDate || null,
        method: existingPayment?.method || null,
      })
    }

    return schedule
  }

  const paymentSchedule = generatePaymentSchedule()

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 max-w-4xl">
      <Button variant="outline" className="mb-6" onClick={() => navigate("/borrower/loan-summary")}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Loan Summary
      </Button>

      <div className="grid gap-6">
        <Card className="bg-white border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <CardTitle className="text-xl sm:text-2xl">
                Loan Details
                <span className="text-muted-foreground ml-2 text-base">#{loan.id}</span>
              </CardTitle>
              <Badge
                className={
                  loan.details.status === "active"
                    ? "bg-blue-100 text-blue-800 hover:bg-blue-100 hover:text-blue-800"
                    : loan.details.status === "completed"
                      ? "bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800"
                      : "bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800"
                }
              >
                {loan.details.status.charAt(0).toUpperCase() + loan.details.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Loan Summary */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Loan Amount</p>
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 text-primary mr-2" />
                  <p className="text-lg font-semibold">Rs {loan.details.amount.toLocaleString()}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Interest Rate</p>
                <div className="flex items-center">
                  <Percent className="h-4 w-4 text-primary mr-2" />
                  <p className="text-lg font-semibold">{loan.details.interestRate}%</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Start Date</p>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-primary mr-2" />
                  <p className="text-lg font-semibold">{format(loan.details.startDate, "MMM dd, yyyy")}</p>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">End Date</p>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-primary mr-2" />
                  <p className="text-lg font-semibold">{format(loan.details.endDate, "MMM dd, yyyy")}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Progress Section */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">Repayment Progress</p>
                <p className="text-sm font-medium">
                  {loan.details.installments - loan.details.remainingInstallments} of {loan.details.installments}{" "}
                  installments
                </p>
              </div>
              <Progress value={completedPercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Rs {loan.details.totalPaid.toLocaleString()} paid</span>
                <span>Rs {loan.details.amount.toLocaleString()} total</span>
              </div>
            </div>

            {/* Lender Information */}
            <div>
              <h3 className="text-base font-medium mb-2">Lender Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p>{loan.lender.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Contact Number</p>
                  <p>{loan.lender.contactNumber}</p>
                </div>
                <div className="sm:col-span-2">
                  <p className="text-sm text-muted-foreground">Address</p>
                  <p>{loan.lender.address}</p>
                </div>
              </div>
            </div>

            {/* Next Payment */}
            <Card className="bg-gray-50 border">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-medium mb-1">Next Payment Due</h3>
                    <div className="flex items-center">
                      <CalendarClock className="h-4 w-4 text-primary mr-2" />
                      <span>{format(loan.nextPayment.dueDate, "MMMM dd, yyyy")}</span>
                    </div>
                    <div className="flex items-center mt-1">
                      <DollarSign className="h-4 w-4 text-primary mr-2" />
                      <span>Rs {loan.nextPayment.amount.toLocaleString()}</span>
                    </div>
                  </div>
                  <Button>Pay Now</Button>
                </div>
              </CardContent>
            </Card>
          </CardContent>
        </Card>

        {/* Payment History */}
        <Card className="bg-white border shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Payment Schedule</CardTitle>
              <Button variant="outline" size="sm">
                <ReceiptText className="h-4 w-4 mr-2" />
                Download Statement
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-xs text-muted-foreground">
                    <th className="text-left py-3 px-4">#</th>
                    <th className="text-left py-3 px-4">Due Date</th>
                    <th className="text-left py-3 px-4">Amount</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Paid Date</th>
                    <th className="text-left py-3 px-4">Method</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentSchedule.map((payment, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{payment.installment}</td>
                      <td className="py-3 px-4">{format(payment.dueDate, "MMM dd, yyyy")}</td>
                      <td className="py-3 px-4">Rs {payment.amount.toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <Badge
                          className={
                            payment.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : payment.status === "upcoming"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-red-100 text-red-800"
                          }
                        >
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">{payment.paidDate ? format(payment.paidDate, "MMM dd, yyyy") : "-"}</td>
                      <td className="py-3 px-4 capitalize">
                        {payment.method ? payment.method.replace("_", " ") : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

