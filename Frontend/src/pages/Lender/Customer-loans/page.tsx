import { useState } from "react"
import { DataTable } from "@/components/default/data-table"
import { columns, type CustomerLoan } from "@/pages/Lender/Customer-loans/column"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Sample customer data
const customers = [
  {
    id: "CUST001",
    name: "John Doe",
    loans: [
      {
        id: "1",
        customerName: "John Doe",
        createdAt: new Date("2023-01-15"),
        totalAmount: 5000,
        paidAmount: 5000,
        orderState: "paid" as const,
      },
      {
        id: "2",
        customerName: "John Doe",
        createdAt: new Date("2023-02-20"),
        totalAmount: 7500,
        paidAmount: 3750,
        orderState: "partial_paid" as const,
      },
      {
        id: "3",
        customerName: "John Doe",
        createdAt: new Date("2023-03-10"),
        totalAmount: 3200,
        paidAmount: 0,
        orderState: "pending" as const,
      },
    ],
  },
  {
    id: "CUST002",
    name: "Jane Smith",
    loans: [
      {
        id: "4",
        customerName: "Jane Smith",
        createdAt: new Date("2023-04-05"),
        totalAmount: 9800,
        paidAmount: 4900,
        orderState: "partial_paid" as const,
      },
    ],
  },
  {
    id: "CUST003",
    name: "Michael Wilson",
    loans: [],
  },
]

export default function CustomerLoanHistoryPage() {
  const [customerId, setCustomerId] = useState("")
  const [searchedId, setSearchedId] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [searchStatus, setSearchStatus] = useState<"idle" | "not_found" | "no_loans" | "found">("idle")
  const [customerLoans, setCustomerLoans] = useState<CustomerLoan[]>([])

  const handleSearch = () => {
    // Reset state
    setSearchStatus("idle")
    setCustomerLoans([])
    setSearchedId(customerId)

    if (!customerId.trim()) {
      return
    }

    // Find customer by ID
    const customer = customers.find((c) => c.id === customerId)

    if (!customer) {
      setSearchStatus("not_found")
      return
    }

    if (customer.loans.length === 0) {
      setSearchStatus("no_loans")
      return
    }

    setSearchStatus("found")
    setCustomerLoans(customer.loans)
  }

  // Filter loans based on active tab
  const filteredLoans = customerLoans.filter((loan) => {
    return (
      activeTab === "all" ||
      (activeTab === "paid" && loan.orderState === "paid") ||
      (activeTab === "partial_paid" && loan.orderState === "partial_paid") ||
      (activeTab === "pending" && loan.orderState === "pending")
    )
  })

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full md:mx-28  px-4"> 
      <Card>
        <CardHeader className="pb-3 items-center">
          <CardTitle className="text-2xl font-bold">Customer History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
            <div>
                <p className="text-xl font-bold">Search Customer</p>
            </div>
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter customer ID"
                className="pl-8 "
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSearch()
                  }
                }}
              />
            </div>
            <Button className="w-2/12" onClick={handleSearch}>Find</Button>
          </div>

          {/* Status Alerts */}
          {searchStatus === "not_found" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Invalid customer ID "{searchedId}". Please check your ID and try again.
              </AlertDescription>
            </Alert>
          )}

          {searchStatus === "no_loans" && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>No loans found</AlertTitle>
              <AlertDescription>No loans found for this customer. They are a new customer.</AlertDescription>
            </Alert>
          )}

          {/* Recent Orders Section */}
          {searchStatus === "found" && (
            <>
              <div className="text-xl font-semibold">Recent Orders</div>

              {/* Tabs */}
              <Tabs defaultValue="all" onValueChange={setActiveTab}>
                <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                  <TabsTrigger
                    value="all"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none py-2.5 px-4"
                  >
                    All
                  </TabsTrigger>
                  <TabsTrigger
                    value="partial_paid"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none py-2.5 px-4"
                  >
                    Partial Paid
                  </TabsTrigger>
                  <TabsTrigger
                    value="paid"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none py-2.5 px-4"
                  >
                    Paid
                  </TabsTrigger>
                  <TabsTrigger
                    value="pending"
                    className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none py-2.5 px-4"
                  >
                    Pending
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="mt-6">
                  <DataTable columns={columns} data={filteredLoans} />
                </TabsContent>
                <TabsContent value="partial_paid" className="mt-6">
                  <DataTable columns={columns} data={filteredLoans} />
                </TabsContent>
                <TabsContent value="paid" className="mt-6">
                  <DataTable columns={columns} data={filteredLoans} />
                </TabsContent>
                <TabsContent value="pending" className="mt-6">
                  <DataTable columns={columns} data={filteredLoans} />
                </TabsContent>
              </Tabs>
            </>
          )}
        </CardContent>
      </Card>
    </div>
</div>
  )
}