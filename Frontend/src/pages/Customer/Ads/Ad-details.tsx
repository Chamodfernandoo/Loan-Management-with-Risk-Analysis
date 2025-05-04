import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import type { LenderAd } from "@/pages/Lender/Advertisments/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ArrowLeft, MapPin, Phone, Store, User, Percent, Calendar, Info } from "lucide-react"
import { adService } from "@/services/api"
import { useToast } from "@/hooks/use-toast"

const BorrowerAdDetailPage: React.FC = () => {
  const params = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [ad, setAd] = useState<LenderAd | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAdDetails = async () => {
      try {
        setLoading(true)
        const adId = params.id as string
        const adData = await adService.getAd(adId)
        
        // Format the data
        const formattedAd = {
          id: adData._id || adData.id,
          createdAt: new Date(adData.created_at || adData.createdAt),
          updatedAt: new Date(adData.updated_at || adData.updatedAt),
          location: adData.location,
          shopName: adData.shop_name || adData.shopName,
          lenderName: adData.lender_name || adData.lenderName,
          contactNumber: adData.contact_number || adData.contactNumber,
          description: adData.description,
          photos: adData.photos || [],
          lenderId: adData.lender_id || adData.lenderId,
          interestRate: adData.interest_rate || adData.interestRate || 0,
          loanTypes: adData.loan_types || adData.loanTypes || [],
        }
        
        setAd(formattedAd)
        
        if (formattedAd.photos.length > 0) {
          setSelectedPhoto(formattedAd.photos[0])
        }
      } catch (error: any) {
        console.error("Error fetching advertisement details:", error)
        toast({
          title: "Failed to load advertisement",
          description: error.response?.data?.detail || "There was an error loading the advertisement details.",
          variant: "destructive"
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchAdDetails()
  }, [params.id, toast])

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!ad) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-3xl">
        <Card>
          <CardContent className="p-6 sm:p-8 text-center">
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Lender Not Found</h2>
            <p className="text-muted-foreground mb-6">
              The lender you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-4xl">
      <Button variant="outline" className="mb-4 sm:mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Lenders
      </Button>

      <Card className="shadow-sm mb-6">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <CardTitle className="text-xl sm:text-2xl font-bold">{ad.shopName}</CardTitle>
              <CardDescription className="flex items-center text-sm mt-1">
                <MapPin className="h-3.5 w-3.5 mr-1" />
                {ad.location.city}, {ad.location.district}
              </CardDescription>
            </div>
            <Badge className="bg-green-600 hover:bg-green-700 text-base px-3 py-1 mt-1 sm:mt-0">
              <Percent className="h-4 w-4 mr-1" />
              {ad.interestRate}% Interest
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Photo Gallery */}
          <div className="space-y-2">
            <div className="relative h-[250px] sm:h-[300px] md:h-[400px] bg-gray-100 rounded-md overflow-hidden">
              {selectedPhoto ? (
                <img
                  src={selectedPhoto || "/placeholder.svg"}
                  alt={ad.shopName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Store className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
                </div>
              )}
            </div>

            {ad.photos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {ad.photos.map((photo, index) => (
                  <div
                    key={index}
                    className={`relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 rounded-md overflow-hidden cursor-pointer border-2 ${
                      selectedPhoto === photo ? "border-primary" : "border-transparent"
                    }`}
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <img
                      src={photo || "/placeholder.svg"}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Loan Information */}
          <Card className="bg-gray-50">
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-lg font-semibold mb-4">Loan Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-start space-x-2">
                  <Percent className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Interest Rate</p>
                    <p className="text-muted-foreground">{ad.interestRate}% per annum</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Calendar className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Available Since</p>
                    <p className="text-muted-foreground">{format(ad.createdAt, "MMMM dd, yyyy")}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Loan Types */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Available Loan Types</h3>
            <div className="flex flex-wrap gap-2">
              {(ad.loanTypes || []).map((type, index) => (
                <Badge key={index} className="px-3 py-1">
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          {/* Lender Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Lender Information</h3>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">Name:</span>
                    <span className="ml-2 font-medium">{ad.lenderName}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">Contact:</span>
                    <span className="ml-2 font-medium">{ad.contactNumber}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold">Description</h3>
                <p className="mt-2 text-muted-foreground">{ad.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Location</h3>
                <div className="mt-2 space-y-1">
                  <div className="flex">
                    <span className="text-muted-foreground w-20">District:</span>
                    <span>{ad.location.district}</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-20">City:</span>
                    <span>{ad.location.city}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold">How to Apply</h3>
                <div className="mt-2 space-y-2">
                  <p className="text-muted-foreground">
                    Contact the lender directly using the provided phone number to discuss your loan requirements and
                    application process.
                  </p>
                  <div className="flex items-start space-x-2 mt-4">
                    <Info className="h-4 w-4 text-amber-500 mt-1" />
                    <p className="text-sm text-amber-700">
                      Always verify the lender's credentials and read all terms and conditions before proceeding with
                      any loan application.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Button */}
          <div className="flex justify-center pt-4">
            <Button size="lg" className="w-full sm:w-auto">
              <Phone className="mr-2 h-4 w-4" />
              Contact Lender
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BorrowerAdDetailPage