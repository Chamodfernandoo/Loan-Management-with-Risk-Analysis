import { useState, useEffect } from "react"
import { format } from "date-fns"
import { User, ArrowLeft, Loader2 } from "lucide-react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { loanService } from "@/services/api"

interface AgreementProps {
  onChange?: (agreed: boolean) => void
}

const Agreement = ({ onChange }: AgreementProps) => {
  const [agreed, setAgreed] = useState<boolean | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetchingLoan, setFetchingLoan] = useState(false)
  const [loanDetails, setLoanDetails] = useState<any>({})
  
  const today = format(new Date(), "MMMM dd, yyyy")
  const location = useLocation()
  const navigate = useNavigate()
  const params = useParams()
  const { toast } = useToast()
  
  // Check if we're in view-only mode
  const viewOnly = location.state?.viewOnly || false
  
  // Get loan ID either from location state or URL params
  const loanId = location.state?.loanId || params.loanId
  
  // Get loan data from location state or fetch it if in view-only mode
  useEffect(() => {
    // If we're in view-only mode and have a loan ID, fetch the loan details
    if (viewOnly && loanId) {
      const fetchLoanDetails = async () => {
        setFetchingLoan(true)
        try {
          const loan = await loanService.getLoan(loanId)
          
          // Transform loan data to match the format needed by the agreement
          const transformedLoan = {
            lender_name: loan.lender_name || "Lender",
            customer_name: loan.customer_name || "Customer",
            borrower_nic: loan.borrower_nic || "N/A",
            customer_phone: loan.customer_phone || "N/A",
            customer_address: loan.customer_address || "N/A",
            customer_gender: loan.customer_gender || "N/A",
            amount: loan.amount,
            interest_rate: loan.interest_rate,
            term_months: loan.term_months,
            installment_amount: loan.installment_amount,
            status: loan.status
          }
          
          setLoanDetails(transformedLoan)
        } catch (error) {
          console.error("Error fetching loan details:", error)
          toast({
            title: "Error fetching loan",
            description: "There was an error loading the loan details. Please try again.",
            variant: "destructive"
          })
        } finally {
          setFetchingLoan(false)
        }
      }
      
      fetchLoanDetails()
    } else {
      // Use loan details from location state if not in view-only mode
      setLoanDetails(location.state?.loanDetails || {})
    }
  }, [loanId, viewOnly, toast])
  
  const handleAgree = async () => {
    setLoading(true)
    setAgreed(true)
    
    try {
      if (loanId) {
        console.log("Updating loan status for loan ID:", loanId)
        // Update loan status to approved
        await loanService.updateLoanStatus(loanId, "APPROVED")
        
        toast({
          title: "Agreement accepted",
          description: "Loan agreement has been accepted successfully.",
        })
      } else {
        console.error("No loan ID available to update status")
        toast({
          title: "Error processing agreement",
          description: "Loan ID not found. Please try again.",
          variant: "destructive"
        })
      }
      
      // Navigate to loan history page
      setTimeout(() => {
        navigate("/view_loan")
      }, 1000)
    } catch (error) {
      console.error("Error updating loan status:", error)
      toast({
        title: "Error processing agreement",
        description: "There was an error accepting the agreement. Please try again.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
      if (onChange) {
        onChange(true)
      }
    }
  }
  
  const handleDisagree = () => {
    setAgreed(false)
    toast({
      title: "Agreement declined",
      description: "Loan agreement has been declined.",
    })
    if (onChange) {
      onChange(false)
    }
    // Navigate back after declining
    setTimeout(() => {
      navigate(-1)
    }, 1000)
  }

  if (fetchingLoan) {
    return (
      <div className="container mx-auto py-10 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading agreement...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-5xl">
      <div className="mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
      
      <Card className="shadow-lg">
        <CardHeader className="bg-primary/5 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-2xl font-bold text-blue-600 ">
              LOAN Agreement {viewOnly ? '(Read Only)' : ''}
            </CardTitle>
            <div className="text-sm font-medium border border-gray-300 rounded px-2 py-1">
              Date: {today}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Shop/Vendor Information */}
          <div className="border rounded-lg p-4 flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10">
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">Name:</p>
                <p className="font-medium">{loanDetails.lender_name || "Lender Name"}</p>
              </div>
              <div className="flex flex-col gap-1">
                <p className="text-sm text-muted-foreground">Address:</p>
                <p className="font-medium">{"Lender Address"}</p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="border rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">First name:</p>
                <p className="font-medium">{loanDetails.customer_name?.split(' ')[0] || "Customer"}</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">Last name:</p>
                <p className="font-medium">{loanDetails.customer_name?.split(' ')[1] || "Name"}</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">Customer id:</p>
                <p className="font-medium">{loanDetails.borrower_nic || "NIC ID"}</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">Phone No:</p>
                <p className="font-medium">{loanDetails.customer_phone || "Phone Number"}</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">Address:</p>
                <p className="font-medium">{loanDetails.customer_address || "Customer Address"}</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">collatral file no</p>
                <p className="font-medium">{loanDetails.customer_gender || "Gender"}</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">Amount:</p>
                <p className="font-medium">{loanDetails.amount?.toFixed(2) || "0.00"}</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">Tax rate:</p>
                <p className="font-medium">{loanDetails.interest_rate || "0"}%</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">No of Installments:</p>
                <p className="font-medium">{loanDetails.term_months || "0"}</p>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-muted-foreground">Instalment price:</p>
                <p className="font-medium">
                  {loanDetails.installment_amount?.toFixed(2) || 
                   loanDetails.installmentPrice?.toFixed(2) || 
                   "0.00"}
                </p>
              </div>
              {viewOnly && (
                <div className="flex flex-col gap-2">
                  <p className="text-sm text-muted-foreground">Status:</p>
                  <p className="font-medium">
                    <Badge 
                      className={
                        loanDetails.status === "APPROVED" ? "bg-green-100 text-green-800" :
                        loanDetails.status === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                        "bg-blue-100 text-blue-800"
                      }
                    >
                      {loanDetails.status || "Unknown"}
                    </Badge>
                  </p>
                </div>
              )}
              <div>
                <p className="text-sm text-muted-foreground">description</p>
                <p className="font-medium">{loanDetails.term_months || "0"}</p>
              </div>
            </div>
          </div>

          {/* Conditions and Rules */}
          <div>
            <h3 className="text-lg font-medium mb-3">Conditions and rules</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>All payments must be made on or before the due date of each month.</li>
              <li>Late payments will incur a penalty fee of 5% of the installment amount.</li>
              <li>The customer must provide valid identification and contact information.</li>
              <li>Ownership of goods will be transferred only after the full payment is completed.</li>
              <li>Early settlement is allowed with a 2% discount on the remaining balance.</li>
            </ul>
          </div>
        </CardContent>

        {/* Only show action buttons if not in view-only mode */}
        {!viewOnly && (
          <CardFooter className="flex flex-col sm:flex-row gap-4 p-6 pt-0">
            <Button
              className="w-full sm:w-auto flex-1"
              onClick={handleAgree}
              variant={agreed === true ? "default" : "outline"}
              disabled={loading}
            >
              {loading ? "Processing..." : "Agree"}
            </Button>
            <Button
              className="w-full sm:w-auto flex-1"
              onClick={handleDisagree}
              variant={agreed === false ? "destructive" : "outline"}
              disabled={loading}
            >
              Disagree
            </Button>
          </CardFooter>
        )}
      </Card>
    </div>
  )
}

export default Agreement
