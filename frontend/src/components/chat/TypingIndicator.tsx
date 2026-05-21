const TypingIndicator = () => {
  return (
    <div className="flex w-fit items-center gap-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
      <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg border border-border-subtle bg-sidebar-accent shadow-sm">
        <div className="h-4 w-4 rounded-full bg-primary/20 animate-pulse" />
      </div>
      <div className="glass-card flex items-center gap-1 rounded-2xl px-4 py-3 shadow-sm">
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary/60" />
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary/60 [animation-delay:0.2s]" />
        <span className="typing-dot h-1.5 w-1.5 rounded-full bg-primary/60 [animation-delay:0.4s]" />
      </div>
    </div>
  );
};

export default TypingIndicator;