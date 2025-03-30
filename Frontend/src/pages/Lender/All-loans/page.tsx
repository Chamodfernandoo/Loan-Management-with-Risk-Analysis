import { useState } from "react"
import { DataTable } from "@/components/default/data-table"
import { columns, type Loan } from "@/pages/Lender/All-loans/column"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"

// Sample data
const data: Loan[] = [
  {id: "1",orderId: "ORD-001",customerName: "John Doe", createdAt: new Date("2023-01-15"),totalPrice: 5000, orderState: "paid",installmentState: "ok", },
  {id: "2",orderId: "ORD-002",customerName: "Jane Smith",createdAt: new Date("2023-02-20"),totalPrice: 7500, orderState: "partial_paid",installmentState: "ok",},
  {id: "3",orderId: "ORD-003",customerName: "Robert Johnson",createdAt: new Date("2023-03-10"),totalPrice: 3200,orderState: "pending",installmentState: "overdue",},
  {id: "4",orderId: "ORD-004", customerName: "Emily Davis", createdAt: new Date("2023-04-05"),totalPrice: 9800,orderState: "partial_paid",installmentState: "pending",},
  {id: "5",orderId: "ORD-005",customerName: "Michael Wilson",createdAt: new Date("2023-05-12"),totalPrice: 6400,orderState: "paid",installmentState: "ok",},
  {id: "6",orderId: "ORD-006",customerName: "John Doe",createdAt: new Date("2023-01-15"),totalPrice: 5000,orderState: "paid",installmentState: "ok",},
  {id: "7",orderId: "ORD-007",customerName: "Jane Smith",createdAt: new Date("2023-02-20"),totalPrice: 7500,orderState: "partial_paid",installmentState: "ok",},
  {id: "8",orderId: "ORD-008",customerName: "Robert Johnson",createdAt: new Date("2023-03-10"),totalPrice: 3200,orderState: "pending",installmentState: "overdue",},
  {id: "9",orderId: "ORD-009",customerName: "Emily Davis",createdAt: new Date("2023-04-05"),totalPrice: 9800,orderState: "partial_paid",installmentState: "overdue",},
  {id: "10",orderId: "ORD-010",customerName: "Michael Wilson",createdAt: new Date("2023-05-12"),totalPrice: 6400,orderState: "paid",installmentState: "ok",},
  {id: "11",orderId: "ORD-011",customerName: "John Doe",createdAt: new Date("2023-01-15"),totalPrice: 5000,orderState: "paid",installmentState: "ok",},
  {id: "12",orderId: "ORD-012",customerName: "Jane Smith",createdAt: new Date("2023-02-20"),totalPrice: 7500,orderState: "partial_paid",installmentState: "ok",},
  {id: "13",orderId: "ORD-0013",customerName: "Robert Johnson",createdAt: new Date("2023-03-10"),totalPrice: 3200,orderState: "pending",installmentState: "overdue", },
  {id: "14",orderId: "ORD-014",customerName: "Emily Davis",createdAt: new Date("2023-04-05"),totalPrice: 9800,orderState: "partial_paid",installmentState: "pending",},
  {id: "15",orderId: "ORD-015",customerName: "Michael Wilson",createdAt: new Date("2023-05-12"),totalPrice: 6400,orderState: "paid",installmentState: "ok",},
]

export default function LoanHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const navigate = useNavigate()

  // Filter data based on search query and active tab
  const filteredData = data.filter((loan) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      loan.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loan.orderId.toLowerCase().includes(searchQuery.toLowerCase())

    // Tab filter
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "paid" && loan.orderState === "paid") ||
      (activeTab === "partial_paid" && loan.orderState === "partial_paid") ||
      (activeTab === "pending" && loan.orderState === "pending") ||
      (activeTab === "overdue" && loan.installmentState === "overdue")

    return matchesSearch && matchesTab
  })

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Card>
        <CardHeader className="pb-3 flex flex-row gap-5">
        <Button variant="outline" className="mb-4 sm:mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
          <CardTitle className="text-2xl font-bold text-blue-600">Order History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter customer ID"
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button>Find</Button>
          </div>

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
              <TabsTrigger
                value="overdue"
                className="rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none py-2.5 px-4"
              >
                Overdue
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-6">
              <DataTable columns={columns} data={filteredData} />
            </TabsContent>
            <TabsContent value="partial_paid" className="mt-6">
              <DataTable columns={columns} data={filteredData} />
            </TabsContent>
            <TabsContent value="paid" className="mt-6">
              <DataTable columns={columns} data={filteredData} />
            </TabsContent>
            <TabsContent value="pending" className="mt-6">
              <DataTable columns={columns} data={filteredData} />
            </TabsContent>
            <TabsContent value="overdue" className="mt-6">
              <DataTable columns={columns} data={filteredData} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}