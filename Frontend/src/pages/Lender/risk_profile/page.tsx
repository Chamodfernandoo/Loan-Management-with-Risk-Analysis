import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormLabel, FormControl } from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { loanService, riskService } from "@/services/api";

interface CustomerData {
  age: string;
  gender: string;
  maritalStatus: string;
  housingStatus: string;
  job: string;
  monthlyIncome: string;
  province: string;
  city: string;
  noOfPreviousLoans: string;
  noOfAvailableLoans: string;
  noOfOnTimePayments: string;
  noOfLatePayments: string;
}

const defaultValues: CustomerData = {
  age: "",
  gender: "",
  maritalStatus: "",
  housingStatus: "",
  job: "",
  monthlyIncome: "",
  province: "",
  city: "",
  noOfPreviousLoans: "",
  noOfAvailableLoans: "",
  noOfOnTimePayments: "",
  noOfLatePayments: "",
};

const RiskProfilePage: React.FC = () => {
  const [customerId, setCustomerId] = useState<string>("");
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [riskLevel, setRiskLevel] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string>("");
  const { toast } = useToast();

  const form = useForm<CustomerData>({
    defaultValues,
  });

  const handleSearch = async () => {
    if (!customerId.trim()) {
      setSearchError("Please enter a NIC number");
      return;
    }

    setIsLoading(true);
    setSearchError("");

    try {
      // Search for customer using the borrowers API
      const borrowerData = await loanService.searchCustomerByNIC(customerId);
      
      // Map the API response to our form data structure
      const formData: CustomerData = {
        age: borrowerData.date_of_birth ? calculateAge(borrowerData.date_of_birth).toString() : "",
        gender: borrowerData.gender || "",
        maritalStatus: borrowerData.marital_status || "",
        housingStatus: borrowerData.housing_status || "",
        job: borrowerData.job_title || "",
        monthlyIncome: borrowerData.monthly_income ? borrowerData.monthly_income.toString() : "",
        province: borrowerData.address?.province || "",
        city: borrowerData.address?.city || "",
        noOfPreviousLoans: "0",
        noOfAvailableLoans: "0",
        noOfOnTimePayments: "0",
        noOfLatePayments: "0"
      };

      // Try to get loan statistics if available
      try {
        if (borrowerData.id) {
          // Get loan data for this borrower if available
          const loans = await loanService.getCustomerLoansByNIC(customerId);
          if (loans && Array.isArray(loans)) {
            formData.noOfPreviousLoans = loans.length.toString();
            // Count active loans
            const activeLoans = loans.filter(loan => 
              loan.orderState === "pending" || loan.orderState === "partial_paid"
            ).length;
            formData.noOfAvailableLoans = activeLoans.toString();
            
            // Count payments
            let onTimePayments = 0;
            let latePayments = 0;
            
            // Try to fetch and process payment data for each loan
            for (const loan of loans) {
              try {
                if (loan.id) {
                  console.log(`Fetching payments for loan ${loan.id}`);
                  const payments = await loanService.getLoanPayments(loan.id);
                  
                  if (payments && Array.isArray(payments)) {
                    onTimePayments += payments.filter(p => 
                      p.status === "COMPLETED" || p.status === "completed"
                    ).length;
                    
                    latePayments += payments.filter(p => 
                      ["LATE", "MISSED", "late", "missed"].includes(p.status || "")
                    ).length;
                  }
                }
              } catch (error) {
                console.error(`Error fetching payments for loan ${loan.id}:`, error);
                // Continue with other loans even if one fails
              }
            }
            
            formData.noOfOnTimePayments = onTimePayments.toString();
            formData.noOfLatePayments = latePayments.toString();
          }
        }
      } catch (error) {
        console.error("Error fetching loan data:", error);
        toast({
          title: "Warning",
          description: "Found customer but couldn't retrieve complete loan history.",
          variant: "warning",
        });
        // Continue with the borrower data we have
      }

      // Reset the form with the new data
      form.reset(formData);
      
      toast({
        title: "Customer Found",
        description: "Customer data has been loaded successfully.",
      });
    } catch (error) {
      console.error("Error searching for customer:", error);
      setSearchError("Customer not found or error occurred during search");
      toast({
        title: "Error",
        description: "Failed to find customer with the provided NIC number.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: CustomerData) => {
    setIsLoading(true);
    try {
      // Format the data for risk analysis
      const riskData = {
        borrower_id: customerId, // Using NIC as identifier
        age: parseInt(data.age) || 0,
        gender: data.gender,
        marital_status: data.maritalStatus,
        job: data.job,
        monthly_income: parseFloat(data.monthlyIncome) || 0,
        housing_status: data.housingStatus,
        district: data.province, // Using province as district
        city: data.city,
        no_of_previous_loans: parseInt(data.noOfPreviousLoans) || 0,
        no_of_available_loans: parseInt(data.noOfAvailableLoans) || 0,
        total_on_time_payments: parseInt(data.noOfOnTimePayments) || 0,
        total_late_payments: parseInt(data.noOfLatePayments) || 0,
      };

      // Save the risk analysis data
      const result = await riskService.analyzeRisk(riskData);
      
      // Set the risk level from the response
      setRiskLevel(result.risk_level.toUpperCase());
      setIsDialogOpen(true);

      toast({
        title: "Risk Analysis Complete",
        description: "The borrower risk profile has been analyzed.",
      });
    } catch (error) {
      console.error("Error submitting risk data:", error);
      toast({
        title: "Error",
        description: "Failed to process the risk analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <Card className="mx-auto my-6 max-w-3xl">
      <CardHeader>
        <CardTitle className="text-blue-500 font-bold">Borrower profile risk level</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex mb-4 space-x-2">
          <Input
            placeholder="Enter customer NIC number"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          />
          <Button 
            onClick={handleSearch} 
            className="bg-blue-500"
            disabled={isLoading}
          >
            {isLoading ? "Searching..." : "Search"}
          </Button>
        </div>
        
        {searchError && (
          <div className="text-red-500 mb-4">
            {searchError}
          </div>
        )}
        
        <div className="my-8">
            <p className="text-lg">Please submit data for risk profile analysis</p>
        </div>

        <Form {...form}>  
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid sm:grid-cols-2  gap-4">
              <FormField
                control={form.control}
                name="age"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Age</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="gender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maritalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marital Status</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="housingStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Housing Status</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="job"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="monthlyIncome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Monthly Income</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="province"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Province</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="noOfPreviousLoans"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No of Previous Loans</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="noOfAvailableLoans"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No of Available Loans</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="noOfOnTimePayments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No of On-Time Payments</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="noOfLatePayments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No of Late Payments</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <Button type="submit" className="w-full bg-blue-500" disabled={isLoading}>
              {isLoading ? "Analyzing..." : "Submit"}
            </Button>
          </form>
        </Form>
      </CardContent>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Risk Level</DialogTitle>
            <DialogDescription>
              This person's profile has been analyzed. The result is given
              below.
            </DialogDescription>
          </DialogHeader>

          <div className="py-6 flex justify-center">
            <Badge className={`px-4 py-2 text-lg font-semibold ${
              riskLevel === "HIGH"
                ? "bg-red-200 text-red-800"
                : riskLevel === "MEDIUM"
                ? "bg-yellow-200 text-yellow-800"
                : "bg-green-200 text-green-800"
            }`}>{riskLevel}</Badge>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </Card>
  );
};

export default RiskProfilePage;