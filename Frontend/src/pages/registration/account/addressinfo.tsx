import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

// Example data - replace with your actual data
const provinces = [
  { label: "Western Province", value: "western" },
  { label: "Central Province", value: "central" },
  { label: "Southern Province", value: "southern" },
  { label: "Northern Province", value: "northern" },
  { label: "Eastern Province", value: "eastern" },
  { label: "North Western Province", value: "north-western" },
  { label: "North Central Province", value: "north-central" },
  { label: "Uva Province", value: "uva" },
  { label: "Sabaragamuwa Province", value: "sabaragamuwa" },
]

const districts = {
  western: [
    { label: "Colombo", value: "colombo" },
    { label: "Gampaha", value: "gampaha" },
    { label: "Kalutara", value: "kalutara" },
  ],
  central: [
    { label: "Kandy", value: "kandy" },
    { label: "Matale", value: "matale" },
    { label: "Nuwara Eliya", value: "nuwara-eliya" },
  ],
  southern: [
    { label: "Galle", value: "galle" },
    { label: "Matara", value: "matara" },
    { label: "Hambantota", value: "hambantota" },
  ],
  northern: [
    { label: "Jaffna", value: "jaffna" },
    { label: "Kilinochchi", value: "kilinochchi" },
    { label: "Mannar", value: "mannar" },
    { label: "Mullaitivu", value: "mullaitivu" },
    { label: "Vavuniya", value: "vavuniya" },
  ],
  eastern: [
    { label: "Trincomalee", value: "trincomalee" },
    { label: "Batticaloa", value: "batticaloa" },
    { label: "Ampara", value: "ampara" },
  ],  
  "north-western": [
    { label: "Kurunegala", value: "kurunegala" },
    { label: "Puttalam", value: "puttalam" },
  ],
  "north-central": [
    { label: "Anuradhapura", value: "anuradhapura" },
    { label: "Polonnaruwa", value: "polonnaruwa" },
  ],
  uva: [
    { label: "Badulla", value: "badulla" },
    { label: "Monaragala", value: "monaragala" },
  ],
  sabaragamuwa: [
    { label: "Ratnapura", value: "ratnapura" },
    { label: "Kegalle", value: "kegalle" },
  ],  
}

const formSchema = z.object({
  province: z.string({
    required_error: "Please select a province",
  }),
  district: z.string({
    required_error: "Please select a district",
  }),
  city: z.string().min(2, "City must be at least 2 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  postalCode: z.string().min(5, "Postal code must be at least 5 characters"),
})


const Addressinfo = () => {
  const [availableDistricts, setAvailableDistricts] = React.useState(districts.western)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const onProvinceChange = React.useCallback(
    (value: string) => {
      form.setValue("district", "")
      setAvailableDistricts(districts[value as keyof typeof districts])
    },
    [form],
  )

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
  }
  return (
    <>
      <div className="min-h-screen p-4 flex flex-col items-center justify-center bg-slate-50">
      <div className="w-full max-w-md space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-blue-600">Setup your Address</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="province"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Select province</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn("w-full justify-between bg-muted", !field.value && "text-muted-foreground")}
                        >
                          {field.value
                            ? provinces.find((province) => province.value === field.value)?.label
                            : "Select province"}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search province..." />
                        <CommandList>
                          <CommandEmpty>No province found.</CommandEmpty>
                          <CommandGroup>
                            {provinces.map((province) => (
                              <CommandItem
                                value={province.label}
                                key={province.value}
                                onSelect={() => {
                                  field.onChange(province.value)
                                  onProvinceChange(province.value)
                                }}
                              >
                                <ChevronDown
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    province.value === field.value ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {province.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="district"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Select District</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn("w-full justify-between bg-muted", !field.value && "text-muted-foreground")}
                        >
                          {field.value
                            ? availableDistricts.find((district) => district.value === field.value)?.label
                            : "Select district"}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search district..." />
                        <CommandList>
                          <CommandEmpty>No district found.</CommandEmpty>
                          <CommandGroup>
                            {availableDistricts.map((district) => (
                              <CommandItem
                                value={district.label}
                                key={district.value}
                                onSelect={() => {
                                  field.onChange(district.value)
                                }}
                              >
                                <ChevronDown
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    district.value === field.value ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {district.label}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter city</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your city" {...field} className="bg-muted" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter your address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full address" {...field} className="bg-muted" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="postalCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Postal code</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter postal code" {...field} className="bg-muted" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full">
              Save Address
            </Button>
          </form>
        </Form>
      </div>
    </div>
    </>
  )
}

export default Addressinfo
