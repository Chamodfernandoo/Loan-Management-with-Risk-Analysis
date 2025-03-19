import type React from "react"
import { useState, useEffect } from "react"
import type { LenderAd, Location } from "@/pages/Lender/Advertisments/types"
import { BorrowerAdCard } from "@/components/default/b-ad-card"
import { BorrowerAdFilter } from "@/components/default/b-ad-filter"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Sample data with interest rates and loan types
const sampleAds: LenderAd[] = [
  {
    id: "1",
    createdAt: new Date("2023-01-15"),
    updatedAt: new Date("2023-01-15"),
    location: {
      district: "Colombo",
      city: "Colombo 3",
    },
    shopName: "Capital Loans",
    lenderName: "John Perera",
    contactNumber: "077-1234567",
    description:
      "We offer competitive interest rates on personal and business loans. Quick approval process and flexible repayment options.",
    photos: ["/placeholder.svg?height=400&width=600"],
    lenderId: "lender-1",
    interestRate: 12.5,
    loanTypes: ["Personal", "Business"],
  },
  {
    id: "2",
    createdAt: new Date("2023-02-20"),
    updatedAt: new Date("2023-02-20"),
    location: {
      district: "Kandy",
      city: "Kandy",
    },
    shopName: "Hill Country Finance",
    lenderName: "Samantha Silva",
    contactNumber: "071-9876543",
    description:
      "Specializing in small business loans and microfinance. Serving the Kandy region for over 10 years with trusted financial services.",
    photos: ["/placeholder.svg?height=400&width=600"],
    lenderId: "lender-2",
    interestRate: 14.0,
    loanTypes: ["Business", "Microfinance", "Agriculture"],
  },
  {
    id: "3",
    createdAt: new Date("2023-03-10"),
    updatedAt: new Date("2023-03-10"),
    location: {
      district: "Gampaha",
      city: "Negombo",
    },
    shopName: "Coastal Credit",
    lenderName: "Michael Fernando",
    contactNumber: "076-5554433",
    description:
      "Fast cash loans for emergencies. Low interest rates and same-day approval available for qualified applicants.",
    photos: ["/placeholder.svg?height=400&width=600"],
    lenderId: "lender-3",
    interestRate: 15.5,
    loanTypes: ["Personal", "Emergency"],
  },
  {
    id: "4",
    createdAt: new Date("2023-04-05"),
    updatedAt: new Date("2023-04-05"),
    location: {
      district: "Kegalle",
      city: "Kegalle",
    },
    shopName: "Sameera Finance",
    lenderName: "Sameera Rathnayake",
    contactNumber: "077-6653521",
    description:
      "Family-owned lending business offering personal loans, business loans, and installment plans. Trusted by the community for generations.",
    photos: ["/placeholder.svg?height=400&width=600"],
    lenderId: "current-lender-id",
    interestRate: 13.75,
    loanTypes: ["Personal", "Business", "Education"],
  },
  {
    id: "5",
    createdAt: new Date("2023-05-12"),
    updatedAt: new Date("2023-05-12"),
    location: {
      district: "Colombo",
      city: "Dehiwala",
    },
    shopName: "Metro Loans",
    lenderName: "Anil Jayawardena",
    contactNumber: "070-1122334",
    description:
      "Providing financial solutions for individuals and small businesses. Competitive rates and personalized service.",
    photos: ["/placeholder.svg?height=400&width=600"],
    lenderId: "lender-5",
    interestRate: 11.9,
    loanTypes: ["Personal", "Home", "Vehicle"],
  },
  {
    id: "6",
    createdAt: new Date("2023-06-18"),
    updatedAt: new Date("2023-06-18"),
    location: {
      district: "Galle",
      city: "Galle",
    },
    shopName: "Southern Lenders",
    lenderName: "Dinesh Gunawardena",
    contactNumber: "077-8899001",
    description:
      "Serving the southern province with reliable lending services. We specialize in small business loans and personal financing.",
    photos: ["/placeholder.svg?height=400&width=600"],
    lenderId: "lender-6",
    interestRate: 13.25,
    loanTypes: ["Business", "Agriculture", "Microfinance"],
  },
]

const BorrowerAllAdsPage: React.FC = () => {
  const [filteredAds, setFilteredAds] = useState<LenderAd[]>(sampleAds)
  const [sortOption, setSortOption] = useState<string>("interest-asc")

  // Apply filters
  const handleFilterChange = (filters: {
    location?: Partial<Location>
    interestRate?: number
    loanTypes?: string[]
  }) => {
    let result = [...sampleAds]

    // Filter by location
    if (filters.location?.district) {
      result = result.filter((ad) => ad.location.district === filters.location?.district)
    }

    if (filters.location?.city) {
      result = result.filter((ad) => ad.location.city === filters.location?.city)
    }

    // Filter by interest rate
    if (filters.interestRate !== undefined) {
      result = result.filter((ad) => ad.interestRate <= filters.interestRate!)
    }

    // Filter by loan types
    if (filters.loanTypes && filters.loanTypes.length > 0) {
      result = result.filter((ad) => filters.loanTypes!.some((type) => ad.loanTypes.includes(type)))
    }

    setFilteredAds(result)
  }

  // Sort ads
  useEffect(() => {
    const sortedAds = [...filteredAds]

    switch (sortOption) {
      case "interest-asc":
        sortedAds.sort((a, b) => a.interestRate - b.interestRate)
        break
      case "interest-desc":
        sortedAds.sort((a, b) => b.interestRate - a.interestRate)
        break
      case "date-desc":
        sortedAds.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        break
      case "date-asc":
        sortedAds.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        break
      default:
        break
    }

    setFilteredAds(sortedAds)
  }, [sortOption])

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold">Find Lenders</h1>

        <div className="w-full sm:w-auto">
          <Tabs defaultValue="interest-asc" onValueChange={setSortOption} className="w-full">
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
              <TabsTrigger value="interest-asc">Lowest Rate</TabsTrigger>
              <TabsTrigger value="interest-desc">Highest Rate</TabsTrigger>
              <TabsTrigger value="date-desc">Newest</TabsTrigger>
              <TabsTrigger value="date-asc">Oldest</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="lg:col-span-1 order-2 lg:order-1">
          <BorrowerAdFilter onFilterChange={handleFilterChange} />
        </div>

        <div className="lg:col-span-3 order-1 lg:order-2">
          {filteredAds.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 sm:p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No lenders found</h3>
              <p className="text-muted-foreground mb-4">Try adjusting your filters to find more lenders</p>
              <Button variant="outline" onClick={() => handleFilterChange({})} className="w-full sm:w-auto">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAds.map((ad) => (
                <BorrowerAdCard key={ad.id} ad={ad} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BorrowerAllAdsPage