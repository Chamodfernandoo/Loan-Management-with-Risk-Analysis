import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { format, formatDistanceToNow } from "date-fns"
import {ArrowLeft,Bell,CheckCircle2,Clock,DollarSign,FileText,Info,MoreVertical,Search,Trash2, User,AlertCircle,BellOff} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import {DropdownMenu,DropdownMenuContent,DropdownMenuItem,DropdownMenuSeparator, DropdownMenuTrigger} from "@/components/ui/dropdown-menu"
import {Dialog,DialogContent,DialogDescription,DialogFooter, DialogHeader,DialogTitle} from "@/components/ui/dialog"

// Notification type definition
type NotificationType =| "payment_received"| "payment_overdue"| "loan_application"| "loan_approved"| "system_update"| "customer_activity"| "document_verification"

// Notification interface
interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  timestamp: Date
  read: boolean
  relatedId?: string
  relatedName?: string
  amount?: number
}

// Sample notifications data
const sampleNotifications: Notification[] = [
  {
    id: "notif-001",
    type: "payment_received",
    title: "Payment Received",
    message: "Chamud Fernando has made a payment of Rs 5,500 for loan LOAN-001.",
    timestamp: new Date("2023-06-15T09:30:00"),
    read: false,
    relatedId: "LOAN-001",
    relatedName: "Chamud Fernando",
    amount: 5500,
  },
  {
    id: "notif-002",
    type: "payment_overdue",
    title: "Payment Overdue",
    message: "Payment for loan LOAN-003 from Amal Perera is overdue by 3 days.",
    timestamp: new Date("2023-06-14T14:15:00"),
    read: false,
    relatedId: "LOAN-003",
    relatedName: "Amal Perera",
  },
  {
    id: "notif-003",
    type: "loan_application",
    title: "New Loan Application",
    message: "Nimal Silva has submitted a new loan application for Rs 75,000.",
    timestamp: new Date("2023-06-13T11:45:00"),
    read: true,
    relatedId: "APP-002",
    relatedName: "Nimal Silva",
    amount: 75000,
  },
  {
    id: "notif-004",
    type: "system_update",
    title: "System Update",
    message: "The loan management system will be undergoing maintenance on June 20, 2023, from 2:00 AM to 4:00 AM.",
    timestamp: new Date("2023-06-12T16:20:00"),
    read: true,
  },
  {
    id: "notif-005",
    type: "customer_activity",
    title: "Customer Profile Updated",
    message: "Chamud Fernando has updated their contact information.",
    timestamp: new Date("2023-06-11T10:05:00"),
    read: true,
    relatedId: "CUST-001",
    relatedName: "Chamud Fernando",
  },
  {
    id: "notif-006",
    type: "document_verification",
    title: "Document Verification Required",
    message: "New business registration document uploaded by you requires verification.",
    timestamp: new Date("2023-06-10T13:40:00"),
    read: false,
  },
  {
    id: "notif-007",
    type: "payment_received",
    title: "Payment Received",
    message: "Amal Perera has made a payment of Rs 4,200 for loan LOAN-003.",
    timestamp: new Date("2023-06-09T15:30:00"),
    read: true,
    relatedId: "LOAN-003",
    relatedName: "Amal Perera",
    amount: 4200,
  },
  {
    id: "notif-008",
    type: "loan_approved",
    title: "Loan Approved",
    message: "You have approved the loan application for Kasun Mendis for Rs 60,000.",
    timestamp: new Date("2023-06-08T09:15:00"),
    read: true,
    relatedId: "LOAN-004",
    relatedName: "Kasun Mendis",
    amount: 60000,
  },
]

