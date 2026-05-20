import { toast } from "sonner";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle2 } from "lucide-react";

const API = import.meta.env.VITE_API_URL;

function getStatusForValue(value: string, type: "systolic" | "diastolic") {
  const num = Number(value);
  if (!value || isNaN(num) || num <= 0) return null;

  if (type === "systolic") {
    if (num < 90) return { text: "Low", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" };
    if (num >= 140) return { text: "High", color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" };
    if (num > 120) return { text: "Elevated", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400" };
    return { text: "Normal", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" };
  } else {
    if (num < 60) return { text: "Low", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" };
    if (num >= 90) return { text: "High", color: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" };
    if (num > 80) return { text: "Elevated", color: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400" };
    return { text: "Normal", color: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400" };
  }
}

export default function BloodPressureForm() {
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [pulse, setPulse] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const sysStatus = getStatusForValue(systolic, "systolic");
  const diaStatus = getStatusForValue(diastolic, "diastolic");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (systolic === "" || diastolic === "") {
      toast.warning("Please fill blood pressure values.");
      return;
    }

    const payload: { systolic: number; diastolic: number; pulse?: number } = {
      systolic: Number(systolic),
      diastolic: Number(diastolic),
    };
    if (pulse) payload.pulse = Number(pulse);

    setIsSaving(true);
    try {
      const response = await fetch(`${API}/api/bp-readings`, {
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
          setSystolic("");
          setDiastolic("");
          setPulse("");
          toast.success("Blood pressure reading logged!");
        }, 1500);
      } else if (response.status === 401) {
        toast.error("Unauthorized. Please log in");
      } else if (response.status === 400) {
        toast.error("Invalid input. Please check your values.");
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
          <p className="text-sm text-muted-foreground">{systolic}/{diastolic} mmHg</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-none border-border">
      <CardContent className="pt-6">
        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <Label htmlFor="systolic" className="text-sm font-semibold">Systolic (mmHg)</Label>
            <Input
              id="systolic"
              type="number"
              inputMode="numeric"
              placeholder="e.g. 120"
              value={systolic}
              onChange={(e) => setSystolic(e.target.value)}
              className="text-lg h-12"
            />
            {sysStatus && (
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full w-fit ${sysStatus.color} animate-in fade-in duration-200`}>
                {sysStatus.text}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="diastolic" className="text-sm font-semibold">Diastolic (mmHg)</Label>
            <Input
              id="diastolic"
              type="number"
              inputMode="numeric"
              placeholder="e.g. 80"
              value={diastolic}
              onChange={(e) => setDiastolic(e.target.value)}
              className="text-lg h-12"
            />
            {diaStatus && (
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full w-fit ${diaStatus.color} animate-in fade-in duration-200`}>
                {diaStatus.text}
              </span>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="pulse" className="text-sm font-semibold">
              Pulse (bpm) <span className="text-muted-foreground font-normal">— optional</span>
            </Label>
            <Input
              id="pulse"
              type="number"
              inputMode="numeric"
              placeholder="e.g. 72"
              value={pulse}
              onChange={(e) => setPulse(e.target.value)}
              className="text-lg h-12"
            />
          </div>

          <Button type="submit" disabled={isSaving} size="lg" className="mt-2 h-12 text-base font-semibold">
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : "Save Reading"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
