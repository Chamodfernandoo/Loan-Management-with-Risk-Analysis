import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  ArrowLeft,
  CreditCard,
  Check,
  ChevronRight,
  DollarSign,
  Receipt,
  Calendar,
  Clock,
  ShieldCheck,
  Plus,
  CarIcon,
  IdCard,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

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

// Sample cards data
const sampleCards: PaymentCard[] = [
  {
    id: "card-1",
    cardNumber: "4111111111111111",
    cardholderName: "John Smith",
    expiryMonth: "12",
    expiryYear: "2025",
    cardType: "visa",
    isDefault: true,
    nickname: "Personal Card",
  },
  {
    id: "card-2",
    cardNumber: "5555555555554444",
    cardholderName: "John Smith",
    expiryMonth: "06",
    expiryYear: "2026",
    cardType: "mastercard",
    isDefault: false,
    nickname: "Business Card",
  },
  {
    id: "card-3",
    cardNumber: "378282246310005",
    cardholderName: "John Smith",
    expiryMonth: "09",
    expiryYear: "2024",
    cardType: "amex",
    isDefault: false,
  },
]

// Sample loan data
const loanData = {
  id: "LOAN-001",
  lender: "Sameera Finance",
  totalAmount: 50000,
  remainingAmount: 33000,
  installmentAmount: 5500,
  nextPaymentDue: new Date("2023-06-25"),
  status: "active",
}

export default function MakePaymentPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [cards] = useState<PaymentCard[]>(sampleCards)
  const [selectedCard, setSelectedCard] = useState<PaymentCard | null>(cards.find((card) => card.isDefault) || null)

  // Initialize form
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: loanData.installmentAmount.toString(),
      cardId: selectedCard?.id || "",
      saveCard: false,
    },
  })

  // Handle card selection
  const handleCardSelection = (cardId: string) => {
    const card = cards.find((c) => c.id === cardId)
    if (card) {
      setSelectedCard(card)
      form.setValue("cardId", cardId)
    }
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

  // Handle form submission
  const onSubmit = async (data: PaymentFormValues) => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    try {
      // In a real app, you would send this data to your backend
      console.log("Payment data submitted:", data)

      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Show success
      setPaymentSuccess(true)
    } catch (error) {
      console.error("Error processing payment:", error)
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

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Make Payment</h1>
        <Button className="mr-4" onClick={() => navigate("/payments/cards")}>
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
            <Button variant="outline" onClick={() => navigate("")}>
              Downlord Pdf
            </Button>
            <Button onClick={() => navigate("/invoice1")}>Payment history</Button>
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

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

                    <div className="flex justify-between">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => navigate("/payments/add-card")}
                        className="w-full"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add New Card
                      </Button>
                    </div>
                  </div>
                )}

                {/* Step 3: Confirmation */}
                {currentStep === 3 && (
                  <div className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg">
                      <h3 className="font-medium mb-2">Payment Summary</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Payment Amount:</span>
                          <span className="text-sm font-medium">
                            {formatCurrency(Number.parseFloat(form.getValues("amount")))}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Payment Method:</span>
                          <span className="text-sm font-medium">
                            {selectedCard
                              ? `${getCardTypeIcon(selectedCard.cardType)} ending in ${selectedCard.cardNumber.slice(-4)}`
                              : ""}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Payment Date:</span>
                          <span className="text-sm font-medium">{formatDate(new Date())}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                      <div className="flex items-start">
                        <ShieldCheck className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                        <div>
                          <h3 className="font-medium text-blue-800">Secure Payment</h3>
                          <p className="text-sm text-blue-700 mt-1">
                            Your payment is secure and encrypted. By proceeding, you authorize a charge to your selected
                            payment method.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  {currentStep > 1 ? (
                    <Button type="button" variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                      Back
                    </Button>
                  ) : (
                    <Button type="button" variant="outline" onClick={() => navigate("/payments/cards")}>
                      Cancel
                    </Button>
                  )}

                  <Button type="submit" disabled={isSubmitting}>
                    {currentStep < 3 ? (
                      <>
                        Next
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </>
                    ) : isSubmitting ? (
                      "Processing..."
                    ) : (
                      "Confirm Payment"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}