import { Button } from "@/components/ui/button";
import { Shield, ArrowRight, Menu, Mail, MapPin } from "lucide-react";
import Link from "next/link";
import { FeatureSection } from "./FeaturesSection";
import { HowItWorks } from "./HowItWorks";
import Image from "next/image"

interface LandingPageProps {
  onNavigateToRegister: () => void;
  onNavigateToLogin: () => void;
}

export const LandingPage = ({
  onNavigateToRegister,
  onNavigateToLogin,
}: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-teal-600" />
              <span className="text-xl font-bold text-navy-900">ABUNRFEDUSEC</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="#" className="text-gray-700 hover:text-teal-600 transition-colors">
                Home
              </Link>
              <Link href="#how-it-works" className="text-gray-700 hover:text-teal-600 transition-colors">
                How It Works
              </Link>
              {/* <Link href="#dashboard" className="text-gray-700 hover:text-teal-600 transition-colors">
                Security Dashboard
              </Link> */}
              <Link href="#contact" className="text-gray-700 hover:text-teal-600 transition-colors">
                Contact
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Button 
                className="bg-teal-600 hover:bg-teal-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
                onClick={onNavigateToLogin}
              >
                Get Started
              </Button>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Secure. Streamlined. <span className="text-teal-400">Smarter Campus Access.</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-300 leading-relaxed">
              An intelligent system to track, approve, and manage vehicle entry and exit across campuses—powered by
              license plate recognition.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-4 text-lg shadow-xl hover:shadow-2xl transition-all duration-300"
                onClick={onNavigateToRegister}
              >
                Register Your Vehicle
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      <FeatureSection />
      <HowItWorks />

      {/* User Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
                <Image
                    src="/abu_detect_image.png?height=500&width=600"
                    alt="Mobile Security Alert"
                    width={600}
                    height={500}
                    className="rounded-lg shadow-xl"
                />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">Experience Seamless Campus Access</h2>
              <div className="space-y-6">
                {[
                  {
                    icon: <Shield className="h-4 w-4 text-blue-600" />,
                    title: "Verified Entry History",
                    description: "Complete audit trail of all your campus visits with timestamps and locations."
                  },
                  {
                    icon: <Mail className="h-4 w-4 text-green-600" />,
                    title: "Mobile Check-in Commands",
                    description: "Receive real-time notifications and control access permissions from your phone."
                  },
                  {
                    icon: <MapPin className="h-4 w-4 text-purple-600" />,
                    title: "Campus-wide Integration",
                    description: "Single registration works across all connected campus locations and facilities."
                  }
                ].map((feature, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className={`w-8 h-8 ${index === 0 ? 'bg-blue-100' : index === 1 ? 'bg-green-100' : 'bg-purple-100'} rounded-full flex items-center justify-center flex-shrink-0 mt-1`}>
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                      <p className="text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-slate-900 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Shield className="h-8 w-8 text-teal-400" />
                <span className="text-2xl font-bold">ABUNRFEDUSEC</span>
              </div>
              <p className="text-gray-300 mb-6 max-w-md">
                Advanced intercampus vehicle security platform powered by ANPR technology. Streamlining campus access
                while maintaining the highest security standards.
              </p>
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="h-4 w-4" />
                <span>contact@abunrfedusec.com</span>
              </div>
            </div>

            {/* Footer links sections... */}
          </div>

          <div className="border-t border-gray-700 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">© {new Date().getFullYear()} ABUNRFEDUSEC. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};