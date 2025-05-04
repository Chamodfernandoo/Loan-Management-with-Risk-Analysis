import { useState } from "react"
import { DataTable } from "@/components/default/data-table"
import { columns, type CustomerLoan } from "@/pages/Lender/Customer-loans/column"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, AlertCircle, Loader2 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useToast } from "@/hooks/use-toast"
import { loanService } from "@/services/api"

export default function CustomerLoanHistoryPage() {
  const [customerId, setCustomerId] = useState("")
  const [searchedId, setSearchedId] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [searchStatus, setSearchStatus] = useState<"idle" | "not_found" | "no_loans" | "found" | "loading" | "error">("idle")
  const [customerLoans, setCustomerLoans] = useState<CustomerLoan[]>([])
  const [errorMessage, setErrorMessage] = useState("")
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleSearch = async () => {
    // Reset state
    setSearchStatus("loading")
    setCustomerLoans([])
    setSearchedId(customerId)
    setErrorMessage("")

    if (!customerId.trim()) {
      setSearchStatus("idle")
      return
    }

    try {
      // Fetch loans from API using the NIC number
      const loans = await loanService.getCustomerLoansByNIC(customerId)
      
      // Check if any loans returned
      if (loans.length === 0) {
        setSearchStatus("no_loans")
        return
      }

      // Update state with the fetched loans
      setSearchStatus("found")
      setCustomerLoans(loans)

    } catch (error: any) {
      console.error("Error searching for customer loans:", error)
      
      // Handle specific error cases
      if (error.response?.status === 404 || error.message === "Borrower not found") {
        setSearchStatus("not_found")
      } else {
        setErrorMessage(error.message || "An unexpected error occurred")
        setSearchStatus("error")
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch customer loans. Please try again."
        })
      }
    }
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
      <div className="w-full md:mx-28 px-4"> 
        <Button variant="outline" className="mb-4 sm:mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Card>
          <CardHeader className="pb-3 items-center">
            <CardTitle className="text-2xl font-bold text-blue-500">Customer History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <p className="text-xl font-bold text-blue-500">Search Customer</p>
            </div>
            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter customer NIC number"
                  className="pl-8"
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch()
                    }
                  }}
                />
              </div>
              <Button 
                className="w-2/12" 
                onClick={handleSearch}
                disabled={searchStatus === "loading"}
              >
                {searchStatus === "loading" ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching
                  </>
                ) : "Find"}
              </Button>
            </div>

            {/* Status Alerts */}
            {searchStatus === "not_found" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Invalid customer NIC "{searchedId}". Please check the NIC and try again.
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

            {searchStatus === "error" && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{errorMessage || "Failed to fetch customer loans. Please try again."}</AlertDescription>
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