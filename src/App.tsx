// src/routes.tsx
import { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router";
import Loading from "./components/loading/load";
import AuthMiddleware from "./config/auth/authmiddlware";
import { AuthProvider } from "./config/auth/authContext";
import SystemHome from "./pages/system/home";

const AuthPage = lazy(() => import("./pages/auth/auth"));
const ErrorPage = lazy(() => import("./pages/error/error"));
const NotFoundPage = lazy(() => import("./pages/notfound/notfound"));
const SystemIndex = lazy(() => import("./pages/system/index"));
const SystemVisits = lazy(() => import("./pages/system/visits/index"));
const SystemAct = lazy(() => import("./pages/system/actives/index"));
const SystemTraining = lazy(() => import("./pages/system/training/index"));
const SystemLeaderDeck = lazy(() => import("./pages/system/leaderdeck/leaderdeck"));

const RoutesComponent = () => {
  return (
    <AuthProvider>
      <Router>
        <AuthMiddleware>
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<AuthPage />} />
              <Route path="/error" element={<ErrorPage />} />
              <Route path="*" element={<NotFoundPage />} />

              <Route path="/system">
                <Route index element={<SystemIndex />} />
                <Route path="executive-visits" element={<SystemVisits />} />
                <Route path="trainings" element={<SystemTraining />} />
                <Route path="activities" element={<SystemAct />} />
                <Route path="home" element={<SystemHome />} />
                <Route path="leaderdeck" element={<SystemLeaderDeck />} />
              </Route>
            </Routes>
          </Suspense>
        </AuthMiddleware>
      </Router>
    </AuthProvider>
  );
};

export default RoutesComponent;
