import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import type { LenderAd } from "@/pages/Lender/Advertisments/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ArrowLeft, BadgeCent, MapPin, Percent, Phone, Store, User, Trash2, Edit } from "lucide-react"
import { adService } from "@/services/api"
import { useToast } from "@/hooks/use-toast"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const AdDetailPage: React.FC = () => {
  const params = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [ad, setAd] = useState<LenderAd | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [isOwner, setIsOwner] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchAdDetails = async () => {
      try {
        setLoading(true)
        const adId = params.id as string
        const adData = await adService.getAd(adId)
        
        // Format dates and handle API response format
        const formattedAd = {
          ...adData,
          id: adData._id || adData.id,
          createdAt: new Date(adData.created_at || adData.createdAt),
          updatedAt: new Date(adData.updated_at || adData.updatedAt),
          loanTypes: adData.loan_types || adData.loanTypes || [],
          interestRate: adData.interest_rate || adData.interestRate || 0,
          lenderId: adData.lender_id || adData.lenderId,
          shopName: adData.shop_name || adData.shopName,
          lenderName: adData.lender_name || adData.lenderName,
          contactNumber: adData.contact_number || adData.contactNumber,
        }
        
        setAd(formattedAd)
        
        // Check if the current user is the owner
        setIsOwner(adData.is_owner || false)
        
        if (formattedAd.photos && formattedAd.photos.length > 0) {
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

  const handleDeleteAd = async () => {
    if (!ad) return
    
    try {
      setIsDeleting(true)
      await adService.deleteAd(ad.id)
      
      toast({
        title: "Advertisement deleted",
        description: "Your advertisement has been deleted successfully.",
      })
      
      navigate("/lender/ads/all-ads")
    } catch (error: any) {
      console.error("Error deleting advertisement:", error)
      toast({
        title: "Failed to delete advertisement",
        description: error.response?.data?.detail || "There was an error deleting the advertisement.",
        variant: "destructive"
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
    }
  }

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
            <h2 className="text-xl sm:text-2xl font-bold mb-4">Ad Not Found</h2>
            <p className="text-muted-foreground mb-6">The ad you're looking for doesn't exist or has been removed.</p>
            <Button onClick={() => navigate(-1)}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Get loan types and interest rate, handling both camelCase and snake_case
  const loanTypes = ad.loan_types || ad.loanTypes || []
  const interestRate = ad.interest_rate || ad.interestRate || 0

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-4 sm:mb-6">
        <Button variant="outline" onClick={() => navigate(-1)}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        {isOwner && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/lender/ads/edit/${ad.id}`)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    advertisement and remove it from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAd}
                    className="bg-destructive text-destructive-foreground"
                    disabled={isDeleting}
                  >
                    {isDeleting ? "Deleting..." : "Delete"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      <Card className="shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <CardTitle className="text-xl sm:text-2xl font-bold">{ad.shopName}</CardTitle>
            {isOwner && <Badge className="bg-primary mt-1 sm:mt-0">Your Ad</Badge>}
          </div>
          <div className="flex items-center text-sm text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 mr-1" />
            {ad.location.city}, {ad.location.district}
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

            {ad.photos && ad.photos.length > 1 && (
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
              <div className="flex items-center text-xs sm:text-sm">
                <Percent className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-2" />
                <span className="text-muted-foreground">Interest:</span>
                <span className="ml-1 font-medium">{interestRate}%</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">Loan Types</h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  {loanTypes.map((type, index) => (
                    <Badge key={index} variant="outline">{type}</Badge>
                  ))}
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
                <h3 className="text-lg font-semibold">Ad Information</h3>
                <div className="mt-2 space-y-1">
                  <div className="flex">
                    <span className="text-muted-foreground w-20">Posted on:</span>
                    <span>{format(ad.createdAt, "MMMM dd, yyyy")}</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-20">Updated:</span>
                    <span>{format(ad.updatedAt, "MMMM dd, yyyy")}</span>
                  </div>
                  <div className="flex">
                    <span className="text-muted-foreground w-20">Ad ID:</span>
                    <span>{ad.id}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default AdDetailPage
