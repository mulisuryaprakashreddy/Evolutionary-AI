import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const bloodTypes = [
  { type: "A+", percentage: "35.7%", canReceiveFrom: ["A+", "A-", "O+", "O-"], canDonateTo: ["A+", "AB+"] },
  { type: "A-", percentage: "6.3%", canReceiveFrom: ["A-", "O-"], canDonateTo: ["A+", "A-", "AB+", "AB-"] },
  { type: "B+", percentage: "8.5%", canReceiveFrom: ["B+", "B-", "O+", "O-"], canDonateTo: ["B+", "AB+"] },
  { type: "B-", percentage: "1.5%", canReceiveFrom: ["B-", "O-"], canDonateTo: ["B+", "B-", "AB+", "AB-"] },
  { type: "AB+", percentage: "3.4%", canReceiveFrom: ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], canDonateTo: ["AB+"] },
  { type: "AB-", percentage: "0.6%", canReceiveFrom: ["A-", "B-", "AB-", "O-"], canDonateTo: ["AB+", "AB-"] },
  { type: "O+", percentage: "37.4%", canReceiveFrom: ["O+", "O-"], canDonateTo: ["A+", "B+", "AB+", "O+"] }
]

const BloodTypeInfo = () => {
  return (
    <div className="py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">Blood Types Guide</h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">Understanding blood compatibility</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          {bloodTypes.map((bt) => (
            <Card key={bt.type} className="border-primary/20 hover:shadow-md transition-shadow">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold text-primary">{bt.type}</CardTitle>
                <p className="text-sm text-gray-500">{bt.percentage} of population</p>
              </CardHeader>
              <CardContent className="text-center text-sm">
                <p className="text-xs text-muted-foreground">Can donate to: {bt.canDonateTo.join(', ')}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}
export default BloodTypeInfo
