import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <h1 className="mb-4 text-6xl font-bold text-primary">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Página não encontrada</p>
        <p className="mb-8 text-sm text-muted-foreground">
          A página {location.pathname} não existe.
        </p>
        <Button onClick={() => window.location.href = "/"}>
          <Home className="w-4 h-4 mr-2" />
          Voltar para Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;