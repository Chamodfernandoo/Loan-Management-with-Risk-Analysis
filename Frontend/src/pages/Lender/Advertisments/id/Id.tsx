import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import type { LenderAd } from "@/pages/Lender/Advertisments/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { ArrowLeft, BadgeCent, MapPin, Percent, Phone, Store, User } from "lucide-react"

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
    photos: [
      "/placeholder.svg?height=400&width=600",
      "/placeholder.svg?height=400&width=600&text=Photo+2",
      "/placeholder.svg?height=400&width=600&text=Photo+3",
    ],
    lenderId: "lender-1",
    interestRate: 8.5,
    loanTypes: ["Personal", "Business", "Home"],

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
    interestRate: 9.0,
    loanTypes: ["Business", "Microfinance"],
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
    interestRate: 7.5,
    loanTypes: ["Personal", "Business", "Installment"],
  },
]

const AdDetailPage: React.FC = () => {
  const params = useParams()
  const navigate = useNavigate()
  const [ad, setAd] = useState<LenderAd | null>(null)
  const [selectedPhoto, setSelectedPhoto] = useState<string>("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, you would fetch the ad from your API
    const adId = params.id as string
    const foundAd = sampleAds.find((a) => a.id === adId)

    if (foundAd) {
      setAd(foundAd)
      if (foundAd.photos.length > 0) {
        setSelectedPhoto(foundAd.photos[0])
      }
    }

    setLoading(false)
  }, [params.id])

  if (loading) {
    return (
      <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 flex justify-center items-center">Loading...</div>
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

  const isOwner = ad.lenderId === "current-lender-id"

  return (
    <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-4xl">
      <Button variant="outline" className="mb-4 sm:mb-6" onClick={() => navigate(-1)}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

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
                <span className="ml-1 font-medium">{ad.interestRate}</span>
            </div>
                <div className="flex items-center text-xs sm:text-sm">
                  <BadgeCent className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-2" />
                  <span className="text-muted-foreground">Loan Type:</span>
                  <span className="ml-1 font-medium">{ad.loanTypes}</span>
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
