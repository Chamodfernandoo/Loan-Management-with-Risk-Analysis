import { useState, useEffect } from "react"
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
import { notificationService } from "@/services/api"
import { useNotifications } from "@/context/NotificationContext"
import { Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Notification type definition - mapped to backend types
type NotificationType = 
  | "payment_received"
  | "payment_overdue"
  | "loan_application"
  | "loan_approved"
  | "system_update"
  | "customer_activity"
  | "document_verification"

// Notification interface mapped to what the backend returns
interface Notification {
  _id: string
  type: NotificationType
  title: string
  message: string
  timestamp: string
  read: boolean
  related_id?: string
  related_data?: {
    amount?: number
    customer_name?: string
    lender_name?: string
    [key: string]: any
  }
}

export default function LenderNotificationsPage() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { refreshUnreadCount } = useNotifications()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [confirmClearAll, setConfirmClearAll] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null)
  const [notificationDetailOpen, setNotificationDetailOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [totalNotifications, setTotalNotifications] = useState(0)
  const [limit] = useState(20)
  const [offset, setOffset] = useState(0)

  // Fetch notifications
  useEffect(() => {
    fetchNotifications()
  }, [activeTab, offset])

  const fetchNotifications = async () => {
    setIsLoading(true)
    try {
      const params: any = { limit, offset }
      
      // Set read parameter based on the activeTab
      if (activeTab === "unread") {
        params.read = false
      } else if (activeTab === "read") {
        params.read = true
      }
      
      const response = await notificationService.getNotifications(params)
      setNotifications(response.notifications || [])
      setTotalNotifications(response.total || 0)
    } catch (error) {
      console.error("Error fetching notifications:", error)
      toast({
        title: "Error",
        description: "Failed to load notifications. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Filter notifications based on search query
  const filteredNotifications = notifications.filter((notification) => {
    const matchesSearch =
      notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (notification.related_data?.customer_name && 
        notification.related_data.customer_name.toLowerCase().includes(searchQuery.toLowerCase()))

    return matchesSearch
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
  const markAsRead = async (id: string) => {
    try {
      await notificationService.markAsRead(id)
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === id ? { ...notification, read: true } : notification,
        ),
      )
      refreshUnreadCount() // Update the unread count in the context
    } catch (error) {
      console.error("Error marking notification as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark notification as read.",
        variant: "destructive"
      })
    }
  }

  // Mark all notifications as read
  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead()
      setNotifications((prevNotifications) => 
        prevNotifications.map((notification) => ({ ...notification, read: true }))
      )
      refreshUnreadCount() // Update the unread count in the context
      toast({
        title: "Success",
        description: "All notifications marked as read.",
      })
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read.",
        variant: "destructive"
      })
    }
  }

  // Delete notification
  const deleteNotification = async (id: string) => {
    try {
      await notificationService.deleteNotification(id)
      setNotifications((prevNotifications) => 
        prevNotifications.filter((notification) => notification._id !== id)
      )
      toast({
        title: "Success",
        description: "Notification deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting notification:", error)
      toast({
        title: "Error",
        description: "Failed to delete notification.",
        variant: "destructive"
      })
    }
  }

  // Clear all notifications
  const clearAllNotifications = async () => {
    try {
      await notificationService.deleteAllNotifications()
      setNotifications([])
      setConfirmClearAll(false)
      toast({
        title: "Success",
        description: "All notifications cleared successfully.",
      })
    } catch (error) {
      console.error("Error clearing all notifications:", error)
      toast({
        title: "Error",
        description: "Failed to clear all notifications.",
        variant: "destructive"
      })
    }
  }

  // View notification details
  const viewNotificationDetails = (notification: Notification) => {
    setSelectedNotification(notification)
    setNotificationDetailOpen(true)
    if (!notification.read) {
      markAsRead(notification._id)
    }
  }

  // Handle load more notifications
  const loadMoreNotifications = () => {
    setOffset(offset + limit)
  }

  // Count unread notifications
  const unreadCount = notifications.filter((notification) => !notification.read).length

  // Format ISO date to relative time
  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    return formatDistanceToNow(date, { addSuffix: true })
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 max-w-5xl">
      <div className="flex items-center mb-6">
        <Button variant="outline" className="mr-4" onClick={() => navigate("/lender")}>
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
              <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
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
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : filteredNotifications.length > 0 ? (
              <>
                {filteredNotifications.map((notification) => (
                  <div
                    key={notification._id}
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
                              {formatRelativeTime(notification.timestamp)}
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
                                      markAsRead(notification._id)
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
                                    deleteNotification(notification._id)
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
                ))}
                
                {/* Load More button */}
                {notifications.length < totalNotifications && (
                  <div className="flex justify-center mt-4">
                    <Button variant="outline" onClick={loadMoreNotifications}>
                      Load More
                    </Button>
                  </div>
                )}
              </>
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
            Showing {filteredNotifications.length} of {totalNotifications} notifications
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
                {format(new Date(selectedNotification.timestamp), "MMMM dd, yyyy 'at' h:mm a")}
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <p className="mb-4">{selectedNotification.message}</p>

              {selectedNotification.related_id && selectedNotification.related_data && (
                <div className="bg-gray-50 p-3 rounded-md mb-4">
                  <div className="flex flex-col gap-2">
                    {selectedNotification.type === "payment_received" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Loan ID:</span>
                          <span className="text-sm font-medium">{selectedNotification.related_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Customer:</span>
                          <span className="text-sm font-medium">{selectedNotification.related_data.customer_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Amount:</span>
                          <span className="text-sm font-medium">
                            Rs {selectedNotification.related_data.amount?.toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}

                    {selectedNotification.type === "payment_overdue" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Loan ID:</span>
                          <span className="text-sm font-medium">{selectedNotification.related_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Customer:</span>
                          <span className="text-sm font-medium">{selectedNotification.related_data.customer_name}</span>
                        </div>
                      </>
                    )}

                    {selectedNotification.type === "loan_application" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Application ID:</span>
                          <span className="text-sm font-medium">{selectedNotification.related_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Customer:</span>
                          <span className="text-sm font-medium">{selectedNotification.related_data.customer_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Requested Amount:</span>
                          <span className="text-sm font-medium">
                            Rs {selectedNotification.related_data.amount?.toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}

                    {selectedNotification.type === "loan_approved" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Loan ID:</span>
                          <span className="text-sm font-medium">{selectedNotification.related_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Customer:</span>
                          <span className="text-sm font-medium">{selectedNotification.related_data.customer_name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Loan Amount:</span>
                          <span className="text-sm font-medium">
                            Rs {selectedNotification.related_data.amount?.toLocaleString()}
                          </span>
                        </div>
                      </>
                    )}

                    {selectedNotification.type === "customer_activity" && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Customer ID:</span>
                          <span className="text-sm font-medium">{selectedNotification.related_id}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Customer Name:</span>
                          <span className="text-sm font-medium">{selectedNotification.related_data.customer_name}</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Action buttons for specific notification types */}
              {selectedNotification.type === "payment_received" && (
                <div className="flex justify-end mt-4">
                  <Button 
                    onClick={() => {
                      setNotificationDetailOpen(false)
                      navigate(`/invoice/${selectedNotification.related_id}`)
                    }}
                  >
                    View Loan Details
                  </Button>
                </div>
              )}

              {selectedNotification.type === "loan_application" && (
                <div className="flex justify-end mt-4">
                  <Button 
                    onClick={() => {
                      setNotificationDetailOpen(false)
                      navigate(`/view_loan?loanId=${selectedNotification.related_id}`)
                    }}
                  >
                    View Application
                  </Button>
                </div>
              )}

              {selectedNotification.type === "payment_overdue" && (
                <div className="flex justify-end mt-4">
                  <Button 
                    onClick={() => {
                      setNotificationDetailOpen(false)
                      navigate(`/view_loan?loanId=${selectedNotification.related_id}`)
                    }}
                  >
                    View Loan Details
                  </Button>
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