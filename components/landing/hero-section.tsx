"use client"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Code,
  Zap,
  Users,
  Shield,
  ArrowRight,
  Play,
  CheckCircle,
  Star,
  Globe,
  Database,
  Lock,
  Sparkles,
  TrendingUp,
  Clock,
  Layers,
} from "lucide-react"
import { isLocalEnvironment } from "@/lib/auth"
import { useEffect, useState } from "react"

interface HeroSectionProps {
  onGetStarted: () => void
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  const isLocal = isLocalEnvironment()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleGetStarted = () => {
    if (isLocal) {
      window.location.reload()
    } else {
      onGetStarted()
    }
  }

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Send requests instantly with our optimized interface. No more waiting around for slow tools.",
      color: "from-yellow-400 to-orange-500",
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work together seamlessly with shared workspaces, collections, and real-time collaboration.",
      color: "from-blue-400 to-purple-500",
    },
    {
      icon: Shield,
      title: "Enterprise Ready",
      description: "Advanced authentication, proxy settings, and security features for enterprise teams.",
      color: "from-green-400 to-teal-500",
    },
    {
      icon: Globe,
      title: "Global CDN",
      description: "Test APIs from multiple regions with our global infrastructure for accurate performance metrics.",
      color: "from-purple-400 to-pink-500",
    },
    {
      icon: Database,
      title: "Smart Collections",
      description: "Organize your APIs with intelligent collections and automated documentation generation.",
      color: "from-indigo-400 to-blue-500",
    },
    {
      icon: Lock,
      title: "Advanced Security",
      description: "Enterprise-grade security with OAuth 2.0, API keys, and custom authentication flows.",
      color: "from-red-400 to-pink-500",
    },
  ]

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Lead Developer at TechCorp",
      content: "API Studio has revolutionized our development workflow. The collaboration features are game-changing.",
      avatar: "/placeholder-user.jpg",
      rating: 5,
    },
    {
      name: "Marcus Rodriguez",
      role: "CTO at StartupXYZ",
      content: "Finally, an API testing tool that doesn't slow us down. The performance is incredible.",
      avatar: "/placeholder-user.jpg",
      rating: 5,
    },
    {
      name: "Emily Johnson",
      role: "DevOps Engineer",
      content: "The enterprise features and security make this perfect for our large-scale operations.",
      avatar: "/placeholder-user.jpg",
      rating: 5,
    },
  ]

  const stats = [
    { number: "50K+", label: "Developers" },
    { number: "1M+", label: "API Requests" },
    { number: "99.9%", label: "Uptime" },
    { number: "24/7", label: "Support" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Header */}
      <header className="relative border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Code className="h-8 w-8 text-blue-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-ping"></div>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              API Studio
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="hidden md:inline-flex">
              Features
            </Button>
            <Button variant="ghost" className="hidden md:inline-flex">
              Pricing
            </Button>
            <Button variant="ghost" className="hidden md:inline-flex">
              Docs
            </Button>
            <Button variant="outline" onClick={onGetStarted}>
              Sign In
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative container mx-auto px-4 py-20 text-center">
        <div className="max-w-6xl mx-auto">
          {/* Badge */}
          <div
            className={`inline-flex items-center space-x-2 mb-8 transition-all duration-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2">
              <Sparkles className="w-4 h-4 mr-2" />
              New: Real-time collaboration features
            </Badge>
          </div>

          {/* Main Heading */}
          <div
            className={`transition-all duration-1000 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              API Testing
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
                Reimagined
              </span>
            </h1>
          </div>

          <div
            className={`transition-all duration-1000 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <p className="text-xl md:text-2xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Build, test, and collaborate on APIs with your team. The modern alternative to Postman with
              <span className="font-semibold text-blue-600"> lightning-fast performance</span> and
              <span className="font-semibold text-purple-600"> seamless collaboration</span>.
            </p>
          </div>

          {/* CTA Buttons */}
          <div
            className={`flex flex-col sm:flex-row gap-4 justify-center mb-16 transition-all duration-1000 delay-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Start Building Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4 border-2 hover:bg-slate-50 group bg-transparent"
            >
              <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Watch Demo
            </Button>
          </div>

          {/* Stats */}
          <div
            className={`grid grid-cols-2 md:grid-cols-4 gap-8 mb-20 transition-all duration-1000 delay-800 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">{stat.number}</div>
                <div className="text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Mock Interface Preview */}
          <div
            className={`relative max-w-5xl mx-auto transition-all duration-1000 delay-1000 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
          >
            <div className="relative bg-white rounded-2xl shadow-2xl border overflow-hidden">
              <div className="bg-slate-100 px-6 py-4 border-b flex items-center space-x-2">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex-1 text-center text-sm text-slate-600 font-medium">API Studio</div>
              </div>
              <div className="p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <Badge className="bg-green-100 text-green-700">GET</Badge>
                  <div className="flex-1 bg-slate-100 rounded-lg px-4 py-2 text-left text-slate-600">
                    https://api.example.com/users
                  </div>
                  <Button className="bg-blue-600 hover:bg-blue-700">Send</Button>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3 text-slate-700">Request</h4>
                    <div className="bg-slate-50 rounded-lg p-4 text-sm font-mono text-slate-600">
                      {`{
  "Authorization": "Bearer token",
  "Content-Type": "application/json"
}`}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3 text-slate-700">Response</h4>
                    <div className="bg-green-50 rounded-lg p-4 text-sm font-mono text-green-700">
                      {`{
  "status": 200,
  "data": [...],
  "time": "45ms"
}`}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Everything you need to
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                ship faster
              </span>
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Powerful features designed for modern development teams who demand speed, reliability, and collaboration.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-0 shadow-lg"
              >
                <CardContent className="p-8">
                  <div
                    className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                  >
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-4 text-slate-800">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Loved by
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                developers
              </span>
            </h2>
            <p className="text-xl text-slate-600">Join thousands of developers who trust API Studio</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-600 mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                      {testimonial.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-800">{testimonial.name}</div>
                      <div className="text-sm text-slate-600">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Performance Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Built for
                  <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                    {" "}
                    performance
                  </span>
                </h2>
                <p className="text-xl text-slate-600 mb-8">
                  Experience lightning-fast API testing with our optimized infrastructure and intelligent caching.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span className="text-slate-700">Sub-100ms response times</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span className="text-slate-700">Global CDN with 99.9% uptime</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span className="text-slate-700">Intelligent request caching</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-green-500" />
                    <span className="text-slate-700">Real-time collaboration</span>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                      <Clock className="w-8 h-8 text-blue-600 mb-4" />
                      <div className="text-2xl font-bold text-slate-800 mb-2">45ms</div>
                      <div className="text-sm text-slate-600">Avg Response Time</div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                      <TrendingUp className="w-8 h-8 text-green-600 mb-4" />
                      <div className="text-2xl font-bold text-slate-800 mb-2">99.9%</div>
                      <div className="text-sm text-slate-600">Uptime SLA</div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                      <Layers className="w-8 h-8 text-purple-600 mb-4" />
                      <div className="text-2xl font-bold text-slate-800 mb-2">50+</div>
                      <div className="text-sm text-slate-600">Global Regions</div>
                    </div>
                    <div className="bg-white rounded-xl p-6 shadow-lg">
                      <Zap className="w-8 h-8 text-yellow-600 mb-4" />
                      <div className="text-2xl font-bold text-slate-800 mb-2">10x</div>
                      <div className="text-sm text-slate-600">Faster Testing</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-900 via-purple-900 to-blue-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=400&width=800')] opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to transform your API workflow?</h2>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Join thousands of developers who have already made the switch to faster, more collaborative API testing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="text-lg px-8 py-4 bg-white text-blue-900 hover:bg-blue-50 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
            >
              Start Free Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-lg px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-blue-900 bg-transparent"
            >
              Schedule Demo
            </Button>
          </div>
          <p className="text-sm text-blue-200 mt-6">No credit card required • Free forever plan available</p>
        </div>
      </section>
    </div>
  )
}
