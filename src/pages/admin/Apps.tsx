import { useState } from "react";
import { trpc } from "@/providers/trpc";
import { useLanguage } from "@/hooks/useLanguage";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Link, Key, Copy, Plus, Trash2 } from "lucide-react";

export default function AppsIntegrations() {
  const { t, isRTL } = useLanguage();
  
  // This would normally fetch from trpc.settings.apiKeys
  // Let's stub it for now
  const [keys, setKeys] = useState([
    { id: 1, name: "Zendrop Integration", key: "sk_live_123456789", provider: "Zendrop", isActive: true },
  ]);

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    toast.success("API Key copied to clipboard");
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-100">Apps & Integrations</h2>
          <p className="text-[#94A3B8] text-sm mt-1">Manage API keys for dropshipping and external platforms</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#B8960F] transition-colors">
          <Plus className="w-4 h-4" />
          <span>Generate New Key</span>
        </button>
      </div>

      <div className="bg-[#0F172A] border border-white/10 rounded-xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-6 py-4 text-sm font-medium text-slate-100">Name</th>
              <th className="px-6 py-4 text-sm font-medium text-slate-100">Provider</th>
              <th className="px-6 py-4 text-sm font-medium text-slate-100">API Key</th>
              <th className="px-6 py-4 text-sm font-medium text-slate-100">Status</th>
              <th className="px-6 py-4 text-sm font-medium text-slate-100 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {keys.map((k) => (
              <tr key={k.id} className="hover:bg-white/5 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-300 font-medium">{k.name}</td>
                <td className="px-6 py-4 text-sm text-slate-300">{k.provider}</td>
                <td className="px-6 py-4 text-sm">
                  <div className="flex items-center gap-2 bg-black/30 px-3 py-1.5 rounded border border-white/10 w-fit">
                    <span className="font-mono text-[#D4AF37]">{k.key.substring(0, 8)}...</span>
                    <button onClick={() => handleCopy(k.key)} className="text-[#94A3B8] hover:text-white transition-colors">
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                    Active
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-red-400 hover:text-red-300 transition-colors p-2 hover:bg-red-500/10 rounded-lg">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
