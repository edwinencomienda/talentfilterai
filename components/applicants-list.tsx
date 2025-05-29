"use client"

import { getJob, sendShortlistedEmail, updateApplicantStatus } from "@/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Briefcase, Calendar, CheckCircle, FileText, Mail, Search, Users, XCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"


const getStatusVariant = (status: string) => {
  switch (status) {
    case "passed":
      return "default"
    case "failed":
      return "destructive"
    case "pending":
      return "secondary"
    default:
      return "default"
  }
}

const getJobStatusVariant = (status: string) => {
  switch (status) {
    case "active":
      return "default"
    case "closed":
      return "destructive"
    case "draft":
      return "secondary"
    default:
      return "default"
  }
}

interface ApplicantsListProps {
  jobId: string
}

export function ApplicantsList({ jobId }: ApplicantsListProps) {
  const [activeTab, setActiveTab] = useState("all")
  const [isAttachmentDialogOpen, setIsAttachmentDialogOpen] = useState(false)
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false)
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null)
  const [contactMessage, setContactMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null)

  const [jobData, setJobData] = useState<Job | null>(null)

  interface Attachment {
    applicant_id: number
    file_url: string
    file_name: string
    content_type: string
    size: number
  }

  function downloadFile(url: string, filename: string) {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    link.target = "_blank"
    link.rel = "noopener noreferrer"
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }


  const handleViewAttachment = (applicant: Applicant, attachment: Attachment) => {
    setSelectedApplicant(applicant)
    setSelectedAttachment(attachment)

    if (attachment.content_type.endsWith('pdf')) {
      setIsAttachmentDialogOpen(true)
    } else {
      // download file
      downloadFile(attachment.file_url, attachment.file_name)
    }
  }

  const handleContact = (applicant: Applicant) => {
    setSelectedApplicant(applicant)
    setContactMessage("")
    setIsContactDialogOpen(true)
  }

  const handleSendShortlistedEmail = (applicant: Applicant) => {
    if (confirm("Are you sure you want to send a shortlisted email to this applicant?")) {
      sendShortlistedEmail(Number(jobData?.id), Number(applicant.id))
    }
  }

  const handleSendMessage = () => {
    if (contactMessage.trim() && selectedApplicant) {
      // Here you would typically send the message via API
      console.log(`Sending message to ${selectedApplicant.email}:`, contactMessage)
      setContactMessage("")
      setIsContactDialogOpen(false)
      setSelectedApplicant(null)
    }
  }

  const [isLoading, setIsLoading] = useState(true)
  const handleGetJob = async () => {
    setIsLoading(true)
    const job = await getJob(Number(jobId))
    console.log(job)

    if (!job) {
      setIsLoading(false)
      return
    }

    setJobData({
      id: job.id,
      title: job.title,
      description: job.description,
      applicantCount: 0,
      createdAt: job.created_at,
      status: job.status as Job['status'],
      applications: job.applications.map((application) => {
        const meta = JSON.parse(application.meta || "{}")

        return {
          id: application.id,
          name: application.name,
          email: application.email,
          created_at: application.created_at,
          status: application.status ?? (meta.qualificationPercentage >= 50 ? "passed" : "failed"),
          qualifications: meta.qualifications,
          qualificationPercentage: meta.qualificationPercentage,
          attachments: application.attachments,
        }
      }),
    })
    setIsLoading(false)
  }

  useEffect(() => {
    handleGetJob()
  }, [])

  const filteredApplicants = jobData?.applications?.filter((applicant) => {
    const matchesTab = activeTab === "all" || applicant.status === activeTab
    const matchesSearch =
      searchQuery === "" ||
      applicant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      applicant.email.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesTab && matchesSearch
  })


  if (isLoading && !jobData) {
    return <div>Loading...</div>
  }

  if (!jobData) {
    return <div>
      <div>Job not found</div>
      <Link href="/">
        <Button variant="outline">Back to Jobs</Button>
      </Link>
    </div>
  }

  const tabsCount = jobData?.applications?.reduce((acc, applicant) => {
    if (applicant.status === "shortlisted") {
      acc.shortlisted++
    } else if (applicant.status === "passed") {
      acc.passed++
    } else if (applicant.status === "failed") {
      acc.failed++
    }
    acc.all++
    return acc
  }, { shortlisted: 0, passed: 0, failed: 0, all: 0 })

  const handleUpdateApplicantStatus = async (applicant: Applicant, status?: string) => {
    await updateApplicantStatus(applicant.id as number, status)
    await handleGetJob()
  }

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="container mx-auto py-8 space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Jobs
                </Button>
              </Link>
            </div>

            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Briefcase className="h-6 w-6 text-muted-foreground" />
                    <h1 className="text-3xl font-bold">{jobData.title}</h1>
                  </div>
                  <div className="flex items-center gap-4">
                    <Badge variant={getJobStatusVariant(jobData.status)} className="text-sm">
                      {jobData.status.charAt(0).toUpperCase() + jobData.status.slice(1)}
                    </Badge>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span className="text-sm">
                        {jobData.applications?.length} total applicant{jobData.applications?.length !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Job Description</h3>
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">{jobData.description}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Applicants Section */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Applicants</h2>
              <div>
                <Button onClick={() => handleGetJob()} variant="outline" disabled={isLoading}>
                  Refresh
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  autoComplete="off"
                  placeholder="Search applicants by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-6">
                  <TabsTrigger value="all" className="flex items-center gap-2">
                    All
                    <Badge variant="secondary" className="text-xs">
                      {tabsCount?.all}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="passed" className="flex items-center gap-2">
                    Passed
                    <Badge variant="secondary" className="text-xs">
                      {tabsCount?.passed}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="failed" className="flex items-center gap-2">
                    Failed
                    <Badge variant="secondary" className="text-xs">
                      {tabsCount?.failed}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="shortlisted" className="flex items-center gap-2">
                    Shortlisted
                    <Badge variant="secondary" className="text-xs">
                      {tabsCount?.shortlisted}
                    </Badge>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab}>
                  <div className="space-y-4">
                    {filteredApplicants?.map((applicant) => (
                      <Card key={applicant.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="space-y-2">
                              <div className="flex items-center gap-3">
                                <h3 className="text-lg font-semibold">{applicant.name}</h3>
                                <Badge variant={getStatusVariant(applicant.status)}>
                                  {applicant.status}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Mail className="h-4 w-4" />
                                  <span>{applicant.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  <span>Applied on {new Date(applicant.created_at).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" onClick={() => handleUpdateApplicantStatus(applicant, applicant.status === "shortlisted" ? undefined : "shortlisted")}>
                                {applicant.status === "shortlisted" ? "Remove from Shortlist" : "Shortlist"}
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="outline" size="sm" disabled={!applicant.attachments?.length}>
                                    <FileText className="h-4 w-4 mr-2" />
                                    Attachments
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                  {/* <DropdownMenuLabel>Attachments</DropdownMenuLabel> */}
                                  <DropdownMenuSeparator />
                                  {applicant.attachments?.map((attachment: any) => (
                                    <DropdownMenuItem key={attachment.id} onClick={() => handleViewAttachment(applicant, attachment)}>
                                      {attachment.file_name}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                              <Button variant="outline" size="sm" onClick={() => handleSendShortlistedEmail(applicant)}>
                                <Mail className="h-4 w-4 mr-2" />
                                Send Shortlisted Email
                              </Button>
                            </div>
                          </div>
                          <div className="p-2 border-y mb-4">
                            <div className="font-semibold mb-2">Qualifications</div>
                            <table className="w-full">
                              <tbody>
                                {Object.entries(applicant.qualifications || {}).map(([key, value]) => (
                                  <tr key={key} className="hover:bg-muted/50">
                                    <td className="py-1.5 pr-2">{key}</td>
                                    <td className="py-1.5">
                                      {value ? (
                                        <CheckCircle className="size-4 text-green-500" />
                                      ) : (
                                        <XCircle className="size-4 text-red-500" />
                                      )}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    ))}

                    {filteredApplicants?.length === 0 && (
                      <Card>
                        <CardContent className="flex flex-col items-center justify-center py-12">
                          <Users className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="text-lg font-semibold mb-2">No applicants found</h3>
                          <p className="text-muted-foreground text-center">
                            {searchQuery
                              ? `No applicants found matching "${searchQuery}" for this filter.`
                              : "There are no applicants matching the selected filter."}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
      {/* Attachment Dialog */}
      <Dialog open={isAttachmentDialogOpen} onOpenChange={setIsAttachmentDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Attachments - {selectedApplicant?.name}</DialogTitle>
            <DialogDescription>{selectedAttachment?.file_name}</DialogDescription>
          </DialogHeader>
          <iframe src={selectedAttachment?.file_url} className="w-full h-[60vh]" title="attachment" />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAttachmentDialogOpen(false)}>
              Close
            </Button>
            <Button onClick={() => {
              if (selectedAttachment) {
                downloadFile(selectedAttachment?.file_url, selectedAttachment?.file_name)
              }
            }} type="button">
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Contact Dialog */}
      <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Contact {selectedApplicant?.name}</DialogTitle>
            <DialogDescription>Send a message to {selectedApplicant?.email}</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                placeholder="Type your message here..."
                value={contactMessage}
                onChange={(e) => setContactMessage(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>
            <div className="text-sm text-muted-foreground">This message will be sent to {selectedApplicant?.email}</div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsContactDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendMessage} disabled={!contactMessage.trim()}>
              Send Message
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
