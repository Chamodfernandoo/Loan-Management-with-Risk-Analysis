import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { Eye, EyeOff, LogOut, MapPin, Phone, User, Mail, Edit, Save, X, Shield, ChevronDown, Check, QrCode } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Popover, PopoverContent, PopoverTrigger } from "../../../components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../../../components/ui/command"
import { Spinner } from "@/components/ui/spinner" // You might need to create this component
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"
import { userService } from "@/services/api"
import { generateQRCode, generateProfileQrData } from "@/utils/qrCode"

interface ProfileData {
  id?: string;
  full_name?: string;
  email?: string;
  phone_number?: string;
  nic_number?: string;
  gender?: string;
  date_of_birth?: string;
  job_title?: string;
  monthly_income?: number;
  marital_status?: string;
  housing_status?: string;
  address?: {
    province?: string;
    district?: string;
    city?: string;
    postal_code?: string;
    address?: string;
  };
  document_type?: string;
  is_verified?: boolean;
  verified_at?: string;
  created_at?: string;
  updated_at?: string;
  role?: string;
  [key: string]: any; // For any additional properties
}

const maritalStatus = [
  { label: "Single", value: "single" },
  { label: "Married", value: "married" },
  { label: "Divorced", value: "divorced" },
]

const housingStatus = [
  { label: "Own Home", value: "own" },
  { label: "Renting", value: "rent" },
  { label: "Living with Family", value: "family" },
  { label: "Other", value: "other" },
]

// Form schema for personal info
const personalInfoSchema = z.object({
  first_name: z.string().min(2, "First name must be at least 2 characters"),
  last_name: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone_number: z.string().min(10, "Phone number must be at least 10 characters"),
  job_title: z.string().optional(),
  monthly_income: z.string().optional(),
  marital_status: z.enum(["single", "married", "divorced"], {
    errorMap: () => ({ message: "Please select a marital status" }),
  }),
  housing_status: z.enum(["own", "rent", "family", "other"], {
    errorMap: () => ({ message: "Please select a housing status" }),
  }),
})

// Form schema for password change
const passwordSchema = z
  .object({
    current_password: z.string().min(8, "Password must be at least 8 characters"),
    new_password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  })

