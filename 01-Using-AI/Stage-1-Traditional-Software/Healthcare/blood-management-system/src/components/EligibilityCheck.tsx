import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export const EligibilityCheck = () => {
  return (
    <div className="space-y-6">
      <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
        <h3 className="font-medium text-gray-900 mb-2">Basic Requirements</h3>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-600">
          <li>Be at least 17 years old in most states</li>
          <li>Weigh at least 110 lbs</li>
          <li>Be in good health and feeling well</li>
          <li>Have not donated whole blood in the last 56 days</li>
        </ul>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="age">What is your age?</Label>
          <Input id="age" type="number" placeholder="Enter your age" min="16" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="weight">What is your weight in pounds?</Label>
          <Input id="weight" type="number" placeholder="Enter your weight" min="0" />
        </div>
        <div className="space-y-2">
          <Label>Have you donated blood in the last 8 weeks (56 days)?</Label>
          <div className="flex space-x-4">
            <Button variant="outline" className="w-full">Yes</Button>
            <Button variant="outline" className="w-full">No</Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Are you feeling well today?</Label>
          <div className="flex space-x-4">
            <Button variant="outline" className="w-full">Yes</Button>
            <Button variant="outline" className="w-full">No</Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Do you have any known medical conditions?</Label>
          <div className="flex space-x-4">
            <Button variant="outline" className="w-full">Yes</Button>
            <Button variant="outline" className="w-full">No</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
