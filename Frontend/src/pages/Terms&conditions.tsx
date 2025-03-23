import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Term {
  title: string;
  content: string[];
}

const Termsconditions = () => {
  
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
  
    return (
      <div className="h-screen bg-gray-50 p-4 md:p-8">
        <Card className="max-w-4xl mx-auto h-full">
          <CardHeader>
            <h1 className="text-2xl font-bold text-gray-900">Terms and Conditions</h1>
          </CardHeader>
          
          <CardContent>
            <ScrollArea className="h-[70vh] rounded-md border p-4">
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
  
          <CardFooter className="flex justify-center space-x-4 pt-4 border-t">
            <Button
              className="bg-green-600 hover:bg-green-700 text-white px-8"
            >
              Accept
            </Button>
            <Button
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50 px-8"
            >
              Decline
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
}

export default Termsconditions
