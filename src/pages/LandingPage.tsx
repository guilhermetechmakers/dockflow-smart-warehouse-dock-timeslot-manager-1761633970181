import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Warehouse, 
  Calendar, 
  QrCode, 
  BarChart3, 
  ArrowRight,
  Truck,
  Clock,
  Shield
} from 'lucide-react';

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-coral-500">
                <Warehouse className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-dark">DockFlow</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link to="/signup">
                <Button className="btn-primary">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-50 to-white py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-dark sm:text-6xl">
              Streamline Your
              <span className="text-coral-500"> Warehouse Operations</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
              Replace phone calls, emails, and spreadsheets with a single synchronized system 
              for scheduling, tracking, and reporting warehouse dock visits.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link to="/signup">
                <Button size="lg" className="btn-primary">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/book">
                <Button size="lg" variant="outline" className="btn-outline">
                  Book a Visit
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-dark">Everything You Need</h2>
            <p className="mt-4 text-lg text-gray-600">
              Complete dock management solution for modern warehouses
            </p>
          </div>
          
          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="dockflow-card dockflow-card-hover">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-coral-100">
                    <Calendar className="h-6 w-6 text-coral-600" />
                  </div>
                  <h3 className="ml-4 text-lg font-semibold text-dark">Smart Scheduling</h3>
                </div>
                <p className="mt-4 text-gray-600">
                  Automated slot management with conflict detection and real-time availability.
                </p>
              </CardContent>
            </Card>

            <Card className="dockflow-card dockflow-card-hover">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-coral-100">
                    <QrCode className="h-6 w-6 text-coral-600" />
                  </div>
                  <h3 className="ml-4 text-lg font-semibold text-dark">QR Check-in</h3>
                </div>
                <p className="mt-4 text-gray-600">
                  Instant gate check-in with QR codes and mobile-friendly interface.
                </p>
              </CardContent>
            </Card>

            <Card className="dockflow-card dockflow-card-hover">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-coral-100">
                    <BarChart3 className="h-6 w-6 text-coral-600" />
                  </div>
                  <h3 className="ml-4 text-lg font-semibold text-dark">Live Analytics</h3>
                </div>
                <p className="mt-4 text-gray-600">
                  Real-time dashboards with detention tracking and performance metrics.
                </p>
              </CardContent>
            </Card>

            <Card className="dockflow-card dockflow-card-hover">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-coral-100">
                    <Truck className="h-6 w-6 text-coral-600" />
                  </div>
                  <h3 className="ml-4 text-lg font-semibold text-dark">Carrier Portal</h3>
                </div>
                <p className="mt-4 text-gray-600">
                  Self-service booking portal for carriers with no login required.
                </p>
              </CardContent>
            </Card>

            <Card className="dockflow-card dockflow-card-hover">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-coral-100">
                    <Clock className="h-6 w-6 text-coral-600" />
                  </div>
                  <h3 className="ml-4 text-lg font-semibold text-dark">Real-time Updates</h3>
                </div>
                <p className="mt-4 text-gray-600">
                  Live notifications and status updates across all devices and users.
                </p>
              </CardContent>
            </Card>

            <Card className="dockflow-card dockflow-card-hover">
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-coral-100">
                    <Shield className="h-6 w-6 text-coral-600" />
                  </div>
                  <h3 className="ml-4 text-lg font-semibold text-dark">Secure & Reliable</h3>
                </div>
                <p className="mt-4 text-gray-600">
                  Enterprise-grade security with audit trails and compliance reporting.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-coral-500 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white">
              Ready to Transform Your Operations?
            </h2>
            <p className="mt-4 text-lg text-coral-100">
              Join hundreds of warehouses already using DockFlow to streamline their dock management.
            </p>
            <div className="mt-8 flex items-center justify-center gap-x-6">
              <Link to="/signup">
                <Button size="lg" variant="secondary" className="bg-white text-coral-500 hover:bg-gray-100">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-coral-500">
                  View Pricing
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-coral-500">
                <Warehouse className="h-5 w-5 text-white" />
              </div>
              <span className="ml-3 text-xl font-bold text-white">DockFlow</span>
            </div>
            <p className="mt-4 text-gray-400">
              © 2024 DockFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
