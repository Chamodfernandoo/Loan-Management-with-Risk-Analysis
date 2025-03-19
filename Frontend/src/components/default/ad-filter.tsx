import { useState, useEffect } from "react"
import { countries, districts, cities, type Location } from "@/types/ad"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Search, X } from "lucide-react"

interface AdFilterProps {
  onFilterChange: (location: Partial<Location>) => void
}

export function AdFilter({ onFilterChange }: AdFilterProps) {
  const [country, setCountry] = useState<string>("")
  const [district, setDistrict] = useState<string>("")
  const [city, setCity] = useState<string>("")
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([])
  const [availableCities, setAvailableCities] = useState<string[]>([])

  useEffect(() => {
    if (country) {
      setAvailableDistricts(districts[country] || [])
      setDistrict("")
      setCity("")
    } else {
      setAvailableDistricts([])
    }
  }, [country])

  useEffect(() => {
    if (country && district) {
      setAvailableCities(cities[country]?.[district] || [])
      setCity("")
    } else {
      setAvailableCities([])
    }
  }, [country, district])

  const handleApplyFilter = () => {
    onFilterChange({
      country,
      district,
      city,
    })
  }

  const handleClearFilter = () => {
    setCountry("")
    setDistrict("")
    setCity("")
    onFilterChange({})
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Select value={country} onValueChange={setCountry}>
            <SelectTrigger id="country">
              <SelectValue placeholder="Select country" />
            </SelectTrigger>
            <SelectContent>
              {countries.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="district">District</Label>
          <Select value={district} onValueChange={setDistrict} disabled={!country}>
            <SelectTrigger id="district">
              <SelectValue placeholder="Select district" />
            </SelectTrigger>
            <SelectContent>
              {availableDistricts.map((d) => (
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