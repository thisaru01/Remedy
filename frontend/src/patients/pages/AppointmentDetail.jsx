import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export default function AppointmentDetail() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Appointment Details</h2>

      <div className="pt-4">
        <Tabs defaultValue="meetings">
          <TabsList variant="line">
            <TabsTrigger value="meetings">Meetings</TabsTrigger>
            <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="meetings" className="mt-4">
            <div className="text-sm text-muted-foreground">No meetings scheduled for this appointment.</div>
          </TabsContent>

          <TabsContent value="prescriptions" className="mt-4">
            <div className="text-sm text-muted-foreground">No prescriptions available.</div>
          </TabsContent>

          <TabsContent value="reports" className="mt-4">
            <div className="text-sm text-muted-foreground">No reports available.</div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
