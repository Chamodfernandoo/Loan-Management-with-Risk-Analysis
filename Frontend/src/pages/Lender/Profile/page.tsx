import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { Eye, EyeOff, LogOut, MapPin, Phone, Mail, Edit, Save, X, Shield, Store } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useToast } from "@/hooks/use-toast"

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
import { userService, authService } from "@/services/api"

// Form schema for personal info
const personalInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"),
  shopName: z.string().min(2, "Shop name must be at least 2 characters"),
  businessRegistrationNumber: z.string().min(5, "Business registration number is required"),
})

// Form schema for password change
const passwordSchema = z
  .object({
    currentPassword: z.string().min(8, "Password must be at least 8 characters"),
    newPassword: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

// Form schema for address update
const addressSchema = z.object({
  province: z.string().min(2, "Province is required"),
  district: z.string().min(2, "District is required"),
  city: z.string().min(2, "City is required"),
  address: z.string().min(5, "Address is required"),
  postalCode: z.string().min(5, "Postal code is required"),
})

export default function LenderProfilePage() {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isEditingAddress, setIsEditingAddress] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false)
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false)
  const [addressUpdateSuccess, setAddressUpdateSuccess] = useState(false)
  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await userService.getLenderProfile()
        setUserData(data)
        
        // Initialize form with user data
        personalInfoForm.reset({
          firstName: data.full_name?.split(' ')[0] || '',
          lastName: data.full_name?.split(' ').slice(1).join(' ') || '',
          email: data.email || '',
          phoneNumber: data.phone_number || '',
          shopName: data.business_name || data.lender_profile?.business_name || '',
          businessRegistrationNumber: data.business_registration_number || data.lender_profile?.business_registration_number || '',
        })
        
        // Initialize address form if address exists
        if (data.address) {
          addressForm.reset({
            province: data.address.province || '',
            district: data.address.district || '',
            city: data.address.city || '',
            address: data.address.address || '',
            postalCode: data.address.postal_code || '',
          })
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  // Personal info form
  const personalInfoForm = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      shopName: '',
      businessRegistrationNumber: '',
    },
  })

  // Password change form
  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })
  
  // Address form
  const addressForm = useForm<z.infer<typeof addressSchema>>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      province: '',
      district: '',
      city: '',
      address: '',
      postalCode: '',
    },
  })

  // Define a user data interface at the top of the file
  interface UserData {
    full_name?: string
    email?: string
    phone_number?: string
    business_name?: string
    business_registration_number?: string
    address?: {
      province: string
      district: string
      city: string
      address: string
      postalCode: string
    }
    is_verified?: boolean
    verified_at?: string
    document_type?: string
    created_at?: string
    updated_at?: string
    nic_number?: string
    is_active?: boolean
    lender_profile?: any
    [key: string]: any; // For other potential properties
  }

  // Handle personal info form submission
  async function onPersonalInfoSubmit(values: z.infer<typeof personalInfoSchema>) {
    try {
      const fullName = `${values.firstName} ${values.lastName}`
      
      // Update user profile with name, email and phone
      await userService.updateProfile({
        full_name: fullName,
        email: values.email,
        phone_number: values.phoneNumber,
        business_name: values.shopName,
        business_registration_number: values.businessRegistrationNumber
      })
      
      // Update state with new values
      setUserData((prevData: UserData | null) => ({
        ...prevData as UserData,
        full_name: fullName,
        email: values.email,
        phone_number: values.phoneNumber,
        business_name: values.shopName,
        business_registration_number: values.businessRegistrationNumber
      }))
      
      setIsEditing(false)
      setProfileUpdateSuccess(true)
      setTimeout(() => setProfileUpdateSuccess(false), 3000)
    } catch (error) {
      console.error("Error updating profile:", error)
      // Handle error (show error message)
    }
  }

  // Handle address form submission
  async function onAddressSubmit(values: z.infer<typeof addressSchema>) {
    try {
      // Update address
      await userService.updateAddress(values)
      
      // Update state with new values
      setUserData((prevData: UserData | null) => ({
        ...prevData as UserData,
        address: values
      }))
      
      setIsEditingAddress(false)
      setAddressUpdateSuccess(true)
      setTimeout(() => setAddressUpdateSuccess(false), 3000)
    } catch (error) {
      console.error("Error updating address:", error)
      // Handle error (show error message)
    }
  }

  // Handle password change form submission
  async function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
    try {
      await userService.changePassword({
        current_password: values.currentPassword,
        new_password: values.newPassword,
        confirm_password: values.confirmPassword
      })
      
      passwordForm.reset()
      setPasswordChangeSuccess(true)
      setTimeout(() => setPasswordChangeSuccess(false), 3000)
    } catch (error) {
      console.error("Error changing password:", error)
      // Handle specific error cases
    }
  }

  // Handle logout
  function handleLogout() {
    try {
      logout()
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      })
      navigate("/login")
    } catch (error) {
      console.error("Error during logout:", error)
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive"
      })
    }
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userData || !userData.full_name) return "LN"
    
    const nameParts = userData.full_name.split(" ")
    if (nameParts.length >= 2) {
      return `${nameParts[0][0]}${nameParts[1][0]}`.toUpperCase()
    }
    return nameParts[0].substring(0, 2).toUpperCase()
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading profile data...</div>
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
    <div className="container py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-blue-600">My Profile</h1>
        <Button variant="destructive" onClick={() => setLogoutDialogOpen(true)} className="sm:self-end">
          <LogOut className="mr-2 h-4 w-4" />
          Logout
        </Button>
      </div>

      {profileUpdateSuccess && (
        <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
          <Shield className="h-4 w-4" />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>Your profile information has been updated successfully.</AlertDescription>
        </Alert>
      )}
      
      {addressUpdateSuccess && (
        <Alert className="mb-6 bg-green-50 text-green-800 border-green-200">
          <Shield className="h-4 w-4" />
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>Your address information has been updated successfully.</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-4">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage src={userData?.profileImage} alt={userData?.full_name} />
                <AvatarFallback>
                  <Store className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl text-center">{userData?.business_name || "Your Business"}</CardTitle>
              <CardDescription className="text-center">
                {userData?.full_name}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-3">
              <div className="flex items-center">
                <Badge className="bg-green-600 hover:bg-green-700">Lender</Badge>
                <Badge className="ml-2 bg-blue-600 hover:bg-blue-700">
                  {userData?.is_verified ? "Verified" : "verified"}
                </Badge>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{userData?.phone_number}</span>
              </div>
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{userData?.email}</span>
              </div>
              {userData?.address && (
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>
                    {userData.address.city}, {userData.address.district}
                  </span>
                </div>
              )}
              <Separator />
              <div className="text-sm text-muted-foreground">
                Member since {format(new Date(userData?.created_at || Date.now()), "MMMM yyyy")}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="md:col-span-2">
          <Tabs defaultValue="personal-info" className="w-full">
            <TabsList className="grid w-full grid-cols-2 ">
              <TabsTrigger value="personal-info">Personal Info</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            {/* Personal Info Tab */}
            <TabsContent value="personal-info" className="space-y-4 pt-4">
              <Card>
                <CardHeader className="pb-2 text-blue-600">
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
                            name="firstName"
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
                            name="lastName"
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
                            name="phoneNumber"
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
                            name="shopName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Shop Name</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={personalInfoForm.control}
                            name="businessRegistrationNumber"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Business Registration Number</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
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
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">First Name</h3>
                          <p>{userData?.full_name?.split(' ')[0]}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Last Name</h3>
                          <p>{userData?.full_name?.split(' ').slice(1).join(' ')}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                          <p>{userData?.email}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Phone Number</h3>
                          <p>{userData?.phone_number}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Shop Name</h3>
                          <p>{userData?.business_name}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Business Registration</h3>
                          <p>{userData?.business_registration_number || "Not provided"}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">NIC Number</h3>
                          <p>{userData?.nic_number || "Not provided"}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Account Status</h3>
                          <p>{userData?.is_active ? "Active" : "Inactive"}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 text-blue-600">
                  <div className="flex justify-between items-center">
                    <CardTitle>Address Information</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setIsEditingAddress(!isEditingAddress)}>
                      {isEditingAddress ? (
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
                  {isEditingAddress ? (
                    <Form {...addressForm}>
                      <form onSubmit={addressForm.handleSubmit(onAddressSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <FormField
                            control={addressForm.control}
                            name="province"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Province</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addressForm.control}
                            name="district"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>District</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addressForm.control}
                            name="city"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>City</FormLabel>
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
                            control={addressForm.control}
                            name="address"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Street Address</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={addressForm.control}
                            name="postalCode"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Postal Code</FormLabel>
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className="flex justify-end">
                          <Button type="submit">
                            <Save className="mr-2 h-4 w-4" />
                            Save Address
                          </Button>
                        </div>
                      </form>
                    </Form>
                  ) : (
                    <div className="space-y-4">
                      {userData?.address ? (
                        <>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground">Province</h3>
                              <p>{userData.address.province}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground">District</h3>
                              <p>{userData.address.district}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground">City</h3>
                              <p>{userData.address.city}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground">Postal Code</h3>
                              <p>{userData.address.postal_code}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                              <p>{userData.address.address}</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="text-muted-foreground">No address information available. Click Edit to add your address.</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {userData?.document_verification && (
                <Card>
                  <CardHeader className="pb-2 text-blue-600">
                    <CardTitle>Document Verification</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center">
                        <Badge
                          className={
                            userData?.is_verified
                              ? "bg-green-600 hover:bg-green-700"
                              : "bg-yellow-600 hover:bg-yellow-700"
                          }
                        >
                          {userData?.is_verified ? "Verified" : "Pending"}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Document Type</h3>
                          <p className="capitalize">{userData?.document_type || "Not specified"}</p>
                        </div>
                        {userData?.is_verified && userData?.verified_at && (
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground">Verified Date</h3>
                            <p>{format(new Date(userData.verified_at), "MMMM dd, yyyy")}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="space-y-4 pt-4">
              <Card>
                <CardHeader className="pb-2 text-blue-600">
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
                        name="currentPassword"
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
                        name="newPassword"
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
                        name="confirmPassword"
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

                      <Button type="submit" className="w-full bg-blue-500">
                        Change Password
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2 text-blue-600">
                  <CardTitle>Account Security</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium">Two-Factor Authentication</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Add an extra layer of security to your account by enabling two-factor authentication.
                      </p>
                      <Button variant="outline" className="mt-2">
                        Enable 2FA
                      </Button>
                    </div>
                    <Separator />
                    <div>
                      <h3 className="text-sm font-medium">Login History</h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        View your recent login activity to ensure your account hasn't been compromised.
                      </p>
                      <Button variant="outline" className="mt-2">
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