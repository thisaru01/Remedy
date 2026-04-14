import { useParams } from "react-router-dom";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import MeetingsTab from "@/patients/components/MeetingsTab";
import PrescriptionsTab from "@/patients/components/PrescriptionsTab";
import ReportsTab from "@/patients/components/ReportsTab";

export default function AppointmentDetail() {
  const { id: appointmentId } = useParams();

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
            <MeetingsTab appointmentId={appointmentId} />
          </TabsContent>

          <TabsContent value="prescriptions" className="mt-4">
            <PrescriptionsTab />
          </TabsContent>

          <TabsContent value="reports" className="mt-4">
            <ReportsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
