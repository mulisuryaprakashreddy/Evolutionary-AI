import { Button } from "@/components/ui/button"

interface HeroProps { onDonateClick: () => void; onReceiveClick?: () => void; }

const Hero = ({ onDonateClick, onReceiveClick }: HeroProps) => {
  return (
    <div className="relative bg-gradient-to-r from-primary/10 to-primary/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left">
            <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
              <span className="block">Give the gift of</span>
              <span className="block text-primary">life through blood</span>
            </h1>
            <p className="mt-6 text-gray-500 text-lg">
              Every donation can save up to three lives. Join our community of donors and help those in need. Your small act of kindness can make a huge difference.
            </p>
            <div className="mt-8 sm:max-w-lg sm:mx-auto sm:text-center lg:text-left">
              <div className="flex flex-col sm:flex-row gap-4 sm:justify-center lg:justify-start">
                <Button
                  className="bg-primary hover:bg-primary-dark text-white font-bold px-6 py-3 rounded-lg shadow-lg"
                  onClick={onDonateClick}
                >
                  Donate Blood
                </Button>
                {onReceiveClick && (
                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/5 font-bold px-6 py-3 rounded-lg"
                    onClick={onReceiveClick}
                  >
                    Receive Blood
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default Hero
