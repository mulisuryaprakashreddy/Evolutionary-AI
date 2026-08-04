import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DonorSection } from "@/components/DonorSection"
import { ReceiverSection } from "@/components/ReceiverSection"
import Hero from "@/components/Hero"
import DonationStats from "@/components/DonationStats"
import DonationProcess from "@/components/DonationProcess"
import BloodTypeInfo from "@/components/BloodTypeInfo"

const Index = () => {
  const [showDonorForm, setShowDonorForm] = useState(false)
  const [showReceiverForm, setShowReceiverForm] = useState(false)

  const handleDonateClick = () => { setShowDonorForm(true) }
  const handleReceiveClick = () => { setShowReceiverForm(true) }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main>
        <Hero onDonateClick={handleDonateClick} onReceiveClick={handleReceiveClick} />
        <DonationStats />
        <DonationProcess />
        <BloodTypeInfo />
      </main>
      <Footer />
      <Dialog open={showDonorForm} onOpenChange={setShowDonorForm}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Donor Registration</DialogTitle>
          </DialogHeader>
          <DonorSection />
        </DialogContent>
      </Dialog>
      <Dialog open={showReceiverForm} onOpenChange={setShowReceiverForm}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Find Blood Donors</DialogTitle>
          </DialogHeader>
          <ReceiverSection />
        </DialogContent>
      </Dialog>
    </div>
  )
}
export default Index
