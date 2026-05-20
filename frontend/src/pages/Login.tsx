import { useState } from "react";
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
        <div className="flex justify-center mb-2">
          <img src="/favicon.png" alt="KinLog" width={64} height={64} />
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
                onClick={() => setEmail("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground bg-foreground/10 rounded-full p-1 transition-colors"
                aria-label="Clear email"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            )}
          </div>

          <Button
            className="w-full h-14 text-[17px] rounded-xl font-bold bg-foreground text-background hover:bg-foreground/90 transition-transform active:scale-[0.98] shadow-none"
            onClick={handleSendCode}
            disabled={isSending || !email}
          >
            {isSending ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              "Continue"
            )}
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
