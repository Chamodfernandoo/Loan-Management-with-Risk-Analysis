import { useState, useEffect } from "react"
import { districts, cities, loanTypes, type Location } from "@/pages/Lender/Advertisments/types"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Search, X, SlidersHorizontal } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

interface BorrowerAdFilterProps {
  onFilterChange: (filters: {
    location?: Partial<Location>
    interestRate?: number
    loanTypes?: string[]
    minAmount?: number
    maxAmount?: number
  }) => void
}

export function BorrowerAdFilter({ onFilterChange }: BorrowerAdFilterProps) {
  const [district, setDistrict] = useState<string>("")
  const [city, setCity] = useState<string>("")
  const [availableCities, setAvailableCities] = useState<string[]>([])
  const [maxInterestRate, setMaxInterestRate] = useState<number>(30)
  const [selectedLoanTypes, setSelectedLoanTypes] = useState<string[]>([])
  const [minAmount, setMinAmount] = useState<string>("")
  const [maxAmount, setMaxAmount] = useState<string>("")
  const [isOpen, setIsOpen] = useState(false)

  // Update available cities when district changes
  useEffect(() => {
    if (district) {
      setAvailableCities(cities[district] || [])
      setCity("")
    } else {
      setAvailableCities([])
    }
  }, [district])

  const handleLoanTypeChange = (type: string, checked: boolean) => {
    if (checked) {
      setSelectedLoanTypes((prev) => [...prev, type])
    } else {
      setSelectedLoanTypes((prev) => prev.filter((t) => t !== type))
    }
  }

  const handleApplyFilter = () => {
    onFilterChange({
      location: {
        district,
        city,
      },
      interestRate: maxInterestRate,
      loanTypes: selectedLoanTypes.length > 0 ? selectedLoanTypes : undefined,
      minAmount: minAmount ? Number(minAmount) : undefined,
      maxAmount: maxAmount ? Number(maxAmount) : undefined,
    })

    if (window.innerWidth < 1024) {
      setIsOpen(false)
    }
  }

  const handleClearFilter = () => {
    setDistrict("")
    setCity("")
    setMaxInterestRate(30)
    setSelectedLoanTypes([])
    setMinAmount("")
    setMaxAmount("")

    onFilterChange({})

    if (window.innerWidth < 1024) {
      setIsOpen(false)
    }
  }

  const filterContent = (
    <div className="space-y-6">
      <Accordion type="single" collapsible defaultValue="location" className="w-full">
        <AccordionItem value="location">
          <AccordionTrigger className="text-base font-medium">Location</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="district">District</Label>
                <Select value={district} onValueChange={setDistrict}>
                  <SelectTrigger id="district" className="w-full">
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
                  <SelectTrigger id="city" className="w-full">
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
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="interest-rate">
          <AccordionTrigger className="text-base font-medium">Interest Rate</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Maximum Interest Rate</Label>
                  <span className="text-sm font-medium">{maxInterestRate}%</span>
                </div>
                <Slider
                  value={[maxInterestRate]}
                  min={5}
                  max={30}
                  step={0.5}
                  onValueChange={(value) => setMaxInterestRate(value[0])}
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>5%</span>
                  <span>30%</span>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="loan-types">
          <AccordionTrigger className="text-base font-medium">Loan Types</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-3 pt-2">
              {loanTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={`loan-type-${type}`}
                    checked={selectedLoanTypes.includes(type)}
                    onCheckedChange={(checked) => handleLoanTypeChange(type, checked as boolean)}
                  />
                  <Label htmlFor={`loan-type-${type}`} className="text-sm cursor-pointer">
                    {type}
                  </Label>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="loan-amount">
          <AccordionTrigger className="text-base font-medium">Loan Amount</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="min-amount">Minimum Amount (Rs)</Label>
                <Input
                  id="min-amount"
                  type="number"
                  placeholder="Min amount"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-amount">Maximum Amount (Rs)</Label>
                <Input
                  id="max-amount"
                  type="number"
                  placeholder="Max amount"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="flex flex-col sm:flex-row gap-2 pt-2">
        <Button onClick={handleApplyFilter} className="w-full">
          <Search className="h-4 w-4 mr-2" />
          Apply Filter
        </Button>
        <Button variant="outline" onClick={handleClearFilter} className="w-full">
          <X className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile filter button */}
      <div className="lg:hidden w-full mb-4">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="w-full">
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Filter Options
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
            <SheetHeader className="mb-4">
              <SheetTitle>Filter Lenders</SheetTitle>
              <SheetDescription>Find the perfect lender for your needs</SheetDescription>
            </SheetHeader>
            {filterContent}
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop filter */}
      <div className="hidden lg:block">
        <Card className="shadow-sm">
          <CardContent className="p-4 space-y-4">
            <h3 className="font-semibold text-lg">Filter Lenders</h3>
            {filterContent}
          </CardContent>
        </Card>
      </div>
    </>
  )
}