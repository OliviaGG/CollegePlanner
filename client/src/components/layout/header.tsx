import { Bell, Settings, LogOut, User, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import sccLogoUrl from "@assets/scc-logo-emblem-white.png";
import { useState, useEffect } from "react";

export default function Header() {
  const { data: user } = useQuery({
    queryKey: ["/api/user"],
  });

  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Check if user is logged in and maintain their information
  useEffect(() => {
    const savedUser = localStorage.getItem('loggedInUser');
    if (savedUser) {
      setLoggedInUser(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }

    // Listen for localStorage changes to update header when profile is updated
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem('loggedInUser');
      if (updatedUser) {
        setLoggedInUser(JSON.parse(updatedUser));
      }
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events for same-tab updates
    window.addEventListener('userProfileUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userProfileUpdated', handleStorageChange);
    };
  }, []);

  const handleLogin = () => {
    // For now, use the mock user data - in production this would be real auth
    const userToLogin = user || { firstName: "John", lastName: "Doe" };
    setLoggedInUser(userToLogin);
    setIsLoggedIn(true);
    localStorage.setItem('loggedInUser', JSON.stringify(userToLogin));
  };

  const handleLogout = () => {
    setLoggedInUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('loggedInUser');
  };

  const displayUser = loggedInUser || user;

  return (
    <header className="bg-card border-b border-border">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <img 
              src={sccLogoUrl} 
              alt="Sacramento City College Logo" 
              className="w-10 h-10 object-contain"
              data-testid="scc-logo"
            />
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-primary leading-tight font-heading">SCC EduPlan</h1>
              <span className="text-xs text-muted-foreground font-serif">Sacramento City College</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" data-testid="button-notifications">
            <Bell className="h-4 w-4" />
          </Button>

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 h-auto p-2">
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground text-sm font-medium" data-testid="user-initials">
                      {displayUser?.firstName?.[0]}{displayUser?.lastName?.[0] || "U"}
                    </span>
                  </div>
                  <span className="text-sm font-medium" data-testid="user-full-name">
                    {displayUser?.firstName} {displayUser?.lastName || "User"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {displayUser?.firstName} {displayUser?.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {displayUser?.email || "student@scc.edu"}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => window.location.href = '/profile'}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  // For now, show a simple alert - could be expanded to open a preferences modal
                  alert('Preferences functionality coming soon! You can update your profile settings from the Profile page.');
                }}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Preferences</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={handleLogin} variant="outline" size="sm">
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}