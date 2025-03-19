import type React from "react"
import { Outlet, Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { PlusCircle, List } from "lucide-react"

const AdsLayout: React.FC = () => {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <h1 className="text-xl font-bold">Lender Ads</h1>
          <nav className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant={location.pathname.includes("/lender/ads/all-ads") ? "default" : "ghost"}
              asChild
              size="sm"
              className="sm:text-base"
            >
              <Link to="/lender/ads/all-ads">
                <List className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">All Ads</span>
                <span className="sm:hidden">Ads</span>
              </Link>
            </Button>
            <Button
              variant={location.pathname.includes("/lender/ads/create") ? "default" : "outline"}
              asChild
              size="sm"
              className="sm:text-base"
            >
              <Link to="/lender/ads/create">
                <PlusCircle className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Create Ad</span>
                <span className="sm:hidden">Create</span>
              </Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1 flex flex-col">
        <Outlet />
      </main>
    </div>
  )
}

export default AdsLayout