
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Download, Menu, X } from "lucide-react";

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <header 
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/90 backdrop-blur-sm shadow-sm py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-medium">Gokul Madan Alikkal</h1>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#about" className="text-sm text-gray-600 hover:text-primary transition-colors">About</a>
            <a href="#timeline" className="text-sm text-gray-600 hover:text-primary transition-colors">Experience</a>
            <a href="#xolution" className="text-sm text-gray-600 hover:text-primary transition-colors">Xolution</a>
            <a href="#vision" className="text-sm text-gray-600 hover:text-primary transition-colors">Vision</a>
            <a href="#contact" className="text-sm text-gray-600 hover:text-primary transition-colors">Contact</a>
            <Button variant="outline" size="sm" className="stripe-button flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span>Resume</span>
            </Button>
          </nav>
          
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-gray-600"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden absolute top-full left-0 right-0 bg-white shadow-md border-t animate-fade-in">
          <div className="px-4 py-5 space-y-4">
            <a href="#about" className="block text-gray-600 hover:text-primary transition-colors">About</a>
            <a href="#timeline" className="block text-gray-600 hover:text-primary transition-colors">Experience</a>
            <a href="#xolution" className="block text-gray-600 hover:text-primary transition-colors">Xolution</a>
            <a href="#vision" className="block text-gray-600 hover:text-primary transition-colors">Vision</a>
            <a href="#contact" className="block text-gray-600 hover:text-primary transition-colors">Contact</a>
            <Button variant="outline" size="sm" className="stripe-button flex items-center gap-2 w-full justify-center">
              <Download className="h-4 w-4" />
              <span>Resume</span>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
