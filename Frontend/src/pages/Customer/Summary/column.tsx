import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, Eye } from "lucide-react"
import { Link } from "react-router-dom"

// Borrowed loan types
export type BorrowedLoan = {
  id: string
  lender: string
  amount: number
  startDate: Date
  endDate: Date
  installments: number
  installmentAmount: number
  remainingInstallments: number
  status: "active" | "completed" | "overdue"
  interestRate: number
}

// Upcoming payment types
export type UpcomingPayment = {
  id: string
  loanId: string
  dueDate: Date
  amount: number
  status: "upcoming" | "overdue"
  lender: string
}

// Columns for Borrowed Loans table
export const BorrowedLoanColumns: ColumnDef<BorrowedLoan>[] = [
  {
    accessorKey: "id",
    header: "Loan ID",
    cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "lender",
    header: "Lender",
  },
  {
    accessorKey: "amount",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number
      return <div>Rs {amount.toLocaleString()}</div>
    },
  },
  {
    accessorKey: "interestRate",
    header: "Interest Rate",
    cell: ({ row }) => {
      const rate = row.getValue("interestRate") as number
      return <div>{rate}%</div>
    },
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => {
      return <div>{format(row.getValue("startDate"), "MMM dd, yyyy")}</div>
    },
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => {
      return <div>{format(row.getValue("endDate"), "MMM dd, yyyy")}</div>
    },
  },
  {
    accessorKey: "remainingInstallments",
    header: "Remaining",
    cell: ({ row }) => {
      const remaining = row.getValue("remainingInstallments") as number
      const total = row.original.installments

      return (
        <div>
          {remaining} of {total}
        </div>
      )
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string

      return (
        <Badge
          className={
            status === "active"
              ? "bg-blue-100 text-blue-800 hover:bg-blue-100 hover:text-blue-800"
              : status === "completed"
                ? "bg-green-100 text-green-800 hover:bg-green-100 hover:text-green-800"
                : "bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800"
          }
        >
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const loan = row.original

      return (
        <Button asChild size="sm" variant="outline">
          <Link to={`/borrower/loans/${loan.id}`}>
            <Eye className="h-4 w-4 mr-1" />
            View
          </Link>
        </Button>
      )
    },
  },
]

// Columns for Upcoming Payments table
export const UpcomingPaymentColumns: ColumnDef<UpcomingPayment>[] = [
  {
    accessorKey: "id",
    header: "Payment ID",
    cell: ({ row }) => <div className="font-medium">{row.getValue("id")}</div>,
  },
  {
    accessorKey: "loanId",
    header: "Loan ID",
  },
  {
    accessorKey: "lender",
    header: "Lender",
  },
  {
    accessorKey: "dueDate",
    header: ({ column }) => {
      return (
        <Button variant="ghost" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Due Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      return <div>{format(row.getValue("dueDate"), "MMM dd, yyyy")}</div>
    },
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => {
      const amount = row.getValue("amount") as number
      return <div>Rs {amount.toLocaleString()}</div>
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string
      const dueDate = row.original.dueDate
      const today = new Date()
      const isOverdue = dueDate < today && status !== "paid"

      return (
        <Badge
          className={
            isOverdue
              ? "bg-red-100 text-red-800 hover:bg-red-100 hover:text-red-800"
              : "bg-amber-100 text-amber-800 hover:bg-amber-100 hover:text-amber-800"
          }
        >
          {isOverdue ? "Overdue" : "Upcoming"}
        </Badge>
      )
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return <Button size="sm">Pay Now</Button>
    },
  },
]

