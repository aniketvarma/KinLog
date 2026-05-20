import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Trash2,
  Bell,
  Heart,
  Droplets,
  Pill,
  Plus,
  ClipboardPlus,
  CalendarClock,
  PackageOpen,
  UserRound,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL;

function getGreeting() {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return "Good morning";
  if (h >= 12 && h < 17) return "Good afternoon";
  if (h >= 17 && h < 21) return "Good evening";
  return "Good night";
}

function getRelativeDay(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const toDateStr = (dt: Date) =>
    `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
  const todayStr = toDateStr(now);
  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = toDateStr(tomorrowDate);
  const rDateStr = toDateStr(d);

  if (rDateStr === todayStr) return "Today";
  if (rDateStr === tomorrowStr) return "Tomorrow";
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}

function getBpStatusColor(sys: number, dia: number) {
  if (sys >= 140 || dia >= 90) return "text-red-600 dark:text-red-400";
  if (sys > 120 || dia > 80) return "text-yellow-600 dark:text-yellow-400";
  return "text-green-600 dark:text-green-400";
}

function getGlucoseStatusColor(val: number) {
  if (val >= 126) return "text-red-600 dark:text-red-400";
  if (val >= 100) return "text-yellow-600 dark:text-yellow-400";
  return "text-green-600 dark:text-green-400";
}

export default function Home() {
  const [medicineList, setMedicineList] = useState<any[]>([]);
  const [newMedicine, setNewMedicine] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reminders, setReminders] = useState<any[]>([]);
  const [userName, setUserName] = useState("");
  const [latestBp, setLatestBp] = useState<any>(null);
  const [latestGlucose, setLatestGlucose] = useState<any>(null);
  const token = localStorage.getItem("token")!;

  useEffect(() => {
    async function fetchAll() {
      // Profile
      try {
        const profileRes = await fetch(`${API}/api/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (profileRes.ok) {
          const { profile } = await profileRes.json();
          if (profile.name) setUserName(profile.name.split(" ")[0]);
        }
      } catch {}

      // Medicines
      try {
        const medRes = await fetch(`${API}/api/medicines`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (medRes.ok) {
          const data = await medRes.json();
          setMedicineList(data.medicines);
        } else if (medRes.status === 401) {
          toast.error("Unauthorized. Please log in again.");
        }
      } catch {}

      // Reminders
      try {
        const remRes = await fetch(`${API}/api/reminders`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (remRes.ok) {
          const data = await remRes.json();
          const now = new Date();
          const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
          const upcoming = data.reminders.filter((r: any) => {
            const d = new Date(r.date);
            const rDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
            return rDate >= today;
          });
          setReminders(upcoming.slice(0, 5));
        }
      } catch {}

      // Latest BP
      try {
        const bpRes = await fetch(`${API}/api/bp-readings`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (bpRes.ok) {
          const data = await bpRes.json();
          if (data.readings?.length > 0) {
            setLatestBp(data.readings[data.readings.length - 1]);
          }
        }
      } catch {}

      // Latest Glucose
      try {
        const gRes = await fetch(`${API}/api/glucose-readings`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (gRes.ok) {
          const data = await gRes.json();
          if (data.readings?.length > 0) {
            setLatestGlucose(data.readings[data.readings.length - 1]);
          }
        }
      } catch {}
    }

    fetchAll();
  }, []);

  async function handleAddMedicine(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!newMedicine) return;

    const response = await fetch(`${API}/api/medicines`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ medicine: newMedicine }),
    });

    if (response.ok) {
      setMedicineList([...medicineList, { medicine: newMedicine }]);
      setNewMedicine("");
      setDialogOpen(false);
    } else if (response.status === 401) {
      toast.error("Unauthorized. Please log in again.");
    } else if (response.status === 400) {
      toast.error("Invalid medicine input.");
    } else if (response.status === 500) {
      toast.error("Server error. Please try again later.");
    }
  }

  async function handleDeleteMedicine(id: number) {
    const response = await fetch(`${API}/api/medicines/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      setMedicineList(medicineList.filter((medicine) => medicine.id !== id));
    }
  }

  return (
    <div className="flex flex-col gap-6 max-w-xl mx-auto pb-4">
      {/* Greeting and Profile */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {getGreeting()}{userName ? `, ${userName}` : ""} 👋
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Here's your health snapshot.</p>
        </div>
        <Link
          to="/dashboard/settings"
          className="rounded-full w-10 h-10 bg-primary/10 text-primary flex items-center justify-center shrink-0"
        >
          <UserRound className="w-5 h-5" />
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="shadow-none border-border">
          <CardContent className="py-4 px-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                <Heart className="w-4 h-4 text-red-600 dark:text-red-400" />
              </div>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Blood Pressure</p>
            </div>
            {latestBp ? (
              <>
                <p className={`text-2xl font-bold ${getBpStatusColor(latestBp.systolic, latestBp.diastolic)}`}>
                  {latestBp.systolic}/{latestBp.diastolic}
                  <span className="text-xs font-normal text-muted-foreground ml-1">mmHg</span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {getRelativeDay(latestBp.created_at)} · {new Date(latestBp.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </>
            ) : (
              <p className="text-2xl font-bold text-muted-foreground">--/--</p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none border-border">
          <CardContent className="py-4 px-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
                <Droplets className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wider">Glucose</p>
            </div>
            {latestGlucose ? (
              <>
                <p className={`text-2xl font-bold ${getGlucoseStatusColor(latestGlucose.reading)}`}>
                  {latestGlucose.reading}
                  <span className="text-xs font-normal text-muted-foreground ml-1">mg/dL</span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {getRelativeDay(latestGlucose.created_at)} · {new Date(latestGlucose.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </>
            ) : (
              <p className="text-2xl font-bold text-muted-foreground">--</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Action */}
      <Link to="/dashboard/log">
        <Button variant="default" size="lg" className="w-full h-12 text-base font-semibold gap-2">
          <ClipboardPlus className="w-5 h-5" />
          Log a New Reading
        </Button>
      </Link>

      {/* Medicines */}
      <Card className="shadow-none border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Pill className="w-4 h-4 text-muted-foreground" />
            Current Medicines
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 gap-1 text-xs font-semibold">
                <Plus className="w-3.5 h-3.5" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Medicine</DialogTitle>
              </DialogHeader>
              <form
                className="flex flex-col gap-4"
                onSubmit={handleAddMedicine}
              >
                <div className="flex flex-col gap-2">
                  <Label htmlFor="medicine">
                    Medicine (name, dose, frequency)
                  </Label>
                  <Input
                    id="medicine"
                    placeholder="e.g. Paracetamol 500mg 2x daily"
                    value={newMedicine}
                    onChange={(e) => setNewMedicine(e.target.value)}
                  />
                </div>
                <Button type="submit">Save</Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {medicineList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2 text-muted-foreground">
              <PackageOpen className="w-8 h-8 opacity-50" />
              <p className="text-sm">No medicines added yet.</p>
            </div>
          ) : (
            <ul className="space-y-1">
              {medicineList.map((med) => (
                <li
                  key={med.id}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Pill className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm font-medium">{med.medicine}</span>
                  </div>
                  <button
                    onClick={() => handleDeleteMedicine(med.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Upcoming Reminders */}
      <Card className="shadow-none border-border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="w-4 h-4 text-muted-foreground" />
            Upcoming Reminders
          </CardTitle>
        </CardHeader>
        <CardContent>
          {reminders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2 text-muted-foreground">
              <CalendarClock className="w-8 h-8 opacity-50" />
              <p className="text-sm">No upcoming reminders.</p>
            </div>
          ) : (
            <ul className="space-y-1">
              {reminders.map((r) => (
                <li
                  key={r.id}
                  className="flex items-center justify-between py-2.5 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center shrink-0">
                      <Bell className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{r.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {getRelativeDay(r.date)} at {r.time}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
