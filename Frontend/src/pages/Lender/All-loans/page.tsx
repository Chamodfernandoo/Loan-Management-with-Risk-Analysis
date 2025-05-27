import { useState, useEffect } from "react"
import { DataTable } from "@/components/default/data-table"
import { columns, type Loan } from "@/pages/Lender/All-loans/column"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { loanService } from "@/services/api"
import { useToast } from "@/hooks/use-toast"




export default function LoanHistoryPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [loans, setLoans] = useState<Loan[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const fetchLoans = async () => {
      setLoading(true)
      try {
        const loansData = await loanService.getLoans()
        
        // Check if we have data
        if (Array.isArray(loansData) && loansData.length > 0) {
          // Transform API data to match Loan type
          const formattedLoans = loansData.map((loan: any) => {
            // Explicitly cast orderState to the allowed string literal type
            let orderState: "paid" | "pending" | "partial_paid"
            if (loan.status === "APPROVED") {
              orderState = "partial_paid"
            } else if (loan.status === "COMPLETED") {
              orderState = "paid"
            } else {
              orderState = "pending"
            }
            
            // Explicitly cast installmentState to the allowed string literal type
            let installmentState: "ok" | "overdue" | "pending"
            if (loan.payments && loan.payments.some((p: any) => p.status === "LATE" || p.status === "MISSED")) {
              installmentState = "overdue"
            } else if (loan.payments && loan.payments.some((p: any) => p.status === "PENDING")) {
              installmentState = "ok"
            } else {
              installmentState = "ok"
            }
            
            return {
              id: loan._id,
              orderId: `ORD-${loan._id.substring(0, 5)}`,
              customerName: loan.customer_name || "Unknown Customer",
              createdAt: new Date(loan.created_at || Date.now()),
              totalPrice: loan.amount || 0,
              orderState, // Use the explicitly typed variable
              installmentState, // Use the explicitly typed variable
            }
          })
        
          setLoans(formattedLoans)
        } else {
          console.log("No loans data returned or empty array")
          setLoans([])
        }
      } catch (error) {
        console.error("Error fetching loans:", error)
        toast({
          title: "Error fetching loans",
          description: "There was an error loading your loans. Please try again.",
          variant: "destructive"
        })
        setLoans([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchLoans()
  }, [toast])

  // Filter data based on search query and active tab
  const filteredData = loans.filter((loan) => {
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
          <Button variant="outline" className="mb-4 sm:mb-6" onClick={() => navigate("/lender")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <CardTitle className="text-2xl font-bold text-blue-600">Loan History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by customer name or order ID"
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
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading loans...</span>
                </div>
              ) : (
                <DataTable columns={columns} data={filteredData} />
              )}
            </TabsContent>
            <TabsContent value="partial_paid" className="mt-6">
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading loans...</span>
                </div>
              ) : (
                <DataTable columns={columns} data={filteredData} />
              )}
            </TabsContent>
            <TabsContent value="paid" className="mt-6">
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading loans...</span>
                </div>
              ) : (
                <DataTable columns={columns} data={filteredData} />
              )}
            </TabsContent>
            <TabsContent value="pending" className="mt-6">
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading loans...</span>
                </div>
              ) : (
                <DataTable columns={columns} data={filteredData} />
              )}
            </TabsContent>
            <TabsContent value="overdue" className="mt-6">
              {loading ? (
                <div className="flex justify-center items-center py-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <span className="ml-2">Loading loans...</span>
                </div>
              ) : (
                <DataTable columns={columns} data={filteredData} />
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}