import React from "react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import Layout from "@/components/layout";
import Dashboard from "@/pages/Dashboard";

const Index = () => {
  // Simply show the dashboard, protected by ProtectedRoute
  return (
    <ProtectedRoute>
      <Layout>
        <Dashboard />
      </Layout>
    </ProtectedRoute>
  );
};

export default Index;
