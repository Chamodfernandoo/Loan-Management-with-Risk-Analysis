import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, CreditCard, Plus, Trash2, MoreVertical, Edit, Star, StarOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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

// Sample cards data
const sampleCards: PaymentCard[] = [
  {
    id: "card-1",
    cardNumber: "4111111111111111",
    cardholderName: "John Smith",
    expiryMonth: "12",
    expiryYear: "2025",
    cardType: "visa",
    isDefault: true,
    nickname: "Personal Card",
  },
  {
    id: "card-2",
    cardNumber: "5555555555554444",
    cardholderName: "John Smith",
    expiryMonth: "06",
    expiryYear: "2026",
    cardType: "mastercard",
    isDefault: false,
    nickname: "Business Card",
  },
  {
    id: "card-3",
    cardNumber: "378282246310005",
    cardholderName: "John Smith",
    expiryMonth: "09",
    expiryYear: "2024",
    cardType: "amex",
    isDefault: false,
  },
]

export default function CardsPage() {
  const navigate = useNavigate()
  const [cards, setCards] = useState<PaymentCard[]>(sampleCards)
  const [cardToDelete, setCardToDelete] = useState<PaymentCard | null>(null)
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)

  // Get card type icon
  const getCardTypeIcon = (cardType: string) => {
    switch (cardType) {
      case "visa":
        return "💳 Visa"
      case "mastercard":
        return "💳 Mastercard"
      case "amex":
        return "💳 American Express"
      case "discover":
        return "💳 Discover"
      default:
        return "💳"
    }
  }

  // Set card as default
  const setDefaultCard = (cardId: string) => {
    setCards(
      cards.map((card) => ({
        ...card,
        isDefault: card.id === cardId,
      })),
    )
  }

  // Delete card
  const deleteCard = () => {
    if (cardToDelete) {
      setCards(cards.filter((card) => card.id !== cardToDelete.id))
      setCardToDelete(null)
      setConfirmDeleteOpen(false)
    }
  }

  // Open delete confirmation
  const openDeleteConfirmation = (card: PaymentCard) => {
    setCardToDelete(card)
    setConfirmDeleteOpen(true)
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-8 max-w-3xl">
      <div className="flex items-center mb-6">
        <Button variant="outline" className="mr-4" onClick={() => navigate("/borrower/loan-summary")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Loans
        </Button>
        <h1 className="text-2xl sm:text-3xl font-bold">Payment Cards</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Your Payment Cards</CardTitle>
              <CardDescription>Manage your saved payment cards</CardDescription>
            </div>
            <Button onClick={() => navigate("/payments/add-card")}>
              <Plus className="h-4 w-4 mr-2" />
              Add New Card
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {cards.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="text-lg font-medium">No cards added yet</h3>
              <p className="text-muted-foreground mb-4">Add a payment card to make payments</p>
              <Button onClick={() => navigate("/payments/add-card")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Card
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {cards.map((card) => (
                <div key={card.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      <div className="mr-3">
                        <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                          {card.cardType === "visa" && <span className="text-blue-600 font-bold text-sm">VISA</span>}
                          {card.cardType === "mastercard" && <span className="text-red-600 font-bold text-sm">MC</span>}
                          {card.cardType === "amex" && <span className="text-blue-800 font-bold text-sm">AMEX</span>}
                          {card.cardType === "discover" && (
                            <span className="text-orange-600 font-bold text-sm">DISC</span>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium">•••• {card.cardNumber.slice(-4)}</span>
                          {card.isDefault && (
                            <span className="ml-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          {card.nickname || card.cardholderName} • Expires {card.expiryMonth}/
                          {card.expiryYear.slice(-2)}
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {!card.isDefault && (
                          <DropdownMenuItem onClick={() => setDefaultCard(card.id)}>
                            <Star className="h-4 w-4 mr-2" />
                            Set as Default
                          </DropdownMenuItem>
                        )}
                        {card.isDefault && (
                          <DropdownMenuItem disabled>
                            <StarOff className="h-4 w-4 mr-2" />
                            Default Card
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => navigate(`/payments/edit-card/${card.id}`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Card
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => openDeleteConfirmation(card)}
                          disabled={card.isDefault && cards.length > 1}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete Card
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-6">
          <Button variant="outline" onClick={() => navigate("/borrower/loan-summary")}>
            Back to Loans
          </Button>
          <Button onClick={() => navigate("/payments/make-payment")}>Make a Payment</Button>
        </CardFooter>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Card</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this card? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {cardToDelete && (
            <div className="bg-muted p-4 rounded-lg my-2">
              <div className="flex items-center">
                <div className="mr-3">
                  <div className="w-10 h-6 bg-gray-100 rounded flex items-center justify-center">
                    {cardToDelete.cardType === "visa" && <span className="text-blue-600 font-bold text-xs">VISA</span>}
                    {cardToDelete.cardType === "mastercard" && (
                      <span className="text-red-600 font-bold text-xs">MC</span>
                    )}
                    {cardToDelete.cardType === "amex" && <span className="text-blue-800 font-bold text-xs">AMEX</span>}
                    {cardToDelete.cardType === "discover" && (
                      <span className="text-orange-600 font-bold text-xs">DISC</span>
                    )}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium">•••• {cardToDelete.cardNumber.slice(-4)}</div>
                  <div className="text-xs text-muted-foreground">
                    {cardToDelete.nickname || cardToDelete.cardholderName}
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={deleteCard}>
              Delete Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}