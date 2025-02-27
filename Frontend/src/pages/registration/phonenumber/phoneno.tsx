import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const formSchema = z.object({
  userType: z.enum(["lender", "customer"], {
    required_error: "Please select your user type",
  }),
  phoneNumber: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .regex(/^\d+$/, "Please enter only numbers"),
})

const Phoneno = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      userType: "customer",
      phoneNumber: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    // Here you would typically trigger the OTP send process
  }
  return (
    <>
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-blue-600">Welcome to PAYME</h1>
          <p className="text-lg text-slate-600">Select your type</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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

            <Button type="submit" className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700">
              Continue
            </Button>
          </form>
        </Form>
      </div>
    </div>
    </>
  )
}

export default Phoneno
