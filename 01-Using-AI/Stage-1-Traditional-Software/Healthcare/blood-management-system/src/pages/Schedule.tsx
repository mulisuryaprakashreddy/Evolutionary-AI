import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CalendarHeart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AppointmentForm } from "@/components/AppointmentForm"
import { AppointmentList } from "@/components/AppointmentList"
import { EligibilityCheck } from "@/components/EligibilityCheck"

const Schedule = () => {
  const [showAppointments, setShowAppointments] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl"> Schedule a Donation</h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto"> Your donation can save up to three lives</p>
        </div>
        <div className="max-w-4xl mx-auto">
          <Tabs defaultValue="appointment" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="appointment">Appointment</TabsTrigger>
              <TabsTrigger value="eligibility">Eligibility Check</TabsTrigger>
            </TabsList>
            <TabsContent value="appointment">
              <Card>
                <CardHeader>
                  <CardTitle>Book Your Appointment</CardTitle>
                  <CardDescription>Select a donation center, date, and time that works for you.</CardDescription>
                </CardHeader>
                <CardContent>
                  <AppointmentForm />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="eligibility">
              <Card>
                <CardHeader>
                  <CardTitle>Eligibility Check</CardTitle>
                  <CardDescription>Answer a few questions to check if you're eligible to donate blood.</CardDescription>
                </CardHeader>
                <CardContent>
                  <EligibilityCheck />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          <div className="mt-8 bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-start">
              <CalendarHeart className="h-12 w-12 text-primary mr-4 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-medium text-gray-900">Already Have an Appointment?</h3>
                <p className="mt-1 text-gray-600">You can manage your existing appointments, reschedule, or cancel if needed.</p>
                <div className="mt-4">
                  <Dialog open={showAppointments} onOpenChange={setShowAppointments}>
                  <DialogTrigger>
                    <Button>Manage Appointments</Button>
                  </DialogTrigger>
                    <DialogContent className="max-w-4xl">
                      <DialogHeader>
                        <DialogTitle>Your Appointments</DialogTitle>
                      </DialogHeader>
                      <AppointmentList />
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
export default Schedule
