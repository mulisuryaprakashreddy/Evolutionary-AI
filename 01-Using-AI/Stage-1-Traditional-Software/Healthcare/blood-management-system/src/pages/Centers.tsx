import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DonorSection } from "@/components/DonorSection"
import { ReceiverSection } from "@/components/ReceiverSection"

const Centers = () => {
  const [mode, setMode] = useState<"donor" | "receiver" | undefined>(undefined)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl"> Donation Centers</h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">Find a blood donation center near you, whether you are a donor or a recipient.</p>
        </div>
        <div className="flex justify-center gap-6 mb-8">
          <Button
            variant={mode === "donor" ? "default" : "outline"}
            className={mode === "donor" ? "bg-primary text-white" : "border-primary text-primary"}
            onClick={() => setMode("donor")}
          >
            I want to Donate
          </Button>
          <Button
            variant={mode === "receiver" ? "default" : "outline"}
            className={mode === "receiver" ? "bg-primary text-white" : "border-primary text-primary"}
            onClick={() => setMode("receiver")}
          >
            I need Blood
          </Button>
        </div>
        {mode === "donor" && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-center mb-6">Donor Registration</h2>
            <DonorSection />
          </div>
        )}
        {mode === "receiver" && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-center mb-6">Find Blood Donors</h2>
            <ReceiverSection />
          </div>
        )}
      </main>
      <Footer />
    </div>
  )
}
export default Centers
