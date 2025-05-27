  import { useState, useEffect } from "react"
  import { useParams, useNavigate } from "react-router-dom"
  import { format, addMonths } from "date-fns"
  import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
  import { Button } from "@/components/ui/button"
  import { Badge } from "@/components/ui/badge"
  import { Separator } from "@/components/ui/separator"
  import { Progress } from "@/components/ui/progress"
  import { CalendarClock, ArrowLeft, CreditCard, Calendar, Percent, DollarSign, ReceiptText, Loader2 } from "lucide-react"
  import { loanService, paymentService } from "@/services/api"
  import { useToast } from "@/hooks/use-toast"

  export default function IndividualLoanPage() {
    const { loanId } = useParams()
    const navigate = useNavigate()
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [loan, setLoan] = useState<any>(null)
    const [payments, setPayments] = useState<any[]>([])
    const [nextPayment, setNextPayment] = useState<any>(null)
    const [paymentSchedule, setPaymentSchedule] = useState<any[]>([])

    useEffect(() => {
      const fetchLoanDetails = async () => {
        if (!loanId) {
          toast({
            title: "Error",
            description: "No loan ID provided.",
            variant: "destructive"
          })
          navigate("/borrower/loan-summary")
          return
        }
      
        setLoading(true)
        try {
          // Fetch the loan details
          const loanData = await loanService.getLoan(loanId)
        
          // Fetch payments for this loan
          const paymentsData = await paymentService.getPayments(loanId)
        
          // Fetch next installment information
          const nextInstallment = await loanService.getNextInstallment(loanId)
        
          // Transform loan data
          const transformedLoan = {
            id: loanData._id,
            lender: {
              name: loanData.lender_name || "Unknown Lender",
              contactNumber: "N/A",
              address: loanData.lender_address || "N/A",
            },
            borrower: {
              name: loanData.customer_name || "N/A",
              id: loanData.borrower_nic || "N/A",
              contactNumber: loanData.customer_phone || "N/A",
              address: loanData.customer_address || "N/A",
            },
            details: {
              amount: loanData.amount,
              startDate: new Date(loanData.start_date || new Date()),
              endDate: new Date(loanData.end_date || new Date()),
              installments: loanData.term_months || 0,
              installmentAmount: loanData.installment_amount || 0,
              interestRate: loanData.interest_rate || 0,
              remainingInstallments: loanData.payments ? 
                loanData.payments.filter((p: any) => p.status === "PENDING").length : 0,
              totalPaid: loanData.total_paid || 0,
              remainingAmount: loanData.remaining_amount || 0,
              status: loanData.status === "ACTIVE" || loanData.status === "APPROVED" ? 
                "active" : loanData.status === "COMPLETED" ? "completed" : "pending",
            },
            payments: Array.isArray(paymentsData) ? paymentsData.map((p: any) => ({
              id: p._id || p.payment_id,
              dueDate: new Date(p.due_date || p.created_at || new Date()),
              paidDate: p.payment_date ? new Date(p.payment_date) : null,
              amount: p.amount || 0,
              status: p.status === "COMPLETED" ? "paid" : 
                    p.status === "PENDING" && new Date(p.due_date) < new Date() ? "overdue" : "pending",
              method: p.method || "unknown",
            })) : [],
            nextPayment: nextInstallment ? {
              id: "NEXT-PAYMENT",
              dueDate: new Date(nextInstallment.dueDate),
              amount: nextInstallment.amount
            } : null
          }
        
          setLoan(transformedLoan)
          setPayments(transformedLoan.payments)
          setNextPayment(transformedLoan.nextPayment)
        
          // Generate payment schedule
          const schedule = generatePaymentSchedule(transformedLoan)
          setPaymentSchedule(schedule)
        
        } catch (error) {
          console.error("Error fetching loan details:", error)
          toast({
            title: "Error",
            description: "Failed to load loan details. Please try again.",
            variant: "destructive"
          })
        } finally {
          setLoading(false)
        }
      }
    
      fetchLoanDetails()
    }, [loanId, navigate, toast])

    // Generate payment schedule
    const generatePaymentSchedule = (loanData: any) => {
      const schedule = []
      const startDate = loanData.details.startDate
      const payments = loanData.payments || []

      for (let i = 0; i < loanData.details.installments; i++) {
        const paymentDate = addMonths(startDate, i)

        // Find if there's a matching payment in the payments history
        const existingPayment = payments.find(
          (p: any) => {
            const paidMonth = p.paidDate ? p.paidDate.getMonth() : null;
            const paidYear = p.paidDate ? p.paidDate.getFullYear() : null;
            return paidMonth === paymentDate.getMonth() && paidYear === paymentDate.getFullYear();
          }
        )

        schedule.push({
          installment: i + 1,
          dueDate: paymentDate,
          amount: loanData.details.installmentAmount,
          status: existingPayment ? "paid" : paymentDate < new Date() ? "overdue" : "upcoming",
          paidDate: existingPayment?.paidDate || null,
          method: existingPayment?.method || null,
        })
      }

      return schedule
    }

    // Calculate progress
    const calculateProgress = () => {
      if (!loan) return 0;
      const completedPercentage =
        ((loan.details.installments - loan.details.remainingInstallments) / loan.details.installments) * 100
      return completedPercentage;
    }

    if (loading) {
      return (
        <div className="container mx-auto flex justify-center items-center h-screen">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p>Loading loan details...</p>
          </div>
        </div>
      )
    }

    if (!loan) {
      return (
        <div className="container mx-auto px-4 py-6">
          <Button variant="outline" className="mb-6" onClick={() => navigate("/borrower/loan-summary")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Loan Summary
          </Button>
          <div className="text-center py-10">
            <p className="text-lg text-muted-foreground">Loan not found or you don't have access to view it.</p>
          </div>
        </div>
      )
    }

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
                <Progress value={calculateProgress()} className="h-2" />
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
              {nextPayment && loan.details.status === "active" && (
                <Card className="bg-gray-50 border">
                  <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-base font-medium mb-1">Next Payment Due</h3>
                        <div className="flex items-center">
                          <CalendarClock className="h-4 w-4 text-primary mr-2" />
                          <span>{format(nextPayment.dueDate, "MMMM dd, yyyy")}</span>
                        </div>
                        <div className="flex items-center mt-1">
                          <DollarSign className="h-4 w-4 text-primary mr-2" />
                          <span>Rs {nextPayment.amount.toLocaleString()}</span>
                        </div>
                      </div>
                      <Button onClick={() => navigate("/payments/make-payment", {
                        state: {
                          loanId: loan.id,
                          amount: nextPayment.amount
                        }
                      })}>Pay Now</Button>
                    </div>
                  </CardContent>
                </Card>
              )}
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
