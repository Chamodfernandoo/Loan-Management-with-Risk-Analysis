import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { QrCode, Search, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { loanService } from "@/services/api";
import QrScanner from "@/components/QrScanner";

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
  collatral_file: z.string().optional(),
  installments: z.string().min(1, "Number of installments is required"),
  taxRate: z.string().min(1, "Tax rate is required"),
  installmentPrice: z.string().min(1, "Installment price is required"),
});

type FormValues = z.infer<typeof formSchema>;

export default function CreateLoanPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSearching, setIsSearching] = useState(false);
  const [nic, setNic] = useState("");
  const [customerNotFound, setCustomerNotFound] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
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
      collatral_file: "",
      installments: "",
      taxRate: "10", // Default tax rate 10%
      installmentPrice: "",
    },
  });

  // Update calculations when amount, tax rate or installments change
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'amount' || name === 'taxRate' || name === 'installments') {
        calculateInstallment();
      }
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  const calculateInstallment = async () => {
    const amount = form.getValues('amount');
    const taxRate = form.getValues('taxRate');
    const installments = form.getValues('installments');

    if (amount && taxRate && installments) {
      setIsCalculating(true);
      try {
        const result = await loanService.calculateLoanDetails(
          parseFloat(amount),
          parseFloat(taxRate),
          parseFloat(installments)
        );
        form.setValue('installmentPrice', result.installmentPrice.toString());
      } catch (error) {
        console.error("Error calculating installment:", error);
      } finally {
        setIsCalculating(false);
      }
    }
  };

  const handleSearch = async () => {
    if (!nic) return;
    
    setIsSearching(true);
    setCustomerNotFound(false);
    
    try {
      const customerData = await loanService.searchCustomerByNIC(nic);
      if (customerData) {
        populateFormWithCustomerData(customerData);
        
        toast({
          title: "Customer found",
          description: "Customer information has been loaded.",
        });
      }
    } catch (error) {
      console.error("Error searching customer:", error);
      setCustomerNotFound(true);
      toast({
        title: "Customer not found",
        description: "No customer found with this NIC. Please check the NIC number.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const populateFormWithCustomerData = (customerData: any) => {
    // Format date of birth if available
    const dob = customerData.date_of_birth ? 
      format(new Date(customerData.date_of_birth), 'yyyy-MM-dd') : '';
    
    // Format address
    const addressStr = customerData.address ? 
      `${customerData.address.address}, ${customerData.address.city}, ${customerData.address.district}` : '';
    
    form.setValue("name", customerData.full_name);
    form.setValue("idNumber", customerData.nic_number);
    form.setValue("dob", dob);
    form.setValue("phoneNumber", customerData.phone_number);
    form.setValue("gender", customerData.gender || '');
    form.setValue("address", addressStr);
  };

  const handleQRScan = () => {
    setIsQrScannerOpen(true);
  };

  const handleQrScanResult = async (data: any) => {
    try {
      // Check if we have a userId in the scanned data
      if (data && data.userId) {
        toast({
          title: "QR Code Scanned",
          description: "Fetching customer details...",
        });

        // First try to get customer by user ID
        try {
          const customerData = await loanService.searchCustomerByUserId(data.userId);
          if (customerData && customerData.nic_number) {
            // Set the NIC in the search field
            setNic(customerData.nic_number);
            // Populate form with customer data
            populateFormWithCustomerData(customerData);
            toast({
              title: "Customer found",
              description: "Customer information has been loaded from QR code.",
            });
          }
        } catch (error) {
          // If user ID search fails, try to use other data from QR code
          console.error("Error searching by user ID, trying with other data:", error);
          
          // If QR contains phone number, we can try to fetch by phone too
          if (data.phone) {
            toast({
              title: "Searching by phone number",
              description: "Could not find by ID, trying alternative search...",
            });
            // This would require a backend endpoint to search by phone
            // For now, just alert the user to manually search
            toast({
              title: "Manual search required",
              description: "Please enter the NIC number manually and search.",
              variant: "destructive"
            });
          }
        }
      } else {
        toast({
          title: "Invalid QR code",
          description: "The scanned QR code does not contain valid customer information.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error processing QR data:", error);
      toast({
        title: "Error processing QR code",
        description: "Could not process the scanned QR code data.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true);
    
    try {
      console.log("Preparing loan data for submission...");
      // Prepare loan data for API
      const loanData = {
        borrower_nic: data.idNumber,
        amount: parseFloat(data.amount),
        interest_rate: parseFloat(data.taxRate),
        term_months: parseInt(data.installments),
        purpose: data.description,
        lender_name: data.loan_name,
        customer_name: data.name,
        customer_phone: data.phoneNumber,
        customer_address: data.address,
        installment_amount: parseFloat(data.installmentPrice),
        // Add gender field with the correct name
        customer_gender: data.gender
      };
      
      console.log("Submitting loan data:", loanData);
      // Create loan
      const createdLoan = await loanService.createLoan(loanData);
      
      toast({
        title: "Loan created successfully",
        description: "A notification has been sent to the borrower about the new loan offer.",
      });
      
      // Navigate to agreement page with loan data
      navigate('/agreement', { 
        state: { 
          loanId: createdLoan._id,
          loanDetails: {
            ...loanData,
            installment_amount: parseFloat(data.installmentPrice),
            customer_gender: data.gender // Ensure gender is included
          }
        }
      });
    } catch (error) {
      console.error("Error creating loan:", error);
      toast({
        title: "Error creating loan",
        description: "There was an error creating the loan. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
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
        <Button 
          onClick={handleSearch} 
          disabled={isSearching} 
          className="bg-blue-500"
        >
          {isSearching ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Searching...
            </>
          ) : (
            <>
              <Search className="mr-1" />
              Search
            </>
          )}
        </Button>
        <Button variant="outline" onClick={handleQRScan} className="bg-blue-400">
          <QrCode className="mr-1" />
          Scan QR
        </Button>
      </div>

      {customerNotFound && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-md mb-6">
          No customer found with this NIC. Please check the NIC number.
        </div>
      )}

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Create Loan</CardTitle>
          <p className="text-sm text-muted-foreground">Please search or scan QR to create a new loan.</p>
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
                  <FormControl><Input placeholder="Enter amount" type="number" {...field}/></FormControl>
                  <FormMessage/>
                </FormItem>
              )} />

              <FormField control={form.control} name="description" render={({ field })=> (
                <FormItem>
                  <FormLabel>Description/collatral info</FormLabel>
                  <FormControl><Textarea placeholder="Loan purpose" {...field}/></FormControl>
                  <FormMessage/>
                </FormItem>
              )} />

                

              <FormField control={form.control} name="installments" render={({ field })=> (
                <FormItem>
                  <FormLabel>No. of Installments</FormLabel>
                  <FormControl><Input placeholder="Enter installments" type="number" {...field}/></FormControl>
                  <FormMessage/>
                </FormItem>
              )} />

              <FormField control={form.control} name="taxRate" render={({ field })=> (
                <FormItem>
                  <FormLabel>Tax Rate (%)</FormLabel>
                  <FormControl><Input placeholder="Enter tax rate" type="number" {...field}/></FormControl>
                  <FormMessage/>
                </FormItem>
              )} />

              <FormField control={form.control} name="installmentPrice" render={({ field })=> (
                <FormItem>
                  <FormLabel>Installment Price</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input placeholder="Calculated price" {...field} readOnly/>
                      {isCalculating && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage/>
                </FormItem>
              )} />

              {/* Action Buttons */}
              <div className="flex space-x-4 pt-4">
                <Button 
                  type="submit" 
                  className="flex-1"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Loan"
                  )}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1" 
                  onClick={()=>form.reset()}
                >
                  Reset
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* QR Scanner Component */}
      <QrScanner 
        isOpen={isQrScannerOpen} 
        onClose={() => setIsQrScannerOpen(false)}
        onScanResult={handleQrScanResult}
      />
    </div>
  );
}
