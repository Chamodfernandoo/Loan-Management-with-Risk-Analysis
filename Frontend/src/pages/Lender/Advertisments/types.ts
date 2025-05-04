export interface Location {
  district: string
  city: string
}

export interface LenderAd {
  id: string
  createdAt: Date
  updatedAt: Date
  location: Location
  shopName: string
  lenderName: string
  contactNumber: string
  description: string
  photos: string[]
  lenderId: string
  interestRate: number
  loanTypes: string[]
  // Support for snake_case properties from API
  shop_name?: string
  lender_name?: string
  contact_number?: string
  lender_id?: string
  interest_rate?: number
  loan_types?: string[]
  created_at?: string | Date
  updated_at?: string | Date
}

export const loanTypes = [
  "Personal",
  "Business",
  "Home",
  "Vehicle",
  "Education",
  "Agriculture",
  "Microfinance",
  "Emergency",
]

export const districts = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Matale",
  "Nuwara Eliya",
  "Galle",
  "Matara",
  "Hambantota",
  "Jaffna",
  "Kilinochchi",
  "Mannar",
  "Vavuniya",
  "Mullaitivu",
  "Batticaloa",
  "Ampara",
  "Trincomalee",
  "Kurunegala",
  "Puttalam",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Monaragala",
  "Ratnapura",
  "Kegalle",
]

export const cities: Record<string, string[]> = {
  Colombo: ["Colombo", "Dehiwala", "Moratuwa", "Kotte", "Kolonnawa"],
  Gampaha: ["Gampaha", "Negombo", "Wattala", "Ja-Ela", "Kadawatha"],
  Kalutara: ["Kalutara", "Panadura", "Horana", "Bandaragama", "Beruwala"],
  Kandy: ["Kandy", "Peradeniya", "Katugastota", "Gampola", "Nawalapitiya", "Akurana", "Pilimatalawa", "Wattegama"],
  Kegalle: [
    "Kegalle",
    "Mawanella",
    "Warakapola",
    "Rambukkana",
    "Ruwanwella",
    "Dehiowita",
    "Deraniyagala",
    "Galigamuwa",
  ],
  Kilinochchi: ["Kilinochchi", "Pallai", "Paranthan", "Poonakary", "Karachchi"],
  Kurunegala: ["Kurunegala", "Kuliyapitiya", "Polgahawela", "Narammala", "Wariyapola"],
  Mannar: ["Mannar", "Madhu", "Adampan", "Nanattan", "Musali"],
  Matale: ["Matale", "Dambulla", "Galewela", "Rattota", "Naula"],
  Matara: ["Matara", "Weligama", "Akuressa", "Dikwella", "Deniyaya"],
  Monaragala: ["Monaragala", "Wellawaya", "Bibile", "Buttala", "Kataragama"],
  Mullaitivu: ["Mullaitivu", "Mulliyawalai", "Puthukkudiyiruppu", "Oddusuddan", "Maritimepattu"],
  "Nuwara Eliya": ["Nuwara Eliya", "Hatton", "Talawakele", "Maskeliya", "Kotagala"],
  Polonnaruwa: ["Polonnaruwa", "Kaduruwela", "Hingurakgoda", "Medirigiriya", "Lankapura"],
  Puttalam: ["Puttalam", "Chilaw", "Wennappuwa", "Marawila", "Anamaduwa"],
  Ratnapura: ["Ratnapura", "Embilipitiya", "Balangoda", "Eheliyagoda", "Pelmadulla"],
  Trincomalee: ["Trincomalee", "Kinniya", "Muttur", "Kantale", "Thampalakamam"],
  Vavuniya: ["Vavuniya", "Cheddikulam", "Nedunkeni", "Omanthai", "Vavuniya South"],
}