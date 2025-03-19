import { ButtonCard } from "@/components/default/card"

const Lender_dashbord = () => {
  return (
    <div className="grid grid-cols-1 gap-6 p-10 md:grid-cols-2 lg:grid-cols-3 ">
      <ButtonCard icon="" title="Create Loan" href="/create_loan" />
      <ButtonCard icon="" title="View Loan" href="/view_loan" />
      <ButtonCard icon="" title="Customer History" href="/customer-history" />
      <ButtonCard icon="" title="Loan Agreements" href="/create_loan" />
      <ButtonCard icon="" title="Analyse Profile" href="/view_loan" />
      <ButtonCard icon="" title="Advertisements" href="/lender/ads/all-ads" />
    </div>
  )
}

export default Lender_dashbord
