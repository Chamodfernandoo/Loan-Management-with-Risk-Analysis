import { Link } from "react-router-dom"
import type { LenderAd } from "@/pages/Lender/Advertisments/types"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Phone, MapPin, Store, User } from "lucide-react"

interface AdCardProps {
  ad: LenderAd
  isOwner?: boolean
}

export function AdCard({ ad, isOwner = false }: AdCardProps) {
  return (
    <Card className="overflow-hidden h-full flex flex-col hover:shadow-md transition-shadow duration-200">
      <div className="relative h-40 sm:h-48 bg-gray-100">
        {ad.photos.length > 0 ? (
          <img src={ad.photos[0] || "/placeholder.svg"} alt={ad.shopName} className="w-full h-full object-cover" />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <Store className="h-12 w-12" />
          </div>
        )}
        {isOwner && <Badge className="absolute top-2 right-2 bg-primary">Your Ad</Badge>}
      </div>
      <CardHeader className="pb-2 pt-3">
        <CardTitle className="text-base sm:text-lg line-clamp-1">{ad.shopName}</CardTitle>
        <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
          <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1" />
          {ad.location.city}, {ad.location.district}
        </div>
      </CardHeader>
      <CardContent className="pb-2 flex-grow">
        <div className="space-y-2">
          <div className="flex items-center text-xs sm:text-sm">
            <User className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-2" />
            <span className="text-muted-foreground">Lender:</span>
            <span className="ml-1 font-medium truncate">{ad.lenderName}</span>
          </div>
          <div className="flex items-center text-xs sm:text-sm">
            <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5 mr-1 sm:mr-2" />
            <span className="text-muted-foreground">Contact:</span>
            <span className="ml-1 font-medium">{ad.contactNumber}</span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-2">{ad.description}</p>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-3 pb-3">
        <div className="text-xs text-muted-foreground">Posted on {format(ad.createdAt, "MMM dd, yyyy")}</div>
        <Button variant="outline" size="sm" asChild>
          <Link to={`/lender/ads/${ad.id}`}>View Details</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}