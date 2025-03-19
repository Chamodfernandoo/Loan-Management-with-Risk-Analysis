import { ButtonCard } from "@/components/default/card"

const Customer_dashbord = () => {
  return (
    <div className="grid grid-cols-1 gap-6 p-10 md:grid-cols-2 lg:grid-cols-3">
      <ButtonCard icon="" title="My Loans" href="/customer/loans" />
      <ButtonCard icon="" title="My Profile" href="/customer/profile" />
      <ButtonCard icon="" title="Support" href="/customer/support" />
      <ButtonCard icon="" title="Find Lenders" href="/borrower/ads/all-ads" />
      <ButtonCard icon="" title="Notification" href="/notifications" />
      <ButtonCard icon="" title="Lender dashbord(this is temparaly) " href="/" />

    </div>
  )
}

export default Customer_dashbord
