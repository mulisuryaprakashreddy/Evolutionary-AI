import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export const metadata = { title: 'FAQ — MedShare' };

const FAQS = [
  { q: 'Is MedShare really free?', a: 'Yes. There are no fees, no payments, and no charges of any kind. Donors give or lend equipment directly to recipients. The platform only helps you find each other and connect.' },
  { q: 'Do I need an account to browse?', a: 'No. Anyone can browse listings, search, and read details without signing up. You only need a free account to create listings, save favorites, or report a listing.' },
  { q: 'How do I contact a donor?', a: 'Open any listing to see the donor’s contact details — phone, email, and a WhatsApp button. You contact them directly to arrange pickup or shipping. MedShare does not manage messages between you.' },
  { q: 'Can I lend equipment instead of donating it?', a: 'Yes. When creating a listing, choose "Lend Temporarily" and set an expected return date. The listing shows up as a loan, and you can mark it returned when the equipment comes back to you.' },
  { q: 'Is the equipment safe to use?', a: 'MedShare is a community marketplace. We ask donors to describe condition honestly, and recipients to inspect equipment before use. Always consult a qualified healthcare professional before relying on any medical device. MedShare is not responsible for the condition of shared equipment.' },
  { q: 'Can NGOs and hospitals use the platform?', a: 'Absolutely. Organizations can create verified profiles, list equipment, and post requests. Look for the verified badge on organization listings to confirm authenticity.' },
  { q: 'What can I list?', a: 'Any reusable medical equipment — wheelchairs, hospital beds, oxygen concentrators, walkers, glucometers, shower chairs, CPAP machines, and more. If it can help someone, you can list it. Single-use or expired consumables should not be listed.' },
  { q: 'How do I report a fake or unsafe listing?', a: 'On any listing page, tap "Report listing" and choose a reason. Our team reviews every report and takes action to keep the community safe.' },
  { q: 'Where does MedShare operate?', a: 'MedShare is a global platform. Anyone from anywhere in the world can create a listing or search for equipment. Listings include country, state, and city so recipients can find nearby options.' },
  { q: 'How is my contact information used?', a: 'Your contact details are shown on your listings so recipients can reach you directly. MedShare does not sell or share your information. You control which details you include on each listing.' },
];

export default function FAQPage() {
  return (
    <div className="container py-16">
      <div className="mx-auto max-w-2xl text-center">
        <span className="text-sm font-semibold uppercase tracking-wider text-primary">Questions</span>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">Frequently asked questions</h1>
        <p className="mt-3 text-muted-foreground">Everything you need to know about donating and finding medical equipment on MedShare.</p>
      </div>
      <div className="mx-auto mt-10 max-w-3xl">
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base font-medium">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
      <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-border bg-secondary/30 p-8 text-center">
        <h2 className="font-display text-xl font-semibold">Still have questions?</h2>
        <p className="mt-1 text-sm text-muted-foreground">Get in touch and we will help you out.</p>
        <Button asChild className="mt-5"><Link href="/contact">Contact us</Link></Button>
      </div>
    </div>
  );
}
