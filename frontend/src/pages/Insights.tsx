import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useEffect, useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

const API = import.meta.env.VITE_API_URL;

// --- Helper Functions ---
function getSysStatus(val: number) {
  if (val >= 140) return { text: "High", textColor: "text-red-600 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/30" };
  if (val > 120) return { text: "Elevated", textColor: "text-yellow-600 dark:text-yellow-400", bgColor: "bg-yellow-100 dark:bg-yellow-900/30" };
  return { text: "Normal", textColor: "text-green-600 dark:text-green-400", bgColor: "bg-green-100 dark:bg-green-900/30" };
}

function getDiaStatus(val: number) {
  if (val >= 90) return { text: "High (Diastolic)", textColor: "text-red-600 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/30" };
  if (val > 80) return { text: "Elevated (Diastolic)", textColor: "text-yellow-600 dark:text-yellow-400", bgColor: "bg-yellow-100 dark:bg-yellow-900/30" };
  return { text: "Normal", textColor: "text-green-600 dark:text-green-400", bgColor: "bg-green-100 dark:bg-green-900/30" };
}

function getGlucoseStatus(val: number, type: "fasting" | "post_meal") {
  if (type === "fasting") {
    if (val >= 126) return { text: "Diabetic", textColor: "text-red-600 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/30" };
    if (val >= 100) return { text: "Pre-diabetic", textColor: "text-yellow-600 dark:text-yellow-400", bgColor: "bg-yellow-100 dark:bg-yellow-900/30" };
    return { text: "Normal", textColor: "text-green-600 dark:text-green-400", bgColor: "bg-green-100 dark:bg-green-900/30" };
  } else {
    if (val >= 200) return { text: "Diabetic", textColor: "text-red-600 dark:text-red-400", bgColor: "bg-red-100 dark:bg-red-900/30" };
    if (val >= 140) return { text: "Pre-diabetic", textColor: "text-yellow-600 dark:text-yellow-400", bgColor: "bg-yellow-100 dark:bg-yellow-900/30" };
    return { text: "Normal", textColor: "text-green-600 dark:text-green-400", bgColor: "bg-green-100 dark:bg-green-900/30" };
  }
}

function getSeverityScore(statusText: string) {
  if (statusText.includes("High") || statusText.includes("Diabetic")) return 3;
  if (statusText.includes("Elevated") || statusText.includes("Pre-diabetic")) return 2;
  return 1; // Normal
}

function getHeatmapColorClass(score: number) {
  if (score === 3) return "bg-red-500 dark:bg-red-600";
  if (score === 2) return "bg-yellow-400 dark:bg-yellow-500";
  if (score === 1) return "bg-green-500 dark:bg-green-600";
  return "bg-muted"; // No data
}

// Generates an array of the last 30 calendar days
function getLast30Days() {
  const days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    days.push(d);
  }
  return days;
}

// --- Subcomponents ---
function Heatmap({ dataMap }: { dataMap: Map<string, number> }) {
  const days = useMemo(() => getLast30Days(), []);
  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">30-Day Consistency</h3>
      <div className="flex flex-wrap gap-1.5">
        {days.map((d) => {
          const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
          const score = dataMap.get(dateStr) || 0;
          return (
            <div
              key={dateStr}
              className={`w-5 h-5 sm:w-6 sm:h-6 rounded-md transition-colors ${getHeatmapColorClass(score)}`}
              title={`${dateStr}: ${score === 3 ? "High/Diabetic" : score === 2 ? "Elevated/Pre-diabetic" : score === 1 ? "Normal" : "No Data"}`}
            />
          );
        })}
      </div>
      <div className="flex gap-4 text-[11px] sm:text-xs text-muted-foreground mt-1 font-medium">
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-muted" /> None</div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-green-500 dark:bg-green-600" /> Normal</div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-yellow-400 dark:bg-yellow-500" /> Elevated</div>
        <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-sm bg-red-500 dark:bg-red-600" /> High</div>
      </div>
    </div>
  );
}

