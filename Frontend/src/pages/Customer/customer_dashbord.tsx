import { ButtonCard } from "@/components/default/card"
const Customer_dashbord = () => {
  return (
    <div className="grid grid-cols-1 gap-6 p-10 md:grid-cols-2 lg:grid-cols-3 ">
          <ButtonCard icon="" title="Create Loan" href="/create_loan" />
          <ButtonCard icon="" title="View Loan" href="/view_loan" />
          <ButtonCard icon="" title="View Profile" href="/view_profile" />
          <ButtonCard icon="" title="Create Loan" href="/create_loan" />
          <ButtonCard icon="" title="View Loan" href="/view_loan" />
          <ButtonCard icon="" title="View Profile" href="/view_profile" />
        </div>
  )
}

export default Customer_dashbord