import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { HeartPulse } from "lucide-react"

const Profile = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-1/3 lg:w-1/4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center">
                  <Avatar className="h-24 w-24 mb-4">
                    <AvatarImage src="" alt="User" />
                    <AvatarFallback className="bg-primary text-white text-xl">JD</AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold">John Doe</h2>
                  <p className="text-gray-500 mb-2">johndoe@example.com</p>
                  <Badge className="bg-primary">O+ Blood Type</Badge>
                  <div className="mt-6 w-full">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Donation Progress</span>
                      <span className="text-sm text-gray-500">5/8</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-primary h-2 rounded-full" style={{ width: '62.5%' }}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">5 more donations to reach Gold status</p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 w-full mt-6 text-center">
                    <div className="bg-primary/5 p-2 rounded-lg">
                      <p className="text-2xl font-bold text-primary">8</p>
                      <p className="text-xs text-gray-500">Donations</p>
                    </div>
                    <div className="bg-primary/5 p-2 rounded-lg">
                      <p className="text-2xl font-bold text-primary">24</p>
                      <p className="text-xs text-gray-500">Lives Saved</p>
                    </div>
                    <div className="bg-primary/5 p-2 rounded-lg">
                      <p className="text-2xl font-bold text-primary">3</p>
                      <p className="text-xs text-gray-500">Badges</p>
                    </div>
                  </div>
                  <Button className="w-full mt-6 bg-primary hover:bg-primary-dark">Schedule Donation</Button>
                </div>
              </CardContent>
            </Card>
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
                <CardDescription>Badges earned through your donations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <HeartPulse className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-xs mt-1">First Time</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <HeartPulse className="h-6 w-6 text-primary" />
                    </div>
                    <span className="text-xs mt-1">5 Donations</span>
                  </div>
                  <div className="flex flex-col items-center text-center">
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                      <HeartPulse className="h-6 w-6 text-gray-400" />
                    </div>
                    <span className="text-xs mt-1">10 Donations</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="w-full md:w-2/3 lg:w-3/4">
            <Card>
              <CardHeader>
                <CardTitle>Donation History</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">No donation history yet. Schedule your first appointment!</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
export default Profile
