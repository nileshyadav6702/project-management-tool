"use client";

import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search,
  HelpCircle,
  BookOpen,
  MessageCircle,
  Video,
  FileText,
  ChevronRight,
  ExternalLink,
  LifeBuoy,
  Zap,
  ShieldCheck,
  Users,
} from "lucide-react";

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    {
      title: "Getting Started",
      icon: Zap,
      color: "text-amber-600",
      bg: "bg-amber-50",
      articles: ["Setting up your profile", "Inviting team members", "Creating your first project"],
    },
    {
      title: "Project Management",
      icon: BookOpen,
      color: "text-blue-600",
      bg: "bg-blue-50",
      articles: ["Task dependencies", "Project timelines", "Milestone tracking"],
    },
    {
      title: "Payments & Billing",
      icon: ShieldCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      articles: ["Recording payments", "Invoicing clients", "Payment history"],
    },
    {
      title: "Team Collaboration",
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
      articles: ["Role permissions", "Team communication", "Shared resources"],
    },
  ];

  const faqs = [
    {
      q: "How do I change my organization name?",
      a: "Go to Settings > Organization and update the name field. Only admins can perform this action.",
    },
    {
      q: "Can I export my project data?",
      a: "Yes, you can export project reports in CSV or PDF format from the Project details page.",
    },
    {
      q: "How are payments calculated?",
      a: "Payments are tied to specific tasks. When a task is marked as done, you can record a payment for the assigned member.",
    },
  ];

  return (
    <MainLayout>
      <div className="max-w-5xl mx-auto space-y-12 pb-12">
        {/* Hero Section */}
        <div className="text-center space-y-6 py-12 bg-gradient-to-b from-blue-50/50 to-transparent rounded-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider">
            <LifeBuoy className="h-3.5 w-3.5" />
            Support Center
          </div>
          <h1 className="text-4xl font-bold text-gray-900">How can we help you?</h1>
          <div className="relative max-w-2xl mx-auto px-4">
            <Search className="absolute left-7 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search for articles, guides, and more..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-14 text-lg bg-white border-gray-200 shadow-xl shadow-blue-500/5 rounded-2xl focus:ring-blue-500/20"
            />
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="border-gray-200 hover:border-blue-200 transition-all group cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 transition-colors">
                <FileText className="h-6 w-6 text-blue-600 group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Documentation</h3>
                <p className="text-sm text-gray-500">Full API and feature guides</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-300 ml-auto" />
            </CardContent>
          </Card>
          <Card className="border-gray-200 hover:border-blue-200 transition-all group cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-600 transition-colors">
                <Video className="h-6 w-6 text-purple-600 group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Video Tutorials</h3>
                <p className="text-sm text-gray-500">Watch and learn features</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-300 ml-auto" />
            </CardContent>
          </Card>
          <Card className="border-gray-200 hover:border-blue-200 transition-all group cursor-pointer">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center group-hover:bg-emerald-600 transition-colors">
                <MessageCircle className="h-6 w-6 text-emerald-600 group-hover:text-white" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900">Community</h3>
                <p className="text-sm text-gray-500">Join the conversation</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-300 ml-auto" />
            </CardContent>
          </Card>
        </div>

        {/* Categories */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 px-2">Browse by Category</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {categories.map((cat, i) => (
              <Card key={i} className="border-gray-200 overflow-hidden">
                <CardHeader className={`${cat.bg} border-b border-gray-100`}>
                  <div className="flex items-center gap-3">
                    <cat.icon className={`h-5 w-5 ${cat.color}`} />
                    <CardTitle className="text-lg">{cat.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-gray-50">
                    {cat.articles.map((article, j) => (
                      <button
                        key={j}
                        className="w-full flex items-center justify-between px-6 py-4 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                      >
                        {article}
                        <ChevronRight className="h-4 w-4 text-gray-300" />
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 px-2">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <Card key={i} className="border-gray-200">
                <CardContent className="p-6">
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <HelpCircle className="h-4 w-4 text-blue-600" />
                    {faq.q}
                  </h3>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {faq.a}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Contact Support */}
        <Card className="bg-blue-600 border-none shadow-2xl shadow-blue-500/20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <CardContent className="p-12 text-center relative z-10">
            <h2 className="text-3xl font-bold text-white mb-4">Still need help?</h2>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto">
              Our support team is available 24/7 to help you with any questions or issues you might have.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button className="bg-white text-blue-600 hover:bg-blue-50 px-8 h-12 font-bold rounded-xl">
                Contact Support
              </Button>
              <Button variant="outline" className="text-white border-white/30 hover:bg-white/10 px-8 h-12 font-bold rounded-xl">
                Email Us
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
