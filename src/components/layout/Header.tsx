import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, LayoutDashboard, Menu, X, Settings } from 'lucide-react';

const Header: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Get user initials - NOW WITH SAFETY CHECKS
  const getInitials = (name?: string) => {
    if (!name || typeof name !== 'string') return 'U';
    
    return name
      .split(' ')
      .filter(n => n.length > 0)
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Get first name - NEW HELPER FUNCTION
  const getFirstName = (name?: string) => {
    if (!name || typeof name !== 'string') return 'User';
    return name.split(' ')[0] || 'User';
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80"
    >
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl gradient-primary">
            <span className="text-lg font-bold text-primary-foreground">K</span>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-lg font-bold text-foreground">KDU NACOS Pay</h1>
            <p className="text-xs text-muted-foreground">400L CS Project</p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <ThemeToggle />
          {isAuthenticated ? (
            <>
              <Link
                to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Dashboard
              </Link>
              {user?.role === 'student' && (
                <Link
                  to="/payments"
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Make Payment
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                      {getInitials(user?.fullName)}
                    </div>
                    <span className="hidden lg:inline">{getFirstName(user?.fullName)}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-card">
                  <div className="px-3 py-2">
                    <p className="text-sm font-medium">{user?.fullName || 'User'}</p>
                    <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={user?.role === 'admin' ? '/admin' : '/dashboard'} className="cursor-pointer">
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile/edit" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      Edit Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Login
              </Link>
              <Button asChild variant="default" size="sm">
                <Link to="/signup">Get Started</Link>
              </Button>
            </>
          )}
        </nav>

        {/* Mobile Navigation - Shows theme toggle, user info, and menu */}
        <div className="md:hidden flex items-center gap-2">
          <ThemeToggle />
          {isAuthenticated && user && (
            <>
              {/* User Initials Avatar */}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-xs">
                {getInitials(user?.fullName)}
              </div>
              {/* User First Name */}
              <span className="text-sm font-medium text-foreground max-w-[80px] truncate">
                {getFirstName(user?.fullName)}
              </span>
            </>
          )}
          {/* Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden border-t border-border bg-card"
        >
          <nav className="container py-4 flex flex-col gap-3">
            {isAuthenticated ? (
              <>
                <div className="px-3 py-2 rounded-lg bg-muted">
                  <p className="text-sm font-medium">{user?.fullName || 'User'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email || ''}</p>
                </div>
                <Link
                  to={user?.role === 'admin' ? '/admin' : '/dashboard'}
                  className="px-3 py-2 text-sm font-medium hover:bg-accent rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {user?.role === 'student' && (
                  <Link
                    to="/payments"
                    className="px-3 py-2 text-sm font-medium hover:bg-accent rounded-lg"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Make Payment
                  </Link>
                )}
                <Link
                  to="/profile/edit"
                  className="px-3 py-2 text-sm font-medium hover:bg-accent rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Edit Profile
                </Link>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 rounded-lg text-left"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-3 py-2 text-sm font-medium hover:bg-accent rounded-lg"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="px-3 py-2 text-sm font-medium gradient-primary text-primary-foreground rounded-lg text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </Link>
              </>
            )}
          </nav>
        </motion.div>
      )}
    </motion.header>
  );
};

export default Header;