import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Dashboard from "@/pages/dashboard";
import Patients from "@/pages/patients";
import AddPatient from "@/pages/add-patient";
import ActivityLog from "@/pages/activity-log";
import NotFound from "@/pages/not-found";
import { AuthProvider, RequireAuth } from "@/lib/auth";
import { useEffect } from "react";

function Router() {
  const [location, navigate] = useLocation();

  // Redirect to login if accessing the root path
  useEffect(() => {
    if (location === "/") {
      navigate("/login");
    }
  }, [location, navigate]);

  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      
      {/* Protected routes */}
      <Route path="/dashboard">
        <RequireAuth>
          <Dashboard />
        </RequireAuth>
      </Route>
      
      <Route path="/patients">
        <RequireAuth>
          <Patients />
        </RequireAuth>
      </Route>
      
      <Route path="/add-patient">
        <RequireAuth>
          <AddPatient />
        </RequireAuth>
      </Route>
      
      <Route path="/activity-log">
        <RequireAuth>
          <ActivityLog />
        </RequireAuth>
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
