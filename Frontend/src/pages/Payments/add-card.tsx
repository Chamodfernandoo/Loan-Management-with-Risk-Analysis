import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ArrowLeft, CreditCard, Check, ChevronRight, Building, User, Calendar, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Card details schema
const cardDetailsSchema = z.object({
  cardNumber: z
    .string()
    .min(16, "Card number must be 16 digits")
    .max(19, "Card number must be at most 19 digits")
    .regex(/^[0-9\s-]+$/, "Card number must contain only digits, spaces, or hyphens"),
  cardholderName: z.string().min(3, "Cardholder name is required"),
  expiryMonth: z.string().min(1, "Expiry month is required"),
  expiryYear: z.string().min(1, "Expiry year is required"),
  cvv: z
    .string()
    .min(3, "CVV must be 3 or 4 digits")
    .max(4, "CVV must be 3 or 4 digits")
    .regex(/^[0-9]+$/, "CVV must contain only digits"),
  cardNickname: z.string().optional(),
})

type CardDetailsFormValues = z.infer<typeof cardDetailsSchema>

// Generate month options
const months = Array.from({ length: 12 }, (_, i) => {
  const month = i + 1
  return {
    value: month.toString().padStart(2, "0"),
    label: month.toString().padStart(2, "0"),
  }
})

// Generate year options (current year + 20 years)
const currentYear = new Date().getFullYear()
const years = Array.from({ length: 21 }, (_, i) => {
  const year = currentYear + i
  return {
    value: year.toString(),
    label: year.toString(),
  }
})

export default function AddCardPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [cardType, setCardType] = useState<"visa" | "mastercard" | "amex" | "discover" | "unknown">("unknown")

  // Initialize form
  const form = useForm<CardDetailsFormValues>({
    resolver: zodResolver(cardDetailsSchema),
    defaultValues: {
      cardNumber: "",
      cardholderName: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      cardNickname: "",
    },
  })

  // Detect card type based on card number
  const detectCardType = (cardNumber: string) => {
    const cleanNumber = cardNumber.replace(/\s+/g, "").replace(/-/g, "")

    if (/^4/.test(cleanNumber)) {
      return "visa"
    } else if (/^5[1-5]/.test(cleanNumber)) {
      return "mastercard"
    } else if (/^3[47]/.test(cleanNumber)) {
      return "amex"
    } else if (/^6(?:011|5)/.test(cleanNumber)) {
      return "discover"
    } else {
      return "unknown"
    }
  }

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleanValue = value.replace(/\s+/g, "").replace(/-/g, "")

    // Different formatting for Amex (4-6-5) vs others (4-4-4-4)
    if (cardType === "amex") {
      return cleanValue
        .replace(/\W/gi, "")
        .replace(/(.{4})(.{6})(.{0,5})/g, "$1 $2 $3")
        .trim()
    }

    return cleanValue
      .replace(/\W/gi, "")
      .replace(/(.{4})/g, "$1 ")
      .trim()
  }

  // Handle card number change
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value

    // Only allow digits, spaces, and hyphens
    value = value.replace(/[^\d\s-]/g, "")

    // Detect card type
    const type = detectCardType(value)
    setCardType(type as any)

    // Format card number
    const formattedValue = formatCardNumber(value)

    // Update form
    form.setValue("cardNumber", formattedValue)
  }

  // Handle form submission
  const onSubmit = async (data: CardDetailsFormValues) => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
      return
    }

    setIsSubmitting(true)

    // Simulate API call
    try {
      // In a real app, you would send this data to your backend
      console.log("Card data submitted:", data)

      // Simulate delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Navigate to cards page
      navigate("/payments/cards")
    } catch (error) {
      console.error("Error adding card:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Get card type icon
  const getCardTypeIcon = () => {
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

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-2xl">
      <div className="flex items-center mb-6">
        <Button variant="outline" className="mr-4" onClick={() => navigate("/payments/cards")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cards
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">Add Payment Card</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add a New Card</CardTitle>
          <CardDescription>Add your debit or credit card details to make payments</CardDescription>
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
                  <CreditCard className="h-5 w-5" />
                </div>
                <span className="text-xs mt-1">Card Details</span>
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
                  <Calendar className="h-5 w-5" />
                </div>
                <span className="text-xs mt-1">Expiry & CVV</span>
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

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: Card Details */}
              {currentStep === 1 && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="cardNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Card Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              placeholder="1234 5678 9012 3456"
                              {...field}
                              onChange={handleCardNumberChange}
                              className="pl-10"
                            />
                            <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                            {cardType !== "unknown" && (
                              <span className="absolute right-3 top-2.5 text-sm font-medium">{getCardTypeIcon()}</span>
                            )}
                          </div>
                        </FormControl>
                        <FormDescription>Enter your 16-digit card number</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cardholderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cardholder Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input placeholder="John Smith" {...field} className="pl-10" />
                            <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          </div>
                        </FormControl>
                        <FormDescription>Enter the name as it appears on the card</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cardNickname"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Card Nickname (Optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input placeholder="e.g. My Personal Card" {...field} className="pl-10" />
                            <Building className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          </div>
                        </FormControl>
                        <FormDescription>Add a nickname to easily identify this card</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 2: Expiry & CVV */}
              {currentStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <FormField
                        control={form.control}
                        name="expiryMonth"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiry Month</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="MM" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {months.map((month) => (
                                  <SelectItem key={month.value} value={month.value}>
                                    {month.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <div>
                      <FormField
                        control={form.control}
                        name="expiryYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Expiry Year</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="YYYY" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {years.map((year) => (
                                  <SelectItem key={year.value} value={year.value}>
                                    {year.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <FormField
                    control={form.control}
                    name="cvv"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CVV</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input type="password" placeholder="123" maxLength={4} {...field} className="pl-10" />
                            <ShieldCheck className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                          </div>
                        </FormControl>
                        <FormDescription>3 or 4 digit security code on the back of your card</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Step 3: Confirmation */}
              {currentStep === 3 && (
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="font-medium mb-2">Card Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Card Type:</span>
                        <span className="text-sm font-medium">{getCardTypeIcon()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Card Number:</span>
                        <span className="text-sm font-medium">
                          •••• •••• •••• {form.getValues("cardNumber").slice(-4)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Cardholder Name:</span>
                        <span className="text-sm font-medium">{form.getValues("cardholderName")}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Expiry Date:</span>
                        <span className="text-sm font-medium">
                          {form.getValues("expiryMonth")}/{form.getValues("expiryYear").slice(-2)}
                        </span>
                      </div>
                      {form.getValues("cardNickname") && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Card Nickname:</span>
                          <span className="text-sm font-medium">{form.getValues("cardNickname")}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <div className="flex items-start">
                      <ShieldCheck className="h-5 w-5 text-blue-500 mt-0.5 mr-2" />
                      <div>
                        <h3 className="font-medium text-blue-800">Secure Card Storage</h3>
                        <p className="text-sm text-blue-700 mt-1">
                          Your card details are securely encrypted and stored according to PCI DSS standards. We never
                          store your full card details on our servers.
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
                    "Add Card"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}