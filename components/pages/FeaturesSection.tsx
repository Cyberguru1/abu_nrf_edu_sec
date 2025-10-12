import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Camera, Clock, CheckCircle, BarChart3 } from "lucide-react";

export const FeatureSection = () => {
  const features = [
    {
      icon: <Camera className="h-8 w-8 text-teal-600" />,
      title: "Instant ANPR Check-In/Out",
      description: "Seamlessly enter and exit campuses using license plate scans—no waiting required.",
      iconBg: "bg-teal-100",
      iconHoverBg: "group-hover:bg-teal-200"
    },
    {
      icon: <Clock className="h-8 w-8 text-blue-600" />,
      title: "Real-Time Vehicle History",
      description: "Track your vehicle's movement history across all connected campuses in real-time.",
      iconBg: "bg-blue-100",
      iconHoverBg: "group-hover:bg-blue-200"
    },
    {
      icon: <CheckCircle className="h-8 w-8 text-green-600" />,
      title: "Driver Approvals",
      description: "Receive mobile approval prompts before each check-in and check-out for enhanced security.",
      iconBg: "bg-green-100",
      iconHoverBg: "group-hover:bg-green-200"
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-purple-600" />,
      title: "Traffic Insights",
      description: "Visual feedback on traffic congestion and entry activity across all campus gates.",
      iconBg: "bg-purple-100",
      iconHoverBg: "group-hover:bg-purple-200"
    }
  ];

  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Advanced Security Features</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience seamless campus access with cutting-edge technology designed for modern security needs.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg"
            >
              <CardHeader className="text-center pb-4">
                <div className={`mx-auto w-16 h-16 ${feature.iconBg} ${feature.iconHoverBg} rounded-full flex items-center justify-center mb-4 transition-colors`}>
                  {feature.icon}
                </div>
                <CardTitle className="text-xl font-semibold">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-center text-gray-600">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};