import { useState, useEffect } from "react"
import { districts, cities, type Location } from "@/types/ad"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Search, X } from "lucide-react"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface AdFilterProps {
  onFilterChange: (location: Partial<Location>) => void
  onViewChange: (view: "all" | "my") => void
  currentView: "all" | "my"
}

export function AdFilter({ onFilterChange, onViewChange, currentView }: AdFilterProps) {
  const [district, setDistrict] = useState<string>("")
  const [city, setCity] = useState<string>("")
  const [availableCities, setAvailableCities] = useState<string[]>([])

  // Update available cities when district changes
  useEffect(() => {
    if (district) {
      setAvailableCities(cities[district] || [])
      setCity("")
    } else {
      setAvailableCities([])
    }
  }, [district])

  const handleApplyFilter = () => {
    onFilterChange({
      district,
      city,
    })
  }

  const handleClearFilter = () => {
    setDistrict("")
    setCity("")
    onFilterChange({})
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <Tabs
          defaultValue={currentView}
          onValueChange={(value) => onViewChange(value as "all" | "my")}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All Ads</TabsTrigger>
            <TabsTrigger value="my">My Ads</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-2">
          <Label htmlFor="district">District</Label>
          <Select value={district} onValueChange={setDistrict}>
            <SelectTrigger id="district">
              <SelectValue placeholder="Select district" />
            </SelectTrigger>
            <SelectContent>
              {districts.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Select value={city} onValueChange={setCity} disabled={!district}>
            <SelectTrigger id="city">
              <SelectValue placeholder="Select city" />
            </SelectTrigger>
            <SelectContent>
              {availableCities.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex gap-2 pt-2">
          <Button onClick={handleApplyFilter} className="flex-1">
            <Search className="h-4 w-4 mr-2" />
            Apply Filter
          </Button>
          <Button variant="outline" onClick={handleClearFilter} className="flex-1">
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}