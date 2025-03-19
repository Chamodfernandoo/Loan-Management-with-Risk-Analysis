import type { ReactNode } from "react"
import { Card, CardContent } from "@/components/ui/card"

type LoanStatCardProps = {
  title: string
  value: string
  icon: ReactNode
  color: "blue" | "green" | "amber" | "purple" | "red"
}

export function LoanStatCard({ title, value, icon, color }: LoanStatCardProps) {
  const getColorClasses = () => {
    switch (color) {
      case "blue":
        return "bg-blue-50 border-blue-200 text-blue-800"
      case "green":
        return "bg-green-50 border-green-200 text-green-800"
      case "amber":
        return "bg-amber-50 border-amber-200 text-amber-800"
      case "purple":
        return "bg-purple-50 border-purple-200 text-purple-800"
      case "red":
        return "bg-red-50 border-red-200 text-red-800"
      default:
        return "bg-blue-50 border-blue-200 text-blue-800"
    }
  }

  const getIconClass = () => {
    switch (color) {
      case "blue":
        return "text-blue-500"
      case "green":
        return "text-green-500"
      case "amber":
        return "text-amber-500"
      case "purple":
        return "text-purple-500"
      case "red":
        return "text-red-500"
      default:
        return "text-blue-500"
    }
  }

  return (
    <Card className={`border ${getColorClasses()}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium">{title}</p>
            <h3 className="text-2xl font-bold">{value}</h3>
          </div>
          <div className={getIconClass()}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  )
}