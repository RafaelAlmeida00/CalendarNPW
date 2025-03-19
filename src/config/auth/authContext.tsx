import { createContext, useContext, useEffect, useState } from "react";
import { GetTokenAndVerify } from "../../utils/auth/auth";

interface AuthContextType {
  isVerified: boolean | null;
  npwAdmin: boolean | null;
  loading: boolean;
  verifyToken: () => void; // Função para forçar a verificação manualmente
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [npwAdmin, setNpwAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const verifyToken = async () => {
    setLoading(true);
    try {
      const userSnap = await GetTokenAndVerify() as any;
      if (userSnap) {
        setIsVerified(true);
        setNpwAdmin(userSnap.npwAdmin ?? false);
      } else {
        setIsVerified(false);
        setNpwAdmin(false);
      }
    } catch (error) {
      setIsVerified(false);
      setNpwAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyToken();
  }, []);

  return (
    <AuthContext.Provider value={{ isVerified, npwAdmin, loading, verifyToken }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para consumir o contexto
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  return context;
};
