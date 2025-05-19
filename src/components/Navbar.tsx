import React from 'react';
import { Button } from "@/components/ui/button";
import { Download, Mail, Linkedin } from "lucide-react";
const Navbar: React.FC = () => {
  return <header className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-sm z-50 py-4 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-serif font-semibold text-primary">Gokul Madan Alikkal</h1>
          </div>
          <nav className="hidden md:flex space-x-4 items-center">
            <a href="#about" className="text-gray-600 hover:text-primary transition-colors">About</a>
            <a href="#timeline" className="text-gray-600 hover:text-primary transition-colors">Experience</a>
            <a href="#xolution" className="text-gray-600 hover:text-primary transition-colors">Xolution</a>
            <a href="#pwc" className="text-gray-600 hover:text-primary transition-colors">PwC</a>
            <a href="#vision" className="text-gray-600 hover:text-primary transition-colors">Vision</a>
            <a href="#contact" className="text-gray-600 hover:text-primary transition-colors">Contact</a>
            
          </nav>
          <div className="md:hidden flex items-center space-x-2">
            <a href="mailto:gokulmadan2@gmail.com" className="p-2 text-gray-600 hover:text-primary">
              <Mail className="h-5 w-5" />
            </a>
            <a href="https://linkedin.com/in/gokulmadan" target="_blank" rel="noopener noreferrer" className="p-2 text-gray-600 hover:text-primary">
              <Linkedin className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
    </header>;
};
export default Navbar;