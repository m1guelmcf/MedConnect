// app/secretary/appointments/page.tsx
import SecretaryLayout from "@/components/secretary-layout";
import ScheduleForm from "@/components/schedule/schedule-form";


export default function SecretaryAppointments() {
  return (
    <SecretaryLayout>
      <ScheduleForm />
    </SecretaryLayout>
  );
}
