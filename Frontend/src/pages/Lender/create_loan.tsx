import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { QrCode, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

// Schema for loan creation
const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  idNumber: z.string().min(1, "NIC is required"),
  dob: z.string().min(1, "Date of birth is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  gender: z.string().min(1, "Gender is required"),
  address: z.string().min(1, "Address is required"),
  loanCreatedDate: z.string(),
  amount: z.string().min(1, "Amount is required"),
  loan_name: z.string().min(1, "Lender name is required"),
  description: z.string().min(1, "Description is required"),
  installments: z.string().min(1, "Number of installments is required"),
  taxRate: z.string().min(1, "Tax rate is required"),
  installmentPrice: z.string().min(1, "Installment price is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateLoanPage() {
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const [nic, setNic] = useState("");
  const today = format(new Date(), "yyyy-MM-dd");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      idNumber: "",
      dob: "",
      phoneNumber: "",
      gender: "",
      address: "",
      loanCreatedDate: today,
      loan_name: "",
      amount: "",
      description: "",
      installments: "",
      taxRate: "",
      installmentPrice: "",
    },
  });

  const handleSearch = () => {
    if (!nic) return;
    setIsSearching(true);
    setTimeout(() => {
      form.setValue("name", "Alice Smith");
      form.setValue("idNumber", nic);
      form.setValue("dob", "1990-05-15");
      form.setValue("phoneNumber", "+94 771234567");
      form.setValue("gender", "Female");
      form.setValue("address", "123 Main St, Colombo");
      setIsSearching(false);
    }, 1000);
  };

  const handleQRScan = () => alert("Open QR scanner to read NIC");

  const onSubmit = (data: FormValues) => {
    console.log("Submitting loan:", data);
    navigate(-1);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button variant="outline" className="mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      {/* Search / QR Section */}
      <div className="flex items-center space-x-2 mb-6">
        <Input
          placeholder="Enter NIC number"
          value={nic}
          onChange={(e) => setNic(e.target.value)}
        />
        <Button onClick={handleSearch} disabled={isSearching} className="bg-blue-500">
          {isSearching ? "Searching..." : <><Search className="mr-1" />Search</>}
        </Button>
        <Button variant="outline" onClick={handleQRScan} className="bg-blue-400">
          <QrCode className="mr-1" />Scan QR
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Create Loan</CardTitle>
          <p className="text-sm text-muted-foreground">please search or scan QR for create a new loan.</p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {/* Readonly Customer Fields in 2-columns */}
              <div className="grid grid-cols-2 gap-4">
                {(["name","idNumber","dob","phoneNumber","gender","address"] as const).map((fieldName) => (
                  <FormField
                    key={fieldName}
                    control={form.control}
                    name={fieldName}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{
                          fieldName==="idNumber"?"NIC":fieldName==="dob"?"Date of Birth":fieldName.charAt(0).toUpperCase()+fieldName.slice(1)
                        }</FormLabel>
                        <FormControl>
                          <Input {...field} readOnly />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>

              {/* Loan Created Date */}
              <FormField
                control={form.control}
                name="loanCreatedDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Loan Created Date</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Manual Input Fields */}

              <FormField control={form.control} name="loan_name" render={({ field })=> (
                <FormItem>
                  <FormLabel>Lender Name/Shop Name</FormLabel>
                  <FormControl><Input placeholder="Enter shop name or lender name" {...field}/></FormControl>
                  <FormMessage/>
                </FormItem>
              )} />

              <FormField control={form.control} name="amount" render={({ field })=> (
                <FormItem>
                  <FormLabel>Loan Amount</FormLabel>
                  <FormControl><Input placeholder="Enter amount" {...field}/></FormControl>
                  <FormMessage/>
                </FormItem>
              )} />

              <FormField control={form.control} name="description" render={({ field })=> (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl><Textarea placeholder="Loan purpose" {...field}/></FormControl>
                  <FormMessage/>
                </FormItem>
              )} />

              <FormField control={form.control} name="installments" render={({ field })=> (
                <FormItem>
                  <FormLabel>No. of Installments</FormLabel>
                  <FormControl><Input placeholder="Enter installments" {...field}/></FormControl>
                  <FormMessage/>
                </FormItem>
              )} />

              <FormField control={form.control} name="taxRate" render={({ field })=> (
                <FormItem>
                  <FormLabel>Tax Rate (%)</FormLabel>
                  <FormControl><Input placeholder="Enter tax rate" {...field}/></FormControl>
                  <FormMessage/>
                </FormItem>
              )} />

              <FormField control={form.control} name="installmentPrice" render={({ field })=> (
                <FormItem>
                  <FormLabel>Installment Price</FormLabel>
                  <FormControl><Input placeholder="Calculated price" {...field}/></FormControl>
                  <FormMessage/>
                </FormItem>
              )} />

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <Button type="submit" className="flex-1">Create Loan</Button>
                <Button type="button" variant="outline" className="flex-1" onClick={()=>form.reset()}>Reset</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
