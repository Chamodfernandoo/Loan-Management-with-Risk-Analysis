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

  const form = useForm<CustomerData>({
    defaultValues,
  });

  const handleSearch = () => {
    // TODO: replace with real API fetch
    const mockData: CustomerData = {
      age: "45",
      gender: "Male",
      maritalStatus: "Married",
      housingStatus: "Own",
      job: "Engineer",
      monthlyIncome: "80000",
      province: "Central",
      city: "Kandy",
      noOfPreviousLoans: "2",
      noOfAvailableLoans: "1",
      noOfOnTimePayments: "10",
      noOfLatePayments: "1",
    };
    form.reset(mockData);
  };

  const onSubmit = (data: CustomerData) => {
    // TODO: send data to ML endpoint
    console.log("Submitting data:", data);
    const result = "High"; // or derive from response
    setRiskLevel(result);
    setIsDialogOpen(true);
  };

  return (
    <Card className="mx-auto my-6 max-w-3xl">
      <CardHeader>
        <CardTitle className="text-blue-500 font-bold">Borrower profile risk level</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex mb-4 space-x-2">
          <Input
            placeholder="Enter customer ID"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
          />
          <Button onClick={handleSearch} className="bg-blue-500">Search</Button>
        </div>
        <div className="my-8">
            <p className="text-lg">please submit data for analyse profile</p>
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
            <Button type="submit" className="w-full bg-blue-500">
              Submit
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
              riskLevel === "High"
                ? "bg-red-200 text-red-800"
                : riskLevel === "Medium"
                ? "bg-yellow-200 text-yellow-800"
                : "bg-green-200 text-green-800"
            }`}>{riskLevel}</Badge>
          </div>

          <DialogFooter>
            <DialogClose>Close</DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </Card>
  );
};

export default RiskProfilePage;