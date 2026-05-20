import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import BloodPressureForm from "@/components/forms/BloodPressureForm";
import GlucoseForm from "@/components/forms/GlucoseForm";
import { Heart, Droplets } from "lucide-react";

export default function LogData() {
  return (
    <div className="max-w-lg mx-auto">
      <Tabs defaultValue="blood-pressure" className="w-full">
        <TabsList className="bg-muted w-full p-1 rounded-xl mb-6">
          <TabsTrigger value="blood-pressure" className="flex-1 rounded-lg gap-2">
            <Heart className="w-4 h-4" />
            Blood Pressure
          </TabsTrigger>
          <TabsTrigger value="glucose" className="flex-1 rounded-lg gap-2">
            <Droplets className="w-4 h-4" />
            Glucose
          </TabsTrigger>
        </TabsList>

        <TabsContent value="blood-pressure" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <BloodPressureForm />
        </TabsContent>

        <TabsContent value="glucose" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
          <GlucoseForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
