import { ButtonCard } from "@/components/default/card"

const Customer_dashbord = () => {
  return (
    <div className="grid grid-cols-1 gap-6 p-10 md:grid-cols-2 lg:grid-cols-3">
      <ButtonCard icon="" title="My Loans" href="/borrower/loans" />
      <ButtonCard icon="" title="My Profile" href="/borrower/profile" />
      <ButtonCard icon="" title="Support" href="/borrower/support" />
      <ButtonCard icon="" title="Find Lenders" href="/borrower/ads/all-ads" />
      <ButtonCard icon="" title="Notification" href="/borrower/notifications" />
      <ButtonCard icon="" title="Lender dashbord(this is temparaly) " href="/lender" />
      <ButtonCard icon="" title="Loans Summary" href="/borrower/loan-summary" />

    </div>
  )
}

export default Customer_dashbord
