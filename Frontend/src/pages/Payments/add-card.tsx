import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { ArrowLeft, CreditCard, Check, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { paymentService } from "@/services/api"
import { useToast } from "@/hooks/use-toast"

// Card form schema
const cardFormSchema = z.object({
  cardNumber: z.string()
    .min(13, "Card number must be at least 13 digits")
    .max(19, "Card number must be at most 19 digits")
    .regex(/^\d+$/, "Card number must contain only digits"),
  cardholderName: z.string().min(1, "Cardholder name is required"),
  expiryMonth: z.string()
    .min(1, "Expiry month is required")
    .max(2, "Expiry month must be 1 or 2 digits")
    .regex(/^(0?[1-9]|1[0-2])$/, "Expiry month must be between 1 and 12"),
  expiryYear: z.string()
    .length(4, "Expiry year must be 4 digits")
    .regex(/^20\d{2}$/, "Expiry year must be a valid year"),
  cvv: z.string()
    .min(3, "CVV must be at least 3 digits")
    .max(4, "CVV must be at most 4 digits")
    .regex(/^\d+$/, "CVV must contain only digits"),
  nickname: z.string().optional(),
  isDefault: z.boolean().default(false),
})

type CardFormValues = z.infer<typeof cardFormSchema>

export default function AddCardPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  // Get return URL from location state
  const returnUrl = location.state?.returnUrl || "/payments/cards"
  const loanId = location.state?.loanId
  const loanData = location.state?.loanData

  // Initialize form
  const form = useForm<CardFormValues>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      cardNumber: "",
      cardholderName: "",
      expiryMonth: "",
      expiryYear: "",
      cvv: "",
      nickname: "",
      isDefault: false,
    },
  })

  // Handle form submission
  const onSubmit = async (data: CardFormValues) => {
    setIsSubmitting(true)

    try {
      // Determine card type based on first digits
      let cardType: "visa" | "mastercard" | "amex" | "discover" = "visa"
      
      if (data.cardNumber.startsWith("4")) {
        cardType = "visa"
      } else if (data.cardNumber.startsWith("5")) {
        cardType = "mastercard"
      } else if (data.cardNumber.startsWith("34") || data.cardNumber.startsWith("37")) {
        cardType = "amex"
      } else if (data.cardNumber.startsWith("6")) {
        cardType = "discover"
      }
      
      // Prepare card data for API
      const cardData = {
        card_number: data.cardNumber,
        cardholder_name: data.cardholderName,
        expiry_month: data.expiryMonth,
        expiry_year: data.expiryYear,
        card_type: cardType,
        is_default: data.isDefault,
        nickname: data.nickname || undefined,
      }
      
      // Add the card via API
      await paymentService.addCard(cardData)
      
      // Show success message
      toast({
        title: "Card added successfully",
        description: "Your card has been saved for future payments"
      })
      
      // Check if we have a return URL from state
      const returnState = {
        loanId: location.state?.loanId,
        amount: location.state?.amount,
        loanData: location.state?.loanData
      }
      
      // Navigate back to the page that sent us here
      navigate(returnUrl, { state: returnState })
    } catch (error) {
      console.error("Error adding card:", error)
      toast({
        title: "Failed to add card",
        description: "There was an error adding your card. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-2xl">
      <Button variant="outline" className="mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Add Payment Card</CardTitle>
          <CardDescription>Add a new card to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="cardNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input placeholder="1234 5678 9012 3456" {...field} className="pl-10" />
                        <CreditCard className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                      </div>
                    </FormControl>
                    <FormDescription>Enter your card number without spaces</FormDescription>
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
                      <Input placeholder="John Smith" {...field} />
                    </FormControl>
                    <FormDescription>Enter the name as it appears on the card</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="expiryMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Month</FormLabel>
                      <FormControl>
                        <Input placeholder="MM" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="expiryYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expiry Year</FormLabel>
                      <FormControl>
                        <Input placeholder="YYYY" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cvv"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CVV</FormLabel>
                      <FormControl>
                        <Input placeholder="123" type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="nickname"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Card Nickname (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Personal Card" {...field} />
                    </FormControl>
                    <FormDescription>A name to help you identify this card</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isDefault"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Make this my default payment method</FormLabel>
                      <FormDescription>
                        This card will be used as your default payment method
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <div className="pt-4 border-t flex justify-end">
                <Button type="submit" disabled={isSubmitting} className="flex items-center">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Adding Card...
                    </>
                  ) : (
                    <>
                      Add Card
                      <Check className="ml-2 h-4 w-4" />
                    </>
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