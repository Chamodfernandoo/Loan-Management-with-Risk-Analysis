import type React from "react"
import { Outlet, Link, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"

const BorrowerAdsLayout: React.FC = () => {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <h1 className="text-xl font-bold">Find Lenders</h1>
          <nav className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant={location.pathname.includes("/borrower/ads/all-ads") ? "default" : "ghost"}
              asChild
              size="sm"
              className="sm:text-base"
            >
              <Link to="/borrower/ads/all-ads">
                <Search className="h-4 w-4 mr-1 sm:mr-2" />
                <span>Browse Lenders</span>
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

export default BorrowerAdsLayout