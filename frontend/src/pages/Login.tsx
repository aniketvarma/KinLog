import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

export default function Login() {
  const navigate = useNavigate();

  // TODO: Anike — add useState for `email` (string) and `isSending` (boolean)
  const [email, setEmail] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);

  async function handleGoogle(credentialResponse: any) {
    const res = await fetch(`${API}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: credentialResponse.credential }),
    });

    if (res.ok) {
      const data = await res.json();
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } else {
      toast.error("Google Login failed");
    }
  }

  async function handleSendCode() {
    setIsSending(true);
    try {
      const response = await fetch(`${API}/api/auth/request-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      });

      if (response.ok) {
        sessionStorage.setItem("otp-email", email);
        navigate("/verify-otp");
        return;
      }

      const body = await response.json();

      if (response.status === 429) {
        toast.error(body.error);
      } else if (response.status === 400) {
        const msg =
          typeof body.error === "string"
            ? body.error
            : "Please enter a valid email address.";
        toast.error(msg);
      } else {
        toast.error("something went wrong");
      }
    } catch (e) {
      toast.error(
        "Couldn't reach the server. Check your connection and try again.",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col items-center pt-[10dvh] bg-background px-4 pb-6 w-full">
      <div className="w-full max-w-[280px] flex flex-col gap-6 mx-auto">
        {/* LOGO BLOB */}
        <div className="flex justify-center mb-2">
          <svg width="64" height="64" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path fill="currentColor" className="text-foreground" d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.3,-46.3C90.8,-33.5,96.8,-18.1,97.2,-2.5C97.7,13.1,92.5,28.8,83.4,42.4C74.3,55.9,61.2,67.3,46.6,74.5C32,81.7,16,84.7,0.7,83.4C-14.5,82.1,-29.1,76.5,-42.6,68.7C-56.2,60.9,-68.8,50.8,-77.3,37.9C-85.9,25,-90.4,9.3,-89.6,-6.1C-88.8,-21.4,-82.7,-36.4,-72.9,-48.5C-63,-60.7,-49.4,-70,-35.1,-76.7C-20.8,-83.4,-5.8,-87.5,9.1,-89.3C24,-91.1,30.6,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
          </svg>
        </div>

        <h1 className="text-3xl font-extrabold text-center text-foreground tracking-tight mb-2">
          Log in or sign up
        </h1>

        <div className="flex flex-col gap-4">
          <div className="relative w-full">
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-muted border-0 h-14 text-base px-4 rounded-xl w-full pr-12 focus-visible:ring-2 focus-visible:ring-foreground/20 shadow-none"
            />
            {email && (
              <button
                onClick={() => setEmail('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground bg-foreground/10 rounded-full p-1 transition-colors"
                aria-label="Clear email"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
              </button>
            )}
          </div>

          <Button
            className="w-full h-14 text-[17px] rounded-xl font-bold bg-foreground text-background hover:bg-foreground/90 transition-transform active:scale-[0.98] shadow-none"
            onClick={handleSendCode}
            disabled={isSending || !email}
          >
            {isSending ? <Loader2 className="w-6 h-6 animate-spin" /> : "Continue"}
          </Button>

          <div className="flex items-center gap-4 my-2 text-[15px] text-muted-foreground">
            <div className="flex-1 h-px bg-border" />
            <span>or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <div className="flex justify-center w-full overflow-hidden rounded-xl">
            <GoogleLogin
              onSuccess={handleGoogle}
              onError={() => toast.error("Google login failed")}
              text="continue_with"
              theme="outline"
              size="large"
              shape="rectangular"
              width="280"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
