import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { districts, cities } from "@/pages/Lender/Advertisments/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, ArrowRight, Upload, X } from "lucide-react"
// import Image from "next/image"

// Step 1 schema
const locationSchema = z.object({
  district: z.string({ required_error: "District is required" }),
  city: z.string({ required_error: "City is required" }),
})

// Step 2 schema
const detailsSchema = z.object({
  shopName: z.string().min(2, "Shop name must be at least 2 characters"),
  lenderName: z.string().min(2, "Lender name must be at least 2 characters"),
  contactNumber: z.string().min(10, "Contact number must be at least 10 characters"),
  description: z.string().min(20, "Description must be at least 20 characters"),
})

// Combined schema
const formSchema = locationSchema.merge(detailsSchema)

type FormValues = z.infer<typeof formSchema>

export default function CreateAdPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState<1 | 2>(1)
  const [photos, setPhotos] = useState<string[]>([])
  const [availableCities, setAvailableCities] = useState<string[]>([])

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      district: "",
      city: "",
      shopName: "",
      lenderName: "",
      contactNumber: "",
      description: "",
    },
    mode: "onChange",
  })

  const watchDistrict = form.watch("district")

  // Update available cities when district changes
  const onDistrictChange = (value: string) => {
    form.setValue("district", value)
    form.setValue("city", "")
    setAvailableCities(cities[value] || [])
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    // Check if adding new photos would exceed the limit
    if (photos.length + files.length > 4) {
      alert("You can only upload a maximum of 4 photos")
      return
    }

    // Convert FileList to array and process each file
    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setPhotos((prev) => [...prev, e.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index))
  }

  const nextStep = async () => {
    // Validate step 1 fields
    if (step === 1) {
      const locationValid = await form.trigger(["district", "city"])
      if (locationValid) {
        setStep(2)
      }
    }
  }

  const prevStep = () => {
    if (step === 2) {
      setStep(1)
    }
  }

  const onSubmit = (data: FormValues) => {
    // In a real app, you would send this data to your API
    const newAd = {
      ...data,
      photos,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date(),
      updatedAt: new Date(),
      lenderId: "current-lender-id", // In a real app, this would be the authenticated user's ID
    }

    console.log("New ad created:", newAd)

    // Redirect to the ads page
    navigate("/lender/ads/all-ads")
  }

  return (
    <div className="container max-w-3xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create New Ad</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs value={step === 1 ? "location" : "details"} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="location" onClick={() => setStep(1)} disabled={step === 1}>
                    Step 1: Location
                  </TabsTrigger>
                  <TabsTrigger value="details" onClick={() => setStep(2)} disabled={step === 2}>
                    Step 2: Details
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="location" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="district"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>District</FormLabel>
                        <Select onValueChange={onDistrictChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select district" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {districts.map((district) => (
                              <SelectItem key={district} value={district}>
                                {district}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>City</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!watchDistrict}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select city" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {availableCities.map((city) => (
                              <SelectItem key={city} value={city}>
                                {city}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end pt-4">
                    <Button type="button" onClick={nextStep}>
                      Next Step
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="details" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="shopName"
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
                    name="lenderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Lender Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter lender name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter contact number" {...field} />
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
                          <Textarea placeholder="Describe your business" className="min-h-[120px]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <FormLabel>Photos (Max 4)</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {photos.map((photo, index) => (
                        <div key={index} className="relative h-24 bg-gray-100 rounded-md overflow-hidden">
                          <img
                            src={photo || "/placeholder.svg"}
                            alt={`Photo ${index + 1}`}
                            className="object-cover"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() => removePhoto(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                      {photos.length < 4 && (
                        <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                          <Upload className="h-6 w-6 text-gray-400" />
                          <span className="mt-2 text-sm text-gray-500">Upload Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoUpload}
                            multiple={photos.length < 3}
                          />
                        </label>
                      )}
                    </div>
                    <FormDescription>Upload up to 4 photos of your business.</FormDescription>
                  </div>

                  <div className="flex justify-between pt-4">
                    <Button type="button" variant="outline" onClick={prevStep}>
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous Step
                    </Button>
                    <Button type="submit">Create Ad</Button>
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}