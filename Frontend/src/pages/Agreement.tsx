import { useState } from "react"
import { format } from "date-fns"
import { User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

const Agreement = () => {

    const [agreed, setAgreed] = useState<boolean | null>(null)
    const today = format(new Date(), "MMMM dd, yyyy")

    const handleAgree = () => {
      setAgreed(true)
      // In a real app, you would submit the agreement to your backend
      alert("Agreement accepted!")
    }
  
    const handleDisagree = () => {
      setAgreed(false)
      // In a real app, you would handle rejection
      alert("Agreement rejected!")
    }

    type CustomerDetail = {label: string;value: string;span?: number;}
    type LenderDetails = {label: string;value: string;span?: number;}


    const employeeDetails: CustomerDetail[] = [
        { label: "Frist name", value: "Chamod" },
        { label: "Last name", value: "Fernando" },
        { label: "Cutomer id", value: "#256.3565.6656" },
        { label: "Phone No", value: "+94 123456789" },
        { label: "Address", value: "109/8 kagalle hettimulla" },
        { label: "Gender", value: "male" }, 
        { label: "Amount", value: "50000.00" },
        { label: "Tax rate", value: "10%" },
        { label: "No of Installments", value: "10" },
        { label: "Instalment price", value: "5500.00" }, 
    ];
    const lenderDetails: LenderDetails[] = [
        { label: "Name", value: "Sameera furniture" },
        { label: "Address", value: "109/8 kagalle hettimulla" },
    ]

  return (
     <div className="container mx-auto px-4 py-6 max-w-5xl">
      <Card className="shadow-lg">
        <CardHeader className="bg-primary/5 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-2xl font-bold text-blue-600 ">ORDER Agreement</CardTitle>
            <div className="text-sm font-medium border border-gray-300 rounded px-2 py-1">
              Date: {today}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Shop/Vendor Information */}
          <div className="border rounded-lg p-4 flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10">
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full">
                {lenderDetails.map((detail, index) => (
                    <div key={index} className="flex flex-col gap-1">
                    <p className="text-sm text-muted-foreground">{detail.label}:</p>
                    <p className="font-medium">{detail.value}</p>
                    </div>
                ))}
                </div>
          </div>

          {/* Customer Information */}
          <div className="border rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {employeeDetails.map((detail, index) => (

                        <div key={index} className="flex flex-col gap-2">
                            <p className="text-sm text-muted-foreground">{detail.label}:</p>
                            <p className="font-medium">{detail.value}</p>
                        </div>
                    ))}
            </div>
        </div>

          {/* Conditions and Rules */}
          <div>
            <h3 className="text-lg font-medium mb-3">Conditions and rules</h3>
            <ul className="list-disc pl-5 space-y-2 text-sm">
              <li>All payments must be made on or before the due date of each month.</li>
              <li>Late payments will incur a penalty fee of 5% of the installment amount.</li>
              <li>The customer must provide valid identification and contact information.</li>
              <li>Ownership of goods will be transferred only after the full payment is completed.</li>
              <li>Early settlement is allowed with a 2% discount on the remaining balance.</li>
            </ul>
          </div>
        </CardContent>

        <CardFooter className="flex flex-col sm:flex-row gap-4 p-6 pt-0">
          <Button
            className="w-full sm:w-auto flex-1"
            onClick={handleAgree}
            variant={agreed === true ? "default" : "outline"}
          >
            Agree
          </Button>
          <Button
            className="w-full sm:w-auto flex-1"
            onClick={handleDisagree}
            variant={agreed === false ? "destructive" : "outline"}
          >
            Disagree
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default Agreement
