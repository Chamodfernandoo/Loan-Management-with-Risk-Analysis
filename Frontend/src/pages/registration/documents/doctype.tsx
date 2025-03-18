import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

const formSchema = z.object({
  documentType: z.enum(["id-card", "driving-license", "passport"], {
    required_error: "Please select a document type",
  }),
})


const Doctype = () => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }
  return (
    <div className="min-h-screen p-4 flex flex-col items-center justify-center bg-slate-50">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-blue-600">Document verification</h1>
          <p className="text-slate-600">Document type</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default Doctype