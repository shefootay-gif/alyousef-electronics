import Navbar from "./Navbar";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import FloatingWhatsApp from "./FloatingWhatsApp";
import PromoBar from "./PromoBar";
import { Toaster } from "sonner";

import { motion } from "framer-motion";

import { useEffect } from "react";
import Lenis from "lenis";

export default function Layout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const lenis = new Lenis({
      autoRaf: true,
    });
    return () => lenis.destroy();
  }, []);

  return (
    <div className="min-h-screen bg-[#F1F5F9]">
      <PromoBar />
      <Navbar />
      <CartDrawer />
      <FloatingWhatsApp />
      <motion.main
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {children}
      </motion.main>
      <Footer />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#171717",
            color: "#F8FAFC",
            border: "1px solid rgba(212, 175, 55, 0.3)",
          },
        }}
      />
    </div>
  );
}
