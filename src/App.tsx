import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/LoginPage";
import { SignupPage } from "@/pages/SignupPage";
import { PasswordResetPage } from "@/pages/PasswordResetPage";
import { EmailVerificationPage } from "@/pages/EmailVerificationPage";
import { PublicBookingPage } from "@/pages/PublicBookingPage";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { OperationsDashboard } from "@/pages/OperationsDashboard";
import { SchedulePage } from "@/pages/SchedulePage";
import { GateCheckInPage } from "@/pages/GateCheckInPage";
import { VisitDetailPage } from "@/pages/VisitDetailPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { UserProfilePage } from "@/pages/UserProfilePage";
import { AdminDashboard } from "@/pages/AdminDashboard";
import { PricingPage } from "@/pages/PricingPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

// React Query client with optimal defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('auth_token');
  return token ? <>{children}</> : <Navigate to="/login" replace />;
}

// Public Route component (redirect to dashboard if already logged in)
function PublicRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('auth_token');
  return token ? <Navigate to="/dashboard" replace /> : <>{children}</>;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-background">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/book/:warehouseId?" element={<PublicBookingPage />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } />
            <Route path="/signup" element={
              <PublicRoute>
                <SignupPage />
              </PublicRoute>
            } />
            <Route path="/password-reset" element={
              <PublicRoute>
                <PasswordResetPage />
              </PublicRoute>
            } />
            <Route path="/verify-email" element={
              <PublicRoute>
                <EmailVerificationPage />
              </PublicRoute>
            } />
            
            {/* Protected Dashboard Routes */}
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }>
              <Route index element={<OperationsDashboard />} />
              <Route path="schedule" element={<SchedulePage />} />
              <Route path="analytics" element={<AnalyticsPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="profile" element={<UserProfilePage />} />
            </Route>
            
            {/* Gate Check-in (separate route for tablets) */}
            <Route path="/gate" element={
              <ProtectedRoute>
                <GateCheckInPage />
              </ProtectedRoute>
            } />
            
            {/* Visit Detail */}
            <Route path="/visit/:id" element={
              <ProtectedRoute>
                <VisitDetailPage />
              </ProtectedRoute>
            } />
            
            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </div>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
