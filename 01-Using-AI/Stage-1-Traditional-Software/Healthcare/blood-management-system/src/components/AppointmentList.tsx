import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { X, RotateCw } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useState } from "react"
import { useToast } from "@/components/ui/use-toast"
import { AppointmentForm } from "./AppointmentForm"

export const AppointmentList = () => {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false)

  const { data: appointments, isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const { data, error } = await supabase.from('appointments').select('*').order('appointment_date', { ascending: true })
      if (error) throw error
      return data
    },
  })

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('appointments').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
      toast({ title: "Appointment Cancelled", description: "Your appointment has been successfully cancelled." })
    },
  })

  const handleCancel = (id: string) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      cancelMutation.mutate(id)
    }
  }

  const handleReschedule = (appointment: any) => {
    setSelectedAppointment(appointment)
    setIsRescheduleOpen(true)
  }

  if (isLoading) return <div>Loading appointments...</div>

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Time</TableHead>
            <TableHead>Center</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments?.map((appointment) => (
            <TableRow key={appointment.id}>
              <TableCell>{format(new Date(appointment.appointment_date), 'PPP')}</TableCell>
              <TableCell>{appointment.appointment_time}</TableCell>
              <TableCell>{appointment.donation_center}</TableCell>
              <TableCell>{appointment.donation_type}</TableCell>
              <TableCell className="space-x-2">
                <Button variant="outline" size="sm" onClick={() => handleReschedule(appointment)}>
                  <RotateCw className="mr-1 h-4 w-4" /> Reschedule
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleCancel(appointment.id)}>
                  <X className="mr-1 h-4 w-4" /> Cancel
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
          </DialogHeader>
          <AppointmentForm isRescheduling existingAppointment={selectedAppointment} onSuccess={() => setIsRescheduleOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
