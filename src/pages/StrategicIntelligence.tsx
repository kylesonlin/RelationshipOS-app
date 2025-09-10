import { SmartInsightsWidget } from "@/components/ai/SmartInsightsWidget";

export default function StrategicIntelligence() {
  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Strategic Intelligence</h1>
        <p className="text-muted-foreground">
          Executive insights and strategic recommendations based on your relationship data
        </p>
      </div>

      <SmartInsightsWidget />
    </div>
  );
}