export default function LenderNotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [confirmClearAll, setConfirmClearAll] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [notificationDetailOpen, setNotificationDetailOpen] = useState(false)

  // Filter notifications based on active tab and search query
  const filteredNotifications = notifications.filter((notification) => {
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "unread" && !notification.read) ||
      (activeTab === "read" && notification.read)

    const matchesSearch =
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (notification.relatedName && notification.relatedName.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesTab && matchesSearch
  })

  // Get notification icon based on type
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case "payment_received":
        return <DollarSign className="h-5 w-5 text-green-500" />
      case "payment_overdue":
        return <Clock className="h-5 w-5 text-red-500" />
      case "loan_application":
        return <FileText className="h-5 w-5 text-blue-500" />
      case "loan_approved":
        return <CheckCircle2 className="h-5 w-5 text-green-500" />
      case "system_update":
        return <Info className="h-5 w-5 text-amber-500" />
      case "customer_activity":
        return <User className="h-5 w-5 text-purple-500" />
      case "document_verification":
        return <AlertCircle className="h-5 w-5 text-amber-500" />
      default:
        return <Bell className="h-5 w-5 text-gray-500" />
    }
  }

  // Mark notification as read
  const markAsRead = (id: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    )
  }

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications((prevNotifications) => prevNotifications.map((notification) => ({ ...notification, read: true })))
  }

  // Delete notification
  const deleteNotification = (id: string) => {
    setNotifications((prevNotifications) => prevNotifications.filter((notification) => notification.id !== id))
  }

  // Clear all notifications
  const clearAllNotifications = () => {
    setNotifications([])
    setConfirmClearAll(false)
  }

  // View notification details
  const viewNotificationDetails = (notification: Notification) => {
    setSelectedNotification(notification)
    setNotificationDetailOpen(true)
    if (!notification.read) {
      markAsRead(notification.id)
    }
  }

  // Count unread notifications
  const unreadCount = notifications.filter((notification) => !notification.read).length

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 max-w-5xl">
      <div className="flex items-center mb-6">
        <Button variant="outline" className="mr-4" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold text-blue-600">Notifications</h1>
        {unreadCount > 0 && <Badge className="ml-3 bg-primary">{unreadCount} unread</Badge>}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-blue-600">
              <CardTitle>Your Notifications</CardTitle>
              <CardDescription>Stay updated on payments, loans, and system updates</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => markAllAsRead()} disabled={unreadCount === 0}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark All Read
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setConfirmClearAll(true)}
                disabled={notifications.length === 0}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search notifications..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
                <TabsTrigger value="read">Read</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Notifications List */}
          <div className="space-y-2">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${!notification.read ? "border-l-4 border-l-primary" : ""}`}
                  onClick={() => viewNotificationDetails(notification)}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">{getNotificationIcon(notification.type)}</div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <h3 className={`font-medium ${!notification.read ? "text-primary" : ""}`}>
                          {notification.title}
                        </h3>
                        <div className="flex items-center">
                          <span className="text-xs text-muted-foreground mr-2">
                            {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                          </span>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {!notification.read && (
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    markAsRead(notification.id)
                                  }}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Mark as read
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation()
                                  deleteNotification(notification.id)
                                }}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <BellOff className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium">No notifications</h3>
                <p className="text-muted-foreground">
                  {notifications.length === 0
                    ? "You don't have any notifications"
                    : "No notifications match your filters"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <p>
            Showing {filteredNotifications.length} of {notifications.length} notifications
          </p>
          {notifications.length > 0 && (
            <Button variant="link" size="sm" className="p-0" onClick={() => setActiveTab("all")}>
              View all
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Notification Detail Dialog */}
      <Dialog open={notificationDetailOpen} onOpenChange={setNotificationDetailOpen}>
        {selectedNotification && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getNotificationIcon(selectedNotification.type)}
                <span>{selectedNotification.title}</span>
              </DialogTitle>
              <DialogDescription>
                {format(selectedNotification.timestamp, "MMMM dd, yyyy 'at' h:mm a")}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="mb-4">{selectedNotification.message}</p>

              {selectedNotification.relatedId && (
                <div className="bg-gray-50 p-3 rounded-md mb-4">
                  <div className="flex flex-col gap-2">
                    {selectedNotification.type === "payment_received" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Loan ID:</span>
                          <span className="text-sm font-medium">{selectedNotification.relatedId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Customer:</span>
                          <span className="text-sm font-medium">{selectedNotification.relatedName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Amount:</span>
                          <span className="text-sm font-medium">
                            Rs {selectedNotification.amount?.toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}

                    {selectedNotification.type === "payment_overdue" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Loan ID:</span>
                          <span className="text-sm font-medium">{selectedNotification.relatedId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Customer:</span>
                          <span className="text-sm font-medium">{selectedNotification.relatedName}</span>
                        </div>
                      </>
                    )}

                    {selectedNotification.type === "loan_application" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Application ID:</span>
                          <span className="text-sm font-medium">{selectedNotification.relatedId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Customer:</span>
                          <span className="text-sm font-medium">{selectedNotification.relatedName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Requested Amount:</span>
                          <span className="text-sm font-medium">
                            Rs {selectedNotification.amount?.toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}

                    {selectedNotification.type === "loan_approved" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Loan ID:</span>
                          <span className="text-sm font-medium">{selectedNotification.relatedId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Customer:</span>
                          <span className="text-sm font-medium">{selectedNotification.relatedName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Loan Amount:</span>
                          <span className="text-sm font-medium">
                            Rs {selectedNotification.amount?.toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}

                    {selectedNotification.type === "customer_activity" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Customer ID:</span>
                          <span className="text-sm font-medium">{selectedNotification.relatedId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Customer Name:</span>
                          <span className="text-sm font-medium">{selectedNotification.relatedName}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Confirm Clear All Dialog */}
      <Dialog open={confirmClearAll} onOpenChange={setConfirmClearAll}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear All Notifications</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear all notifications? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmClearAll(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={clearAllNotifications}>
              Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}