// app/patient/appointments/page.tsx
import PatientLayout from "@/components/patient-layout";
import ScheduleForm from "@/components/schedule/schedule-form";


export default function PatientAppointments() {
  return (
    <PatientLayout>
      <ScheduleForm />
    </PatientLayout>
  );
}
