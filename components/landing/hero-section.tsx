"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  Zap,
  Shield,
  Globe,
  Star,
  CheckCircle,
  TrendingUp,
  Code,
  Database,
  Layers,
  BarChart3,
  Play,
} from "lucide-react"

export function HeroSection() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const handleGetStarted = () => {
    router.push("/app")
  }

  return (
    <div className="relative">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-purple-400/10 to-pink-600/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-background">
        <div className="container mx-auto px-4 py-20 sm:py-24 lg:py-32">
          <div className="mx-auto max-w-4xl text-center">
            <Badge variant="secondary" className="mb-4">
              <Zap className="mr-1 h-3 w-3" />
              Now with PWA Support
            </Badge>

            <h1 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Professional API Testing
              <span className="block text-primary">Made Simple</span>
            </h1>

            <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Build, test, and document your APIs with our powerful, intuitive platform. Everything you need for API
              development in one place.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" onClick={handleGetStarted} className="text-lg px-8 py-3">
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-lg px-8 py-3 bg-transparent">
                View Documentation
              </Button>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
              <div className="flex flex-col items-center">
                <div className="mb-4 rounded-full bg-primary/10 p-3">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Lightning Fast</h3>
                <p className="text-sm text-muted-foreground">Optimized for speed with instant response times</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="mb-4 rounded-full bg-primary/10 p-3">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Secure & Private</h3>
                <p className="text-sm text-muted-foreground">Your data stays secure with enterprise-grade protection</p>
              </div>

              <div className="flex flex-col items-center">
                <div className="mb-4 rounded-full bg-primary/10 p-3">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-lg font-semibold">Works Everywhere</h3>
                <p className="text-sm text-muted-foreground">Cross-platform PWA that works on any device</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-16 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl font-bold text-slate-900">10M+</div>
              <div className="text-slate-600">API Requests</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-slate-900">50K+</div>
              <div className="text-slate-600">Developers</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-slate-900">100%</div>
              <div className="text-slate-600">Free Forever</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl font-bold text-slate-900">24/7</div>
              <div className="text-slate-600">Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Everything you need, completely free</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              All premium features included at no cost. No hidden fees, no usage limits, no credit card required.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Code,
                title: "Smart Code Generation",
                description: "Generate client SDKs and server stubs in multiple languages automatically",
                color: "from-blue-500 to-cyan-500",
              },
              {
                icon: Database,
                title: "Advanced Testing",
                description: "Comprehensive testing suite with automated test generation and validation",
                color: "from-purple-500 to-pink-500",
              },
              {
                icon: Layers,
                title: "Team Collaboration",
                description: "Real-time collaboration tools for distributed development teams",
                color: "from-green-500 to-emerald-500",
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                description: "Bank-grade security with SSO, RBAC, and compliance certifications",
                color: "from-red-500 to-orange-500",
              },
              {
                icon: BarChart3,
                title: "Analytics & Monitoring",
                description: "Real-time insights into API performance and usage patterns",
                color: "from-indigo-500 to-purple-500",
              },
              {
                icon: Globe,
                title: "Global CDN",
                description: "Lightning-fast API responses with our global edge network",
                color: "from-teal-500 to-blue-500",
              },
            ].map((feature, index) => (
              <Card
                key={index}
                className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-slate-200 bg-white"
              >
                <CardContent className="p-6">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                  <p className="text-slate-600">{feature.description}</p>
                  <div className="mt-3">
                    <Badge className="bg-green-100 text-green-800 text-xs">FREE</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="px-6 py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-slate-900 mb-4">Simple, transparent pricing</h2>
          <p className="text-xl text-slate-600 mb-12">Everything is free. Forever. No catch.</p>

          <Card className="max-w-md mx-auto bg-white border-2 border-blue-200 shadow-xl">
            <CardContent className="p-8">
              <div className="text-center">
                <Badge className="bg-blue-100 text-blue-800 mb-4">Most Popular</Badge>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">Free Forever</h3>
                <div className="text-5xl font-bold text-slate-900 mb-4">
                  $0
                  <span className="text-lg text-slate-600 font-normal">/month</span>
                </div>
                <p className="text-slate-600 mb-6">Everything you need to build amazing APIs</p>

                <ul className="text-left space-y-3 mb-8">
                  {[
                    "Unlimited API requests",
                    "Unlimited collections",
                    "Team collaboration",
                    "Code generation",
                    "Advanced testing",
                    "Real-time monitoring",
                    "Global CDN access",
                    "24/7 support",
                    "No usage limits",
                    "No hidden fees",
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={handleGetStarted}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3"
                >
                  Get Started Free
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>

                <p className="text-sm text-slate-500 mt-4">No credit card required • Start in seconds</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Loved by developers worldwide</h2>
            <p className="text-xl text-slate-600">
              Join thousands of developers who trust API Studio for their projects
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Senior Developer at TechCorp",
                avatar: "/placeholder-user.jpg",
                content:
                  "I can't believe this is free! API Studio has revolutionized our development workflow. The testing capabilities are unmatched.",
                rating: 5,
              },
              {
                name: "Marcus Johnson",
                role: "CTO at StartupXYZ",
                avatar: "/placeholder-user.jpg",
                content:
                  "Finally, a free tool that doesn't compromise on features. The collaboration features have made our distributed team 3x more productive.",
                rating: 5,
              },
              {
                name: "Elena Rodriguez",
                role: "Lead Engineer at DataFlow",
                avatar: "/placeholder-user.jpg",
                content:
                  "Best free API development platform I've used. The code generation saves us hours every week. No hidden costs!",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <Card key={index} className="bg-white border-slate-200">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-700 mb-4">"{testimonial.content}"</p>
                  <div className="flex items-center">
                    <Avatar className="w-10 h-10 mr-3">
                      <AvatarImage src={testimonial.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {testimonial.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-semibold text-slate-900">{testimonial.name}</div>
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
      <section className="px-6 py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Enterprise performance, zero cost</h2>
            <p className="text-xl text-slate-600">Handle millions of requests with confidence - all for free</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { metric: "< 50ms", label: "Average Response Time", icon: Zap },
              { metric: "99.99%", label: "Uptime SLA", icon: Shield },
              { metric: "∞", label: "Request Limit", icon: TrendingUp },
              { metric: "150+", label: "Global Locations", icon: Globe },
            ].map((item, index) => (
              <Card key={index} className="text-center bg-white border-slate-200 hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <item.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-slate-900 mb-1">{item.metric}</div>
                  <div className="text-slate-600">{item.label}</div>
                  <Badge className="bg-green-100 text-green-800 text-xs mt-2">FREE</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to start building for free?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of developers who are building better APIs with our completely free platform. No credit card,
            no catch.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              onClick={handleGetStarted}
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold"
            >
              Start Building Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg bg-transparent"
            >
              <Play className="mr-2 w-5 h-5" />
              Watch Demo
            </Button>
          </div>
          <div className="mt-8 flex items-center justify-center space-x-6 text-blue-100">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              No credit card required
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              Free forever
            </div>
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 mr-2" />
              No usage limits
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
