import type React from "react"
import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import type { LenderAd, Location } from "@/pages/Lender/Advertisments/types"
import { AdCard } from "@/components/default/ad-card"
import { AdFilter } from "@/components/default/ad-filter"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { adService } from "@/services/api"
import { useToast } from "@/hooks/use-toast"

const AllAdsPage: React.FC = () => {
  const [ads, setAds] = useState<LenderAd[]>([])
  const [filteredAds, setFilteredAds] = useState<LenderAd[]>([])
  const [filter, setFilter] = useState<Partial<Location>>({})
  const [viewMode, setViewMode] = useState<"all" | "my">("all")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { toast } = useToast()

  // Fetch ads when component mounts or filter/viewMode changes
  useEffect(() => {
    const fetchAds = async () => {
      try {
        setLoading(true)
        setError(null)
        
        let data = []
        
        if (viewMode === "my") {
          data = await adService.getMyAds()
        } else {
          // Get all ads with optional filters
          const filters = {
            district: filter.district,
            city: filter.city,
          }
          data = await adService.getAds(filters)
        }
        
        // Handle empty response
        if (!data || !Array.isArray(data)) {
          data = []
        }
        
        // Convert date strings to Date objects
        const formattedData = data.map(ad => ({
          ...ad,
          id: ad._id || ad.id,
          createdAt: new Date(ad.created_at || ad.createdAt),
          updatedAt: new Date(ad.updated_at || ad.updatedAt),
          loanTypes: ad.loan_types || ad.loanTypes || [],
          interestRate: ad.interest_rate || ad.interestRate || 0,
          lenderId: ad.lender_id || ad.lenderId,
          shopName: ad.shop_name || ad.shopName,
          lenderName: ad.lender_name || ad.lenderName,
          contactNumber: ad.contact_number || ad.contactNumber,
          photos: ad.photos || []
        }))
        
        setAds(formattedData)
        setFilteredAds(formattedData)
      } catch (error: any) {
        console.error("Error fetching advertisements:", error)
        setError("Failed to load advertisements. Please try again later.")
        // Don't show toast for 404 when there are no ads yet
        if (error.response?.status !== 404) {
          toast({
            title: "Failed to load advertisements",
            description: error.response?.data?.detail || "There was an error loading advertisements.",
            variant: "destructive"
          })
        }
        setAds([])
        setFilteredAds([])
      } finally {
        setLoading(false)
      }
    }
    
    fetchAds()
  }, [viewMode, filter, toast])

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-7xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <Button variant="outline" onClick={() => navigate("/lender")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">{viewMode === "all" ? "All Lender Ads" : "My Ads"}</h1>
        <Button asChild className="w-full sm:w-auto hidden sm:flex">   
          <Link to="/lender/ads/create">
            <Plus className="mr-2 h-4 w-4" />
            Create New Ad
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="lg:col-span-1 order-1 lg:order-1">
          <div className="sticky top-20">
            <AdFilter onFilterChange={setFilter} onViewChange={setViewMode} currentView={viewMode} />
          </div>
        </div>

        <div className="lg:col-span-3 order-2 lg:order-2">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 rounded-lg p-6 sm:p-8 text-center">
              <h3 className="text-lg font-medium mb-2 text-red-800">Error</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()} className="w-full sm:w-auto">
                Try Again
              </Button>
            </div>
          ) : filteredAds.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-6 sm:p-8 text-center">
              <h3 className="text-lg font-medium mb-2">No ads found</h3>
              <p className="text-muted-foreground mb-4">
                {viewMode === "my"
                  ? "You don't have any ads matching the selected filters."
                  : "There are no ads matching the selected filters."}
              </p>
              {viewMode === "my" ? (
                <Button asChild className="w-full sm:w-auto">
                  <Link to="/lender/ads/create">Create Your First Ad</Link>
                </Button>
              ) : (
                <Button variant="outline" onClick={() => setFilter({})} className="w-full sm:w-auto">
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAds.map((ad) => (
                <AdCard 
                  key={ad.id} 
                  ad={ad} 
                  isOwner={ad.is_owner || viewMode === "my"} 
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AllAdsPage