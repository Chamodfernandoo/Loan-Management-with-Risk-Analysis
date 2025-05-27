import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  ArrowLeft,
  MessageSquare,
  Phone,
  Mail,
  FileQuestion,
  ChevronDown,
  ChevronUp,
  FileText,
  WrenchIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"

// Form schema for contact form
const contactFormSchema = z.object({
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  category: z.string().min(1, "Please select a category"),
  message: z.string().min(20, "Message must be at least 20 characters"),
  attachments: z.any().optional(),
})
interface Term {
    title: string;
    content: string[];
  }

// FAQ data
const faqData = [
  {
    question: "How do I create a new loan?",
    answer:
      "To create a new loan, navigate to the 'Create Loan' section from your dashboard. Fill in the required customer information, loan amount, interest rate, and installment details. Review the information and submit the form to generate a loan agreement.",
  },
  {
    question: "How can I track payments from borrowers?",
    answer:
      "You can track all payments from borrowers in the 'View Loan' section. Each loan has a detailed payment history showing paid, pending, and overdue installments. You can also generate payment reports for specific time periods.",
  },
  {
    question: "What should I do if a borrower misses a payment?",
    answer:
      "If a borrower misses a payment, the system will automatically mark it as overdue. You can send a payment reminder through the platform. If the issue persists, you can contact the borrower directly or use the built-in communication tools to discuss a payment plan.",
  },
  {
    question: "How do I update my business information?",
    answer:
      "To update your business information, go to 'My Profile' from the dashboard. Click on the 'Edit' button in the Personal Information section. Make the necessary changes and save your updates. For business registration changes, you may need to provide additional documentation.",
  },
  {
    question: "Can I customize loan agreement templates?",
    answer:
      "Yes, you can customize loan agreement templates. Go to 'Loan Agreements' from your dashboard, then select 'Manage Templates'. You can modify existing templates or create new ones. Make sure all customized templates comply with local regulations.",
  },
  {
    question: "How do I create and manage advertisements?",
    answer:
      "To create and manage advertisements, navigate to the 'Advertisements' section from your dashboard. Click on 'Create Ad' to set up a new advertisement with your business details, loan offerings, and contact information. You can edit, pause, or delete your ads from the 'My Ads' section.",
  },
]
const terms: Term[] = [
    {
      title: "1. Introduction",
      content: [
        "Welcome to PAYME ( By using our platform, you agree to comply with these Terms and Conditions. Please read them carefully before proceeding."
      ]
    },
    {
      title: "2. Eligibility",
      content: [
        "Users must be at least 18 years old or have legal authorization to enter into financial agreements.",
        "Loan providers must be registered and authorized financial entities."
      ]
    },
    {
      title: "3. User Responsibilities",
      content: [
        "Borrowers are responsible for repaying loans as per the agreed terms.",
        "Lenders must ensure transparency in loan terms, interest rates, and repayment conditions.",
        "Users must not engage in fraudulent activities or misrepresent their financial information."
      ]
    },
    {
      title: "4. Loan Transactions and Payments",
      content: [
        "All loan agreements are between the borrower and the lender. The platform facilitates management but does not provide loans.",
        "Payments can be made online via the supported payment gateways or manually through the lender.",
        "Late payments may incur additional interest or penalties as per the lender's policy."
      ]
    },
      {
          title: "5. QR Code-Based Loan Verification",
          content: [
          "Every transaction is verified using a unique QR code assigned to each customer.",
          "Lenders can only update loan statuses when the customer is physically present to scan the QR code."
          ]
      },
      {
          title: "6. Privacy Policy",
          content: [
          "We collect and store customer data securely in compliance with data protection laws",
          "User data will only be shared with authorized lenders upon consent.",
          "Unauthorized access, misuse, or sharing of customer data is strictly prohibited."
          ]
      },
      {
          title: "7. Dispute Resolution",
          content: [
          "Any disputes between borrowers and lenders must be resolved directly.",
          "The platform is not liable for any financial losses or disputes arising from loan agreements."
          ]
      },
      {
          title: "8.  Loan Risk Analysis and Credit Assessment",
          content: [
          "The platform may use AI-based models to analyze customer credit risk.",
          "Risk scores are generated based on historical payment data but do not guarantee approval or denial of loans."
          ]
      },
  ];


