import { Check, Copy, Database, Terminal, User, FileDown } from "lucide-react";
import { toast } from "sonner";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { exportToCSV } from "@/lib/utils";

// --- Utility Function ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  tableData?: any[];
  executionTime?: string;
  confidence?: number;
  verified?: boolean;
}

interface MessageBubbleProps {
  message: Message;
}

const MessageBubble = ({ message }: MessageBubbleProps) => {
  const isUser = message.role === "user";

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(message.tableData, null, 2));
    toast.success("Data copied to clipboard");
  };

  const handleExport = () => {
  console.log("Export button clicked. Data:", message.tableData); // Check your console for this!
  if (message.tableData && message.tableData.length > 0) {
    const timestamp = new Date().getTime();
    exportToCSV(message.tableData, `query_results_${timestamp}`);
    toast.success("CSV download started");
  } else {
    toast.error("No data available to export");
  }
};

  return (
    <div className={cn("flex w-full gap-4 animate-in fade-in-0 slide-in-from-bottom-2 duration-500", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg border border-white/10 bg-black/20 shadow-sm">
          <Database className="h-4 w-4 text-cyan-400 animate-pulse" />
        </div>
      )}

      <div className={cn("flex max-w-[85%] flex-col gap-2", isUser && "items-end")}>
        {/* TEXT BUBBLE */}
        <div className={cn("relative rounded-2xl px-5 py-3 text-sm shadow-sm transition-all", isUser ? "bg-[#7c3aed] text-white rounded-tr-sm" : "bg-[#161b22] border border-[#30363d] text-gray-100 rounded-tl-sm hover:border-[#7c3aed]/30")}>
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>

        {/* DATA TABLE SECTION */}
        {!isUser && message.tableData && message.tableData.length > 0 && (
          <div className="w-full overflow-hidden rounded-xl border border-[#30363d] bg-[#161b22]/50 shadow-lg mt-1 backdrop-blur-sm">
            {/* Header Metadata */}
            <div className="flex items-center justify-between border-b border-white/5 bg-black/20 px-4 py-2">
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-[#7c3aed]/10 text-[#7c3aed] border border-[#7c3aed]/20">
                  <Terminal className="h-3 w-3" /> Result Set
                </span>
                {message.executionTime && <span className="text-[10px] font-mono text-gray-500">{message.executionTime}</span>}
              </div>
              <div className="flex items-center gap-2">
                {message.verified && (
                  <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-green-500/10 text-green-500 border border-green-500/20">
                    <Check className="h-3 w-3" /> Verified
                  </span>
                )}
                <button onClick={handleCopy} className="p-1 rounded hover:bg-white/10 text-gray-400 transition-colors">
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            </div>

            {/* Table Area */}
            <div className="max-h-[350px] overflow-auto">
              <table className="w-full text-left text-[11px]">
                <thead className="sticky top-0 bg-[#161b22] z-10 border-b border-white/5">
                  <tr>
                    {Object.keys(message.tableData[0]).map((key) => (
                      <th key={key} className="px-4 py-2.5 font-bold uppercase tracking-wider text-gray-500 whitespace-nowrap">{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {message.tableData.map((row, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors group">
                      {Object.values(row).map((val: any, j) => (
                        <td key={j} className="px-4 py-2 font-mono text-gray-400 group-hover:text-gray-200">
                          {typeof val === "object" ? JSON.stringify(val).slice(0, 20) + "..." : String(val)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Action Footer */}
            <div className="bg-black/30 border-t border-white/5 px-4 py-2 flex justify-between items-center">
              <span className="text-[10px] text-gray-600 uppercase tracking-widest font-medium">ReadOnly Connection</span>
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-gray-500">{message.tableData.length} rows</span>
                <button 
                  onClick={handleExport}
                  className="flex items-center gap-1.5 text-[10px] text-cyan-400 hover:text-cyan-300 transition-colors uppercase font-bold tracking-tight"
                >
                  <FileDown className="h-3 w-3" /> Export CSV
                </button>
              </div>
            </div>
          </div>
        )}

        <span className="text-[10px] text-gray-600 px-1 select-none">
          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      {isUser && (
        <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-lg bg-[#7c3aed] text-white shadow-md">
          <User className="h-4 w-4" />
        </div>
      )}
    </div>
  );
};

export default MessageBubble;