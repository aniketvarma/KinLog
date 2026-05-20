import { toast } from "sonner";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

function getGlucoseStatus(value: string, type: "fasting" | "post_meal") {
  const num = Number(value);
  if (!value || isNaN(num) || num <= 0) return null;

  if (type === "fasting") {
    if (num < 70) return { text: "Low", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" };
    if (num >= 126) return { text: "Diabetic Range", color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" };
    if (num >= 100) return { text: "Pre-diabetic", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400" };
    return { text: "Normal", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" };
  } else {
    if (num < 70) return { text: "Low", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" };
    if (num >= 200) return { text: "Diabetic Range", color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" };
    if (num >= 140) return { text: "Pre-diabetic", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400" };
    return { text: "Normal", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" };
  }
}

export default function GlucoseForm() {
  const [reading, setReading] = useState("");
  const [type, setType] = useState<"fasting" | "post_meal">("fasting");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const status = getGlucoseStatus(reading, type);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (reading === "") {
      toast.warning("Please enter a glucose reading.");
      return;
    }

    const payload = { reading: Number(reading), type: type };

    setIsSaving(true);
    try {
      const response = await fetch(`${API}/api/glucose-readings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          setReading("");
          toast.success("Glucose reading saved!");
        }, 1500);
      } else if (response.status === 401) {
        toast.error("Unauthorized. Please log in again.");
      } else if (response.status === 400) {
        toast.error("Invalid glucose reading.");
      } else if (response.status === 500) {
        toast.error("Server error. Please try again later.");
      }
    } finally {
      setIsSaving(false);
    }
  }

  if (showSuccess) {
    return (
      <Card className="shadow-none border-border">
        <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-in zoom-in duration-300">
            <CheckCircle2 className="w-9 h-9 text-green-600 dark:text-green-400" />
          </div>
          <p className="text-lg font-semibold text-foreground">Reading Saved!</p>
          <p className="text-sm text-muted-foreground">{reading} mg/dL ({type === "fasting" ? "Fasting" : "Post-Meal"})</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-none border-border">
      <CardContent className="pt-6">
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-3">
            <Label className="text-sm font-semibold">Reading Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <Button
                type="button"
                variant={type === "fasting" ? "default" : "outline"}
                onClick={() => setType("fasting")}
                className="h-11 text-sm font-semibold"
              >
                Fasting
              </Button>
              <Button
                type="button"
                variant={type === "post_meal" ? "default" : "outline"}
                onClick={() => setType("post_meal")}
                className="h-11 text-sm font-semibold"
              >
                Post-Meal
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="reading" className="text-sm font-semibold">Glucose Level (mg/dL)</Label>
            <Input
              id="reading"
              type="number"
              inputMode="numeric"
              placeholder={type === "fasting" ? "e.g. 95" : "e.g. 130"}
              value={reading}
              onChange={(e) => setReading(e.target.value)}
              className="text-lg h-12"
            />
            {status && (
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full w-fit ${status.color} animate-in fade-in duration-200`}>
                {status.text}
              </span>
            )}
          </div>

          <Button type="submit" disabled={isSaving} size="lg" className="mt-2 h-12 text-base font-semibold">
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Reading"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
