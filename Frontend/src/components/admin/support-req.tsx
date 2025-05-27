import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search } from "lucide-react"

export function SupportRequests() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Support Requests</CardTitle>
            <CardDescription>Manage customer support tickets</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search tickets..." className="pl-8 w-full" />
          </div>
          <Button variant="outline">Filter</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket ID</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>User</TableHead>
              <TableHead>User Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell className="font-medium">{ticket.id}</TableCell>
                <TableCell>{ticket.subject}</TableCell>
                <TableCell>{ticket.user}</TableCell>
                <TableCell>{ticket.userType}</TableCell>
                <TableCell>
                  <Badge variant={getStatusBadgeVariant(ticket.status)}>{ticket.status}</Badge>
                </TableCell>
                <TableCell>{ticket.created}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Respond
                    </Button>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

function getStatusBadgeVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "Open":
      return "default"
    case "In Progress":
      return "secondary"
    case "Resolved":
      return "outline" // Changed from "success" to "outline" as it's supported
    case "Urgent":
      return "destructive"
    default:
      return "default"
  }
}

const tickets = [
  {
    id: "TICKET-001",
    subject: "Payment not reflecting in account",
    user: "Rahul Sharma",
    userType: "Borrower",
    status: "Open",
    created: "2023-04-15",
  },
  {
    id: "TICKET-002",
    subject: "Unable to generate QR code",
    user: "Priya Patel",
    userType: "Lender",
    status: "In Progress",
    created: "2023-04-16",
  },
  {
    id: "TICKET-003",
    subject: "Need to update personal information",
    user: "Amit Kumar",
    userType: "Borrower",
    status: "Resolved",
    created: "2023-04-14",
  },
  {
    id: "TICKET-004",
    subject: "Account login issues",
    user: "Sneha Gupta",
    userType: "Lender",
    status: "Urgent",
    created: "2023-04-17",
  },
  {
    id: "TICKET-005",
    subject: "Loan application rejected without reason",
    user: "Vikram Singh",
    userType: "Borrower",
    status: "Open",
    created: "2023-04-16",
  },
]
