// app/patient/appointments/page.tsx
import Sidebar from "@/components/Sidebar";
import ScheduleForm from "@/components/schedule/schedule-form";


export default function PatientAppointments() {
  return (
    <Sidebar>
      <ScheduleForm />
    </Sidebar>
  );
}
