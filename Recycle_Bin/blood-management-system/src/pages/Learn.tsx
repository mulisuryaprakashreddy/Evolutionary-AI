import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import BloodTypeInfo from "@/components/BloodTypeInfo"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const Learn = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl"> Learn About Blood Donation</h1>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto"> Educational resources to help you understand the importance of donation</p>
        </div>
        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="faq">FAQ</TabsTrigger>
            <TabsTrigger value="bloodTypes">Blood Types</TabsTrigger>
            <TabsTrigger value="eligibility">Eligibility</TabsTrigger>
            <TabsTrigger value="impact">Your Impact</TabsTrigger>
          </TabsList>
          <TabsContent value="faq" className="mt-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How often can I donate blood?</AccordionTrigger>
                  <AccordionContent>You can donate whole blood every 56 days (8 weeks). If you donate platelets, you can give every 7 days up to 24 times a year. Plasma donors can donate every 28 days, and double red cell donors can give every 112 days.</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-2">
                  <AccordionTrigger>Does it hurt to give blood?</AccordionTrigger>
                  <AccordionContent>Most people feel only a slight pinch when the needle is inserted and very little discomfort during the donation process. The actual blood donation typically takes less than 10-15 minutes.</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-3">
                  <AccordionTrigger>How long does the donation process take?</AccordionTrigger>
                  <AccordionContent>The entire process, from registration to post-donation refreshments, takes about an hour. The actual blood donation usually takes less than 10-15 minutes.</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-4">
                  <AccordionTrigger>How much blood is taken during donation?</AccordionTrigger>
                  <AccordionContent>For a whole blood donation, approximately one pint (about 500 ml) of blood is collected. Your body contains 10-12 pints of blood and replaces the fluid lost within 24 hours.</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-5">
                  <AccordionTrigger>What should I eat before donating blood?</AccordionTrigger>
                  <AccordionContent>Eat a healthy, low-fat meal within 2-3 hours before donating. Avoid fatty foods like hamburgers, fries, or ice cream. Include iron-rich foods like red meat, fish, poultry, beans, spinach, and iron-fortified cereals in your pre-donation meals. Drink plenty of water before your donation.</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-6">
                  <AccordionTrigger>Can I exercise after donating blood?</AccordionTrigger>
                  <AccordionContent>It's recommended to avoid strenuous exercise or heavy lifting for at least 24 hours after donation. Light exercise is fine, but listen to your body and rest if you feel tired.</AccordionContent>
                </AccordionItem>
                <AccordionItem value="item-7">
                  <AccordionTrigger>Is it safe to give blood?</AccordionTrigger>
                  <AccordionContent>Yes, it's completely safe to give blood. All equipment used for blood donation is sterile and disposable, used only once for each donor. There is no risk of contracting any disease by donating blood.</AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </TabsContent>
          <TabsContent value="bloodTypes" className="mt-6">
            <BloodTypeInfo />
          </TabsContent>
          <TabsContent value="eligibility" className="mt-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Eligibility Requirements</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">Age & Weight</h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-600">
                    <li>At least 17 years old (16 with parental consent in some states)</li>
                    <li>Weigh at least 110 lbs (50 kg)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-2">Health Status</h3>
                  <ul className="list-disc pl-5 space-y-1 text-gray-600">
                    <li>Must be in good general health</li>
                    <li>No cold, flu, or infection symptoms</li>
                    <li>Adequate iron levels</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="impact" className="mt-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Impact</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader><CardTitle>1 Donation</CardTitle></CardHeader>
                  <CardContent><p className="text-gray-600">Can save up to 3 lives</p></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Regular Donors</CardTitle></CardHeader>
                  <CardContent><p className="text-gray-600">Help maintain stable blood supplies year-round</p></CardContent>
                </Card>
                <Card>
                  <CardHeader><CardTitle>Community</CardTitle></CardHeader>
                  <CardContent><p className="text-gray-600">Builds a culture of giving and support</p></CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  )
}
export default Learn
