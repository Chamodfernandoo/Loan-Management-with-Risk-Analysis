import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useEffect } from "react"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../../../components/ui/form"
import { InputOTP, InputOTPGroup, InputOTPSlot } from "../../../components/ui/input-otp"

interface InputOTPFormProps {
  onDataChange?: (data: any) => void
  phoneNumber?: string
}

const FormSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
})

export const InputOTPForm = ({ onDataChange, phoneNumber }: InputOTPFormProps) => {
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      pin: "",
    },
  })

  // Watch for form changes and notify parent when valid
  const formValues = form.watch()
  const otp = formValues.pin

  useEffect(() => {
    if (otp.length === 6 && onDataChange) {
      // Assuming 6-digit OTP
      onDataChange({ otp })
    }
  }, [otp, onDataChange])

  const onSubmit = (values: z.infer<typeof FormSchema>) => {
    if (onDataChange) {
      onDataChange(values)
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold">Verify Your Phone Number</h2>
        <p className="text-muted-foreground">We've sent a verification code to {phoneNumber || "your phone"}</p>
      </div>

      <Form {...form}>
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="pin"
            render={({ field }) => (
              <FormItem className="mx-auto max-w-sm">
                <FormLabel>One-Time Password</FormLabel>
                <FormControl>
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormDescription>Please enter the one-time password sent to your phone.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  )
}