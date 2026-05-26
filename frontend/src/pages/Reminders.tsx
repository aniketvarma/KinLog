import { Calendar } from "@/components/ui/calendar";
import { useEffect, useState, useRef, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Sun, Moon, Clock, Bell, BellRing, BellOff } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const API = import.meta.env.VITE_API_URL;

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

/* ─── Analog Clock Face Component ─── */
function ClockFace({
  mode,
  hour,
  minute,
  onHourChange,
  onMinuteChange,
  onModeChange,
}: {
  mode: "hour" | "minute";
  hour: number;
  minute: number;
  onHourChange: (h: number) => void;
  onMinuteChange: (m: number) => void;
  onModeChange: (m: "hour" | "minute") => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const SIZE = 220;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R = 85; // radius for number placement

  const getAngleFromEvent = useCallback(
    (clientX: number, clientY: number) => {
      const svg = svgRef.current;
      if (!svg) return 0;
      const rect = svg.getBoundingClientRect();
      const x = clientX - rect.left - CX;
      const y = clientY - rect.top - CY;
      let angle = Math.atan2(x, -y) * (180 / Math.PI);
      if (angle < 0) angle += 360;
      return angle;
    },
    [CX, CY]
  );

  const handlePointer = useCallback(
    (clientX: number, clientY: number) => {
      const angle = getAngleFromEvent(clientX, clientY);
      if (mode === "hour") {
        let h = Math.round(angle / 30);
        if (h === 0) h = 12;
        onHourChange(h);
      } else {
        let m = Math.round(angle / 6);
        if (m === 60) m = 0;
        onMinuteChange(m);
      }
    },
    [mode, getAngleFromEvent, onHourChange, onMinuteChange]
  );

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as Element).setPointerCapture(e.pointerId);
    handlePointer(e.clientX, e.clientY);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    handlePointer(e.clientX, e.clientY);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    dragging.current = false;
    (e.target as Element).releasePointerCapture(e.pointerId);
    if (mode === "hour") onModeChange("minute");
  };

  // hand angle
  const handAngle =
    mode === "hour" ? ((hour % 12) / 12) * 360 : (minute / 60) * 360;
  const handLength = mode === "hour" ? 55 : 70;
  const handRad = (handAngle - 90) * (Math.PI / 180);
  const hx = CX + handLength * Math.cos(handRad);
  const hy = CY + handLength * Math.sin(handRad);

  // numbers around the face
  const numbers =
    mode === "hour"
      ? Array.from({ length: 12 }, (_, i) => i + 1)
      : [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="w-full max-w-[220px] mx-auto touch-none select-none"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
    >
      {/* outer ring */}
      <circle cx={CX} cy={CY} r={R + 15} className="fill-none stroke-border" strokeWidth="1" />
      {/* background */}
      <circle cx={CX} cy={CY} r={R + 14} className="fill-muted/30" />
      {/* center dot */}
      <circle cx={CX} cy={CY} r={4} className="fill-primary" />
      {/* hand line */}
      <line
        x1={CX}
        y1={CY}
        x2={hx}
        y2={hy}
        className="stroke-primary"
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* hand tip circle */}
      <circle cx={hx} cy={hy} r={18} className="fill-primary/15 stroke-primary" strokeWidth={1.5} />

      {/* numbers */}
      {numbers.map((n, i) => {
        const total = numbers.length;
        const angleDeg = (i / total) * 360 - 90;
        const rad = angleDeg * (Math.PI / 180);
        const nx = CX + R * Math.cos(rad);
        const ny = CY + R * Math.sin(rad);
        const isActive =
          mode === "hour" ? hour === n : minute === n;
        return (
          <text
            key={n}
            x={nx}
            y={ny}
            textAnchor="middle"
            dominantBaseline="central"
            className={`pointer-events-none ${isActive ? "fill-primary" : "fill-foreground"}`}
            fontSize={isActive ? 15 : 13}
            fontWeight={isActive ? 700 : 400}
          >
            {mode === "minute" ? String(n).padStart(2, "0") : n}
          </text>
        );
      })}
    </svg>
  );
}

