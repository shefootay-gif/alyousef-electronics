import { trpc } from "@/providers/trpc";
import { MessageCircle } from "lucide-react";

export default function FloatingWhatsApp() {
  const { data: contactLinks } = trpc.settings.getContactLinks.useQuery();

  if (!contactLinks?.whatsapp) return null;

  return (
    <a
      href={`https://wa.me/${contactLinks.whatsapp}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] text-white rounded-full shadow-[0_4px_14px_rgba(37,211,102,0.4)] hover:bg-[#20bd5a] hover:scale-110 hover:shadow-[0_6px_20px_rgba(37,211,102,0.6)] transition-all duration-300 animate-bounce"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-8 h-8" />
    </a>
  );
}
