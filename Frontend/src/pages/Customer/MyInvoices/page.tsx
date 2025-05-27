import { useState, useEffect } from "react"
import { DataTable } from "@/components/default/data-table"
import { columns, type Payment } from "@/pages/Customer/MyInvoices/column"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Printer, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ArrowLeft } from "lucide-react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { loanService, paymentService } from "@/services/api"
import { useToast } from "@/hooks/use-toast"

export default function MyInvoiceView() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [invoiceData, setInvoiceData] = useState<any>({
    id: "",
    status: "pending",
    totalAmount: 0,
    paidAmount: 0,
    remainingAmount: 0,
    customer: {
      name: "",
      address: "",
      phone: "",
    },
    orderDetails: {
      amount: 0,
      taxRate: 0,
      installments: 0,
      installmentPrice: 0,
    },
  })
  
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  
  // Get loanId from location state
  const loanId = location.state?.loanId

  useEffect(() => {
    const fetchInvoiceData = async () => {
      if (!loanId) {
        toast({
          title: "Error",
          description: "No loan ID found. Please go back and try again.",
          variant: "destructive"
        })
        return
      }
      
      setLoading(true)
      try {
        // Fetch loan details
        const loanData = await loanService.getLoan(loanId)
        
        // Fetch payment history for this loan
        const paymentsData = await paymentService.getPayments(loanId)
        
        // Calculate total paid amount from payments
        const totalPaid = Array.isArray(paymentsData) 
          ? paymentsData.reduce((sum, payment) => sum + payment.amount, 0) 
          : 0
          
        // Calculate remaining amount
        const totalAmount = loanData.amount + (loanData.amount * loanData.interest_rate / 100)
        const remainingAmount = totalAmount - totalPaid
        
        // Transform payment data to match our Payment type
        const formattedPayments = Array.isArray(paymentsData) 
          ? paymentsData.map((payment: any) => {
              // Explicitly type status to match Payment type
              let status: "pending" | "completed" | "failed"
              
              if (payment.status === "COMPLETED") {
                status = "completed"
              } else if (payment.status === "FAILED") {
                status = "failed"
              } else {
                status = "pending"
              }
              
              return {
                id: payment._id,
                date: new Date(payment.created_at || payment.payment_date || Date.now()),
                amount: payment.amount,
                method: payment.method || "cash",
                status // Use the explicitly typed status
              }
            })
          : []
        
        // Set invoice data
        setInvoiceData({
          id: `INV-${loanId.substring(0, 5)}`,
          status: loanData.status === "COMPLETED" ? "paid" : "pending",
          totalAmount: totalAmount,
          paidAmount: totalPaid,
          remainingAmount: remainingAmount,
          customer: {
            name: loanData.customer_name || "Customer",
            address: loanData.customer_address || "Address",
            phone: loanData.customer_phone || "Phone",
          },
          orderDetails: {
            amount: loanData.amount,
            taxRate: loanData.interest_rate,
            installments: loanData.term_months,
            installmentPrice: loanData.installment_amount,
          },
        })
        
        setPayments(formattedPayments)
      } catch (error) {
        console.error("Error fetching invoice data:", error)
        toast({
          title: "Error",
          description: "Failed to load invoice data. Please try again.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchInvoiceData()
  }, [loanId, toast])

  // Handle print function
  const handlePrint = () => {
    window.print()
  }

  if (loading) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading invoice...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <Card className="shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <Button variant="outline" className="mb-4 sm:mb-6" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <CardTitle className="text-2xl font-bold">View Invoice</CardTitle>
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
                <Badge className={invoiceData.status === "paid" 
                  ? "bg-green-100 text-green-800" 
                  : "bg-yellow-100 text-yellow-800"}>
                  {invoiceData.status === "paid" ? "Paid" : "Pending"}
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
                    <div className="text-sm text-muted-foreground">Tax Rate:</div>
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
              <h3 className="text-lg font-semibold">Payment History</h3>
              {invoiceData.remainingAmount > 0 && (
                <Button>
                  <Link to="/payments/make-payment" state={{ loanId, 
                    amount: invoiceData.orderDetails.installmentPrice, 
                    loanData: invoiceData }}>
                    Pay online
                  </Link>
                </Button>
              )}
            </div>
            {payments.length > 0 ? (
              <DataTable columns={columns} data={payments} />
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded">
                <p className="text-muted-foreground">No payment records found.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
