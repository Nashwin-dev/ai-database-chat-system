import { Terminal, Database, Sparkles } from "lucide-react";

const EmptyState = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8 text-center animate-in fade-in-50 duration-500">
      <div className="relative mb-6">
        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-border-subtle bg-card/50 shadow-2xl backdrop-blur-sm">
          <Database className="h-10 w-10 text-primary" />
        </div>
        <div className="absolute -right-2 -bottom-2 flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-accent-foreground shadow-lg">
          <Sparkles className="h-4 w-4" />
        </div>
      </div>
      
      <h3 className="mb-2 text-2xl font-bold tracking-tight text-foreground">
        QueryNest <span className="text-primary">Database AI</span>
      </h3>
      <p className="mb-8 max-w-md text-muted-foreground">
        Connect to your MongoDB or SQL database and ask questions in plain English. I'll translate them into optimized queries.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg w-full">
        {[
          { icon: Terminal, label: "Generate SQL Queries", desc: "Convert text to complex SQL" },
          { icon: Database, label: "Analyze Schemas", desc: "Understand table relationships" },
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 rounded-xl border border-border-subtle bg-card/30 p-4 transition-all hover:bg-card/50 hover:border-primary/20">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sidebar-accent">
              <item.icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="text-left">
              <div className="text-sm font-medium text-foreground">{item.label}</div>
              <div className="text-xs text-muted-foreground">{item.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmptyState;