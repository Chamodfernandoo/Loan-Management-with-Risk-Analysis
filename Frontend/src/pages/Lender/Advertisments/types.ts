export type Location = {
    district: string
    city: string
  }
  
  export type LenderAd = {
    id: string
    createdAt: Date
    updatedAt: Date
    location: Location
    shopName: string
    lenderName: string
    contactNumber: string
    description: string
    photos: string[]
    lenderId: string // To identify which lender created the ad
    interestRate: number // Added interest rate field
    loanTypes: string[] // Added loan types (e.g., "Personal", "Business", "Home")
  }
  
  // Sri Lankan districts
  export const districts = [
    "Ampara",
    "Anuradhapura",
    "Badulla",
    "Batticaloa",
    "Colombo",
    "Galle",
    "Gampaha",
    "Hambantota",
    "Jaffna",
    "Kalutara",
    "Kandy",
    "Kegalle",
    "Kilinochchi",
    "Kurunegala",
    "Mannar",
    "Matale",
    "Matara",
    "Monaragala",
    "Mullaitivu",
    "Nuwara Eliya",
    "Polonnaruwa",
    "Puttalam",
    "Ratnapura",
    "Trincomalee",
    "Vavuniya",
  ]
  
  // Cities by district
  export const cities: Record<string, string[]> = {
    Ampara: ["Ampara", "Kalmunai", "Akkaraipattu", "Sammanthurai", "Pottuvil"],
    Anuradhapura: ["Anuradhapura", "Kekirawa", "Medawachchiya", "Tambuttegama", "Eppawala"],
    Badulla: ["Badulla", "Bandarawela", "Haputale", "Welimada", "Ella"],
    Batticaloa: ["Batticaloa", "Kattankudy", "Eravur", "Valaichchenai", "Kaluwanchikudy"],
    Colombo: [
      "Colombo 1",
      "Colombo 2",
      "Colombo 3",
      "Dehiwala",
      "Mount Lavinia",
      "Moratuwa",
      "Kolonnawa",
      "Kaduwela",
      "Kotte",
      "Keselwatta",
      "Dematagoda",
      "Wellampitiya",
    ],
    Galle: ["Galle", "Ambalangoda", "Hikkaduwa", "Baddegama", "Elpitiya"],
    Gampaha: ["Gampaha", "Negombo", "Kadawatha", "Kelaniya", "Wattala", "Ja-Ela", "Kandana", "Ragama", "Minuwangoda"],
    Hambantota: ["Hambantota", "Tangalle", "Ambalantota", "Beliatta", "Tissamaharama"],
    Jaffna: ["Jaffna", "Nallur", "Chavakachcheri", "Manipay", "Kopay"],
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

  // Loan types
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