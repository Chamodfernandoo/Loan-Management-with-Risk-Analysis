import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { districts, cities, loanTypes } from "@/pages/Lender/Advertisments/types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, ArrowRight, Upload, X } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"
import { adService } from "@/services/api"
import { useToast } from "@/hooks/use-toast"

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
  interestRate: z.string().refine((val) => !isNaN(Number(val)), {
    message: "Interest rate must be a number",
  }),
  loanTypes: z.array(z.string()).min(1, "Select at least one loan type"),
})

// Combined schema
const formSchema = locationSchema.merge(detailsSchema)

type FormValues = z.infer<typeof formSchema>

const CreateAdPage: React.FC = () => {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [step, setStep] = useState<1 | 2>(1)
  const [photos, setPhotos] = useState<File[]>([])
  const [photoPreviewUrls, setPhotoPreviewUrls] = useState<string[]>([])
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      district: "",
      city: "",
      shopName: "",
      lenderName: "",
      contactNumber: "",
      description: "",
      interestRate: "",
      loanTypes: [],
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
      toast({
        title: "Upload limit exceeded",
        description: "You can only upload a maximum of 4 photos",
        variant: "destructive",
      })
      return
    }

    // Convert FileList to array and process each file
    const newFiles: File[] = Array.from(files)
    const validFiles = newFiles.filter(file => file.type.startsWith('image/'))
    
    if (validFiles.length !== newFiles.length) {
      toast({
        title: "Invalid file type",
        description: "Only image files are allowed",
        variant: "destructive",
      })
    }

    // Add valid files to state
    setPhotos(prev => [...prev, ...validFiles])
    
    // Create preview URLs for valid files
    validFiles.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setPhotoPreviewUrls(prev => [...prev, e.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index))
    setPhotoPreviewUrls(prev => prev.filter((_, i) => i !== index))
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

  const onSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true)
      
      // Prepare form data for multipart request
      const formData = new FormData()
      
      // Add advertisement details
      formData.append('shop_name', data.shopName)
      formData.append('lender_name', data.lenderName)
      formData.append('contact_number', data.contactNumber)
      formData.append('description', data.description)
      formData.append('interest_rate', data.interestRate)
      
      // Add location
      formData.append('location', JSON.stringify({
        district: data.district,
        city: data.city
      }))
      
      // Add loan types
      data.loanTypes.forEach((type) => {
        formData.append(`loan_types`, type)
      })
      
      // Add photos
      photos.forEach((photo) => {
        formData.append(`photos`, photo)
      })
      
      // Submit to API
      await adService.createAd(formData)
      
      toast({
        title: "Advertisement created",
        description: "Your advertisement has been published successfully.",
      })
      
      // Redirect to the ads page
      navigate("/lender/ads/all-ads")
    } catch (error: any) {
      console.error("Error creating advertisement:", error)
      toast({
        title: "Failed to create advertisement",
        description: error.response?.data?.detail || "There was an error creating your advertisement.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-3xl">
      <Card className="shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl sm:text-2xl font-bold text-blue-600">Create New Ad</CardTitle>
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
                    <Button type="button" onClick={nextStep} className="w-full sm:w-auto">
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
                    name="interestRate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Interest Rate (%)</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.01" min="0" max="100" placeholder="e.g. 8.5" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="loanTypes"
                    render={() => (
                      <FormItem>
                        <div className="mb-4">
                          <FormLabel className="text-base">Loan Types</FormLabel>
                          <FormDescription>
                            Select the types of loans you offer
                          </FormDescription>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {loanTypes.map((type) => (
                            <FormField
                              key={type}
                              control={form.control}
                              name="loanTypes"
                              render={({ field }) => {
                                return (
                                  <FormItem
                                    key={type}
                                    className="flex flex-row items-start space-x-3 space-y-0"
                                  >
                                    <FormControl>
                                      <Checkbox
                                        checked={field.value?.includes(type)}
                                        onCheckedChange={(checked) => {
                                          return checked
                                            ? field.onChange([...field.value, type])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) => value !== type
                                                )
                                              )
                                        }}
                                      />
                                    </FormControl>
                                    <FormLabel className="font-normal">
                                      {type}
                                    </FormLabel>
                                  </FormItem>
                                )
                              }}
                            />
                          ))}
                        </div>
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
                      {photoPreviewUrls.map((photoUrl, index) => (
                        <div key={index} className="relative h-24 bg-gray-100 rounded-md overflow-hidden">
                          <img
                            src={photoUrl}
                            alt={`Photo ${index + 1}`}
                            className="w-full h-full object-cover"
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
                      {photoPreviewUrls.length < 4 && (
                        <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-gray-300 rounded-md cursor-pointer hover:bg-gray-50">
                          <Upload className="h-6 w-6 text-gray-400" />
                          <span className="mt-2 text-sm text-gray-500">Upload Photo</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handlePhotoUpload}
                            multiple={photoPreviewUrls.length < 3}
                          />
                        </label>
                      )}
                    </div>
                    <FormDescription>Upload up to 4 photos of your business.</FormDescription>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={prevStep} className="order-2 sm:order-1">
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Previous Step
                    </Button>
                    <Button type="submit" className="order-1 sm:order-2" disabled={isSubmitting}>
                      {isSubmitting ? "Creating..." : "Create Ad"}
                    </Button>
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

export default CreateAdPage
