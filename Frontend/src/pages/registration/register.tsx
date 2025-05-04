import React, { useState, useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { Stepper, StepperItem, StepperIndicator, StepperTitle, StepperSeparator } from "../../components/ui/stepper"
import { Button } from "../../components/ui/button"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { CheckCircle2 } from "lucide-react"
import { authService } from "../../services/api"
import { useToast } from "../../components/ui/use-toast"

// Import components from your existing file structure
import Phoneno from "./phonenumber/phoneno"
import Personalinfo from "./account/personalinfo"
import Addressinfo from "./account/addressinfo"
import Doctype from "./documents/doctype"
import Uploadtype from "./documents/uploadtype"
import Termsconditions from "../Terms&conditions"
import LenderPersonalinfo from "./lender/info"

// Define types for step data
interface PhoneStepData {
  userType: "lender" | "customer"
  phoneNumber: string
  [key: string]: any
}

interface StepData {
  [key: string]: any
}

const RegistrationPage: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0)
  const [userType, setUserType] = useState<"lender" | "customer" | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { toast } = useToast()

  interface FormDataType {
    phone: { phoneNumber?: string; userType?: "lender" | "customer" } & Record<string, any>
    personal: Record<string, any>
    address: Record<string, any>
    docType: { documentType?: string } & Record<string, any>
    upload: Record<string, any>
    termsAccepted: boolean
  }

  const [formData, setFormData] = useState<FormDataType>({
    phone: {},
    personal: {},
    address: {},
    docType: {},
    upload: {},
    termsAccepted: false,
  })
  const [isNextDisabled, setIsNextDisabled] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const navigate = useNavigate()

  // Current step data with proper typing
  const [currentStepData, setCurrentStepData] = useState<PhoneStepData | StepData | null>(null)

  // Update form data when current step data changes
  useEffect(() => {
    if (currentStepData !== null) {
      const newFormData = { ...formData }

      switch (activeStep) {
        case 0:
          newFormData.phone = currentStepData
          // Set user type based on selection
          if ("userType" in currentStepData) {
            setUserType(currentStepData.userType as "lender" | "customer")
          }
          break
        case 1:
          newFormData.personal = currentStepData
          break
        case 2:
          newFormData.address = currentStepData
          break
        case 3:
          if (userType === "customer") {
            newFormData.docType = currentStepData
          } else {
            // For lender terms acceptance
            newFormData.termsAccepted = currentStepData?.accepted || false
          }
          break
        case 4:
          if (userType === "customer") {
            newFormData.upload = currentStepData
          }
          break
        case 5:
          if (userType === "customer") {
            // For customer terms acceptance
            newFormData.termsAccepted = currentStepData?.accepted || false
          }
          break
      }

      setFormData(newFormData)
      setIsNextDisabled(false)
    }
  }, [currentStepData, activeStep, userType])

  // Reset current step data when active step changes
  useEffect(() => {
    setCurrentStepData(null)
    setIsNextDisabled(true)
  }, [activeStep])

  const handleNext = async () => {
    const maxStep = userType === "lender" ? 3 : 5;

    if (activeStep < maxStep) {
      setActiveStep(activeStep + 1);
    } else {
      // On final step submission
      setIsSubmitting(true);
      
      try {
        // Process uploaded files first if there are any
        let documentUploads: File[] = [];
        if (formData.upload && formData.upload.frontSide && formData.upload.backSide) {
          // Extract files from FileList objects
          const frontFile = formData.upload.frontSide[0];
          const backFile = formData.upload.backSide[0];
          
          if (frontFile && backFile) {
            documentUploads = [frontFile, backFile];
          }
        }
        
        // Format date properly for ISO string
        let formattedDateOfBirth = null;
        if (formData.personal.dateOfBirth) {
          formattedDateOfBirth = formData.personal.dateOfBirth instanceof Date 
            ? formData.personal.dateOfBirth.toISOString().split('T')[0]
            : new Date(formData.personal.dateOfBirth).toISOString().split('T')[0];
        }
        
        // Create full name from first and last name
        const fullName = `${formData.personal.firstName} ${formData.personal.lastName}`;
        
        // Prepare registration data in exact format expected by backend
        const registrationData = {
          email: formData.personal.email,
          password: formData.personal.password,
          phone_number: formData.phone.phoneNumber,
          full_name: fullName,
          role: formData.phone.userType === "customer" ? "borrower" : "lender", 
          terms_accepted: true,
          
          // Optional fields - properly formatted to match backend expectations
          nic_number: formData.personal.nicNumber || null,
          gender: formData.personal.gender || null,
          date_of_birth: formattedDateOfBirth,
          marital_status: formData.personal.maritalStatus || null,
          housing_status: formData.personal.housingStatus || null,
          job_title: formData.personal.jobTitle || null,
          monthly_income: formData.personal.monthlyIncome ? 
            parseFloat(formData.personal.monthlyIncome) : null,
          
          // Format address as expected by the backend
          address: formData.address && Object.keys(formData.address).length > 0 ? {
            province: formData.address.province || "",
            district: formData.address.district || "",
            city: formData.address.city || "",
            address: formData.address.address || "",
            postal_code: formData.address.postalCode || ""
          } : null,
          
          document_type: formData.docType?.documentType || null,
          document_uploads: documentUploads,
          
          // Field for lender only
          business_name: formData.phone.userType === "lender" ? formData.personal.shopName || "" : null
        };
        
        // Log the data being sent
        console.log("Registration data:", registrationData);
        
        // Send the registration request
        const response = await authService.register(registrationData);
        
        toast({
          title: "Registration successful!",
          description: "Your account has been created. Redirecting to login...",
          variant: "default",
        });
        
        setShowSuccess(true);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } catch (error: any) {
        console.error("Registration error:", error);
        
        // Enhanced error handling with better formatting
        let errorMessage = "Registration failed. Please check your information and try again.";
        
        if (error.response?.data?.detail) {
          if (Array.isArray(error.response.data.detail)) {
            // Format validation errors from array
            errorMessage = error.response.data.detail
              .map((err: any) => `${err.loc[1]}: ${err.msg}`)
              .join("\n");
          } else {
            // Single error message
            errorMessage = error.response.data.detail;
          }
        }
        
        toast({
          title: "Registration failed",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {        
        setIsSubmitting(false);
      }
    }
  }

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1)
    }
  }

  // Memoized handleDataChange function to prevent infinite loops
  const handleDataChange = useCallback((data: any) => {
    setCurrentStepData(prevData => {
      // Only update if data has actually changed
      if (JSON.stringify(prevData) !== JSON.stringify(data)) {
        return data;
      }
      return prevData;
    });
  }, []);

  // Handle terms and conditions change specifically
  const handleTermsChange = useCallback((accepted: boolean) => {
    setCurrentStepData({ accepted })
  }, []);

  // Determine if the next button should be disabled
  const isLastStep = userType === "lender" ? activeStep === 3 : activeStep === 5
  const nextButtonDisabled = isNextDisabled || (isLastStep && !formData.termsAccepted)

  // Render the current step component
  const renderCurrentStep = () => {
    switch (activeStep) {
      case 0:
        return <Phoneno onDataChange={handleDataChange} />
      case 1:
       // Use different personal info form based on user type
       return userType === "lender" ? (
        <LenderPersonalinfo onDataChange={handleDataChange} />
      ) : (
        <Personalinfo onDataChange={handleDataChange} />
      )
      case 2:
        return <Addressinfo onDataChange={handleDataChange} />
      case 3:
       // For lender, show terms and conditions
        // For customer, show document type selection
        return userType === "lender" ? (
          <Termsconditions onChange={handleTermsChange} />
        ) : (
          <Doctype onDataChange={handleDataChange} />
        )
      case 4:
        // Only for customer
        return <Uploadtype onDataChange={handleDataChange} docType={formData.docType?.documentType} />
      case 5:
        // Only for customer
        return <Termsconditions onChange={handleTermsChange} />
      default:
        return null
    }
  }

  // Get steps based on user type
  const getSteps = () => {
    if (userType === "lender") {
      return [{ title: "Phone" },  { title: "Personal" }, { title: "Address" }, { title: "Terms" }]
    } else {
      return [
        { title: "Phone" },
        { title: "Personal" },
        { title: "Address" },
        { title: "Document" },
        { title: "Upload" },
        { title: "Terms" },
      ]
    }
  }

  const steps = getSteps()

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 bg-background min-h-screen">
      <h1 className="text-2xl font-bold text-center">Registration</h1>

      {showSuccess && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Registration process done! Redirecting to login page...
          </AlertDescription>
        </Alert>
      )}

      <div className="py-4">
        <Stepper value={activeStep} className="w-full">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <StepperItem step={index} completed={activeStep > index}>
                <StepperIndicator />
                <div className="ml-2">
                  <StepperTitle>{step.title}</StepperTitle>
                </div>
              </StepperItem>
              {index < steps.length - 1 && <StepperSeparator />}
            </React.Fragment>
          ))}
        </Stepper>
      </div>

      <div className="mt-8 p-6 border rounded-lg bg-card">
        {renderCurrentStep()}

        <div className="flex justify-between mt-8">
          {activeStep > 0 && (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}

          <Button className="ml-auto" onClick={handleNext} disabled={nextButtonDisabled || isSubmitting}>
            {isLastStep ? (isSubmitting ? "Submitting..." : "Submit") : "Next"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default RegistrationPage
