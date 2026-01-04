"use client";

import Link from "next/link";
import { 
  ArrowRight, 
  CheckCircle2, 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Zap, 
  ShieldCheck, 
  Globe,
  BarChart3,
  Clock,
  ChevronRight,
  Menu,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      title: "Project Tracking",
      description: "Real-time progress monitoring with intuitive dashboards and milestone tracking.",
      icon: LayoutDashboard,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      title: "Team Collaboration",
      description: "Seamlessly manage team members, roles, and permissions in one central hub.",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50"
    },
    {
      title: "Payment Management",
      description: "Track task-based payments and financial history with automated reporting.",
      icon: CreditCard,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      title: "Performance Analytics",
      description: "Gain deep insights into project velocity and team productivity with built-in charts.",
      icon: BarChart3,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
    {
      title: "Smart Notifications",
      description: "Stay updated with real-time alerts for task assignments and project updates.",
      icon: Zap,
      color: "text-rose-600",
      bg: "bg-rose-50"
    },
    {
      title: "Enterprise Security",
      description: "Role-based access control and secure data encryption for your organization.",
      icon: ShieldCheck,
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    }
  ];

  const stats = [
    { label: "Active Projects", value: "12k+" },
    { label: "Team Members", value: "85k+" },
    { label: "Tasks Completed", value: "1.2M+" },
    { label: "Client Satisfaction", value: "99.9%" }
  ];

  return (
    <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900">
      {/* Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white/80 backdrop-blur-md border-b border-gray-100 py-3" : "bg-transparent py-5"
      }`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <span className="font-bold text-xl text-gray-900 tracking-tight">ProjectHub</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Features</a>
            <a href="#stats" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Impact</a>
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">Login</Link>
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 shadow-lg shadow-blue-500/20">
                Get Started
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button className="md:hidden p-2 text-gray-600" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white border-b border-gray-100 p-6 space-y-4 shadow-xl animate-in slide-in-from-top-2">
            <a href="#features" className="block text-lg font-medium text-gray-900" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
            <a href="#stats" className="block text-lg font-medium text-gray-900" onClick={() => setIsMobileMenuOpen(false)}>Impact</a>
            <Link href="/login" className="block text-lg font-medium text-gray-900">Login</Link>
            <Link href="/login" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 text-lg">Get Started</Button>
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-[120px] opacity-60" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-50 rounded-full blur-[120px] opacity-60" />
        </div>

        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-semibold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Zap className="h-4 w-4 fill-blue-600" />
            <span>The next generation of project management</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Manage Projects <br className="hidden md:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              With Precision.
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-gray-600 mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            The all-in-one platform to track projects, manage team performance, and handle payments seamlessly. Built for modern teams that demand excellence.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            <Link href="/login">
              <Button className="h-14 px-10 bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold rounded-2xl shadow-2xl shadow-blue-500/30 group">
                Start for Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="outline" className="h-14 px-10 text-lg font-bold rounded-2xl border-gray-200 hover:bg-gray-50">
              Watch Demo
            </Button>
          </div>

          {/* Hero Image / Dashboard Preview */}
          <div className="relative max-w-5xl mx-auto animate-in fade-in zoom-in duration-1000 delay-500">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-[2.5rem] blur opacity-20" />
            <div className="relative bg-white rounded-[2rem] border border-gray-200 shadow-2xl overflow-hidden p-2">
              <img 
                src="/landing-hero.png" 
                alt="ProjectHub Dashboard" 
                className="w-full rounded-[1.5rem] shadow-inner"
              />
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -left-12 top-1/4 hidden lg:block animate-bounce duration-[3000ms]">
              <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-500 font-medium">Task Completed</p>
                  <p className="text-sm font-bold text-gray-900">Landing Page Design</p>
                </div>
              </div>
            </div>

            <div className="absolute -right-12 bottom-1/4 hidden lg:block animate-bounce duration-[4000ms]">
              <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-gray-500 font-medium">Payment Received</p>
                  <p className="text-sm font-bold text-gray-900">$2,450.00</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-sm font-bold text-blue-600 uppercase tracking-widest mb-3">Features</h2>
            <h3 className="text-4xl font-bold text-gray-900 mb-6">Everything you need to scale your team</h3>
            <p className="text-lg text-gray-600 leading-relaxed">
              We've built the most comprehensive toolset for modern project management. No more jumping between five different apps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div 
                key={i} 
                className="group p-8 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300"
              >
                <div className={`w-14 h-14 ${feature.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <feature.icon className={`h-7 w-7 ${feature.color}`} />
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="bg-blue-600 rounded-[3rem] p-12 md:p-20 relative overflow-hidden shadow-2xl shadow-blue-500/20">
            <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
            
            <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-12 text-center">
              {stats.map((stat, i) => (
                <div key={i} className="space-y-2">
                  <p className="text-4xl md:text-5xl font-extrabold text-white">{stat.value}</p>
                  <p className="text-blue-100 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">Ready to transform your workflow?</h2>
            <p className="text-xl text-gray-600">
              Join thousands of teams already using ProjectHub to deliver their best work.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button className="h-16 px-12 bg-blue-600 hover:bg-blue-700 text-white text-xl font-bold rounded-2xl shadow-xl shadow-blue-500/20">
                  Get Started Now
                </Button>
              </Link>
              <Button variant="ghost" className="h-16 px-12 text-xl font-bold text-gray-600 hover:text-blue-600">
                Contact Sales
              </Button>
            </div>
            <div className="flex items-center justify-center gap-8 pt-8 text-gray-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">14-day free trial</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1 space-y-6">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">P</span>
                </div>
                <span className="font-bold text-xl text-white tracking-tight">ProjectHub</span>
              </div>
              <p className="text-sm leading-relaxed">
                Empowering teams to manage projects with precision and ease. The modern standard for project management.
              </p>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <Globe className="h-5 w-5 text-white" />
                </div>
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                  <Users className="h-5 w-5 text-white" />
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Product</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Company</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-bold mb-6">Legal</h4>
              <ul className="space-y-4 text-sm">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <p>© 2026 ProjectHub Inc. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white transition-colors">GitHub</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
