import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import AdminDashboard from "./pages/AdminDashboard";
import Scores from "./pages/Scores";
import Charities from "./pages/Charities";
import MyCharity from "./pages/MyCharity";
import CharityDetails from "./pages/CharityDetails";
import Pricing from "./pages/Pricing";
import SubscriptionSuccess from "./pages/SubscriptionSuccess";
import SubscriptionCancel from "./pages/SubscriptionCancel";
import Draws from "./pages/Draws";
import AdminDraws from "./pages/AdminDraws";
import AdminWinners from "./pages/AdminWinners";
import AdminUsers from "./pages/AdminUsers";
import AdminCharities from "./pages/AdminCharities";
import AdminReports from "./pages/AdminReports";
import SubscriberRoute from "./components/SubscriberRoute";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/"
            element={<Home />}
          />

          <Route
            path="/login"
            element={<Login />}
          />

          <Route
            path="/signup"
            element={<Signup />}
          />

          <Route
            path="/charities"
            element={<Charities />}
          />

          <Route
            path="/charities/:id"
            element={<CharityDetails />}
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard/scores"
            element={
              <SubscriberRoute>
              <Scores />
              </SubscriberRoute>
             }
          />

          <Route
            path="/dashboard/charity"
            element={
              <ProtectedRoute>
              <MyCharity />
              </ProtectedRoute>
             }
          />

          <Route
             path="/dashboard/draws"
             element={
              <ProtectedRoute>
              <Draws />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          <Route
            path="/admin/draws"
            element={
            <AdminRoute>
             <AdminDraws />
             </AdminRoute>
             }
          />

          <Route
             path="/admin/winners"
             element={
                <AdminRoute>
                <AdminWinners />
                 </AdminRoute>
             }
          />

          <Route
             path="/admin/users"
              element={
               <AdminRoute>
               <AdminUsers />
              </AdminRoute>
         }
        />

        <Route
         path="/admin/charities"
        element={
          <AdminRoute>
          <AdminCharities />
          </AdminRoute>
          }
        />

        <Route
          path="/admin/reports"
          element={
             <AdminRoute>
             <AdminReports />
             </AdminRoute>
           }
          />

          <Route
             path="/pricing"
             element={
            <ProtectedRoute>
            <Pricing />
            </ProtectedRoute>
           }
          />

          <Route
            path="/subscription/success"
            element={
              <ProtectedRoute>
               <SubscriptionSuccess />
              </ProtectedRoute>
             }
          />

          <Route
             path="/subscription/cancel"
             element={
                <ProtectedRoute>
                <SubscriptionCancel />
               </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={<Navigate to="/login" replace />}
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;