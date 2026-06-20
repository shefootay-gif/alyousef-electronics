import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from "@/providers/trpc";
import { toast } from "sonner";
import { useLanguage } from "@/hooks/useLanguage";

function getOAuthUrl() {
  const kimiAuthUrl = import.meta.env.VITE_KIMI_AUTH_URL;
  const appID = import.meta.env.VITE_APP_ID;
  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  const url = new URL(`${kimiAuthUrl}/api/oauth/authorize`);
  url.searchParams.set("client_id", appID);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "profile");
  url.searchParams.set("state", state);

  return url.toString();
}

export default function Login() {
  const { t, isRTL } = useLanguage();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => {
      toast.success("Login successful");
      window.location.href = "/";
    },
    onError: (err) => toast.error(err.message),
  });

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: () => {
      toast.success("Registration successful");
      window.location.href = "/";
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      loginMutation.mutate({ email, password });
    } else {
      registerMutation.mutate({ name, email, password });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8FAFC]">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-2xl font-bold text-[#1A2A44]">
            {isLogin ? t("welcomeBack") : t("createAccount")}
          </CardTitle>
          <CardDescription>
            {isLogin ? t("signInAccount") : t("signUpStart")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 mb-6">
            {!isLogin && (
              <div className={isRTL ? "text-right" : "text-left"}>
                <label className="block text-sm font-medium text-[#1A2A44] mb-1">{t("nameTitle")}</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" 
                  required 
                />
              </div>
            )}
            <div className={isRTL ? "text-right" : "text-left"}>
              <label className="block text-sm font-medium text-[#1A2A44] mb-1">{t("email")}</label>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" 
                required 
              />
            </div>
            <div className={isRTL ? "text-right" : "text-left"}>
              <label className="block text-sm font-medium text-[#1A2A44] mb-1">{t("password")}</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full px-4 py-2.5 rounded-xl border border-[#E2E8F0] focus:outline-none focus:ring-2 focus:ring-[#D4AF37]" 
                required 
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-[#1A2A44] hover:bg-[#00D4FF] text-white py-6 rounded-xl text-md font-semibold transition-all"
              disabled={loginMutation.isPending || registerMutation.isPending}
            >
              {isLogin ? t("signIn") : t("signUp")}
            </Button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[#E2E8F0]" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-[#94A3B8]">{t("orContinueWith")}</span>
            </div>
          </div>

          <div className="mt-6 text-center">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => toast.error("تسجيل الدخول عبر Google يتطلب إعداد مفاتيح API أولاً")}
            >
              الدخول عبر Google
            </Button>
          </div>

          <p className="text-center text-sm text-[#64748B] flex items-center justify-center gap-1 flex-row-reverse mt-6">
            <button 
              type="button" 
              onClick={() => setIsLogin(!isLogin)} 
              className="text-[#D4AF37] font-semibold hover:underline"
            >
              {isLogin ? t("signUp") : t("signIn")}
            </button>
            <span>{isLogin ? t("noAccount") : t("hasAccount")}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
