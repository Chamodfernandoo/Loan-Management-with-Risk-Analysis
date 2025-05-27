import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useEffect } from "react"

import { Form, FormControl, FormField, FormItem } from "../../../components/ui/form"
import { RadioGroup, RadioGroupItem } from "../../../components/ui/radio-group"

interface DoctypeProps {
  onDataChange?: (data: any) => void
}

const formSchema = z.object({
  documentType: z.enum(["id-card", "driving-license", "passport"], {
    required_error: "Please select a document type",
  }),
})

const Doctype = ({ onDataChange }: DoctypeProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  })

  // Watch for form changes and notify parent when valid
  const formValues = form.watch()
  const selectedDocType = formValues?.documentType

  useEffect(() => {
    if (selectedDocType && onDataChange) {
      onDataChange({ documentType: selectedDocType })
    }
  }, [selectedDocType, onDataChange])

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (onDataChange) {
      onDataChange(values)
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-blue-600">Document verification</h1>
        <p className="text-slate-600">Document type</p>
      </div>

      <Form {...form}>
        <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="documentType"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-3"
                  >
                    <FormItem>
                      <FormControl>
                        <div className="border rounded-md">
                          <RadioGroupItem value="id-card" id="id-card" className="peer sr-only" />
                          <label
                            htmlFor="id-card"
                            className="flex w-full cursor-pointer rounded-md p-4 hover:bg-slate-100 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                          >
                            ID card
                          </label>
                        </div>
                      </FormControl>
                    </FormItem>
                    <FormItem>
                      <FormControl>
                        <div className="border rounded-md">
                          <RadioGroupItem value="driving-license" id="driving-license" className="peer sr-only" />
                          <label
                            htmlFor="driving-license"
                            className="flex w-full cursor-pointer rounded-md p-4 hover:bg-slate-100 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                          >
                            Driving license
                          </label>
                        </div>
                      </FormControl>
                    </FormItem>
                    <FormItem>
                      <FormControl>
                        <div className="border rounded-md">
                          <RadioGroupItem value="passport" id="passport" className="peer sr-only" />
                          <label
                            htmlFor="passport"
                            className="flex w-full cursor-pointer rounded-md p-4 hover:bg-slate-100 peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5"
                          >
                            Passport
                          </label>
                        </div>
                      </FormControl>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
              </FormItem>
            )}
          />
        </form>
      </Form>
    </div>
  )
}

export default Doctype