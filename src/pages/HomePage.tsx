import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { 
  DollarSign, 
  TrendingUp, 
  Target, 
  BarChart3, 
  Shield, 
  Smartphone, 
  Zap, 
  Users,
  ArrowRight,
  CheckCircle,
  Star
} from "lucide-react";

export function HomePage() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <DollarSign className="h-8 w-8 text-primary" />,
      title: "Track Expenses",
      description: "Easily record and categorize your daily expenses with our intuitive interface."
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-primary" />,
      title: "Income Management",
      description: "Monitor your income sources and get insights into your earning patterns."
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Savings Goals",
      description: "Set and track your financial goals with visual progress indicators."
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-primary" />,
      title: "Analytics & Reports",
      description: "Get detailed insights and reports on your spending habits and trends."
    }
  ];

  const benefits = [
    "📊 Visual dashboard with beautiful charts",
    "🎯 Set and track multiple savings goals",
    "📱 Mobile-friendly responsive design",
    "🔒 Secure and private data storage",
    "⚡ Fast and intuitive user experience",
    "💡 Smart spending insights and tips"
  ];

  const steps = [
    {
      number: "01",
      title: "Sign Up",
      description: "Create your account with email verification or try our demo mode"
    },
    {
      number: "02", 
      title: "Add Transactions",
      description: "Start recording your income and expenses with easy categorization"
    },
    {
      number: "03",
      title: "Set Goals",
      description: "Define your financial goals and watch your progress in real-time"
    },
    {
      number: "04",
      title: "Track Progress",
      description: "Monitor your spending patterns and achieve your financial objectives"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <Navbar />
      
      {/* Hero Section */}
      <div id="hero" className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-8">
            {/* Logo and Title */}
            <div className="space-y-4">
              <div className="mx-auto w-20 h-20 neomorph-raised rounded-3xl flex items-center justify-center">
                <DollarSign className="h-12 w-12 text-primary" />
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Expense Tracker
              </h1>
              <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto">
                Take control of your finances with beautiful insights and smart analytics
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={() => navigate('/auth')}
                className="neomorph-button border-0 gradient-primary text-primary-foreground px-8 py-3 text-lg"
              >
                <Users className="h-5 w-5 mr-2" />
                Get Started
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              
              <Button
                onClick={() => navigate('/auth')}
                variant="outline"
                className="neomorph-button border-0 hover:gradient-primary hover:text-primary-foreground transition-all duration-200 px-8 py-3 text-lg"
              >
                <Zap className="h-5 w-5 mr-2" />
                Try Demo
              </Button>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-4 pt-8">
              <Badge variant="secondary" className="neomorph-inset border-0 px-4 py-2">
                <Shield className="h-4 w-4 mr-2" />
                Secure & Private
              </Badge>
              <Badge variant="secondary" className="neomorph-inset border-0 px-4 py-2">
                <Smartphone className="h-4 w-4 mr-2" />
                Mobile Friendly
              </Badge>
              <Badge variant="secondary" className="neomorph-inset border-0 px-4 py-2">
                <Star className="h-4 w-4 mr-2" />
                Easy to Use
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">Everything You Need</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed to help you manage your finances effectively
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="neomorph-raised border-0 shadow-none hover:neomorph-inset transition-all duration-300">
                <CardContent className="p-6 text-center space-y-4">
                  <div className="mx-auto w-16 h-16 neomorph-inset rounded-2xl flex items-center justify-center">
                    {feature.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div id="how-it-works" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes and take control of your finances
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center space-y-4">
                <div className="mx-auto w-16 h-16 neomorph-raised rounded-2xl flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">{step.number}</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl font-bold">Why Choose Our Expense Tracker?</h2>
              <p className="text-lg text-muted-foreground">
                Built with modern design principles and user experience in mind, our expense tracker helps you achieve your financial goals effortlessly.
              </p>
              
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
                    <span className="text-muted-foreground">{benefit}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => navigate('/auth')}
                  className="neomorph-button border-0 gradient-primary text-primary-foreground"
                >
                  Start Your Journey
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>

            <div className="relative">
              <div className="neomorph-raised rounded-3xl p-8 space-y-6">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-16 h-16 neomorph-inset rounded-2xl flex items-center justify-center">
                    <DollarSign className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Your Financial Dashboard</h3>
                  <p className="text-muted-foreground">
                    Get a complete overview of your financial health with beautiful charts and insights.
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="neomorph-inset rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-green-500">$2,450</div>
                    <div className="text-sm text-muted-foreground">Total Income</div>
                  </div>
                  <div className="neomorph-inset rounded-xl p-4 text-center">
                    <div className="text-2xl font-bold text-red-500">$1,890</div>
                    <div className="text-sm text-muted-foreground">Total Expenses</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-3xl sm:text-4xl font-bold">Ready to Take Control?</h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of users who are already managing their finances better with our expense tracker.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => navigate('/auth')}
              className="neomorph-button border-0 gradient-primary text-primary-foreground px-8 py-3 text-lg"
            >
              <Users className="h-5 w-5 mr-2" />
              Create Account
            </Button>
            
            <Button
              onClick={() => navigate('/auth')}
              variant="outline"
              className="neomorph-button border-0 hover:gradient-primary hover:text-primary-foreground transition-all duration-200 px-8 py-3 text-lg"
            >
              <Zap className="h-5 w-5 mr-2" />
              Try Demo First
            </Button>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="bg-muted/30 border-t border-border/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 All rights reserved by aqsaaltaf01@gmail.com
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
