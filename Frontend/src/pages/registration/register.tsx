import React from "react"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Stepper, StepperItem, StepperIndicator, StepperTitle, StepperSeparator } from "../../components/ui/stepper"
import { Button } from "../../components/ui/button"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { CheckCircle2 } from "lucide-react"

// Import components from your existing file structure
import Phoneno from "./phonenumber/phoneno"
import { InputOTPForm } from "./phonenumber/otp"
import Personalinfo from "./account/personalinfo"
import Addressinfo from "./account/addressinfo"
import Doctype from "./documents/doctype"
import Uploadtype from "./documents/uploadtype"
import Termsconditions from "../Terms&conditions"

export default function RegistrationPage() {
  const [activeStep, setActiveStep] = useState(0)
  interface FormDataType {
    phone: { phoneNumber?: string } & Record<string, any>;
    otp: Record<string, any>;
    personal: Record<string, any>;
    address: Record<string, any>;
    docType: { documentType?: string } & Record<string, any>;
    upload: Record<string, any>;
    termsAccepted: boolean;
  }

  const [formData, setFormData] = useState<FormDataType>({
    phone: {},
    otp: {},
    personal: {},
    address: {},
    docType: {},
    upload: {},
    termsAccepted: false,
  })
  const [isNextDisabled, setIsNextDisabled] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const navigate = useNavigate()

  // Current step data
  const [currentStepData, setCurrentStepData] = useState(null)

  // Update form data when current step data changes
  useEffect(() => {
    if (currentStepData !== null) {
      const newFormData = { ...formData }

      switch (activeStep) {
        case 0:
          newFormData.phone = currentStepData
          break
        case 1:
          newFormData.otp = currentStepData
          break
        case 2:
          newFormData.personal = currentStepData
          break
        case 3:
          newFormData.address = currentStepData
          break
        case 4:
          newFormData.docType = currentStepData
          break
        case 5:
          newFormData.upload = currentStepData
          break
        case 6:
          newFormData.termsAccepted = currentStepData
          break
      }

      setFormData(newFormData)
      setIsNextDisabled(false)
    }
  }, [currentStepData, activeStep])

  // Reset current step data when active step changes
  useEffect(() => {
    setCurrentStepData(null)
    setIsNextDisabled(true)
  }, [activeStep])

  const handleNext = () => {
    if (activeStep < 6) {
      setActiveStep(activeStep + 1)
    } else {
      // On final step submission
      setShowSuccess(true)

      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate("/login")
      }, 2000)
    }
  }

  const handleBack = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1)
    }
  }

  const handleDataChange = (data: any) => {
    setCurrentStepData(data)
  }

  // Determine if the next button should be disabled
  const isLastStep = activeStep === 6
  const nextButtonDisabled = isNextDisabled || (isLastStep && !formData.termsAccepted)

  // Render the current step component
  const renderCurrentStep = () => {
    switch (activeStep) {
      case 0:
        return <Phoneno onDataChange={handleDataChange} />
      case 1:
        return <InputOTPForm onDataChange={handleDataChange} phoneNumber={formData.phone?.phoneNumber} />
      case 2:
        return <Personalinfo onDataChange={handleDataChange} />
      case 3:
        return <Addressinfo onDataChange={handleDataChange} />
      case 4:
        return <Doctype onDataChange={handleDataChange} />
      case 5:
        return <Uploadtype onDataChange={handleDataChange} docType={formData.docType?.documentType} />
      case 6:
        return <Termsconditions onChange={handleDataChange} />
      default:
        return null
    }
  }

  const steps = [
    { title: "Phone" },
    { title: "OTP" },
    { title: "Personal" },
    { title: "Address" },
    { title: "Document" },
    { title: "Upload" },
    { title: "Terms" },
  ]

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8 bg-background min-h-screen">
      <h1 className="text-2xl font-bold text-center text-blue-700">Registration</h1>

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

          <Button className="ml-auto" onClick={handleNext} >
            {isLastStep ? "Submit" : "Next"}
          </Button>
        </div>
      </div>
    </div>
  )
}