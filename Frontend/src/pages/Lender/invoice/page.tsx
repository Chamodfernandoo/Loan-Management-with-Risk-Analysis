import { useState, useEffect } from "react"
import { DataTable } from "@/components/default/data-table"
import { columns, type Payment } from "@/pages/Lender/invoice/column"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Printer, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { format } from "date-fns"
import Payament_popup from "./payament_popup"
import { ArrowLeft } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { loanService, paymentService } from "@/services/api"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface InvoiceData {
  id: string
  status: string
  totalAmount: number
  paidAmount: number
  remainingAmount: number
  customer: {
    name: string
    address: string
    phone: string
  }
  orderDetails: {
    amount: number
    taxRate: number
    installments: number
    installmentPrice: number
  }
}

interface NextInstallment {
  amount: number
  dueDate: string
}

export default function InvoiceView() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null)
  const [loading, setLoading] = useState(true)
  const [nextInstallment, setNextInstallment] = useState<NextInstallment | null>(null)
  const navigate = useNavigate()
  const { loanId } = useParams()
  const { toast } = useToast()

  // Fetch loan and payment data
  useEffect(() => {
    const fetchLoanData = async () => {
      if (!loanId) {
        toast({
          title: "Error",
          description: "No loan ID provided",
          variant: "destructive"
        })
        navigate(-1)
        return
      }

      setLoading(true)
      try {
        // Fetch loan details
        const loan = await loanService.getLoan(loanId)
        
        // Format invoice data
        const formattedInvoice = {
          id: loan._id,
          status: loan.status.toLowerCase(),
          totalAmount: loan.total_amount,
          paidAmount: loan.total_paid || 0,
          remainingAmount: loan.remaining_amount || (loan.total_amount - (loan.total_paid || 0)),
          customer: {
            name: loan.customer_name || "Unknown Customer",
            address: loan.customer_address || "No address provided",
            phone: loan.customer_phone || "No phone provided",
          },
          orderDetails: {
            amount: loan.amount,
            taxRate: loan.interest_rate,
            installments: loan.term_months,
            installmentPrice: loan.installment_amount,
          }
        }
        
        setInvoiceData(formattedInvoice)

        // Format payments
        if (loan.payments && Array.isArray(loan.payments)) {
          const formattedPayments = loan.payments.map((payment: any, index: number) => ({
            id: payment.payment_id || `PAY-${index + 1}`,
            date: payment.payment_date ? new Date(payment.payment_date) : new Date(),
            amount: payment.amount,
            method: payment.method || "cash",
            status: payment.status.toLowerCase(),
          }))
          setPayments(formattedPayments.reverse()) // Most recent first
        }

        // Get next installment info
        try {
          // Find the first pending payment if available
          const pendingPayment = loan.payments.find((p: any) => p.status === "PENDING")
          if (pendingPayment) {
            setNextInstallment({
              amount: pendingPayment.amount,
              dueDate: pendingPayment.due_date
            })
          }
        } catch (error) {
          console.error("Error finding next installment:", error)
        }
      } catch (error) {
        console.error("Error fetching loan data:", error)
        toast({
          title: "Error",
          description: "Failed to load loan details. Please try again.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }

    fetchLoanData()
  }, [loanId, navigate, toast])

  // Handle adding a new payment
  const handleAddPayment = async (amount: string, date: Date, method: string) => {
    if (!loanId || !invoiceData) return
    
    try {
      const paymentData = {
        amount: parseFloat(amount),
        payment_date: date,
        method,
        status: "COMPLETED"
      }
      
      const newPayment = await paymentService.addLoanPayment(loanId, paymentData)
      
      // Refresh loan data to get updated payment info
      const updatedLoan = await loanService.getLoan(loanId)
      
      // Update invoice data - fix: create new complete InvoiceData object
      setInvoiceData({
        id: invoiceData.id,
        status: updatedLoan.status.toLowerCase(),
        totalAmount: invoiceData.totalAmount,
        paidAmount: updatedLoan.total_paid || 0,
        remainingAmount: updatedLoan.remaining_amount || 0,
        customer: invoiceData.customer,
        orderDetails: invoiceData.orderDetails
      })
      
      // Update payments list
      if (updatedLoan.payments && Array.isArray(updatedLoan.payments)) {
        const formattedPayments = updatedLoan.payments.map((payment: any, index: number) => ({
          id: payment.payment_id || `PAY-${index + 1}`,
          date: payment.payment_date ? new Date(payment.payment_date) : new Date(),
          amount: payment.amount,
          method: payment.method || "cash",
          status: payment.status.toLowerCase(),
        }))
        setPayments(formattedPayments.reverse()) // Most recent first
      }
      
      toast({
        title: "Payment added successfully",
        description: `Payment of Rs ${amount} recorded.`,
      })
      
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error adding payment:", error)
      toast({
        title: "Error",
        description: "Failed to add payment. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Handle print function
  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="container mx-auto py-6 flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p>Loading invoice details...</p>
        </div>
      </div>
    )
  }

  if (!invoiceData) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="p-6 text-center">
            <p>Could not load invoice details. Please try again.</p>
            <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <Button variant="outline" className="mb-4 sm:mb-6" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <CardTitle className="text-2xl font-bold text-blue-600">View Invoice</CardTitle>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Order Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex justify-between items-center mb-4">
                <div className="font-medium">Order ID: {invoiceData.id}</div>
                <Badge className={
                  invoiceData.status === "completed" ? "bg-green-100 text-green-800" :
                  invoiceData.status === "approved" ? "bg-blue-100 text-blue-800" :
                  "bg-yellow-100 text-yellow-800"
                }>
                  {invoiceData.status.charAt(0).toUpperCase() + invoiceData.status.slice(1)}
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Total Amount:</div>
                  <div className="font-medium">Rs {invoiceData.totalAmount.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Paid Amount:</div>
                  <div className="font-medium">Rs {invoiceData.paidAmount.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Remaining:</div>
                  <div className="font-medium">Rs {invoiceData.remainingAmount.toFixed(2)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardContent className="p-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Customer Name:</div>
                    <div className="font-medium">{invoiceData.customer.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Phone No:</div>
                    <div className="font-medium">{invoiceData.customer.phone}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Amount:</div>
                    <div className="font-medium">Rs {invoiceData.orderDetails.amount.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Installments:</div>
                    <div className="font-medium">{invoiceData.orderDetails.installments}</div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Address:</div>
                    <div className="font-medium">{invoiceData.customer.address}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Date:</div>
                    <div className="font-medium">{format(new Date(), "MMM dd, yyyy")}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Interest Rate:</div>
                    <div className="font-medium">{invoiceData.orderDetails.taxRate}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Installment Price:</div>
                    <div className="font-medium">Rs {invoiceData.orderDetails.installmentPrice.toFixed(2)}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-blue-700">Payment History</h3>
              {invoiceData.remainingAmount > 0 && (
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Payment
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <Payament_popup 
                      onSubmitPayment={handleAddPayment} 
                      nextInstallment={nextInstallment} 
                      loanId={loanId}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
            <DataTable columns={columns} data={payments} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
