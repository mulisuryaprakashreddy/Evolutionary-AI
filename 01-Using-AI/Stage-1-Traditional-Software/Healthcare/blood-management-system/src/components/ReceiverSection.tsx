import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"

type DonorInfo = { name: string; mobile: string; blood_group: string; address: string }

export function ReceiverSection() {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [donors, setDonors] = useState<DonorInfo[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSearched(true)
    try {
      const searchTerm = address.toLowerCase().trim()
      const { data, error } = await supabase.from('donor_registrations').select('name, mobile, blood_group, address')
      if (error) throw error
      const matchingDonors = data?.filter(donor => donor.address && donor.address.toLowerCase().includes(searchTerm)) || []
      setDonors(matchingDonors)
      if (matchingDonors.length === 0) {
        toast.info("No donors found near this address")
      } else {
        toast.success(`Found ${matchingDonors.length} donor${matchingDonors.length === 1 ? '' : 's'}`)
      }
    } catch (error: any) {
      console.error("Error fetching donors:", error)
      toast.error("Failed to fetch donor information")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>Find Blood Donors</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Location / Address</Label>
            <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            <Search className="mr-2 h-4 w-4" /> {loading ? 'Searching...' : 'Find Donors'}
          </Button>
        </form>

        {searched && donors.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Available Donors Nearby</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Blood Group</TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead>Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {donors.map((donor, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="font-medium">{donor.name}</TableCell>
                    <TableCell><span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">{donor.blood_group}</span></TableCell>
                    <TableCell>{donor.mobile}</TableCell>
                    <TableCell>{donor.address}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
