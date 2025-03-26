import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useEffect } from "react"

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "../../../components/ui/form"
import { Input } from "../../../components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "../../../components/ui/toggle-group"

interface PhonenoProps {
  onDataChange?: (data: any) => void
}

const formSchema = z.object({
  userType: z.enum(["lender", "customer"], {
    required_error: "Please select your user type",
  }),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\d+$/, "Please enter only numbers"),
})

const Phoneno = ({ onDataChange }: PhonenoProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userType: "customer",
      phoneNumber: "",
    },
  })

  // Watch for form changes and notify parent when valid
  const formValues = form.watch()
  const isValid = form.formState.isValid

  useEffect(() => {
    if (isValid && onDataChange) {
      onDataChange(formValues)
    }
  }, [formValues, isValid, onDataChange])

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (onDataChange) {
      onDataChange(values)
    }
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-blue-600">Welcome to PAYME</h1>
        <p className="text-lg text-slate-600">Select your type</p>
      </div>

      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="userType"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <ToggleGroup
                    type="single"
                    value={field.value}
                    onValueChange={field.onChange}
                    className="justify-center"
                  >
                    <ToggleGroupItem value="lender" className="w-[120px] data-[state=on]:bg-blue-600">
                      Lender
                    </ToggleGroupItem>
                    <ToggleGroupItem value="customer" className="w-[120px] data-[state=on]:bg-blue-600">
                      Customer
                    </ToggleGroupItem>
                  </ToggleGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Phone number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your phone number"
                    type="tel"
                    className="h-12 bg-muted text-lg"
                    {...field}
                  />
                </FormControl>
                <p className="text-sm text-muted-foreground">Enter valid number, will send ontime-password</p>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  )
}

export default Phoneno
