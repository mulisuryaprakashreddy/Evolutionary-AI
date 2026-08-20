import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { supabase } from "@/integrations/supabase/client"

interface AppointmentFormProps { isRescheduling?: boolean; existingAppointment?: any; onSuccess?: () => void }

export const AppointmentForm = ({ isRescheduling = false, existingAppointment, onSuccess }: AppointmentFormProps) => {
  const { toast } = useToast()
  const [firstName, setFirstName] = useState(existingAppointment?.first_name || "")
  const [lastName, setLastName] = useState(existingAppointment?.last_name || "")
  const [email, setEmail] = useState(existingAppointment?.email || "")
  const [phone, setPhone] = useState(existingAppointment?.phone || "")
  const [center, setCenter] = useState(existingAppointment?.donation_center || "")
  const [date, setDate] = useState<Date | undefined>(existingAppointment?.appointment_date ? new Date(existingAppointment.appointment_date) : undefined)
  const [time, setTime] = useState(existingAppointment?.appointment_time || "")
  const [donationType, setDonationType] = useState(existingAppointment?.donation_type || "")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const appointmentData = {
        first_name: firstName,
        last_name: lastName,
        email,
        phone,
        donation_center: center,
        appointment_date: date?.toISOString(),
        appointment_time: time,
        donation_type: donationType,
      }
      if (isRescheduling && existingAppointment) {
        const { error } = await supabase.from("appointments").update(appointmentData).eq("id", existingAppointment.id)
        if (error) throw error
        toast({ title: "Success", description: "Appointment rescheduled successfully!" })
      } else {
        const { error } = await supabase.from("appointments").insert([appointmentData])
        if (error) throw error
        toast({ title: "Success", description: "Appointment booked successfully!" })
      }
      onSuccess?.()
    } catch (error) {
      toast({ title: "Error", description: "Something went wrong. Please try again.", variant: "destructive" })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label>Donation Center</Label>
        <select
          value={center}
          onChange={(e) => setCenter(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          required
        >
          <option value="">Select center</option>
          <option value="city-hospital">City Hospital</option>
          <option value="red-cross">Red Cross Center</option>
          <option value="community-center">Community Center</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label>Date</Label>
        <Calendar selected={date} onSelect={setDate} />
      </div>
      <div className="space-y-2">
        <Label>Time</Label>
        <select
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          required
        >
          <option value="">Select time</option>
          <option value="09:00">9:00 AM</option>
          <option value="11:00">11:00 AM</option>
          <option value="14:00">2:00 PM</option>
          <option value="16:00">4:00 PM</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label>Donation Type</Label>
        <select
          value={donationType}
          onChange={(e) => setDonationType(e.target.value)}
          className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          required
        >
          <option value="">Select type</option>
          <option value="whole-blood">Whole Blood</option>
          <option value="platelets">Platelets</option>
          <option value="plasma">Plasma</option>
        </select>
      </div>
      <Button type="submit" className="w-full">{isRescheduling ? 'Reschedule Appointment' : 'Book Appointment'}</Button>
    </form>
  )
}
