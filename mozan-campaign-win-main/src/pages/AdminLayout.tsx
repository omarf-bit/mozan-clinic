import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, Users, FileText, LogOut } from "lucide-react";

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card ml-64">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-foreground">Admin Panel</h1>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>
      {/* Sidebar fixed to the left */}
      <aside className="fixed left-0 top-0 h-screen w-64 bg-black text-white rounded-r-md overflow-auto shadow-sm">
        <nav className="flex flex-col mt-20">
          <Link to="/admin/dashboard" className="w-full">
            <Button
              variant={isActive("/admin/dashboard") ? "default" : "ghost"}
              className={`w-full justify-start px-6 py-4 rounded-none border-0 ${isActive("/admin/dashboard") ? 'bg-white text-black' : 'bg-transparent text-white hover:bg-white/5'}`}
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Dashboard
            </Button>
          </Link>

          <Link to="/admin/leads" className="w-full">
            <Button
              variant={isActive("/admin/leads") ? "default" : "ghost"}
              className={`w-full justify-start px-6 py-4 rounded-none border-0 ${isActive("/admin/leads") ? 'bg-white text-black' : 'bg-transparent text-white hover:bg-white/5'}`}
            >
              <FileText className="w-4 h-4 mr-2" />
              Leads
            </Button>
          </Link>

          <Link to="/admin/users" className="w-full">
            <Button
              variant={isActive("/admin/users") ? "default" : "ghost"}
              className={`w-full justify-start px-6 py-4 rounded-none border-0 ${isActive("/admin/users") ? 'bg-white text-black' : 'bg-transparent text-white hover:bg-white/5'}`}
            >
              <Users className="w-4 h-4 mr-2" />
              Users
            </Button>
          </Link>
        </nav>
      </aside>

      <div className="ml-64 max-w-7xl mx-auto px-8 py-6">
        <div className="flex gap-6">
          {/* Main Content */}
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
