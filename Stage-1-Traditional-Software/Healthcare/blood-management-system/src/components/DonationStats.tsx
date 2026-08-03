import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Heart, HeartPulse } from "lucide-react"

const DonationStats = () => {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl"> Our Impact</h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto"> Together we're making a difference in our community</p>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-primary/20 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-2xl font-bold">15,000+</CardTitle>
              <Heart className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent><p className="text-sm text-gray-500">Blood Donations</p></CardContent>
          </Card>
          <Card className="border-primary/20 hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-2xl font-bold">45,000+</CardTitle>
              <HeartPulse className="h-6 w-6 text-primary" />
            </CardHeader>
            <CardContent><p className="text-sm text-gray-500">Lives Saved</p></CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
export default DonationStats
