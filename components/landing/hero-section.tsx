"use client"

import { Button } from "@/components/ui/button"
import { Code, ArrowRight, Zap, Users, Shield } from "lucide-react"

interface HeroSectionProps {
  onGetStarted: () => void
}

export function HeroSection({ onGetStarted }: HeroSectionProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <Code className="h-8 w-8 text-blue-600" />
          <span className="text-2xl font-bold text-gray-900">API Studio</span>
        </div>
        <Button onClick={onGetStarted} variant="outline" className="bg-white">
          Sign In
        </Button>
      </nav>

      {/* Hero Content */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
            API Testing
            <span className="text-blue-600 block">Made Simple</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed max-w-3xl mx-auto">
            Build, test, and collaborate on APIs with your team. The modern alternative to Postman with powerful
            features and seamless collaboration.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <Button
              onClick={onGetStarted}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
            >
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button variant="outline" size="lg" className="bg-white border-gray-300 px-8 py-4 text-lg">
              View Demo
            </Button>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6 mx-auto">
                <Zap className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Lightning Fast</h3>
              <p className="text-gray-600 leading-relaxed">
                Send requests instantly with our optimized interface. No more waiting around for slow tools.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6 mx-auto">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Team Collaboration</h3>
              <p className="text-gray-600 leading-relaxed">
                Work together seamlessly with shared workspaces, collections, and real-time collaboration.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-6 mx-auto">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Enterprise Ready</h3>
              <p className="text-gray-600 leading-relaxed">
                Advanced authentication, proxy settings, and security features for enterprise teams.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to supercharge your API workflow?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of developers who trust API Studio for their API testing needs.
          </p>
          <Button
            onClick={onGetStarted}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg"
          >
            Start Building Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
