import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { QrCode, Search, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
// Define the form schema with Zod
const formSchema = z.object({
  searchId: z.string().optional(),
  name: z.string().min(1, "Name is required"),
  idNumber: z.string().min(1, "ID number is required"),
  phoneNumber: z.string().regex(/^\d{3}-\d{3}-\d{4}$/, "Phone number must be in format: 123-456-7890"),
  city: z.string().min(1, "City is required"),
  orderId: z.string().min(1, "Order ID is required"),
  lenderName: z.string().min(1, "Lender name is required"),
  amount: z.string().min(1, "Amount is required"),
  description: z.string().min(1, "Description is required"),
  installments: z.string().min(1, "Number of installments is required"),
  taxRate: z.string().min(1, "Tax rate is required"),
  installmentPrice: z.string().min(1, "Installment price is required"),
})

type FormValues = z.infer<typeof formSchema>

const Create_loan = () => {

  const [isSearching, setIsSearching] = useState(false)
  const today = format(new Date(), "MMMM dd, yyyy")
  const navigate = useNavigate()

  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      searchId: "",
      name: "",
      idNumber: "",
      phoneNumber: "",
      city: "",
      orderId: `ORD-${Math.floor(Math.random() * 10000)}`,
      lenderName: "Sampath Shop",
      amount: "",
      description: "",
      installments: "",
      taxRate: "",
      installmentPrice: "",
    },
  })

  // Handle form submission
  function onSubmit(data: FormValues) {
    console.log("Form submitted:", data)
    // Here you would typically send the data to your backend
    alert("Order submitted successfully!")
    form.reset()
  }

  // Handle search
  function handleSearch() {
    const searchId = form.getValues("searchId")
    if (!searchId) return

    setIsSearching(true)

    // Simulate API call
    setTimeout(() => {
      // Mock data - in a real app, this would come from your API
      form.setValue("name", "John Doe")
      form.setValue("idNumber", "ID-12345")
      form.setValue("phoneNumber", "877-666-3350")
      form.setValue("city", "Kegalle")
      setIsSearching(false)
    }, 1000)
  }

  // Handle QR scan
  function handleQRScan() {
    // In a real app, this would open a camera or QR scanner
    alert("QR scanner would open here")
  }

  // Employee details data
  type EmployeeDetail = {label: string;value: string;span?: number;}
  const employeeDetails: EmployeeDetail[] = [
    { label: "Frist name", value: "Chamod" },
    { label: "Last name", value: "Fernando" },
    { label: "User id", value: "#256.3565.6656" },
    { label: "Order id", value: "#256.6656" },
    { label: "Phone No", value: "+94 123456789" },
    { label: "Date", value: today },
    { label: "Address", value: "109/8 kagalle hettimulla" },
    { label: "Gender", value: "male" }, 
  ];

  return (
    <>
        <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Button variant="outline" className="mb-4 sm:mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>
      <Card className="shadow-lg">
        <CardHeader className="bg-primary text-primary-foreground">
          <CardTitle className="text-2xl font-bold">Add Order</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Search Section */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <FormField
                    control={form.control}
                    name="searchId"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <div className="flex">
                            <Input placeholder="Enter ID no" className="rounded-r-none" {...field} />
                            <Button
                              type="button"
                              onClick={handleSearch}
                              className="rounded-l-none"
                              disabled={isSearching}
                            >
                              {isSearching ? (
                                "Searching..."
                              ) : (
                                <>
                                  <Search className="h-4 w-4 mr-2" />
                                  Find
                                </>
                              )}
                            </Button>
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="button" variant="outline" onClick={handleQRScan} className="sm:w-auto w-full">
                  <QrCode className="h-4 w-4 mr-2" />
                  Scan QR
                </Button>
              </div>

              {/* Customer Information Card */}
              <Card className="border rounded-lg">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 ">
                    <div className="flex items-start gap-3">
                      <Avatar className="h-12 w-12 mt-1">
                        <AvatarFallback>
                          <User className="h-6 w-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                      <h1 className='text-xl sm:text-2xl font-bold'> {employeeDetails
                    .filter(detail => ['Frist name', 'Last name', 'User id'].includes(detail.label))
                    .map((detail, index) => (
                    <span key={index} className="mr-2">
                      {detail.label === 'User id' ? (
                      <div className="text-sm font-normal">{detail.value}</div>
                      ) : (
                      `${detail.value}${detail.label === 'Frist name' ? ' ' : ''}`
                      )}
                    </span>
                  ))}
                  </h1>
                </div>
              </div>
                    <div >{employeeDetails
                    .filter(detail => ['Order id',].includes(detail.label))
                    .map((detail, index) =>(
                      <div key={index} className="flex flex-col">
                        <h3 className="text-muted-foreground">{detail.label}</h3>
                        <h3>{detail.value}</h3>
                      </div>
                    ))}</div>
                   </div> 
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8 mt-6 sm:mt-0">{employeeDetails
                        .filter(detail => ['Phone No','Date','Address','Gender'].includes(detail.label))
                        .map((detail, index) =>(
                          <div key={index} className="flex flex-col">
                            <h3 className="text-muted-foreground">{detail.label}</h3>
                            <h3>{detail.value}</h3>
                          </div>
                ))}</div> 
                </CardContent>
              </Card>

              {/* Order Details Section */}
              <div>
                <h3 className="text-lg font-medium mb-4">Fill Order Details</h3>
                <div className="space-y-4">
                <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Shop Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter shop name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter full amount" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Write about your deal and order"
                            className="min-h-[100px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="installments"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>No of installments</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter installments number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="taxRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tax rate</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input placeholder="Enter tax rate" {...field} />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              %
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="installmentPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Installment price</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button type="submit" className="flex-1">
                  Submit Order
                </Button>
                <Button type="button" variant="outline" className="flex-1" onClick={() => form.reset()}>
                  Cancel
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
    </>
  )
}

export default Create_loan
