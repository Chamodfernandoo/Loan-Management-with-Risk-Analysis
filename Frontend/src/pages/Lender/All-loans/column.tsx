import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Eye, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
// import Link from "next/link"
import { Link } from "react-router-dom"
import { format } from "date-fns"

// Define the loan data type
export type Loan = {
  id: string
  orderId: string
  customerName: string
  createdAt: Date
  totalPrice: number
  orderState: "paid" | "pending" | "partial_paid"
  installmentState: "ok" | "overdue" | "pending"
}

export const columns: ColumnDef<Loan>[] = [
  {
    accessorKey: "orderId",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Order ID
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("orderId")}</div>,
  },
  {
    accessorKey: "customerName",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Customer Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div>{row.getValue("customerName")}</div>,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Created At
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date
      return <div>{format(date, "MMM dd, yyyy")}</div>
    }
  },
  {
    accessorKey: "totalPrice",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Total Price
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = Number.parseFloat(row.getValue("totalPrice"))
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "LKR",
      }).format(amount)
      return <div className="font-medium">{formatted}</div>
    }
  },
    {
    accessorKey: "orderState",
    header: "Loan State",
    cell: ({ row }) => {
      const status = row.getValue("orderState") as string
    
      return (
        <Badge
          variant={status === "paid" ? "default" : status === "partial_paid" ? "outline" : "secondary"}
          className={
            status === "paid"
              ? "bg-green-100 text-green-800 hover:bg-green-100"
              : status === "partial_paid"
                ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                : "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
          }
        >
          {status === "paid" ? "Paid" : status === "partial_paid" ? "Partial Paid" : "Pending"}
        </Badge>
      )
      },
    },
      {
      accessorKey: "installmentState",
      header: "Installment State",
      cell: ({ row }) => {
        const status = row.getValue("installmentState") as string

        return (
        <Badge
          variant={status === "ok" ? "default" : status === "pending" ? "outline" : "destructive"}
          className={
          status === "ok"
            ? "bg-green-100 text-green-800 hover:bg-green-100"
            : status === "pending"
            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
            : "bg-red-100 text-red-800 hover:bg-red-100"
          }
        >
          {status === "ok" ? "OK" : status === "pending" ? "Pending" : "Overdue"}
        </Badge>
        )
      },
      },
      {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
      const loan = row.original

      return (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/invoice/${loan.id}`}>
              <FileText className="mr-2 h-4 w-4" />
              View Invoice
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to={`/agreement/${loan.id}`} state={{ viewOnly: true, loanId: loan.id }}>
              <Eye className="mr-2 h-4 w-4" />
              Agreement
            </Link>
          </Button>
        </div>
      )
    },
  },
]