export default function LenderSupportPage() {
  const navigate = useNavigate()
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("faq")


  // Contact form
  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      subject: "",
      category: "",
      message: "",
    },
  })

  // Handle contact form submission
  function onSubmit(values: z.infer<typeof contactFormSchema>) {
    console.log(values)
    // Here you would typically send the form data to your backend
    alert("Your support request has been submitted. We'll get back to you soon!")
    form.reset()
  }

  // Toggle FAQ expansion
  const toggleFaq = (index: number) => {
    if (expandedFaq === index) {
      setExpandedFaq(null)
    } else {
      setExpandedFaq(index)
    }
  }


  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
      <div className="flex items-center mb-6">
        <Button variant="outline" className="mr-4" onClick={() => navigate("/lender")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">Lender Support Center</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Sidebar - Contact Options */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="h-full">
            <CardHeader className="pb-3 text-blue-600">
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>We're here to help with your lending business</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-primary mr-3" />
                <div>
                  <p className="font-medium">Phone Support</p>
                  <p className="text-sm text-muted-foreground">077-123-4567</p>
                  <p className="text-xs text-muted-foreground">Mon-Fri, 9AM-5PM</p>
                </div>
              </div>
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-primary mr-3" />
                <div>
                  <p className="font-medium">Email Support</p>
                  <p className="text-sm text-muted-foreground">lender-support@example.com</p>
                  <p className="text-xs text-muted-foreground">24-48 hour response time</p>
                </div>
              </div>
              <div className="flex items-center">
                <MessageSquare className="h-5 w-5 text-primary mr-3" />
                <div>
                  <p className="font-medium">Live Chat</p>
                  <p className="text-sm text-muted-foreground">Available now</p>
                  <p className="text-xs text-muted-foreground">Instant support for quick questions</p>
                </div>
              </div>
              <div className="flex items-center">
                 <WrenchIcon className="h-5 w-5 text-primary mr-3" />
                    <div>
                    <p className="font-medium">Terms & Conditions</p>
                    <p className="text-sm text-muted-foreground">Watch now</p>
                    <p className="text-xs text-muted-foreground">You can watch and read Again,and Get Idea</p>
                    </div>
                </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="faq">
                <FileQuestion className="h-4 w-4 mr-2 hidden sm:inline" />
                FAQs
              </TabsTrigger>
              <TabsTrigger value="tickets">
                <FileText className="h-4 w-4 mr-2 hidden sm:inline" />
                Support Request
              </TabsTrigger>
              <TabsTrigger value="chat">
              <WrenchIcon className="h-4 w-4 mr-2 hidden sm:inline" />
                Terms & Conditions
              </TabsTrigger>
            </TabsList>

            {/* FAQ Tab */}
            <TabsContent value="faq" className="space-y-6">
              <Card>
                <CardHeader className="pb-3 text-blue-600">
                  <CardTitle>Frequently Asked Questions</CardTitle>
                  <CardDescription>Find quick answers to common questions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {faqData.map((faq, index) => (
                    <div key={index} className="border rounded-lg overflow-hidden">
                      <button
                        className="w-full flex justify-between items-center p-4 text-left font-medium hover:bg-gray-50"
                        onClick={() => toggleFaq(index)}
                      >
                        <span>{faq.question}</span>
                        {expandedFaq === index ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </button>
                      {expandedFaq === index && (
                        <div className="p-4 pt-0 text-muted-foreground border-t">{faq.answer}</div>
                      )}
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <p className="text-sm text-muted-foreground">Can't find what you're looking for?</p>
                  <Button variant="outline" onClick={() => setActiveTab("tickets")}>
                    Contact Support
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Support Req Tab */}
            <TabsContent value="tickets" className="space-y-6">
            <Card>
                <CardHeader className="pb-3 text-blue-600">
                  <CardTitle>Submit a Support Request</CardTitle>
                  <CardDescription>We'll get back to you as soon as possible</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="subject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Subject</FormLabel>
                            <FormControl>
                              <Input placeholder="Brief description of your issue" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="category"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="account">Account Management</SelectItem>
                                <SelectItem value="loans">Loan Management</SelectItem>
                                <SelectItem value="payments">Payments</SelectItem>
                                <SelectItem value="customers">Customer Management</SelectItem>
                                <SelectItem value="technical">Technical Issue</SelectItem>
                                <SelectItem value="other">Other</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe your issue in detail"
                                className="min-h-[120px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="attachments"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Attachments (Optional)</FormLabel>
                            <FormControl>
                              <Input type="file" multiple onChange={field.onChange} />
                            </FormControl>
                            <FormDescription>
                              You can upload screenshots or documents related to your issue
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button type="submit" className="w-full">
                        Submit Support Request
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Terms and Conditions Tab */}
            <TabsContent value="chat" className="space-y-6">
                <Card className="max-w-4xl mx-auto h-full">
                    <CardHeader>
                        <h1 className="text-2xl font-bold text-blue-600">Terms and Conditions</h1>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[60vh] rounded-md border p-4">
                            <div className="space-y-6">
                                {terms.map((term, index) => (
                                    <div key={index} className="space-y-2">
                                    <h2 className="text-xl font-semibold text-gray-800">
                                        {term.title}
                                        </h2>
                                        <div className="space-y-2">
                                          {term.content.map((paragraph, pIndex) => (
                                            <p key={pIndex} className="text-gray-600">
                                              {paragraph}
                                            </p>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                            </ScrollArea>
                    </CardContent>
                 </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}