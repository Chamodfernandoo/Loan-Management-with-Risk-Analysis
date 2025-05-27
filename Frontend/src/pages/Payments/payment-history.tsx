import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { ArrowLeft, Download, Search, Filter, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Payment interface
interface Payment {
  id: string
  date: Date
  amount: number
  status: "successful" | "failed" | "pending" | "refunded"
  method: {
    type: "card"
    last4: string
    brand: "visa" | "mastercard" | "amex" | "discover"
  }
  loanId: string
  lender: string
  description: string
}

// Sample payments data
const samplePayments: Payment[] = [
  {
    id: "pmt-001",
    date: new Date("2023-06-15"),
    amount: 5500,
    status: "successful",
    method: {
      type: "card",
      last4: "1111",
      brand: "visa",
    },
    loanId: "LOAN-001",
    lender: "Sameera Finance",
    description: "Monthly installment payment",
  },
  {
    id: "pmt-002",
    date: new Date("2023-05-15"),
    amount: 5500,
    status: "successful",
    method: {
      type: "card",
      last4: "4444",
      brand: "mastercard",
    },
    loanId: "LOAN-001",
    lender: "Sameera Finance",
    description: "Monthly installment payment",
  },
  {
    id: "pmt-003",
    date: new Date("2023-04-15"),
    amount: 5500,
    status: "successful",
    method: {
      type: "card",
      last4: "1111",
      brand: "visa",
    },
    loanId: "LOAN-001",
    lender: "Sameera Finance",
    description: "Monthly installment payment",
  },
  {
    id: "pmt-004",
    date: new Date("2023-03-16"),
    amount: 5500,
    status: "failed",
    method: {
      type: "card",
      last4: "1111",
      brand: "visa",
    },
    loanId: "LOAN-001",
    lender: "Sameera Finance",
    description: "Monthly installment payment - Failed due to insufficient funds",
  },
  {
    id: "pmt-005",
    date: new Date("2023-03-17"),
    amount: 5500,
    status: "successful",
    method: {
      type: "card",
      last4: "1111",
      brand: "visa",
    },
    loanId: "LOAN-001",
    lender: "Sameera Finance",
    description: "Monthly installment payment - Retry",
  },
  {
    id: "pmt-006",
    date: new Date("2023-02-15"),
    amount: 5500,
    status: "successful",
    method: {
      type: "card",
      last4: "1111",
      brand: "visa",
    },
    loanId: "LOAN-001",
    lender: "Sameera Finance",
    description: "Monthly installment payment",
  },
  {
    id: "pmt-007",
    date: new Date("2023-01-15"),
    amount: 5500,
    status: "successful",
    method: {
      type: "card",
      last4: "1111",
      brand: "visa",
    },
    loanId: "LOAN-001",
    lender: "Sameera Finance",
    description: "Monthly installment payment",
  },
  {
    id: "pmt-008",
    date: new Date("2023-06-10"),
    amount: 4200,
    status: "pending",
    method: {
      type: "card",
      last4: "0005",
      brand: "amex",
    },
    loanId: "LOAN-003",
    lender: "Coastal Credit",
    description: "Monthly installment payment - Processing",
  },
]

export default function PaymentHistoryPage() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [activeTab, setActiveTab] = useState<string>("all")
  const [payments] = useState<Payment[]>(samplePayments)

  // Filter payments based on search query, status filter, and active tab
  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.loanId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.lender.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.description.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || payment.status === statusFilter

    const matchesTab =
      activeTab === "all" ||
      (activeTab === "loan-001" && payment.loanId === "LOAN-001") ||
      (activeTab === "loan-003" && payment.loanId === "LOAN-003")

    return matchesSearch && matchesStatus && matchesTab
  })

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "successful":
        return (
          <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Successful
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "refunded":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            <AlertCircle className="h-3 w-3 mr-1" />
            Refunded
          </Badge>
        )
      default:
        return null
    }
  }

  // Get card brand icon
  const getCardBrandIcon = (brand: string) => {
    switch (brand) {
      case "visa":
        return "VISA"
      case "mastercard":
        return "MC"
      case "amex":
        return "AMEX"
      case "discover":
        return "DISC"
      default:
        return "CARD"
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-5xl">
      <div className="flex items-center mb-6">
        <Button variant="outline" className="mr-4" onClick={() => navigate("/borrower/loan-summary")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Loans
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">Payment History</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Your Payments</CardTitle>
              <CardDescription>View and manage your payment history</CardDescription>
            </div>
            <Button variant="outline" onClick={() => navigate("/payments/make-payment")}>
              Make a Payment
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search payments..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <div className="flex items-center">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="successful">Successful</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setStatusFilter("all")
                }}
              >
                Reset
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Loans</TabsTrigger>
              <TabsTrigger value="loan-001">LOAN-001</TabsTrigger>
              <TabsTrigger value="loan-003">LOAN-003</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Payments Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4">Date</th>
                  <th className="text-left py-3 px-4">Payment ID</th>
                  <th className="text-left py-3 px-4">Amount</th>
                  <th className="text-left py-3 px-4">Method</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Loan</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4">{format(payment.date, "MMM dd, yyyy")}</td>
                      <td className="py-3 px-4">{payment.id}</td>
                      <td className="py-3 px-4 font-medium">{formatCurrency(payment.amount)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <div className="w-8 h-5 bg-gray-100 rounded flex items-center justify-center mr-2">
                            <span
                              className={`text-xs font-bold ${
                                payment.method.brand === "visa"
                                  ? "text-blue-600"
                                  : payment.method.brand === "mastercard"
                                    ? "text-red-600"
                                    : payment.method.brand === "amex"
                                      ? "text-blue-800"
                                      : "text-orange-600"
                              }`}
                            >
                              {getCardBrandIcon(payment.method.brand)}
                            </span>
                          </div>
                          <span>•••• {payment.method.last4}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">{getStatusBadge(payment.status)}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-col">
                          <span>{payment.loanId}</span>
                          <span className="text-xs text-muted-foreground">{payment.lender}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center">
                      <p className="text-muted-foreground">No payments found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" onClick={() => navigate("/borrower/loan-summary")}>
            Back to Loans
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export History
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}