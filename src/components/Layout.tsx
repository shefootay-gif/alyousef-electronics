import Navbar from "./Navbar";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import FloatingWhatsApp from "./FloatingWhatsApp";
import PromoBar from "./PromoBar";
import { Toaster } from "sonner";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <PromoBar />
      <Navbar />
      <CartDrawer />
      <FloatingWhatsApp />
      <main>{children}</main>
      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1A2A44",
            color: "#F8FAFC",
            border: "1px solid rgba(212, 175, 55, 0.3)",
          },
        }}
      />
    </div>
  );
}
