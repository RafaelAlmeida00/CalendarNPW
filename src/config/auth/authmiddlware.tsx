import { JSX } from "react";
import { Navigate, useLocation } from "react-router";
import Loading from "../../components/loading/load";
import { useAuth } from "./authContext";

const AuthMiddleware = ({ children }: { children: JSX.Element }) => {
  const location = useLocation();
  const { isVerified, npwAdmin, loading } = useAuth();

  // Exibe o carregamento até que o estado de verificação esteja pronto
  if (loading) {
    return <Loading />;
  }

  // Redireciona para a página inicial se não for verificado
  if (location.pathname.startsWith("/system") && !isVerified) {
    localStorage.removeItem("token");
    return <Navigate to="/" replace />;
  }

  // Redireciona para /system se estiver verificado e tentando acessar outra página
  if (!location.pathname.startsWith("/system") && isVerified) {
    return <Navigate to="/system" replace />;
  }

  // Se o usuário está autorizado e na página correta, renderiza o conteúdo filho
  return children;
};

export default AuthMiddleware;
