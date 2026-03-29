import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import { useGetMe } from "@workspace/api-client-react";

// Pages
import Login from "@/pages/login";
import Register from "@/pages/register";
import ClientHome from "@/pages/client/home";
import ClientProduct from "@/pages/client/product";
import ClientOrders from "@/pages/client/orders";
import ClientCollections from "@/pages/client/collections";
import ClientCollection from "@/pages/client/collection";
import ClientProfile from "@/pages/client/profile";
import FranchiseDashboard from "@/pages/franchise/dashboard";
import FranchiseProducts from "@/pages/franchise/products";
import FranchisePlans from "@/pages/franchise/plans";
import FranchiseProfile from "@/pages/franchise/profile";
import ProductionDashboard from "@/pages/production/dashboard";
import ProductionProfile from "@/pages/production/profile";
import { Spinner } from "./components/ui-elements";

import { initAuthToken } from "@/lib/auth-token";

initAuthToken();

const queryClient = new QueryClient();

function GuardedRoute({ component: Component, allowedRoles }: { component: any; allowedRoles?: string[] }) {
  const { data: user, isLoading } = useGetMe();

  if (isLoading) {
    return <div className="min-h-screen bg-black text-white"><Spinner /></div>;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === "client") return <Redirect to="/client" />;
    if (user.role === "franchise") return <Redirect to="/franchise" />;
    if (user.role === "production") return <Redirect to="/production" />;
    return <Redirect to="/login" />;
  }

  return <Component />;
}

function RootRouter() {
  const { data: user, isLoading } = useGetMe();

  if (isLoading) return <div className="min-h-screen bg-black text-white"><Spinner /></div>;

  if (!user) return <Redirect to="/login" />;
  if (user.role === "client") return <Redirect to="/client" />;
  if (user.role === "franchise") return <Redirect to="/franchise" />;
  if (user.role === "production") return <Redirect to="/production" />;

  return <Redirect to="/login" />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={RootRouter} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Client Routes */}
      <Route path="/client" children={<GuardedRoute component={ClientHome} allowedRoles={["client"]} />} />
      <Route path="/client/product/:id" children={<GuardedRoute component={ClientProduct} allowedRoles={["client"]} />} />
      <Route path="/client/orders" children={<GuardedRoute component={ClientOrders} allowedRoles={["client"]} />} />
      <Route path="/client/collections" children={<GuardedRoute component={ClientCollections} allowedRoles={["client"]} />} />
      <Route path="/client/collection/:name" children={<GuardedRoute component={ClientCollection} allowedRoles={["client"]} />} />
      <Route path="/client/profile" children={<GuardedRoute component={ClientProfile} allowedRoles={["client"]} />} />

      {/* Franchise Routes */}
      <Route path="/franchise" children={<GuardedRoute component={FranchiseDashboard} allowedRoles={["franchise"]} />} />
      <Route path="/franchise/products" children={<GuardedRoute component={FranchiseProducts} allowedRoles={["franchise"]} />} />
      <Route path="/franchise/plans" children={<GuardedRoute component={FranchisePlans} allowedRoles={["franchise"]} />} />
      <Route path="/franchise/profile" children={<GuardedRoute component={FranchiseProfile} allowedRoles={["franchise"]} />} />

      {/* Production Routes */}
      <Route path="/production" children={<GuardedRoute component={ProductionDashboard} allowedRoles={["production"]} />} />
      <Route path="/production/profile" children={<GuardedRoute component={ProductionProfile} allowedRoles={["production"]} />} />

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
