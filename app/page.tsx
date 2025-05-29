import AppLayout from "@/components/app-layout"
import { JobsList } from "@/components/jobs-list"

export default function HomePage() {
  return (
    <AppLayout>
      <JobsList />
    </AppLayout>
  )
}
