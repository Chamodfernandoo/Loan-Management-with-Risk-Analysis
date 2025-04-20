import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { Eye, EyeOff, LogOut, MapPin, Phone, User, Mail, Edit, Save, X, Shield, ChevronDown, Check} from "lucide-react"

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

// Sample borrower data
const borrowerData = {
  firstName: "Chamod",
  lastName: "Fernando",
  email: "chamud@example.com",
  phoneNumber: "077-3556635",
  dateOfBirth: new Date("1990-12-29"),
  gender: "male",
  nicNumber: "199029102613",
  Job: "Software Engineer",
  income: "50000",
  maritalStatus: "single",
  housingStatus: "rent",
  address: {
    province: "Western Province",
    district: "Kegalle",
    city: "Kegalle",
    address: "Kegalle nethuwall",
    postalCode: "71000",
  },
  documentVerification: {
    status: "verified",
    documentType: "id-card",
    verifiedDate: new Date("2023-01-15"),
  },
  joinedDate: new Date("2023-01-05"),
  profileImage: "/placeholder.svg?height=100&width=100",
  loanStats: {
    activeLoans: 1,
    completedLoans: 2,
    totalBorrowed: 150000,
    currentBalance: 50000,
  },
}

// Form schema for personal info
const personalInfoSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phoneNumber: z.string().min(10, "Phone number must be at least 10 characters"),
  job: z.string().optional(),
  income: z.string().optional(),
  maritalStatus: z.enum(["single", "married", "divorced"], {
    errorMap: () => ({ message: "Please select a marital status" }),
  }),
  housingStatus: z.enum(["own", "rent", "family", "other"], {
    errorMap: () => ({ message: "Please select a housing status" }),
  }),
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

export default function BorrowerProfilePage() {
  const navigate = useNavigate()
  const [isEditing, setIsEditing] = useState(false)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)
  const [passwordChangeSuccess, setPasswordChangeSuccess] = useState(false)
  const [profileUpdateSuccess, setProfileUpdateSuccess] = useState(false)

  // Personal info form
  const personalInfoForm = useForm<z.infer<typeof personalInfoSchema>>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      firstName: borrowerData.firstName,
      lastName: borrowerData.lastName,
      email: borrowerData.email,
      phoneNumber: borrowerData.phoneNumber,
      job: borrowerData.Job,
      income: borrowerData.income,
      maritalStatus: borrowerData.maritalStatus as "single" | "married" | "divorced",
      housingStatus: borrowerData.housingStatus as "own" | "rent" | "family" | "other",
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

  // Handle personal info form submission
  function onPersonalInfoSubmit(values: z.infer<typeof personalInfoSchema>) {
    console.log("Updated personal info:", values)
    // Here you would typically send the data to your backend
    setIsEditing(false)
    setProfileUpdateSuccess(true)
    setTimeout(() => setProfileUpdateSuccess(false), 3000)
  }

  // Handle password change form submission
  function onPasswordSubmit(values: z.infer<typeof passwordSchema>) {
    console.log("Password change:", values)
    // Here you would typically send the data to your backend
    passwordForm.reset()
    setPasswordChangeSuccess(true)
    setTimeout(() => setPasswordChangeSuccess(false), 3000)
  }

  // Handle logout
  function handleLogout() {
    console.log("Logging out...")
    // Here you would typically clear auth tokens, etc.
    navigate("/customer")
  }

  function cn(...inputs: (string | boolean | undefined)[]): string {
    return inputs
      .filter(Boolean)
      .join(" ")
      .trim();
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
    <div className="container py-8 px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold">My Profile</h1>
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Summary Card */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-4">
            <div className="flex flex-col items-center">
              <Avatar className="h-24 w-24 mb-4">
                <AvatarImage
                  src={borrowerData.profileImage}
                  alt={`${borrowerData.firstName} ${borrowerData.lastName}`}
                />
                <AvatarFallback>
                  <User className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl text-center">
                {borrowerData.firstName} {borrowerData.lastName}
              </CardTitle>
              <CardDescription className="text-center">{borrowerData.nicNumber}</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="space-y-3">
              <div className="flex items-center">
                <Badge className="bg-purple-600 hover:bg-purple-700">Borrower</Badge>
                <Badge className="ml-2 bg-blue-600 hover:bg-blue-700">
                  {borrowerData.documentVerification.status === "verified" ? "Verified" : "Unverified"}
                </Badge>
              </div>
              <div className="flex items-center text-sm">
                <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{borrowerData.phoneNumber}</span>
              </div>
              <div className="flex items-center text-sm">
                <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>{borrowerData.email}</span>
              </div>
              <div className="flex items-center text-sm">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>
                  {borrowerData.address.city}, {borrowerData.address.district}
                </span>
              </div>
              <Separator />
              <div className="text-sm text-muted-foreground">
                Member since {format(borrowerData.joinedDate, "MMMM yyyy")}
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
                            name="job"
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
                            name="income"
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
              name="maritalStatus"
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
              name="housingStatus"
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
                          <p>{borrowerData.firstName}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Last Name</h3>
                          <p>{borrowerData.lastName}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                          <p>{borrowerData.email}</p>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Phone Number</h3>
                          <p>{borrowerData.phoneNumber}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Date of Birth</h3>
                          <p>{format(borrowerData.dateOfBirth, "MMMM dd, yyyy")}</p>
                        </div> <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Gender</h3>
                          <p className="capitalize">{borrowerData.gender}</p>
                        </div>
                        <div>
                        <h3 className="text-sm font-medium text-muted-foreground">NIC Number</h3>
                        <p>{borrowerData.nicNumber}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Job</h3>
                        <p>{borrowerData.Job}</p>
                      </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Income</h3>
                        <p>{borrowerData.income}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Marital Status</h3>
                        <p className="capitalize">{borrowerData.maritalStatus}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Housing Status</h3>
                        <p className="capitalize">{borrowerData.housingStatus}</p>
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
                        <p>{borrowerData.address.province}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">District</h3>
                        <p>{borrowerData.address.district}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">City</h3>
                        <p>{borrowerData.address.city}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Postal Code</h3>
                        <p>{borrowerData.address.postalCode}</p>
                      </div>
                      <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                      <p>{borrowerData.address.address}</p>
                    </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full">
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
                          borrowerData.documentVerification.status === "verified"
                            ? "bg-green-600 hover:bg-green-700"
                            : "bg-yellow-600 hover:bg-yellow-700"
                        }
                      >
                        {borrowerData.documentVerification.status === "verified" ? "Verified" : "Pending"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Document Type</h3>
                        <p className="capitalize">{borrowerData.documentVerification.documentType.replace("-", " ")}</p>
                      </div>
                      {borrowerData.documentVerification.status === "verified" && (
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Verified Date</h3>
                          <p>{format(borrowerData.documentVerification.verifiedDate, "MMMM dd, yyyy")}</p>
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