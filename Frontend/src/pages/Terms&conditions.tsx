import { useState } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"

interface TermsConditionsProps {
  onChange?: (accepted: boolean) => void
}

const Termsconditions = ({ onChange }: TermsConditionsProps) => {
  const [accepted, setAccepted] = useState(false)

  const handleChange = (checked: boolean) => {
    setAccepted(checked)
    if (onChange) {
      onChange(checked)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-blue-600 mb-4">Terms and Conditions</h2>
        <p className="text-slate-600 mb-4">
          Please read and accept our terms and conditions to complete your registration.
        </p>
      </div>

      <ScrollArea className="h-64 rounded-md border p-4">
        <div className="space-y-4 text-sm text-slate-700">
          <h3 className="font-medium">1. Introduction</h3>
          <p>
            Welcome to PAYME. These Terms and Conditions govern your use of our platform and services. By accessing or
            using our services, you agree to be bound by these Terms.
          </p>

          <h3 className="font-medium">2. Definitions</h3>
          <p>
            "Service" refers to the PAYME platform and all related services. "User" refers to any individual who
            accesses or uses our Service. "Agreement" refers to these Terms and Conditions.
          </p>

          <h3 className="font-medium">3. Account Registration</h3>
          <p>
            To use our Service, you must register for an account. You agree to provide accurate, current, and complete
            information during the registration process and to update such information to keep it accurate, current, and
            complete.
          </p>

          <h3 className="font-medium">4. Privacy Policy</h3>
          <p>
            Your privacy is important to us. Our Privacy Policy describes how we collect, use, and disclose information
            about you. By using our Service, you consent to the collection, use, and disclosure of your information as
            described in our Privacy Policy.
          </p>

          <h3 className="font-medium">5. User Responsibilities</h3>
          <p>
            You are responsible for maintaining the confidentiality of your account credentials and for all activities
            that occur under your account. You agree to notify us immediately of any unauthorized use of your account or
            any other breach of security.
          </p>

          <h3 className="font-medium">6. Service Usage</h3>
          <p>
            You agree to use our Service only for lawful purposes and in accordance with these Terms. You agree not to
            use our Service in any way that could damage, disable, overburden, or impair our Service or interfere with
            any other party's use of our Service.
          </p>

          <h3 className="font-medium">7. Termination</h3>
          <p>
            We reserve the right to terminate or suspend your account and access to our Service at our sole discretion,
            without notice, for conduct that we believe violates these Terms or is harmful to other users of our
            Service, us, or third parties, or for any other reason.
          </p>

          <h3 className="font-medium">8. Changes to Terms</h3>
          <p>
            We reserve the right to modify these Terms at any time. We will provide notice of any material changes to
            these Terms by posting the updated Terms on our website or through other communications.
          </p>

          <h3 className="font-medium">9. Contact Information</h3>
          <p>If you have any questions about these Terms, please contact us at support@payme.com.</p>
        </div>
      </ScrollArea>

      <div className="flex items-center space-x-2">
        <Checkbox id="terms" checked={accepted} onCheckedChange={(checked) => handleChange(checked as boolean)} />
        <Label
          htmlFor="terms"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          I have read and agree to the terms and conditions
        </Label>
      </div>
    </div>
  )
}

export default Termsconditions
