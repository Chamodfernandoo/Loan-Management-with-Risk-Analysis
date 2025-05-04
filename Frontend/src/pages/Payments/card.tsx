import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { ArrowLeft, Plus, Trash, CreditCard, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { paymentService } from "@/services/api"
import { useToast } from "@/hooks/use-toast"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"

// Card interface
interface PaymentCard {
  id: string
  cardNumber: string
  cardholderName: string
  expiryMonth: string
  expiryYear: string
  cardType: "visa" | "mastercard" | "amex" | "discover"
  isDefault: boolean
  nickname?: string
}

export default function CardsPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()
  const [cards, setCards] = useState<PaymentCard[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteInProgress, setDeleteInProgress] = useState<string | null>(null)
  
  // Get return URL from location state if available
  const returnUrl = location.state?.returnUrl
  const loanId = location.state?.loanId
  const loanData = location.state?.loanData

  // Fetch cards on component mount
  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true)
      try {
        const cardsData = await paymentService.getCards()
        setCards(Array.isArray(cardsData) ? cardsData : [])
      } catch (error) {
        console.error("Error fetching cards:", error)
        toast({
          title: "Error",
          description: "Failed to load your payment cards.",
          variant: "destructive",
        })
        setCards([])
      } finally {
        setLoading(false)
      }
    }

    fetchCards()
  }, [toast])

  // Handle adding a new card
  const handleAddCard = () => {
    navigate("/payments/add-card", { 
      state: { 
        returnUrl: "/payments/cards",
        loanId,
        loanData 
      } 
    })
  }

  // Handle deleting a card
  const handleDeleteCard = async (cardId: string) => {
    setDeleteInProgress(cardId)
    try {
      await paymentService.deleteCard(cardId)
      setCards(cards.filter(card => card.id !== cardId))
      toast({
        title: "Card deleted",
        description: "Your card has been deleted successfully.",
      })
    } catch (error) {
      console.error("Error deleting card:", error)
      toast({
        title: "Error",
        description: "Failed to delete card. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleteInProgress(null)
    }
  }

  // Get card type icon/text
  const getCardTypeDisplay = (cardType: string) => {
    switch (cardType) {
      case "visa":
        return {
          text: "VISA",
          className: "text-blue-600 font-bold"
        }
      case "mastercard":
        return {
          text: "MASTERCARD",
          className: "text-red-600 font-bold"
        }
      case "amex":
        return {
          text: "AMEX",
          className: "text-blue-800 font-bold"
        }
      case "discover":
        return {
          text: "DISCOVER",
          className: "text-orange-600 font-bold"
        }
      default:
        return {
          text: "CARD",
          className: "text-gray-600 font-bold"
        }
    }
  }

  // Go back to payment page if applicable
  const handleReturn = () => {
    const returnUrl = location.state?.returnUrl || "/borrower"
    navigate(returnUrl, { 
      state: { 
        loanId: location.state?.loanId,
        amount: location.state?.amount,
        loanData: location.state?.loanData
      }
    })
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Button variant="outline" className="mr-4" onClick={handleReturn}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold">Your Payment Cards</h1>
        </div>
        <Button onClick={handleAddCard}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Card
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading your cards...</span>
        </div>
      ) : cards.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => {
            const cardType = getCardTypeDisplay(card.cardType)
            
            return (
              <Card key={card.id} className={card.isDefault ? "border-primary" : ""}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center">
                        <CreditCard className="h-5 w-5 mr-2" />
                        <span className={cardType.className}>{cardType.text}</span>
                      </CardTitle>
                      <CardDescription>
                        {card.nickname || `Card ending in ${card.cardNumber.slice(-4)}`}
                      </CardDescription>
                    </div>
                    {card.isDefault && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm space-y-1">
                    <div className="font-medium">•••• •••• •••• {card.cardNumber.slice(-4)}</div>
                    <div className="text-muted-foreground">{card.cardholderName}</div>
                    <div className="text-muted-foreground">Expires {card.expiryMonth}/{card.expiryYear.slice(-2)}</div>
                  </div>
                </CardContent>
                <CardFooter className="pt-0">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-500 hover:text-red-700">
                        <Trash className="h-4 w-4 mr-2" />
                        {deleteInProgress === card.id ? "Deleting..." : "Delete Card"}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete your card ending in {card.cardNumber.slice(-4)}.
                          This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => handleDeleteCard(card.id)}
                          className="bg-red-500 hover:bg-red-600"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-10">
            <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Payment Cards</h3>
            <p className="text-muted-foreground mb-6">You haven't added any payment cards yet.</p>
            <Button onClick={handleAddCard}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Card
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}