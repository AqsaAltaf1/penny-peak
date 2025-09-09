import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  DollarSign, 
  LogIn, 
  UserPlus, 
  Zap,
  Home,
  BarChart3
} from "lucide-react";

interface NavbarProps {
  showAuthButtons?: boolean;
}

export function Navbar({ showAuthButtons = true }: NavbarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const scrollToSection = (sectionId: string) => {
    if (location.pathname === '/') {
      // If we're on the home page, scroll to the section
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      // If we're on another page, navigate to home and then scroll
      navigate('/');
      setTimeout(() => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
    closeMenu();
  };

  // Scroll spy effect to detect active section
  useEffect(() => {
    if (location.pathname !== '/') {
      // Reset active section when not on home page
      setActiveSection('');
      return;
    }

    const sections = ['hero', 'features', 'how-it-works'];
    
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 100; // Offset for navbar height
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    // Set initial active section
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  return (
    <nav className="bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div 
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <div className="w-8 h-8 neomorph-raised rounded-lg flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Expense Tracker
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <button
              onClick={() => scrollToSection('hero')}
              className={`transition-all duration-200 flex items-center space-x-1 px-3 py-2 rounded-lg relative ${
                activeSection === 'hero' 
                  ? 'text-primary bg-primary/10 neomorph-inset' 
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
              }`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
              {activeSection === 'hero' && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
              )}
            </button>
            
            <button
              onClick={() => scrollToSection('features')}
              className={`transition-all duration-200 flex items-center space-x-1 px-3 py-2 rounded-lg relative ${
                activeSection === 'features' 
                  ? 'text-primary bg-primary/10 neomorph-inset' 
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Features</span>
              {activeSection === 'features' && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
              )}
            </button>
            
            <button
              onClick={() => scrollToSection('how-it-works')}
              className={`transition-all duration-200 flex items-center space-x-1 px-3 py-2 rounded-lg relative ${
                activeSection === 'how-it-works' 
                  ? 'text-primary bg-primary/10 neomorph-inset' 
                  : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
              }`}
            >
              <Zap className="h-4 w-4" />
              <span>How It Works</span>
              {activeSection === 'how-it-works' && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full"></div>
              )}
            </button>

            {showAuthButtons && (
              <>
                <Button
                  onClick={() => navigate('/auth')}
                  variant="ghost"
                  className="neomorph-button border-0 hover:gradient-primary hover:text-primary-foreground transition-all duration-200"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
                
                <Button
                  onClick={() => navigate('/auth')}
                  className="neomorph-button border-0 gradient-primary text-primary-foreground"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Register
                </Button>
              </>
            )}
          </div>

          {/* Tablet Navigation - Show auth buttons on medium screens */}
          <div className="hidden md:flex lg:hidden items-center space-x-4">
            {showAuthButtons && (
              <>
                <Button
                  onClick={() => navigate('/auth')}
                  variant="ghost"
                  size="sm"
                  className="neomorph-button border-0 hover:gradient-primary hover:text-primary-foreground transition-all duration-200"
                >
                  <LogIn className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Login</span>
                </Button>
                
                <Button
                  onClick={() => navigate('/auth')}
                  size="sm"
                  className="neomorph-button border-0 gradient-primary text-primary-foreground"
                >
                  <UserPlus className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Register</span>
                </Button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="neomorph-button border-0"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-background/95 backdrop-blur-md rounded-lg mt-2 neomorph-inset border-0">
              <button
                onClick={() => scrollToSection('hero')}
                className={`w-full text-left px-3 py-2 transition-all duration-200 flex items-center space-x-2 rounded-lg ${
                  activeSection === 'hero' 
                    ? 'text-primary bg-primary/10 neomorph-inset' 
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                }`}
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </button>
              
              <button
                onClick={() => scrollToSection('features')}
                className={`w-full text-left px-3 py-2 transition-all duration-200 flex items-center space-x-2 rounded-lg ${
                  activeSection === 'features' 
                    ? 'text-primary bg-primary/10 neomorph-inset' 
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                }`}
              >
                <BarChart3 className="h-4 w-4" />
                <span>Features</span>
              </button>
              
              <button
                onClick={() => scrollToSection('how-it-works')}
                className={`w-full text-left px-3 py-2 transition-all duration-200 flex items-center space-x-2 rounded-lg ${
                  activeSection === 'how-it-works' 
                    ? 'text-primary bg-primary/10 neomorph-inset' 
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/10'
                }`}
              >
                <Zap className="h-4 w-4" />
                <span>How It Works</span>
              </button>

              {showAuthButtons && (
                <>
                  <div className="border-t border-border/50 my-2"></div>
                  
                  <Button
                    onClick={() => {
                      navigate('/auth');
                      closeMenu();
                    }}
                    variant="ghost"
                    className="w-full justify-start neomorph-button border-0 hover:gradient-primary hover:text-primary-foreground transition-all duration-200"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                  
                  <Button
                    onClick={() => {
                      navigate('/auth');
                      closeMenu();
                    }}
                    className="w-full justify-start neomorph-button border-0 gradient-primary text-primary-foreground"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Register
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
