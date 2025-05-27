import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { useEffect } from "react"

const formSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((val) => !isNaN(Number(val)), {
      message: "Amount must be a valid number",
    }),
  date: z.date({
    required_error: "Date is required",
  }),
  method: z.string({
    required_error: "Payment method is required",
  }),
})

type FormValues = z.infer<typeof formSchema>

const paymentMethods = [
  { value: "cash", label: "Cash" },
  { value: "card", label: "Card" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "cheque", label: "Cheque" },
]

interface NextInstallment {
  amount: number;
  dueDate: string;
}

interface PaymentPopupProps {
  onSubmitPayment: (amount: string, date: Date, method: string) => void;
  nextInstallment?: NextInstallment | null;
  loanId?: string;
}

const Payament_popup = ({ onSubmitPayment, nextInstallment, loanId }: PaymentPopupProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: nextInstallment ? nextInstallment.amount.toString() : "",
      date: new Date(),
    },
  })

  // Update form with next installment amount when it changes
  useEffect(() => {
    if (nextInstallment && nextInstallment.amount) {
      form.setValue("amount", nextInstallment.amount.toString())
    }
  }, [nextInstallment, form])

  function onSubmit(data: FormValues) {
    console.log("Form submitted:", data);
    
    // Ensure the date is properly formatted
    const paymentDate = new Date(data.date);
    
    // Send the data to the parent component
    onSubmitPayment(data.amount, paymentDate, data.method);
    
    // Reset the form
    form.reset();
    
    // Show a success toast
    toast({
      title: "Payment Recorded",
      description: "The payment has been successfully recorded and notifications sent.",
    });
  }

  return (
    <div className="px-4 py-6 max-w-xl">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center text-blue-600">
            {nextInstallment ? "Record Next Payment" : "Add Payment"}
          </CardTitle>
          {nextInstallment && nextInstallment.dueDate && (
            <div className="text-center text-sm text-muted-foreground">
              Next installment due: {format(new Date(nextInstallment.dueDate), "MMM dd, yyyy")}
            </div>
          )}
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter payment amount" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                          >
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date("2100-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {paymentMethods.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            {method.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Record Payment
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}

export default Payament_popup