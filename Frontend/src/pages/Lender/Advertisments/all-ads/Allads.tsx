import { useState, useEffect } from "react"
import type { LenderAd, Location } from "@/pages/Lender/Advertisments/types"
import { AdCard } from "@/components/default/ad-card"   
import { AdFilter } from "@/components/default/ad-filter"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { Link } from "react-router-dom"

// Sample data - in a real app, this would come from your API
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
    lenderId: "current-lender-id",
  },
]

export default function AllAdsPage() {
  const [filteredAds, setFilteredAds] = useState<LenderAd[]>(sampleAds)
  const [filter, setFilter] = useState<Partial<Location>>({})
  const [viewMode, setViewMode] = useState<"all" | "my">("all")

  // Apply filters when filter state or view mode changes
  useEffect(() => {
    let result = sampleAds

    // Filter by view mode (all ads or my ads)
    if (viewMode === "my") {
      result = result.filter((ad) => ad.lenderId === "current-lender-id")
    }

    // Filter by location
    if (filter.district) {
      result = result.filter((ad) => ad.location.district === filter.district)
    }

    if (filter.city) {
      result = result.filter((ad) => ad.location.city === filter.city)
    }

    setFilteredAds(result)
  }, [filter, viewMode])

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{viewMode === "all" ? "All Lender Ads" : "My Ads"}</h1>
        <Button asChild>
          <Link to="/lender/ads/create">
            <Plus className="mr-2 h-4 w-4" />
            Create New Ad
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <AdFilter onFilterChange={setFilter} onViewChange={setViewMode} currentView={viewMode} />
        </div>

        <div className="lg:col-span-3">
          {filteredAds.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No ads found</h3>
              <p className="text-muted-foreground mb-4">
                {viewMode === "my"
                  ? "You don't have any ads matching the selected filters."
                  : "There are no ads matching the selected filters."}
              </p>
              {viewMode === "my" ? (
                <Button asChild>
                  <Link to="/lender/ads/create">Create Your First Ad</Link>
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setFilter({})}>
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAds.map((ad) => (
                <AdCard key={ad.id} ad={ad} isOwner={ad.lenderId === "current-lender-id"} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}