import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Pencil, X, Check, LogOut, Mail, User, Shield, CalendarIcon, Moon, Bell, MonitorSmartphone, ChevronRight } from "lucide-react";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { useTheme } from "@/components/theme-provider";

const API = import.meta.env.VITE_API_URL;

// shape of profile data from API
interface Profile {
  name: string;
  email: string;
  role: string;
  date_of_birth: string | null;
  gender: string | null;
}

// which fields can be edited
type EditableField = "name" | "date_of_birth" | "gender";

export default function Settings() {
  const navigate = useNavigate();

  // profile state
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // editing state — which field is currently being edited
  const [editingField, setEditingField] = useState<EditableField | null>(null);
  // temp value while editing
  const [editValue, setEditValue] = useState("");

  // theme state
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  // mock settings states
  const [notifications, setNotifications] = useState(true);

  // Helper to get initials
  function getInitials(name: string) {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
  }

  // fetch profile on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch(`${API}/api/profile`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setProfile(data.profile);
        } else {
          toast.error("Failed to load profile");
        }
      } catch {
        toast.error("Network error");
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  // start editing a field
  function startEdit(field: EditableField) {
    setEditingField(field);
    // pre-fill with current value
    const currentValue = profile?.[field] ?? "";
    setEditValue(currentValue);
  }

  // cancel editing
  function cancelEdit() {
    setEditingField(null);
    setEditValue("");
  }

  // save a single field
  async function saveField() {
    if (!editingField) return;

    try {
      const res = await fetch(`${API}/api/profile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ field: editingField, value: editValue }),
      });

      if (res.ok) {
        // update local state
        setProfile((prev) =>
          prev ? { ...prev, [editingField]: editValue } : prev,
        );
        toast.success("Profile updated");
        setEditingField(null);
        setEditValue("");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update");
      }
    } catch {
      toast.error("Network error");
    }
  }

  // logout handler
  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  // format date for display
  function formatDate(dateStr: string | null) {
    if (!dateStr) return "Not set";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-destructive">Could not load profile</p>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto pb-8">
      
      {/* Hero Header */}
      <div className="flex flex-col items-center justify-center p-8 mb-6 rounded-3xl bg-gradient-to-br from-primary/15 via-primary/5 to-background border border-border/50 shadow-sm relative overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl"></div>
        
        <div className="w-24 h-24 rounded-full bg-primary/10 text-primary border-4 border-background flex items-center justify-center text-3xl font-bold mb-4 shadow-md z-10">
          {getInitials(profile.name)}
        </div>
        <h2 className="text-2xl font-bold tracking-tight z-10">{profile.name}</h2>
        <p className="text-sm text-muted-foreground capitalize flex items-center gap-1.5 mt-1.5 px-3 py-1 bg-background/50 backdrop-blur-sm rounded-full border border-border/50 z-10">
          <Shield className="w-3.5 h-3.5 text-primary" />
          {profile.role || "Patient"}
        </p>
      </div>

      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="w-full mb-6 bg-muted/50 p-1 rounded-xl">
          <TabsTrigger value="profile" className="flex-1 rounded-lg data-[state=active]:shadow-sm">
            Profile Details
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex-1 rounded-lg data-[state=active]:shadow-sm">
            App Settings
          </TabsTrigger>
        </TabsList>

        {/* ===== PROFILE TAB ===== */}
        <TabsContent value="profile" className="space-y-4 outline-none">
          <Card className="shadow-none border-border/60 overflow-hidden">
            <CardHeader className="bg-muted/30 pb-4 border-b border-border/40">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/40">
                {/* Email — read only */}
                <ProfileRow icon={<Mail className="w-4 h-4" />} label="Email Address" value={profile.email} />

                {/* Name — editable */}
                <div className="px-6 py-4 transition-colors hover:bg-muted/10">
                  {editingField === "name" ? (
                    <EditRow icon={<User className="w-4 h-4" />} label="Full Name" onSave={saveField} onCancel={cancelEdit}>
                      <Input
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        autoFocus
                        className="mt-2"
                      />
                    </EditRow>
                  ) : (
                    <ProfileRow
                      icon={<User className="w-4 h-4" />}
                      label="Full Name"
                      value={profile.name}
                      onEdit={() => startEdit("name")}
                    />
                  )}
                </div>

                {/* Date of Birth — editable with calendar */}
                <div className="px-6 py-4 transition-colors hover:bg-muted/10">
                  {editingField === "date_of_birth" ? (
                    <EditRow
                      icon={<CalendarIcon className="w-4 h-4" />}
                      label="Date of Birth"
                      onSave={saveField}
                      onCancel={cancelEdit}
                    >
                      <div className="mt-2 bg-background rounded-lg border shadow-sm flex justify-center p-2">
                        <Calendar
                          mode="single"
                          selected={editValue ? new Date(editValue) : undefined}
                          onSelect={(date) => {
                            if (date) {
                              const yyyy = date.getFullYear();
                              const mm = String(date.getMonth() + 1).padStart(2, "0");
                              const dd = String(date.getDate()).padStart(2, "0");
                              setEditValue(`${yyyy}-${mm}-${dd}`);
                            }
                          }}
                          captionLayout="dropdown"
                          startMonth={new Date(1930, 0)}
                          endMonth={new Date()}
                        />
                      </div>
                    </EditRow>
                  ) : (
                    <ProfileRow
                      icon={<CalendarIcon className="w-4 h-4" />}
                      label="Date of Birth"
                      value={formatDate(profile.date_of_birth)}
                      onEdit={() => startEdit("date_of_birth")}
                    />
                  )}
                </div>

                {/* Gender — editable with select */}
                <div className="px-6 py-4 transition-colors hover:bg-muted/10">
                  {editingField === "gender" ? (
                    <EditRow
                      icon={<User className="w-4 h-4" />}
                      label="Gender"
                      onSave={saveField}
                      onCancel={cancelEdit}
                    >
                      <select
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </EditRow>
                  ) : (
                    <ProfileRow
                      icon={<User className="w-4 h-4" />}
                      label="Gender"
                      value={profile.gender || "Not set"}
                      onEdit={() => startEdit("gender")}
                    />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== SETTINGS TAB ===== */}
        <TabsContent value="settings" className="space-y-6 outline-none">
          {/* Preferences */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground px-1 uppercase tracking-wider">Preferences</h3>
            <Card className="shadow-none border-border/60 overflow-hidden">
              <div className="divide-y divide-border/40">
                <div className="flex items-center justify-between p-4 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Moon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Dark Mode</p>
                      <p className="text-[11px] text-muted-foreground">Adjust the app appearance</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setTheme(isDark ? "light" : "dark")}
                    className={`w-11 h-6 rounded-full transition-colors relative ${isDark ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${isDark ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 px-5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Bell className="w-4 h-4 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Push Notifications</p>
                      <p className="text-[11px] text-muted-foreground">Medication and reading reminders</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setNotifications(!notifications)}
                    className={`w-11 h-6 rounded-full transition-colors relative ${notifications ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                  >
                    <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-200 ${notifications ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </button>
                </div>
              </div>
            </Card>
          </div>

          {/* Account */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-muted-foreground px-1 uppercase tracking-wider">Account</h3>
            <Card className="shadow-none border-border/60 overflow-hidden">
              <div className="divide-y divide-border/40">
                <button className="w-full flex items-center justify-between p-4 px-5 hover:bg-muted/30 transition-colors text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                      <MonitorSmartphone className="w-4 h-4 text-foreground" />
                    </div>
                    <p className="text-sm font-medium">Connected Devices</p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>

                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center justify-between p-4 px-5 hover:bg-red-500/5 transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center group-hover:bg-red-200 dark:group-hover:bg-red-900/50 transition-colors">
                      <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">Sign Out</p>
                  </div>
                </button>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// --- Helper components ---

// displays a read-only row with optional edit button
function ProfileRow({
  icon,
  label,
  value,
  onEdit,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onEdit?: () => void;
}) {
  return (
    <div className={`flex items-center justify-between ${!onEdit ? 'px-6 py-4' : ''}`}>
      <div className="flex items-center gap-4">
        <div className="w-9 h-9 rounded-full bg-muted/50 text-muted-foreground flex items-center justify-center shrink-0">
          {icon}
        </div>
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-0.5">{label}</p>
          <p className="text-sm font-medium">{value}</p>
        </div>
      </div>
      {onEdit && (
        <button
          onClick={onEdit}
          className="w-8 h-8 rounded-full flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Pencil className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

// wraps an editing field with save/cancel buttons
function EditRow({
  icon,
  label,
  children,
  onSave,
  onCancel,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
      <div className="flex items-center gap-3 text-primary">
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          {icon}
        </div>
        <p className="text-sm font-semibold">Edit {label}</p>
      </div>
      
      <div className="pl-11 pr-2">
        {children}
        <div className="flex gap-2 mt-4 justify-end">
          <Button size="sm" variant="ghost" onClick={onCancel} className="h-8 text-muted-foreground">
            Cancel
          </Button>
          <Button size="sm" onClick={onSave} className="h-8 px-4 rounded-full">
            <Check className="w-3.5 h-3.5 mr-1.5" />
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
