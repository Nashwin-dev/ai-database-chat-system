import { Bell, Search, Wifi } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const Navbar = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border-subtle bg-background/80 backdrop-blur-md">
      <div className="flex h-16 items-center px-6 gap-4">
        {/* Logo Area */}
        <div className="flex items-center gap-2 mr-4 md:mr-8">
          <div className="h-8 w-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center shadow-glow">
            <span className="font-bold text-white">Q</span>
          </div>
          <span className="text-lg font-bold tracking-tight hidden md:inline-block">QueryNest</span>
        </div>

        {/* Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search documentation or past queries..." 
            className="pl-9 bg-secondary/50 border-transparent focus:bg-background focus:border-primary/50 transition-all"
          />
        </div>

        <div className="flex-1 md:flex-none" />

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Connection Status */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
            <div className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </div>
            <span className="text-xs font-medium text-green-500">Cluster Active</span>
          </div>

          <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
            <Bell className="h-5 w-5" />
            <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full border-2 border-background" />
          </Button>
          
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-white/10 shadow-lg cursor-pointer hover:scale-105 transition-transform" />
        </div>
      </div>
    </header>
  );
};

export default Navbar;