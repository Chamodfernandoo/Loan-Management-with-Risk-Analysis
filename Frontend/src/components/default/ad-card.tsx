import type { LenderAd } from "@/types/ad"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { Phone, MapPin, Store, User } from "lucide-react"
import Image from "next/image"
import { Link } from "react-router-dom"

interface AdCardProps {
  ad: LenderAd
  isOwner?: boolean
}

const Adcard = ({ ad, isOwner = false }: AdCardProps) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
    <div className="relative h-48 bg-gray-100">
      {ad.photos.length > 0 ? (
        <Image src={ad.photos[0] || "/placeholder.svg"} alt={ad.shopName} fill className="object-cover" />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400">
          <Store className="h-12 w-12" />
        </div>
      )}
      {isOwner && <Badge className="absolute top-2 right-2 bg-primary">Your Ad</Badge>}
    </div>
    <CardHeader className="pb-2">
      <CardTitle className="text-lg">{ad.shopName}</CardTitle>
      <div className="flex items-center text-sm text-muted-foreground">
        <MapPin className="h-3.5 w-3.5 mr-1" />
        {ad.location.city}, {ad.location.district}, {ad.location.country}
      </div>
    </CardHeader>
    <CardContent className="pb-2 flex-grow">
      <div className="space-y-2">
        <div className="flex items-center text-sm">
          <User className="h-3.5 w-3.5 mr-2" />
          <span className="text-muted-foreground">Lender:</span>
          <span className="ml-1 font-medium">{ad.lenderName}</span>
        </div>
        <div className="flex items-center text-sm">
          <Phone className="h-3.5 w-3.5 mr-2" />
          <span className="text-muted-foreground">Contact:</span>
          <span className="ml-1 font-medium">{ad.contactNumber}</span>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2 mt-2">{ad.description}</p>
      </div>
    </CardContent>
    <CardFooter className="flex justify-between border-t pt-4">
      <div className="text-xs text-muted-foreground">Posted on {format(ad.createdAt, "MMM dd, yyyy")}</div>
      <Button variant="outline" size="sm">
        <Link to={`/lender/ads/${ad.id}`}>View Details</Link>
      </Button>
    </CardFooter>
  </Card>
  )
}

export default Adcard
