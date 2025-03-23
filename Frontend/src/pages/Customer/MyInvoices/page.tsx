import { useState } from "react"
import { DataTable } from "@/components/default/data-table"
import { columns, type Payment } from "@/pages/Lender/invoice/column"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Printer, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

// Sample invoice data
const invoiceData = {
  id: "INV-001",
  status: "paid",
  totalAmount: 57500.0,
  paidAmount: 57500.0,
  remainingAmount: 0.0,
  customer: {
    name: "Chamud Fernando",
    address: "100/3 morthavi, Kegalle",
    phone: "0776653521",
  },
  orderDetails: {
    amount: 50000.0,
    taxRate: 10,
    installments: 10,
    installmentPrice: 5500.0,
  },
}

// Sample payment history data
const paymentHistoryData: Payment[] = [
  {
    id: "PAY-001",
    date: new Date("2023-01-15"),
    amount: 5500.0,
    method: "cash",
    status: "completed",
  },
  {
    id: "PAY-002",
    date: new Date("2023-02-15"),
    amount: 5500.0,
    method: "bank_transfer",
    status: "completed",
  },
  {
    id: "PAY-003",
    date: new Date("2023-03-15"),
    amount: 5500.0,
    method: "card",
    status: "completed",
  },
  {
    id: "PAY-004",
    date: new Date("2023-04-15"),
    amount: 5500.0,
    method: "cash",
    status: "completed",
  },
  {
    id: "PAY-005",
    date: new Date("2023-05-15"),
    amount: 5500.0,
    method: "cheque",
    status: "completed",
  },
  {
    id: "PAY-006",
    date: new Date("2023-06-15"),
    amount: 5500.0,
    method: "cash",
    status: "completed",
  },
  {
    id: "PAY-007",
    date: new Date("2023-07-15"),
    amount: 5500.0,
    method: "card",
    status: "completed",
  },
  {
    id: "PAY-008",
    date: new Date("2023-08-15"),
    amount: 5500.0,
    method: "bank_transfer",
    status: "completed",
  },
  {
    id: "PAY-009",
    date: new Date("2023-09-15"),
    amount: 5500.0,
    method: "cash",
    status: "completed",
  },
  {
    id: "PAY-010",
    date: new Date("2023-10-15"),
    amount: 5500.0,
    method: "card",
    status: "completed",
  },
]

export default function MyInvoiceView() {
  const [payments, _setPayments] = useState<Payment[]>(paymentHistoryData)
  const navigate = useNavigate()


  // Handle print function
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="container mx-auto py-6 space-y-6 max-w-4xl">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <Button variant="outline" className="mb-4 sm:mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
          <CardTitle className="text-2xl font-bold">Viw Invoice</CardTitle>
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
                <Badge className="bg-green-100 text-green-800">
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
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Pay online
                  </Button>
            </div>
            <DataTable columns={columns} data={payments} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
