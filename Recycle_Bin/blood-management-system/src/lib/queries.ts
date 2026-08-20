import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/components/ui/use-toast'

export function useDonorRegistrations() {
  return useQuery({
    queryKey: ['donor_registrations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('donor_registrations')
        .select('*')
      if (error) throw error
      return data
    },
  })
}

export function useCreateDonorRegistration() {
  const queryClient = useQueryClient()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (data: any) => {
      const { error } = await supabase
        .from('donor_registrations')
        .insert([data])
      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['donor_registrations'] })
      toast({ title: 'Success', description: 'Donor registration submitted successfully!' })
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to submit donor registration.', variant: 'destructive' })
    },
  })
}
