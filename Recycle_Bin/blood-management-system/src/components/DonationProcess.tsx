import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"

const steps = [
  { number: 1, title: "Registration", description: "Complete a short registration form with your personal details and medical history." },
  { number: 2, title: "Screening", description: "Undergo a quick health check including blood pressure, pulse, and hemoglobin levels." },
  { number: 3, title: "Donation", description: "The actual donation takes about 10-15 minutes, while you relax in a comfortable chair." },
  { number: 4, title: "Recovery", description: "Enjoy refreshments and take a short rest before heading back to your day." }
]

const DonationProcess = () => {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl"> The Donation Process</h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto"> Simple, safe, and takes less than an hour of your time</p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <Card key={step.number} className="relative border-primary/20 hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold mb-4">{step.number}</div>
                <CardTitle>{step.title}</CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
export default DonationProcess
