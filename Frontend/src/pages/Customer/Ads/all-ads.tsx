import type React from "react"
import { useState, useEffect } from "react"
import type { LenderAd, Location } from "@/pages/Lender/Advertisments/types"
import { BorrowerAdCard } from "@/components/default/b-ad-card"
import { BorrowerAdFilter } from "@/components/default/b-ad-filter"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useNavigate } from "react-router-dom"
import { ArrowLeft } from "lucide-react"
import { adService } from "@/services/api"
import { useToast } from "@/hooks/use-toast"

const BorrowerAllAdsPage: React.FC = () => {
  const [ads, setAds] = useState<LenderAd[]>([])
  const [filteredAds, setFilteredAds] = useState<LenderAd[]>([])
  const [sortOption, setSortOption] = useState<string>("interest-asc")
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { toast } = useToast()

  // Fetch ads when component mounts
  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true)
        const response = await adService.getAds()
        
        // Format the data
        const formattedAds = response.map((ad: any) => ({
          id: ad._id || ad.id,
          createdAt: new Date(ad.created_at || ad.createdAt),
          updatedAt: new Date(ad.updated_at || ad.updatedAt),
          location: ad.location,
          shopName: ad.shop_name || ad.shopName,
          lenderName: ad.lender_name || ad.lenderName,
          contactNumber: ad.contact_number || ad.contactNumber,
          description: ad.description,
          photos: ad.photos || [],
          lenderId: ad.lender_id || ad.lenderId,
          interestRate: ad.interest_rate || ad.interestRate || 0,
          loanTypes: ad.loan_types || ad.loanTypes || [],
        }))
        
        setAds(formattedAds)
        setFilteredAds(formattedAds)
      } catch (error: any) {
        console.error("Error fetching advertisements:", error)
        toast({
          title: "Failed to load advertisements",
          description: error.response?.data?.detail || "There was an error loading advertisements.",
          variant: "destructive"
        })
        setAds([])
        setFilteredAds([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchAds()
  }, [toast])

  // Apply filters
  const handleFilterChange = (filters: {
    location?: Partial<Location>
    interestRate?: number
    loanTypes?: string[]
  }) => {
    let result = [...ads]

    // Filter by location
    if (filters.location?.district) {
      result = result.filter((ad) => ad.location.district === filters.location?.district)
    }

    if (filters.location?.city) {
      result = result.filter((ad) => ad.location.city === filters.location?.city)
    }

    // Filter by interest rate - Fix for possibly undefined interestRate
    if (filters.interestRate !== undefined) {
      result = result.filter((ad) => (ad.interestRate || 0) <= filters.interestRate!)
    }

    // Filter by loan types - Fix for possibly undefined loanTypes
    if (filters.loanTypes && filters.loanTypes.length > 0) {
      result = result.filter((ad) => 
        filters.loanTypes!.some((type) => (ad.loanTypes || []).includes(type))
      )
    }

    setFilteredAds(result)
  }

  // Sort ads
  useEffect(() => {
    const sortedAds = [...filteredAds]

    switch (sortOption) {
      case "interest-asc":
        sortedAds.sort((a, b) => (a.interestRate || 0) - (b.interestRate || 0))
        break
      case "interest-desc":
        sortedAds.sort((a, b) => (b.interestRate || 0) - (a.interestRate || 0))
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
  }, [sortOption, ads])

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <Button variant="outline" className="mb-4 sm:mb-6" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
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
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : filteredAds.length === 0 ? (
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