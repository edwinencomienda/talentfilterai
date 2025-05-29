
import AppLayout from "@/components/app-layout"
import { ApplicantsList } from "@/components/applicants-list"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function ApplicantsPage({ params }: PageProps) {
  const id = (await params).id

  return (
    <AppLayout>
      <ApplicantsList jobId={id} />
    </AppLayout>
  )
}
