import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  LayoutDashboard, 
  Users, 
  UserPlus, 
  History, 
  Settings, 
  LogOut,
  Menu, 
  X
} from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  const sidebarItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      href: "/dashboard",
    },
    {
      title: "Patients",
      icon: <Users className="h-5 w-5" />,
      href: "/patients",
    },
    {
      title: "Add Patient",
      icon: <UserPlus className="h-5 w-5" />,
      href: "/add-patient",
    },
    {
      title: "Activity Log",
      icon: <History className="h-5 w-5" />,
      href: "/activity-log",
    },
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      href: "/settings",
    },
  ];

  const sidebarContent = (
    <>
      <div className="flex items-center mb-8 pl-4 gap-2 mt-4">
        <div className="h-8 w-8 flex items-center justify-center bg-primary rounded-md">
          <svg className="h-6 w-6" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="40" height="40" rx="8" fill="currentColor"/>
            <path d="M20 10V30M10 20H30" stroke="white" strokeWidth="4" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">MediTrack</h1>
          <p className="text-xs text-slate-300">Patient Management</p>
        </div>
      </div>
      
      <div className="space-y-1 py-2">
        {sidebarItems.map((item) => (
          <Tooltip key={item.href}>
            <TooltipTrigger asChild>
              <Link href={item.href}>
                <Button
                  variant="ghost"
                  size="lg"
                  className={cn(
                    "w-full justify-start items-center px-4 py-2",
                    location === item.href
                      ? "bg-primary text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  )}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.icon}
                  <span className="ml-3">{item.title}</span>
                </Button>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">{item.title}</TooltipContent>
          </Tooltip>
        ))}
      </div>
      
      <div className="absolute bottom-4 left-0 right-0 px-4">
        <Button
          variant="ghost"
          size="lg"
          className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
          onClick={() => {
            logout();
            setMobileOpen(false);
          }}
        >
          <LogOut className="h-5 w-5" />
          <span className="ml-3">Logout</span>
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleMobileMenu}
          className="bg-primary text-white border-none hover:bg-primary-dark"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={cn(
          "fixed inset-0 z-40 md:hidden bg-black/50 transition-opacity",
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMobileOpen(false)}
      >
        <div
          className={cn(
            "fixed inset-y-0 left-0 w-64 bg-slate-900 transition-transform z-50",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          <ScrollArea className="h-full">
            {sidebarContent}
          </ScrollArea>
        </div>
      </div>

      {/* Desktop Sidebar */}
      <div
        className={cn(
          "hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-slate-900",
          className
        )}
      >
        <ScrollArea className="h-full">
          {sidebarContent}
        </ScrollArea>
      </div>
    </>
  );
}