export default function BorrowerProfilePage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false)
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false)
  const [profileData, setProfileData] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [showQrDialog, setShowQrDialog] = useState(false)

  // Fetch user profile data
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true)
        const data = await userService.getBorrowerProfile()
        console.log("Profile data fetched:", data)
        setProfileData(data)
        
        // Generate QR code
        if (data.id && data.full_name && data.phone_number) {
          const qrData = generateProfileQrData(data.id, data.full_name, data.phone_number)
          const qrCode = await generateQRCode(qrData)
          setQrCodeUrl(qrCode)
        }
      } catch (error) {
        console.error("Error fetching profile:", error)
        toast({
          title: "Error",
          description: "Failed to load profile data. Please try again.",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [toast])

  // Personal info form
  const personalInfoForm = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone_number: "",
      job_title: "",
      monthly_income: "",
      marital_status: "single",
      housing_status: "rent",
    },
  })

  // Update form values when profile data is loaded
  useEffect(() => {
    if (profileData) {
      const nameParts = profileData.full_name?.split(' ') || ['', '']
      const firstName = nameParts[0] || ''
      const lastName = nameParts.slice(1).join(' ') || ''
      
      personalInfoForm.reset({
        first_name: firstName,
        last_name: lastName,
        email: profileData.email || '',
        phone_number: profileData.phone_number || '',
        job_title: profileData.job_title || '',
        monthly_income: profileData.monthly_income?.toString() || '',
        marital_status: profileData.marital_status as "single" | "married" | "divorced" || "single",
        housing_status: profileData.housing_status as "own" | "rent" | "family" | "other" || "rent",
      })
    }
  }, [profileData, personalInfoForm])

  // Password change form
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: "",
      new_password: "",
      confirm_password: "",
    },
  })

  // Handle personal info form submission
  async function onPersonalInfoSubmit(values: z.infer<typeof personalInfoSchema>) {
    try {
      // Combine first and last name
      const updateData = {
        full_name: `${values.first_name} ${values.last_name}`,
        email: values.email,
        phone_number: values.phone_number,
        job_title: values.job_title,
        monthly_income: values.monthly_income ? parseFloat(values.monthly_income) : undefined,
        marital_status: values.marital_status,
        housing_status: values.housing_status,
      }
      
      console.log("Updating profile with:", updateData)
      await userService.updateBorrowerProfile(updateData)
      
      // Update local profile data
      setProfileData((prev: ProfileData | null) => ({ ...prev, ...updateData }))
      
      setIsEditing(false)
      setProfileUpdateSuccess(true)
      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      })
      
      // Regenerate QR code with new data
      const qrData = generateProfileQrData(
        profileData?.id || '', 
        updateData.full_name || '', 
        updateData.phone_number || ''
      )
      const qrCode = await generateQRCode(qrData)
      setQrCodeUrl(qrCode)
      
      setTimeout(() => setProfileUpdateSuccess(false), 3000)
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Handle password change form submission
  async function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
    try {
      await userService.changePassword({
        current_password: values.current_password,
        new_password: values.new_password,
        confirm_password: values.confirm_password,
      })
      
      passwordForm.reset()
      setPasswordChangeSuccess(true)
      toast({
        title: "Success",
        description: "Your password has been changed successfully.",
      })
      setTimeout(() => setPasswordChangeSuccess(false), 3000)
    } catch (error) {
      console.error("Error changing password:", error)
      toast({
        title: "Error",
        description: "Failed to change password. Please ensure your current password is correct.",
        variant: "destructive"
      })
    }
  }

  // Handle logout
  function handleLogout() {
    logout()
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    })
    navigate("/login")
  }

  function cn(...inputs: (string | boolean | undefined)[]): string {
    return inputs
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="mb-4">Loading profile data...</div>
          {/* Add your spinner component here */}
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
    <div className="container py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">My Profile</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowQrDialog(true)}
            className="flex items-center gap-2"
          >
            <QrCode className="h-4 w-4" />
            My QR Code
          </Button>
          <Button variant="destructive" onClick={() => setLogoutDialogOpen(true)} className="sm:self-end">
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </div>

      {profileUpdateSuccess && (
        <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
          <Shield className="h-4 w-4" />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>Your profile information has been updated successfully.</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-4">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage
                  src="/placeholder.svg?height=100&width=100"
                  alt={profileData?.full_name || "User"}
                />
                <AvatarFallback>
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl text-center">
                {profileData?.full_name || "User"}
              </CardTitle>
              <CardDescription className="text-center">{profileData?.nic_number || "NIC Not Available"}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-3">
              <div className="flex items-center">
                <Badge className="bg-purple-600 hover:bg-purple-700">Borrower</Badge>
                <Badge className="ml-2 bg-blue-600 hover:bg-blue-700">
                  {profileData?.is_verified ? "Verified" : "Verified"}
                </Badge>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{profileData?.phone_number || "No phone number"}</span>
              </div>
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{profileData?.email || "No email"}</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  {profileData?.address?.city}, {profileData?.address?.district}
                </span>
              </div>
              <Separator />
              <div className="text-sm text-muted-foreground">
                Member since {profileData?.created_at ? format(new Date(profileData.created_at), "MMMM yyyy") : "N/A"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="md:col-span-2">
          <Tabs defaultValue="personal-info" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            {/* Personal Info Tab */}
            <TabsContent value="personal-info" className="space-y-4 pt-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Personal Information</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
                      {isEditing ? (
                        <>
                          <X className="mr-2 h-4 w-4" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </>
                      )}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <Form {...personalInfoForm}>
                      <form onSubmit={personalInfoForm.handleSubmit(onPersonalInfoSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={personalInfoForm.control}
                            name="first_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>First Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={personalInfoForm.control}
                            name="last_name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Last Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={personalInfoForm.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input {...field} type="email" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={personalInfoForm.control}
                            name="phone_number"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={personalInfoForm.control}
                            name="job_title"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Job</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={personalInfoForm.control}
                            name="monthly_income"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Income</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField
                          control={personalInfoForm.control}
                          name="marital_status"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Marital Status</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      className={cn("w-full justify-between bg-muted", !field.value && "text-muted-foreground")}
                                    >
                                      {field.value
                                        ? maritalStatus.find((status) => status.value === field.value)?.label
                                        : "Select marital status"}
                                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                  <Command>
                                    <CommandInput placeholder="Search marital status..." />
                                    <CommandList>
                                      <CommandEmpty>No status found.</CommandEmpty>
                                      <CommandGroup>
                                        {maritalStatus.map((status) => (
                                          <CommandItem
                                            key={status.value}
                                            value={status.value}
                                            onSelect={(value) => {
                                              field.onChange(value)
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                status.value === field.value ? "opacity-100" : "opacity-0",
                                              )}
                                            />
                                            {status.label}
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
                          control={personalInfoForm.control}
                          name="housing_status"
                          render={({ field }) => (
                            <FormItem className="flex flex-col">
                              <FormLabel>Housing Status</FormLabel>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <FormControl>
                                    <Button
                                      variant="outline"
                                      role="combobox"
                                      className={cn("w-full justify-between bg-muted", !field.value && "text-muted-foreground")}
                                    >
                                      {field.value
                                        ? housingStatus.find((status) => status.value === field.value)?.label
                                        : "Select housing status"}
                                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                  </FormControl>
                                </PopoverTrigger>
                                <PopoverContent className="w-full p-0">
                                  <Command>
                                    <CommandInput placeholder="Search housing status..." />
                                    <CommandList>
                                      <CommandEmpty>No status found.</CommandEmpty>
                                      <CommandGroup>
                                        {housingStatus.map((status) => (
                                          <CommandItem
                                            key={status.value}
                                            value={status.value}
                                            onSelect={(value) => {
                                              field.onChange(value)
                                            }}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-4 w-4",
                                                status.value === field.value ? "opacity-100" : "opacity-0",
                                              )}
                                            />
                                            {status.label}
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
                        </div>

                        <div className="flex justify-end">
                          <Button type="submit">
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </Button>
                        </div>
                      </form>
                    </Form>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">First Name</h3>
                          <p>{profileData?.full_name?.split(' ')[0] || "N/A"}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Last Name</h3>
                          <p>{profileData?.full_name?.split(' ').slice(1).join(' ') || "N/A"}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                          <p>{profileData?.email || "N/A"}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Phone Number</h3>
                          <p>{profileData?.phone_number || "N/A"}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Date of Birth</h3>
                          <p>{profileData?.date_of_birth ? format(new Date(profileData.date_of_birth), "MMMM dd, yyyy") : "N/A"}</p>
                        </div> 
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Gender</h3>
                          <p className="capitalize">{profileData?.gender || "N/A"}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">NIC Number</h3>
                          <p>{profileData?.nic_number || "N/A"}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Job</h3>
                          <p>{profileData?.job_title || "N/A"}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Income</h3>
                          <p>{profileData?.monthly_income || "N/A"}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Marital Status</h3>
                          <p className="capitalize">{profileData?.marital_status || "N/A"}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Housing Status</h3>
                          <p className="capitalize">{profileData?.housing_status || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Address Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Province</h3>
                        <p>{profileData?.address?.province || "N/A"}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">District</h3>
                        <p>{profileData?.address?.district || "N/A"}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">City</h3>
                        <p>{profileData?.address?.city || "N/A"}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Postal Code</h3>
                        <p>{profileData?.address?.postal_code || "N/A"}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                        <p>{profileData?.address?.address || "N/A"}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" disabled>
                    <Edit className="mr-2 h-4 w-4" />
                    Update Address
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Document Verification</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Badge
                        className={
                          profileData?.is_verified
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-yellow-600 hover:bg-yellow-700"
                        }
                      >
                        {profileData?.is_verified ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Document Type</h3>
                        <p className="capitalize">{profileData?.document_type?.replace("-", " ") || "N/A"}</p>
                      </div>
                      {profileData?.verified_at && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Verified Date</h3>
                          <p>{format(new Date(profileData.verified_at), "MMMM dd, yyyy")}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-4 pt-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Change Password</CardTitle>
                </CardHeader>
                <CardContent>
                  {passwordChangeSuccess && (
                    <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
                      <Shield className="h-4 w-4" />
                      <AlertTitle>Success!</AlertTitle>
                      <AlertDescription>Your password has been changed successfully.</AlertDescription>
                    </Alert>
                  )}

                  <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                      <FormField
                        control={passwordForm.control}
                        name="current_password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input type={showCurrentPassword ? "text" : "password"} className="pr-10" {...field} />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                >
                                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="new_password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input type={showNewPassword ? "text" : "password"} className="pr-10" {...field} />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                >
                                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={passwordForm.control}
                        name="confirm_password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <Input type={showConfirmPassword ? "text" : "password"} className="pr-10" {...field} />
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </Button>
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full">
                        Change Password
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Account Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium">Two-Factor Authentication</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add an extra layer of security to your account by enabling two-factor authentication.
                      </p>
                      <Button variant="outline" className="mt-2" disabled>
                        Enable 2FA
                      </Button>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium">Login History</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        View your recent login activity to ensure your account hasn't been compromised.
                      </p>
                      <Button variant="outline" className="mt-2" disabled>
                        View Login History
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* QR Code Dialog */}
      <Dialog open={showQrDialog} onOpenChange={setShowQrDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Profile QR Code</DialogTitle>
            <DialogDescription>
              Share this QR code with lenders to quickly identify your profile.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-4">
            {qrCodeUrl ? (
              <div className="border p-2 rounded-lg bg-white">
                <img src={qrCodeUrl} alt="Profile QR Code" className="w-64 h-64" />
              </div>
            ) : (
              <div className="text-center p-6">
                <p>Could not generate QR code</p>
              </div>
            )}
            <p className="mt-4 text-sm text-center text-muted-foreground">
              This QR code contains your basic profile information
            </p>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={() => setShowQrDialog(false)}>
              Close
            </Button>
            {qrCodeUrl && (
              <Button 
                variant="default" 
                onClick={() => {
                  // Download QR code as image
                  const link = document.createElement('a');
                  link.href = qrCodeUrl;
                  link.download = `profile-qr-${profileData?.full_name?.replace(/\s+/g, '-').toLowerCase() || 'user'}.png`;
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);

                  toast({
                    title: "QR Code Downloaded",
                    description: "Your profile QR code has been downloaded successfully.",
                  });
                }}
              >
                Download
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Logout Confirmation Dialog */}
      <Dialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Logout</DialogTitle>
            <DialogDescription>Are you sure you want to log out of your account?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLogoutDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
   </div>
  )
}