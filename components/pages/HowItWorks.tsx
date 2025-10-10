import { Badge } from "@/components/ui/badge";
import { Camera, Shield, CheckCircle, Smartphone } from "lucide-react";

export const HowItWorks = () => {
  const steps = [
    {
      icon: <Camera className="h-10 w-10 text-white" />,
      title: "Camera Detects Plate",
      description: "Advanced cameras automatically scan and capture license plate information",
      bgColor: "bg-teal-600",
      badgeNumber: 1
    },
    {
      icon: <Shield className="h-10 w-10 text-white" />,
      title: "ANPR Software Verifies",
      description: "Our AI-powered system instantly verifies vehicle registration and permissions",
      bgColor: "bg-blue-600",
      badgeNumber: 2
    },
    {
      icon: <CheckCircle className="h-10 w-10 text-white" />,
      title: "Gate Opens Automatically",
      description: "Authorized vehicles gain immediate access without stopping or waiting",
      bgColor: "bg-green-600",
      badgeNumber: 3
    },
    {
      icon: <Smartphone className="h-10 w-10 text-white" />,
      title: "Activity Logged",
      description: "All check-ins and check-outs are automatically recorded in your account",
      bgColor: "bg-purple-600",
      badgeNumber: 4
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Our intelligent system makes campus access effortless with just four simple steps.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className={`w-20 h-20 ${step.bgColor} rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    {step.icon}
                  </div>
                  <Badge 
                    className={`absolute -top-2 -right-2 ${
                      step.badgeNumber === 1 ? "bg-teal-100 text-teal-800 hover:bg-teal-100" :
                      step.badgeNumber === 2 ? "bg-blue-100 text-blue-800 hover:bg-blue-100" :
                      step.badgeNumber === 3 ? "bg-green-100 text-green-800 hover:bg-green-100" :
                      "bg-purple-100 text-purple-800 hover:bg-purple-100"
                    }`}
                  >
                    {step.badgeNumber}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-600 text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};