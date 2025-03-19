import type React from "react"
import { Outlet, Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { PlusCircle, List } from "lucide-react"

const AdsLayout: React.FC = () => {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container flex items-center justify-between h-16">
          <h1 className="text-xl font-bold">Lender Ads</h1>
          <nav className="flex items-center space-x-4">
            <Button variant={location.pathname.includes("/lender/ads/all-ads") ? "default" : "ghost"} asChild>
              <Link to="/lender/ads/all-ads">
                <List className="h-4 w-4 mr-2" />
                All Ads
              </Link>
            </Button>
            <Button variant={location.pathname.includes("/lender/ads/create") ? "default" : "outline"} asChild>
              <Link to="/lender/ads/create">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Ad
              </Link>
            </Button>
          </nav>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default AdsLayout