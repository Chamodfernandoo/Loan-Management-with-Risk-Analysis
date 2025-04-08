import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Search, UserPlus } from "lucide-react"

export function UserManagement() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>User Management</CardTitle>
            <CardDescription>Manage all users in the system</CardDescription>
          </div>
          <Button size="sm">
            <UserPlus className="mr-2 h-4 w-4" />
            Add User
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search users..." className="pl-8 w-full" />
          </div>
          <Button variant="outline">Filter</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.id}</TableCell>
                <TableCell>{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === "Lender" ? "secondary" : "default"}>{user.role}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={user.status === "Active" ? "default" : "destructive"}>{user.status}</Badge>
                </TableCell>
                <TableCell>{user.joined}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      Edit
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

const users = [
  {
    id: "USR-001",
    name: "Rahul Sharma",
    email: "rahul.sharma@example.com",
    role: "Lender",
    status: "Active",
    joined: "2023-01-15",
  },
  {
    id: "USR-002",
    name: "Priya Patel",
    email: "priya.patel@example.com",
    role: "Borrower",
    status: "Active",
    joined: "2023-02-20",
  },
  {
    id: "USR-003",
    name: "Amit Kumar",
    email: "amit.kumar@example.com",
    role: "Lender",
    status: "Inactive",
    joined: "2023-01-10",
  },
  {
    id: "USR-004",
    name: "Sneha Gupta",
    email: "sneha.gupta@example.com",
    role: "Borrower",
    status: "Active",
    joined: "2023-03-05",
  },
  {
    id: "USR-005",
    name: "Vikram Singh",
    email: "vikram.singh@example.com",
    role: "Lender",
    status: "Active",
    joined: "2023-02-15",
  },
]