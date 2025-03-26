import { useState } from "react"
import { useRouter } from "next/navigation"
import { Stepper, Step } from "@/components/ui/stepper"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2 } from "lucide-react"

// Import the provided components
import Phoneno from "@/components/registration/phoneno"
import { InputOTPForm } from "@/components/registration/input-otp-form"
import Personalinfo from "@/components/registration/personalinfo"
import Addressinfo from "@/components/registration/addressinfo"
import Doctype from "@/components/registration/doctype"
import Termsconditions from "@/components/registration/termsconditions"

export default function RegistrationPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    phoneData: null,
    otpData: null,
    personalData: null,
    addressData: null,
    docTypeData: null,
    uploadData: null,
    termsAccepted: false,
  })
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()

  const steps = [
    { label: "Phone", component: Phoneno },
    { label: "OTP", component: InputOTPForm },
    { label: "Personal", component: Personalinfo },
    { label: "Address", component: Addressinfo },
    { label: "Document", component: Doctype },
    { label: "Upload", component: Termsconditions },
    { label: "Terms", component: Termsconditions },
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = () => {
    // Show success message
    setShowSuccess(true)

    // Redirect to login page after 2 seconds
    setTimeout(() => {
      router.push("/login")
    }, 2000)
  }

  const handleStepDataChange = (data) => {
    // Update form data based on current step
    const updatedFormData = { ...formData }

    switch (currentStep) {
      case 0:
        updatedFormData.phoneData = data
        break
      case 1:
        updatedFormData.otpData = data
        break
      case 2:
        updatedFormData.personalData = data
        break
      case 3:
        updatedFormData.addressData = data
        break
      case 4:
        updatedFormData.docTypeData = data
        break
      case 5:
        updatedFormData.uploadData = data
        break
      case 6:
        updatedFormData.termsAccepted = data
        break
      default:
        break
    }

    setFormData(updatedFormData)
  }

  // Get current component
  const CurrentStepComponent = steps[currentStep].component
  const isLastStep = currentStep === steps.length - 1

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
        <Stepper value={currentStep} className="w-full">
          {steps.map((step, index) => (
            <Step key={index} description={step.label} />
          ))}
        </Stepper>
      </div>

      <div className="mt-8 p-6 border rounded-lg bg-card">
        <div className="registration-step-content">
          <CurrentStepComponent onStepComplete={handleStepDataChange} formData={formData} onNext={handleNext} />
        </div>

        <div className="flex justify-between mt-8">
          {currentStep > 0 && (
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}

          {!isLastStep ? (
            <Button className="ml-auto" onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button className="ml-auto" onClick={handleSubmit} disabled={!formData.termsAccepted}>
              Submit
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}