function LatestReadingHero({ title, value, statusInfo }: { title: string, value: string, statusInfo?: { text: string, textColor: string, bgColor: string } }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 bg-card rounded-2xl border border-border shadow-sm">
      <span className="text-sm text-muted-foreground font-semibold uppercase tracking-wider mb-2">{title}</span>
      <div className="text-5xl font-extrabold tracking-tight text-foreground mb-4">
        {value}
      </div>
      {statusInfo ? (
        <span className={`px-4 py-1.5 text-sm font-bold rounded-full ${statusInfo.bgColor} ${statusInfo.textColor}`}>
          {statusInfo.text}
        </span>
      ) : (
        <span className="px-4 py-1.5 text-sm font-bold rounded-full bg-muted text-muted-foreground">
          No Data
        </span>
      )}
    </div>
  );
}

export default function Insights() {
  const [bpReadings, setBpReadings] = useState<any[]>([]);
  const [glucoseReadings, setGlucoseReadings] = useState<any[]>([]);

  useEffect(() => {
    async function fetchReadings() {
      const response = await fetch(`${API}/api/bp-readings`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setBpReadings(data.readings);
      } else if (response.status === 401) {
        toast.error("Unauthorized. Please log in again.");
      }

      const response2 = await fetch(`${API}/api/glucose-readings`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (response2.ok) {
        const data = await response2.json();
        setGlucoseReadings(data.readings);
      } else if (response2.status === 401) {
        toast.error("Unauthorized. Please log in again.");
      }
    }

    fetchReadings();
  }, []);

  const fastingReadings = glucoseReadings.filter((r) => r.type === "fasting");
  const postMealReadings = glucoseReadings.filter((r) => r.type === "post_meal");

  const uniqueBpDays = new Set(bpReadings.map(r => new Date(r.created_at).toDateString())).size;
  const uniqueFastingDays = new Set(fastingReadings.map(r => new Date(r.created_at).toDateString())).size;
  const uniquePostMealDays = new Set(postMealReadings.map(r => new Date(r.created_at).toDateString())).size;

  // BP Logic
  const latestBp = bpReadings.length > 0 ? bpReadings[bpReadings.length - 1] : null;
  // If either systolic or diastolic is bad, we take the worst status for the Hero
  let sysStatusInfo = undefined;
  if (latestBp) {
    const sysScore = getSeverityScore(getSysStatus(latestBp.systolic).text);
    const diaScore = getSeverityScore(getDiaStatus(latestBp.diastolic).text);
    sysStatusInfo = sysScore >= diaScore ? getSysStatus(latestBp.systolic) : getDiaStatus(latestBp.diastolic);
  }

  const bpHeatmapMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of bpReadings) {
      const d = new Date(r.created_at);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const sysScore = getSeverityScore(getSysStatus(r.systolic).text);
      const diaScore = getSeverityScore(getDiaStatus(r.diastolic).text);
      const score = Math.max(sysScore, diaScore);
      const existing = map.get(dateStr) || 0;
      if (score > existing) map.set(dateStr, score);
    }
    return map;
  }, [bpReadings]);

  // Glucose Logic
  const latestFasting = fastingReadings.length > 0 ? fastingReadings[fastingReadings.length - 1] : null;
  const fastingStatusInfo = latestFasting ? getGlucoseStatus(latestFasting.reading, "fasting") : undefined;
  
  const fastingHeatmapMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of fastingReadings) {
      const d = new Date(r.created_at);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const score = getSeverityScore(getGlucoseStatus(r.reading, "fasting").text);
      const existing = map.get(dateStr) || 0;
      if (score > existing) map.set(dateStr, score);
    }
    return map;
  }, [fastingReadings]);

  const latestPost = postMealReadings.length > 0 ? postMealReadings[postMealReadings.length - 1] : null;
  const postStatusInfo = latestPost ? getGlucoseStatus(latestPost.reading, "post_meal") : undefined;

  const postHeatmapMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of postMealReadings) {
      const d = new Date(r.created_at);
      const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const score = getSeverityScore(getGlucoseStatus(r.reading, "post_meal").text);
      const existing = map.get(dateStr) || 0;
      if (score > existing) map.set(dateStr, score);
    }
    return map;
  }, [postMealReadings]);

  return (
    <Tabs defaultValue="bp" className="w-full pb-10 max-w-xl mx-auto">
      <TabsList className="bg-muted mb-6 w-full p-1 rounded-xl">
        <TabsTrigger value="bp" className="flex-1 rounded-lg">Blood Pressure</TabsTrigger>
        <TabsTrigger value="glucose" className="flex-1 rounded-lg">Glucose</TabsTrigger>
      </TabsList>

      <TabsContent value="bp" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <LatestReadingHero 
          title="Latest Reading" 
          value={latestBp ? `${latestBp.systolic} / ${latestBp.diastolic}` : "-- / --"} 
          statusInfo={sysStatusInfo} 
        />
        
        <Card className="shadow-none border-border">
          <CardContent className="pt-6">
            <Heatmap dataMap={bpHeatmapMap} />
          </CardContent>
        </Card>

        {uniqueBpDays > 10 ? (
          <Card className="shadow-none border-border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Historical Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={bpReadings.slice(-30)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                  <XAxis
                    dataKey="created_at"
                    tickFormatter={(val) => new Date(val).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    stroke="var(--muted-foreground)"
                    fontSize={12}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    stroke="var(--muted-foreground)" 
                    fontSize={11} 
                    axisLine={false}
                    tickLine={false}
                    width={35}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleString()}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', marginTop: '10px' }} />
                  <Line type="monotone" dataKey="systolic" stroke="var(--primary)" strokeWidth={2} dot={{ fill: "var(--primary)", r: 4 }} activeDot={{ r: 6 }} name="Systolic" />
                  <Line type="monotone" dataKey="diastolic" stroke="var(--chart-2)" strokeWidth={2} dot={{ fill: "var(--chart-2)", r: 4 }} activeDot={{ r: 6 }} name="Diastolic" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-none border-border border-dashed bg-muted/10">
            <CardContent className="pt-6 flex flex-col items-center justify-center h-[200px] text-center text-muted-foreground">
              <p className="font-medium text-foreground mb-1">More data needed</p>
              <p className="text-sm">Log Blood Pressure on {11 - uniqueBpDays} more unique days to unlock trend charts.</p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="glucose" className="space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/* Fasting Section */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold tracking-tight text-foreground border-b pb-2">Fasting Glucose</h2>
          <LatestReadingHero 
            title="Latest Fasting" 
            value={latestFasting ? `${latestFasting.reading} mg/dL` : "--"} 
            statusInfo={fastingStatusInfo} 
          />
          <Card className="shadow-none border-border">
            <CardContent className="pt-6">
              <Heatmap dataMap={fastingHeatmapMap} />
            </CardContent>
          </Card>
          
          {uniqueFastingDays > 10 ? (
            <Card className="shadow-none border-border">
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={fastingReadings.slice(-30)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="created_at" hide />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} width={35} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="reading" stroke="var(--foreground)" strokeWidth={2} dot={false} name="Fasting" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-none border-border border-dashed bg-muted/10">
              <CardContent className="pt-6 flex flex-col items-center justify-center h-[100px] text-center text-muted-foreground">
                <p className="text-sm">Log Fasting Glucose on {11 - uniqueFastingDays} more days to unlock charts.</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Post-Meal Section */}
        <div className="space-y-6">
          <h2 className="text-lg font-bold tracking-tight text-foreground border-b pb-2">Post-Meal Glucose</h2>
          <LatestReadingHero 
            title="Latest Post-Meal" 
            value={latestPost ? `${latestPost.reading} mg/dL` : "--"} 
            statusInfo={postStatusInfo} 
          />
          <Card className="shadow-none border-border">
            <CardContent className="pt-6">
              <Heatmap dataMap={postHeatmapMap} />
            </CardContent>
          </Card>

          {uniquePostMealDays > 10 ? (
            <Card className="shadow-none border-border">
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={150}>
                  <LineChart data={postMealReadings.slice(-30)}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                    <XAxis dataKey="created_at" hide />
                    <YAxis stroke="var(--muted-foreground)" fontSize={11} axisLine={false} tickLine={false} width={35} domain={['auto', 'auto']} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="reading" stroke="var(--foreground)" strokeWidth={2} dot={false} name="Post-Meal" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-none border-border border-dashed bg-muted/10">
              <CardContent className="pt-6 flex flex-col items-center justify-center h-[100px] text-center text-muted-foreground">
                <p className="text-sm">Log Post-Meal Glucose on {11 - uniquePostMealDays} more days to unlock charts.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>
    </Tabs>
  );
}
