import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  CreditCard,
  Check,
  ChevronRight,
  DollarSign,
  Receipt,
  Calendar,
  Clock,
  ShieldCheck,
  Plus,
  IdCard,
  Loader2
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { paymentService, loanService } from "@/services/api"
import { useToast } from "@/hooks/use-toast"

// Payment form schema
const paymentFormSchema = z.object({
  amount: z.string().min(1, "Amount is required"),
  cardId: z.string().min(1, "Please select a payment card"),
  saveCard: z.boolean().optional(),
})

type PaymentFormValues = z.infer<typeof paymentFormSchema>

// Card interface
interface PaymentCard {
  id: string
  cardNumber: string
  cardholderName: string
  expiryMonth: string
  expiryYear: string
  cardType: "visa" | "mastercard" | "amex" | "discover"
  isDefault: boolean
  nickname?: string
}

export default function MakePaymentPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [cards, setCards] = useState<PaymentCard[]>([])
  const [selectedCard, setSelectedCard] = useState<PaymentCard | null>(null)
  const [fetchingCards, setFetchingCards] = useState(false)
  
  // Add missing state variables
  const [loanId, setLoanId] = useState<string | null>(null)
  const [loanDetails, setLoanDetails] = useState<any>({})
  
  // Add missing loanData state
  const [loanData, setLoanData] = useState<any>({
    id: "LOAN-001",
    lender: "Sameera Finance",
    totalAmount: 50000,
    remainingAmount: 33000,
    installmentAmount: 5500,
    nextPaymentDue: new Date("2023-06-25"),
    status: "active",
  })
  
  // Get loan data from location state
  const suggestedAmount = location.state?.amount

  // Initialize form - MOVED BEFORE useEffect
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: suggestedAmount?.toString() || loanData.installmentAmount?.toString() || "",
      cardId: selectedCard?.id || "",
      saveCard: false,
    },
  })

  // Add code to handle queryParams
  const queryParams = new URLSearchParams(location.search)
  const loanIdFromQuery = queryParams.get('loanId')
  const amountFromQuery = queryParams.get('amount')

  // Define a function to fetch cards
  const fetchCards = async () => {
    setFetchingCards(true)
    try {
      const cardsData = await paymentService.getCards()
      setCards(cardsData || [])
      
      // Set default card if available
      const defaultCard = cardsData.find((card: PaymentCard) => card.isDefault)
      if (defaultCard) {
        setSelectedCard(defaultCard)
        form.setValue('cardId', defaultCard.id)
      }
    } catch (error) {
      console.error("Error fetching cards:", error)
      toast({
        title: "Error",
        description: "Failed to load payment cards",
        variant: "destructive"
      })
    } finally {
      setFetchingCards(false)
    }
  }

  useEffect(() => {
    // Check both location state and query params
    const loanIdToUse = location.state?.loanId || loanIdFromQuery
    const amountToUse = location.state?.amount || amountFromQuery
    
    if (loanIdToUse) {
      setLoanId(loanIdToUse)
      
      if (amountToUse) {
        form.setValue("amount", amountToUse.toString())
      }
      
      // Fetch loan details to show information
      const fetchLoanDetails = async () => {
        try {
          const loanDetails = await loanService.getLoan(loanIdToUse)
          // Update any UI elements as needed with loan details
          setLoanDetails(loanDetails)
        } catch (error) {
          console.error("Error fetching loan details:", error)
        }
      }
      
      fetchLoanDetails()
    }
    
    // Fetch cards
    fetchCards()
  }, [location.state, loanIdFromQuery, amountFromQuery, form])

  // Handle print function
  const handlePrint = () => {
    window.print()
  }

  // Handle card selection
  const handleCardSelection = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId)
    if (card) {
      setSelectedCard(card)
      form.setValue("cardId", cardId)
    }
  }

  // Navigate to Add Card page
  const navigateToAddCard = () => {
    // Save current form state to session storage
    sessionStorage.setItem('paymentFormData', JSON.stringify(form.getValues()))
    sessionStorage.setItem('paymentStep', currentStep.toString())
    
    // Use absolute path to avoid redirection issues
    navigate("/payments/add-card", { 
      state: { 
        returnUrl: "/payments/make-payment", 
        loanId: loanId, 
        amount: form.getValues("amount"),
        loanData: loanData 
      },
      replace: false  // Do not replace current history entry
    })
  }

  // Navigate to View Cards page
  const navigateToViewCards = () => {
    // Save current form state to session storage
    sessionStorage.setItem('paymentFormData', JSON.stringify(form.getValues()))
    sessionStorage.setItem('paymentStep', currentStep.toString())
    
    // Use absolute path to avoid redirection issues
    navigate("/payments/cards", { 
      state: { 
        returnUrl: "/payments/make-payment", 
        loanId: loanId, 
        amount: form.getValues("amount"),
        loanData: loanData 
      },
      replace: false  // Do not replace current history entry
    })
  }

  // Get card type icon
  const getCardTypeIcon = (cardType: string) => {
    switch (cardType) {
      case "visa":
        return "💳 Visa"
      case "mastercard":
        return "💳 Mastercard"
      case "amex":
        return "💳 American Express"
      case "discover":
        return "💳 Discover"
      default:
        return "💳"
    }
  }

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Handle moving to next step
  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Handle moving to previous step
  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Handle form submission
  const onSubmit = async (data: PaymentFormValues) => {
    setIsSubmitting(true)

    // Simulate API call
    try {
      // In a real app, you would send payment data to your backend
      if (!loanId) {
        throw new Error("No loan ID provided")
      }
      
      // Create payment object
      const paymentData = {
        loan_id: loanId,
        amount: parseFloat(data.amount),
        method: "card",
        method_details: {
          card_id: data.cardId
        }
      }
      
      // Create a payment in the backend
      await paymentService.createPayment(paymentData)
      
      // Show success message
      toast({
        title: "Payment successful",
        description: "Your payment has been processed successfully. A confirmation notification has been sent.",
      })
      
      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Update loan status if needed
      const loan = await loanService.getLoan(loanId)
      if (loan.remainingAmount <= parseFloat(data.amount)) {
        await loanService.updateLoanStatus(loanId, "COMPLETED")
      }

      // Show success
      setPaymentSuccess(true)
    } catch (error) {
      console.error("Error processing payment:", error)
      toast({
        title: "Payment failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }
  
  // Navigate back to loans page
  const navigateToLoans = () => {
    navigate("/borrower/loans")
  }

  // Check if we have any saved form data on component mount
  useEffect(() => {
    const savedFormData = sessionStorage.getItem('paymentFormData')
    const savedStep = sessionStorage.getItem('paymentStep')
    
    if (savedFormData) {
      const formData = JSON.parse(savedFormData)
      form.reset(formData)
      
      // If we have card data, set the selected card
      if (formData.cardId) {
        const card = cards.find(c => c.id === formData.cardId)
        if (card) {
          setSelectedCard(card)
        }
      }
      
      // Clean up
      sessionStorage.removeItem('paymentFormData')
    }
    
    if (savedStep) {
      setCurrentStep(parseInt(savedStep))
      // Clean up
      sessionStorage.removeItem('paymentStep')
    }
  }, [cards, form])

  // Update the useEffect that loads loan data
  useEffect(() => {
    // Check if we have loan data from state
    if (loanId) {
      const fetchLoanData = async () => {
        try {
          // Fetch the loan data
          const loanDetails = await loanService.getLoan(loanId)
          
          // Find next pending payment with proper type annotation
          const pendingPayment = loanDetails.payments && 
            loanDetails.payments.find((p: {status: string, due_date: string}) => p.status === "PENDING")
          
          // Set up the updated loan data
          const updatedLoanData = {
            id: loanDetails._id || "LOAN-001",
            lender: loanDetails.lender_name || "Unknown Lender",
            totalAmount: loanDetails.total_amount || 0,
            remainingAmount: loanDetails.remaining_amount || 0,
            installmentAmount: loanDetails.installment_amount || 0,
            nextPaymentDue: pendingPayment ? new Date(pendingPayment.due_date) : new Date(),
            status: loanDetails.status?.toLowerCase() || "active",
          }
          
          // Update the state with this loan data
          setLoanData(updatedLoanData)
          
          // If we have a suggested amount, try to find a card too
          if (suggestedAmount) {
            const suggestedAmountNum = parseFloat(suggestedAmount.toString())
            if (!isNaN(suggestedAmountNum)) {
              form.setValue("amount", suggestedAmountNum.toString())
            }
          }
        } catch (error) {
          console.error("Error fetching loan data:", error)
          toast({
            title: "Error loading loan",
            description: "Could not load loan details. Please try again.",
            variant: "destructive"
          })
        }
      }
      
      fetchLoanData()
    }
  }, [loanId, suggestedAmount, form, toast])

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Make Payment</h1>
        <Button className="mr-4" onClick={navigateToViewCards}>
          <IdCard className="h-4 w-4 mr-2" />
          Your Cards
        </Button>
      </div>

      {paymentSuccess ? (
        <Card>
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>Your payment has been processed successfully</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-lg my-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Payment Amount:</span>
                  <span className="font-medium">{formatCurrency(Number.parseFloat(form.getValues("amount")))}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Payment Date:</span>
                  <span className="font-medium">{formatDate(new Date())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Payment Method:</span>
                  <span className="font-medium">
                    {selectedCard
                      ? `${getCardTypeIcon(selectedCard.cardType)} ending in ${selectedCard.cardNumber.slice(-4)}`
                      : ""}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Transaction ID:</span>
                  <span className="font-medium">TXN-{Math.random().toString(36).substring(2, 10).toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg border border-green-100 mt-4">
              <div className="flex items-start">
                <Receipt className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                <div>
                  <h3 className="font-medium text-green-800">Payment Receipt</h3>
                  <p className="text-sm text-green-700 mt-1">
                    A receipt has been sent to your email address. You can also view this payment in your payment
                    history.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-2">
            <Button variant="outline" onClick={handlePrint}>
              Download PDF
            </Button>
            <Button onClick={navigateToLoans}>View Loans</Button>
          </CardFooter>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>Make a payment for your loan</CardDescription>
          </CardHeader>
          <CardContent>
            {/* Stepper */}
            <div className="mb-8">
              <div className="flex justify-between">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep >= 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <DollarSign className="h-5 w-5" />
                  </div>
                  <span className="text-xs mt-1">Amount</span>
                </div>
                <div className="flex-1 flex items-center mx-2">
                  <div className={`h-1 w-full ${currentStep >= 2 ? "bg-primary" : "bg-muted"}`}></div>
                </div>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep >= 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <CreditCard className="h-5 w-5" />
                  </div>
                  <span className="text-xs mt-1">Payment Method</span>
                </div>
                <div className="flex-1 flex items-center mx-2">
                  <div className={`h-1 w-full ${currentStep >= 3 ? "bg-primary" : "bg-muted"}`}></div>
                </div>
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep >= 3 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <Check className="h-5 w-5" />
                  </div>
                  <span className="text-xs mt-1">Confirm</span>
                </div>
              </div>
            </div>

            {/* Loan Summary */}
            <div className="bg-muted p-4 rounded-lg mb-6">
              <h3 className="font-medium mb-2">Loan Summary</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Loan ID:</span>
                  <p className="font-medium">{loanData.id}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Lender:</span>
                  <p className="font-medium">{loanData.lender}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Total Amount:</span>
                  <p className="font-medium">{formatCurrency(loanData.totalAmount)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Remaining Amount:</span>
                  <p className="font-medium">{formatCurrency(loanData.remainingAmount)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Next Payment Due:</span>
                  <p className="font-medium">{formatDate(loanData.nextPaymentDue)}</p>
                </div>
                <div>
                  <span className="text-muted-foreground">Installment Amount:</span>
                  <p className="font-medium">{formatCurrency(loanData.installmentAmount)}</p>
                </div>
              </div>
            </div>

            {/* Add this for recommended payment */}
            <div className="flex justify-between bg-amber-50 p-3 rounded-lg border border-amber-100 mb-4">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-amber-500 mr-2" />
                <span className="text-sm text-amber-800">Recommended payment:</span>
              </div>
              <span className="text-sm font-medium text-amber-800">
                {formatCurrency(loanData.installmentAmount)}
              </span>
            </div>

            <Form {...form}>
              <form className="space-y-6">
                {/* Step 1: Payment Amount */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Amount</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input type="number" placeholder="Enter amount" {...field} className="pl-10" />
                              <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            </div>
                          </FormControl>
                          <FormDescription>Enter the amount you want to pay</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-between bg-blue-50 p-3 rounded-lg border border-blue-100">
                      <div className="flex items-center">
                        <Calendar className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="text-sm text-blue-800">Next payment due:</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-blue-800">{formatDate(loanData.nextPaymentDue)}</span>
                        <Clock className="h-4 w-4 text-blue-500 ml-1" />
                      </div>
                    </div>

                    <div className="flex justify-between bg-amber-50 p-3 rounded-lg border border-amber-100">
                      <div className="flex items-center">
                        <DollarSign className="h-5 w-5 text-amber-500 mr-2" />
                        <span className="text-sm text-amber-800">Recommended payment:</span>
                      </div>
                      <span className="text-sm font-medium text-amber-800">
                        {formatCurrency(loanData.installmentAmount)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Step 2: Payment Method */}
                {currentStep === 2 && (
                  <div className="space-y-4">
                    {fetchingCards ? (
                      <div className="flex justify-center items-center py-10">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <span className="ml-2">Loading payment methods...</span>
                      </div>
                    ) : cards.length > 0 ? (
                      <FormField
                        control={form.control}
                        name="cardId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Payment Method</FormLabel>
                            <FormControl>
                              <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="space-y-3">
                                {cards.map((card) => (
                                  <div
                                    key={card.id}
                                    className={`flex items-center space-x-2 border rounded-lg p-3 cursor-pointer hover:bg-gray-50 ${
                                      field.value === card.id ? "border-primary" : "border-gray-200"
                                    }`}
                                    onClick={() => handleCardSelection(card.id)}
                                  >
                                    <RadioGroupItem value={card.id} id={card.id} />
                                    <div className="flex items-center flex-1">
                                      <div className="mr-3">
                                        <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center">
                                          {card.cardType === "visa" && (
                                            <span className="text-blue-600 font-bold text-xs">VISA</span>
                                          )}
                                          {card.cardType === "mastercard" && (
                                            <span className="text-red-600 font-bold text-xs">MC</span>
                                          )}
                                          {card.cardType === "amex" && (
                                            <span className="text-blue-800 font-bold text-xs">AMEX</span>
                                          )}
                                          {card.cardType === "discover" && (
                                            <span className="text-orange-600 font-bold text-xs">DISC</span>
                                          )}
                                        </div>
                                      </div>
                                      <div>
                                        <div className="text-sm font-medium">
                                          •••• {card.cardNumber.slice(-4)}
                                          {card.isDefault && (
                                            <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                                              Default
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                          {card.nickname || card.cardholderName} • Expires {card.expiryMonth}/
                                          {card.expiryYear.slice(-2)}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </RadioGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    ) : (
                      <div className="text-center py-6 bg-gray-50 rounded">
                        <p className="text-muted-foreground mb-4">No payment cards found. Please add a card.</p>
                        <Button onClick={navigateToAddCard}>Add a Card</Button>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handlePreviousStep}
                        className="flex items-center"
                      >
                        Back
                      </Button>

                      <Button type="button" onClick={navigateToAddCard}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Card
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Review and Confirm */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Confirm Payment</h3>
                    <div className="space-y-4">
                      <div className="bg-muted p-4 rounded-lg">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Payment Amount:</span>
                            <span className="font-medium">{formatCurrency(Number.parseFloat(form.getValues("amount")))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Payment Method:</span>
                            <span className="font-medium">
                              {selectedCard
                                ? `${getCardTypeIcon(selectedCard.cardType)} ending in ${selectedCard.cardNumber.slice(-4)}`
                                : "Card not selected"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Payment Date:</span>
                            <span className="font-medium">{formatDate(new Date())}</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <div className="flex items-start">
                          <ShieldCheck className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
                          <div>
                            <h3 className="font-medium text-green-800">Secure Payment</h3>
                            <p className="text-sm text-green-700 mt-1">
                              Your payment information is encrypted and secure. We do not store your card details.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-between">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handlePreviousStep}
                          className="flex items-center"
                        >
                          Back
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-4 border-t flex justify-end">
                  {currentStep === 1 && (
                    <Button 
                      type="button" 
                      onClick={handleNextStep} 
                      className="flex items-center"
                      disabled={!form.getValues().amount}
                    >
                      Select Payment Method
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                  
                  {currentStep === 2 && (
                    <Button 
                      type="button" 
                      onClick={handleNextStep} 
                      className="flex items-center"
                      disabled={!form.getValues().cardId}
                    >
                      Review Payment
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                  
                  {currentStep === 3 && (
                    <Button 
                      type="button" 
                      onClick={() => form.handleSubmit(onSubmit)()} 
                      disabled={isSubmitting} 
                      className="flex items-center"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          Confirm Payment
                          <Check className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}