export default function Reminders() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const [hour, setHour] = useState(8);
  const [minute, setMinute] = useState(0);
  const [ampm, setAmpm] = useState<"AM" | "PM">("AM");
  const [clockMode, setClockMode] = useState<"hour" | "minute">("hour");
  const [message, setMessage] = useState("");
  const [reminders, setReminders] = useState<any[]>([]);
  const token = localStorage.getItem("token")!;

  type NotifState = "default" | "granted-subscribed" | "granted-unsubscribed" | "denied";
  const [notifState, setNotifState] = useState<NotifState>("default");

  useEffect(() => {
    async function detectNotifState() {
      if (!("Notification" in window) || !("serviceWorker" in navigator)) {
        setNotifState("denied");
        return;
      }
      if (Notification.permission === "denied") {
        setNotifState("denied");
        return;
      }
      if (Notification.permission === "default") {
        setNotifState("default");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      setNotifState(sub ? "granted-subscribed" : "granted-unsubscribed");
    }
    detectNotifState();
  }, []);

  // Use a ref so setTimeout always calls the latest version
  const handleEnableNotificationsRef = useRef<() => Promise<void>>();

  const handleEnableNotifications = useCallback(async () => {
    try {
      // 1. Ask browser for notification permission
      const perm = await Notification.requestPermission();
      if (perm !== "granted") {
        if (perm === "denied") setNotifState("denied");
        toast.error("Notification permission was not granted.");
        return;
      }

      // 2. Wait for service worker to be ready
      const reg = await navigator.serviceWorker.ready;
      if (!reg.pushManager) {
        toast.error("Push notifications are not supported in this browser.");
        return;
      }

      // 3. Check for existing subscription first
      let sub = await reg.pushManager.getSubscription();

      // 4. Subscribe if no existing subscription
      if (!sub) {
        const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        if (!vapidKey) {
          toast.error("VAPID key is missing. Contact support.");
          return;
        }
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidKey),
        });
      }

      // 5. Send subscription to backend
      const subJson = sub.toJSON();
      const res = await fetch(`${API}/api/push/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          endpoint: subJson.endpoint,
          keys: subJson.keys,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        console.error("Subscribe API error:", res.status, errBody);
        await sub.unsubscribe();
        toast.error("Server rejected the subscription. Check console for details.");
        return;
      }

      setNotifState("granted-subscribed");
      toast.success("Notifications enabled!");
    } catch (err) {
      console.error("Enable notifications failed:", err);
      toast.error(`Failed to enable notifications: ${(err as Error).message}`);
    }
  }, [token]);

  handleEnableNotificationsRef.current = handleEnableNotifications;

  async function handleDisableNotifications() {
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (!sub) {
        setNotifState("default");
        toast.info("No active subscription found.");
        return;
      }
      const endpoint = sub.endpoint;
      await sub.unsubscribe();

      // Tell backend to remove the subscription
      const res = await fetch(`${API}/api/push/subscribe`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ endpoint }),
      });

      if (!res.ok) {
        console.warn("Backend unsubscribe returned:", res.status);
      }

      setNotifState("default");
      toast.success("Notifications disabled.");
    } catch (err) {
      console.error("Disable notifications failed:", err);
      toast.error(`Failed to disable: ${(err as Error).message}`);
    }
  }

  // fetch reminders on page load
  useEffect(() => {
    async function fetchReminders() {
      const response = await fetch(`${API}/api/reminders`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReminders(data.reminders);
      } else if (response.status === 401) {
        toast.error("Unauthorized. Please log in again.");
      }
    }

    fetchReminders();
  }, []);

  // save a reminder
  async function handleSaveReminder() {
    if (!message) {
      toast.warning("Please enter a reminder message.");
      return;
    }

    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, "0");
    const d = String(selectedDate.getDate()).padStart(2, "0");
    const dateStr = `${y}-${m}-${d}`;

    const h24 =
      ampm === "PM" ? (hour === 12 ? 12 : hour + 12) : hour === 12 ? 0 : hour;
    const h24Str = String(h24).padStart(2, "0");
    const minStr = String(minute).padStart(2, "0");
    const timeStr24 = `${h24Str}:${minStr}`;

    const due_at = new Date(`${dateStr}T${timeStr24}:00`).toISOString();

    const payload = { message, due_at, frequency: "once" };
    console.log("Saving reminder payload:", payload);

    const response = await fetch(`${API}/api/reminders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      toast.success("Reminder saved!");
      setReminders([...reminders, data.reminder]);
      setMessage("");
      setIsPopUpOpen(false);
      setClockMode("hour");

      // Auto-prompt for notifications after first reminder save
      if (notifState === "default" || notifState === "granted-unsubscribed") {
        setTimeout(() => {
          handleEnableNotificationsRef.current?.();
        }, 800);
      }
    } else if (response.status === 400) {
      const errBody = await response.json().catch(() => ({}));
      console.error("400 validation error:", errBody);
      toast.error(`Invalid input: ${JSON.stringify(errBody.error ?? errBody)}`);
    } else {
      toast.error("Something went wrong.");
    }
  }

  // delete a reminder
  async function handleDeleteReminder(id: number) {
    const response = await fetch(`${API}/api/reminders/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      setReminders(reminders.filter((r) => r.id !== id));
      toast.success("Reminder deleted.");
    } else {
      toast.error("Failed to delete reminder.");
    }
  }

  // Quick-pick helper
  function pickQuickTime(h: number, m: number, ap: "AM" | "PM") {
    setHour(h);
    setMinute(m);
    setAmpm(ap);
    setClockMode("hour");
  }

  // Format display time
  const displayTime = `${hour}:${String(minute).padStart(2, "0")} ${ampm}`;

  return (
    <div className="flex flex-col items-center gap-6 pb-20 w-full px-2 sm:px-4">
      {/* Notification banners */}
      {(notifState === "default" || notifState === "granted-unsubscribed") && (
        <div className="w-full max-w-2xl mt-4 bg-primary/10 border border-primary/20 p-3 sm:p-4 rounded-xl flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 text-primary">
            <Bell className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-sm font-medium">Enable push notifications</p>
              <p className="text-xs text-primary/70">Get reminded on time, even when the app is closed</p>
            </div>
          </div>
          <Button size="sm" onClick={handleEnableNotifications}>Turn On</Button>
        </div>
      )}
      {notifState === "granted-subscribed" && (
        <div className="w-full max-w-2xl mt-4 bg-muted/50 border border-border/50 p-3 sm:p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3 text-muted-foreground">
            <BellRing className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">Notifications are on</p>
          </div>
          <Button size="sm" variant="ghost" onClick={handleDisableNotifications}>Turn Off</Button>
        </div>
      )}
      {notifState === "denied" && (
        <div className="w-full max-w-2xl mt-4 bg-destructive/10 border border-destructive/20 p-3 sm:p-4 rounded-xl flex items-center gap-3">
          <BellOff className="w-5 h-5 shrink-0 text-destructive" />
          <p className="text-sm text-destructive">Notifications blocked — reset in your browser's site settings to enable</p>
        </div>
      )}

      {/* Calendar — NO classNames overrides that break the internal flex layout */}
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(day) => {
          setSelectedDate(day ?? selectedDate);
          setClockMode("hour");
          setIsPopUpOpen(true);
        }}
        className="w-full max-w-2xl mt-4 bg-card shadow-xl rounded-2xl p-3 sm:p-6 [--cell-size:--spacing(10)] sm:[--cell-size:--spacing(12)]"
      />

      {/* reminder list */}
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Upcoming Reminders</CardTitle>
        </CardHeader>
        <CardContent>
          {reminders.length === 0 ? (
            <p className="text-muted-foreground">No reminders set yet.</p>
          ) : (
            <ul className="space-y-3">
              {reminders.map((r) => (
                <li key={r.id} className="flex items-center justify-between border-b pb-2">
                  <div>
                    <p className="font-medium">{r.message}</p>
                    {(() => {
                      const d = new Date(r.due_at);
                      const dateStr = d.toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      });
                      const timeStr = d.toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      });
                      return (
                        <p className="text-sm text-muted-foreground">
                          {dateStr} at {timeStr}
                        </p>
                      );
                    })()}
                  </div>
                  <button onClick={() => handleDeleteReminder(r.id)}>
                    <Trash2 className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* dialog for setting a reminder */}
      <Dialog open={isPopUpOpen} onOpenChange={setIsPopUpOpen}>
        <DialogContent className="max-w-sm sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Reminder</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {selectedDate.toLocaleDateString("en-IN", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>

          <div className="flex flex-col gap-4 py-2">
            {/* Quick-pick chips */}
            <div className="flex flex-col gap-2">
              <Label className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">Quick Pick</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={hour === 8 && minute === 0 && ampm === "AM" ? "default" : "outline"}
                  onClick={() => pickQuickTime(8, 0, "AM")}
                  className="flex flex-col h-auto py-2 gap-0.5"
                  size="sm"
                >
                  <Sun className="w-4 h-4 text-orange-400" />
                  <span className="text-[10px] opacity-70">Morning</span>
                  <span className="font-bold text-sm">8:00 AM</span>
                </Button>
                <Button
                  variant={hour === 1 && minute === 0 && ampm === "PM" ? "default" : "outline"}
                  onClick={() => pickQuickTime(1, 0, "PM")}
                  className="flex flex-col h-auto py-2 gap-0.5"
                  size="sm"
                >
                  <Clock className="w-4 h-4 text-blue-400" />
                  <span className="text-[10px] opacity-70">Afternoon</span>
                  <span className="font-bold text-sm">1:00 PM</span>
                </Button>
                <Button
                  variant={hour === 8 && minute === 0 && ampm === "PM" ? "default" : "outline"}
                  onClick={() => pickQuickTime(8, 0, "PM")}
                  className="flex flex-col h-auto py-2 gap-0.5"
                  size="sm"
                >
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span className="text-[10px] opacity-70">Evening</span>
                  <span className="font-bold text-sm">8:00 PM</span>
                </Button>
              </div>
            </div>

            {/* Clock face time picker */}
            <div className="flex flex-col items-center gap-3">
              {/* Digital display */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setClockMode("hour")}
                  className={`text-4xl font-bold transition-colors px-2 py-1 rounded-lg ${
                    clockMode === "hour"
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {hour}
                </button>
                <span className="text-4xl font-bold text-muted-foreground">:</span>
                <button
                  onClick={() => setClockMode("minute")}
                  className={`text-4xl font-bold transition-colors px-2 py-1 rounded-lg ${
                    clockMode === "minute"
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {String(minute).padStart(2, "0")}
                </button>
                <div className="flex flex-col gap-1 ml-2">
                  <button
                    onClick={() => setAmpm("AM")}
                    className={`text-xs font-bold px-2 py-1 rounded-md transition-colors ${
                      ampm === "AM"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    AM
                  </button>
                  <button
                    onClick={() => setAmpm("PM")}
                    className={`text-xs font-bold px-2 py-1 rounded-md transition-colors ${
                      ampm === "PM"
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    PM
                  </button>
                </div>
              </div>

              {/* Analog clock */}
              <ClockFace
                mode={clockMode}
                hour={hour}
                minute={minute}
                onHourChange={(h) => setHour(h)}
                onMinuteChange={(m) => setMinute(m)}
                onModeChange={setClockMode}
              />
              <p className="text-xs text-muted-foreground">
                {clockMode === "hour" ? "Select hour" : "Select minutes"} · tap the digits above to switch
              </p>
            </div>

            {/* Reminder message */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="message" className="text-muted-foreground text-xs uppercase tracking-wider font-semibold">
                Reminder Message
              </Label>
              <Input
                id="message"
                placeholder="e.g. Take medicine, Check BP"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="h-11 text-base"
              />
            </div>

            <Button size="lg" className="font-bold shadow-md" onClick={handleSaveReminder}>
              Save Reminder
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
