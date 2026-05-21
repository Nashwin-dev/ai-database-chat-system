import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Database, 
  History, 
  LayoutDashboard, 
  Settings, 
  ShieldCheck, 
  Zap,
  ChevronRight 
} from "lucide-react";

interface SidebarProps {
  onQuerySelect?: (query: string) => void;
  className?: string;
}

const suggestedQueries = [
  "Find users with duplicate emails",
  "Show system error logs from last 24h",
  "List top 10 most active users",
  "Check database connection latency",
  "Identify slow running queries"
];

const Sidebar = ({ onQuerySelect, className }: SidebarProps) => {
  return (
    <div className={cn("pb-12 w-64 border-r border-border-subtle bg-sidebar-background h-full hidden md:block", className)}>
      <div className="space-y-4 py-4">
        
        {/* Main Navigation */}
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">
            Platform
          </h2>
          <div className="space-y-1">
            <Button variant="ghost" className="w-full justify-start hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group">
              <LayoutDashboard className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              Dashboard
            </Button>
            <Button variant="ghost" className="w-full justify-start hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group">
              <Database className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
              Data Explorer
            </Button>
            <Button variant="ghost" className="w-full justify-start hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group">
              <ShieldCheck className="mr-2 h-4 w-4 text-muted-foreground group-hover:text-green-500 transition-colors" />
              Security Audit
            </Button>
          </div>
        </div>

        {/* Quick Actions (The "Brain") */}
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground/50 flex items-center justify-between">
            <span>Quick Analysis</span>
            <Zap className="h-3 w-3 text-yellow-500" />
          </h2>
          <ScrollArea className="h-[300px] px-1">
            <div className="space-y-1 p-2">
              {suggestedQueries.map((query, i) => (
                <button
                  key={i}
                  onClick={() => onQuerySelect?.(query)}
                  className="group flex w-full flex-col gap-1 rounded-md border border-transparent p-2 text-left text-sm transition-all hover:bg-sidebar-accent hover:border-border-subtle hover:shadow-sm active:scale-95"
                >
                  <span className="font-medium text-sidebar-foreground group-hover:text-primary transition-colors line-clamp-1">
                    {query}
                  </span>
                  <span className="text-[10px] text-muted-foreground flex items-center">
                    Execute Query <ChevronRight className="h-2 w-2 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </span>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Footer Settings */}
        <div className="px-3 py-2 mt-auto">
           <Button variant="ghost" className="w-full justify-start text-muted-foreground">
              <Settings className="mr-2 h-4 w-4" />
              Configuration
            </Button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;