"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Shield, 
  Zap, 
  Eye, 
  Code, 
  Cloud, 
  Lock, 
  ArrowRight, 
  CheckCircle,
  BarChart3,
  FileText,
  Cpu,
  Globe
} from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  const features = [
    {
      icon: Shield,
      title: "AI-Powered CVE Analysis",
      description: "Get instant, expert-level explanations of CVE vulnerabilities with detailed security insights."
    },
    {
      icon: Code,
      title: "WAF Rule Generation",
      description: "Automatically generate WAF rules for AWS, Azure, GCP, and Cloudflare to protect your applications."
    },
    {
      icon: BarChart3,
      title: "Visual Flowcharts",
      description: "Understand vulnerabilities through interactive Mermaid.js diagrams showing discovery, severity, and mitigation."
    },
    {
      icon: Zap,
      title: "Real-time Protection",
      description: "Generate security rules instantly to protect your web applications from emerging threats."
    }
  ]

  const wafProviders = [
    { name: "AWS WAF", icon: Cloud, color: "bg-yellow-700" },
    { name: "Azure Front Door", icon: Cloud, color: "bg-yellow-700" },
    { name: "Google Cloud Armor", icon: Cloud, color: "bg-yellow-700" },
    { name: "Cloudflare", icon: Cloud, color: "bg-yellow-700" }
  ]

  const benefits = [
    "Reduce security response time from hours to minutes",
    "Expert-level security analysis powered by AI",
    "Multi-platform WAF rule generation",
    "Visual vulnerability mapping and documentation",
    "Stay ahead of emerging threats",
    "Compliance-ready security documentation"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-900 via-stone-800 to-stone-900">
      {/* Navigation */}
      <nav className="border-stone-600 bg-stone-800/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-yellow-700 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-stone-200" />
              </div>
              <span className="text-xl font-bold text-stone-100">WAF Copilot</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-stone-300 hover:text-stone-100 hover:bg-stone-700">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-yellow-700 hover:bg-yellow-600 text-stone-900 font-semibold">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm bg-yellow-700/20 border-yellow-700/30">
              <Shield className="w-4 h-4 mr-2" />
              AI-Powered Security by <p className="text-yellow-500">CyberUltron</p>
            </Badge>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-stone-100 mb-6 leading-tight">
            Secure Your Web Apps with
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-300">
              {" "}AI-Powered WAF Rules
            </span>
          </h1>
          
          <p className="text-xl text-stone-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Transform CVE vulnerabilities into actionable WAF rules in seconds. 
            Protect your applications across AWS, Azure, GCP, and Cloudflare with 
            intelligent security automation.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="px-8 py-3 text-lg bg-yellow-700 hover:bg-yellow-600 text-stone-900 font-semibold">
                Start Protecting Your Apps
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="outline" size="lg" className="px-8 py-3 text-lg border-stone-500 text-stone-300 hover:bg-stone-700 hover:text-stone-100">
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-100 mb-4">
              Everything You Need for Modern Web Security
            </h2>
            <p className="text-xl text-stone-300 max-w-2xl mx-auto">
              From vulnerability analysis to rule deployment, WAF Copilot streamlines 
              your entire security workflow.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-stone-600 shadow-2xl hover:shadow-yellow-500/10 transition-all duration-300 bg-stone-700/50 backdrop-blur-sm">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 bg-yellow-700 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <feature.icon className="w-6 h-6 text-stone-200" />
                  </div>
                  <CardTitle className="text-lg text-stone-100">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center text-stone-400">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* WAF Providers Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-stone-700/30">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-stone-100 mb-4">
              Multi-Platform WAF Support
            </h2>
            <p className="text-xl text-stone-300 max-w-2xl mx-auto">
              Generate security rules for all major cloud providers and WAF solutions.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {wafProviders.map((provider, index) => (
              <Card key={index} className="border-stone-600 shadow-lg hover:shadow-yellow-500/20 transition-all duration-300 bg-stone-700">
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 ${provider.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <provider.icon className="w-8 h-8 text-stone-200" />
                  </div>
                  <h3 className="text-lg font-semibold text-stone-100">{provider.name}</h3>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-stone-100 mb-6">
                Why Security Teams Choose WAF Copilot
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <CheckCircle className="w-6 h-6 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span className="text-stone-300 text-lg">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <Card className="border-stone-600 shadow-2xl bg-gradient-to-br from-stone-700 to-stone-600 p-8">
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-700 rounded-full flex items-center justify-center">
                      <Cpu className="w-5 h-5 text-stone-200" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-100">AI-Powered Analysis</h3>
                      <p className="text-sm text-stone-400">GPT-4 powered security insights</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-700 rounded-full flex items-center justify-center">
                      <FileText className="w-5 h-5 text-stone-200" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-100">Instant Documentation</h3>
                      <p className="text-sm text-stone-400">Generate security reports in seconds</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-700 rounded-full flex items-center justify-center">
                      <Globe className="w-5 h-5 text-stone-200" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-stone-100">Multi-Cloud Ready</h3>
                      <p className="text-sm text-stone-400">Deploy across any cloud platform</p>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-yellow-700 to-yellow-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-900 mb-6">
            Ready to Transform Your Security Operations?
          </h2>
          <p className="text-xl text-stone-800 mb-8">
            Join security teams worldwide who trust WAF Copilot to protect their applications.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="px-8 py-3 text-lg bg-stone-100 hover:bg-stone-200 text-stone-900">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="px-8 py-3 text-lg border-stone-800 text-stone-800 hover:bg-stone-800 hover:text-stone-100">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-stone-800 text-stone-100 py-12 px-4 sm:px-6 lg:px-8 border-t border-stone-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-yellow-700 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-stone-200" />
                </div>
                <span className="text-xl font-bold">WAF Copilot</span>
              </div>
              <p className="text-stone-400">
                AI-powered security automation for modern web applications.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-stone-100">Product</h3>
              <ul className="space-y-2 text-stone-400">
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-stone-100">Company</h3>
              <ul className="space-y-2 text-stone-400">
                <li><a href="#" className="hover:text-yellow-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-stone-100">Support</h3>
              <ul className="space-y-2 text-stone-400">
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-yellow-400 transition-colors">Security</a></li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8 bg-stone-600" />
          
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-stone-400 text-sm">
              © 2024 WAF Copilot. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-stone-400 hover:text-yellow-400 transition-colors">Privacy</a>
              <a href="#" className="text-stone-400 hover:text-yellow-400 transition-colors">Terms</a>
              <a href="#" className="text-stone-400 hover:text-yellow-400 transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
