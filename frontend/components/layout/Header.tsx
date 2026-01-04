"use client";

import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePathname } from "next/navigation";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 md:px-6">
      <div className="flex items-center gap-4">
        {/* Mobile Menu Trigger */}
        <Button 
          variant="ghost" 
          size="icon" 
          className="lg:hidden h-10 w-10 text-gray-500"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </Button>

        {/* Mobile Logo (Visible only on small screens) */}
        <div className="lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
        </div>

        {/* Search - Hidden on very small screens, responsive on others */}
        <div className="hidden sm:flex items-center gap-4">
          <div className="relative w-48 md:w-80">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search..."
              className="pl-10 h-10 bg-gray-50 border-gray-200 focus:bg-white rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Mobile Search Trigger */}
        <Button variant="ghost" size="icon" className="sm:hidden h-10 w-10">
          <Search className="h-5 w-5 text-gray-500" />
        </Button>
        
        <Button variant="ghost" size="icon" className="relative h-10 w-10">
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </Button>
      </div>
    </header>
  );
}

