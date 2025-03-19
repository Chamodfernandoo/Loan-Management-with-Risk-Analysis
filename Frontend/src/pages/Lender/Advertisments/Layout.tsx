import type React from "react"
import { Button } from "@/components/ui/button"
import { Link } from "react-router-dom"
import { PlusCircle, List } from "lucide-react"

export default function AdsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-xl font-bold">Lender Ads</h1>
          <nav className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link to="/lender/ads/all-ads">
                <List className="h-4 w-4 mr-2" />
                All Ads
              </Link>
            </Button>
            <Button asChild>
              <Link to="/lender/ads/create">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Ad
              </Link>
            </Button>
          </nav>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
