"use client"

import { createJob, deleteJob, generateJobQualifications, getJobsList, updateJob } from "@/actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Calendar, CheckCircle, Clock, Edit, Plus, Search, Trash, Users, XCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

const mockJobs: Job[] = [
  {
    id: "1",
    title: "Frontend Developer",
    description: "React and TypeScript developer needed",
    applicantCount: 12,
    createdAt: "2024-01-15",
    status: "active",
  },
  {
    id: "2",
    title: "Backend Engineer",
    description: "Node.js and PostgreSQL experience required",
    applicantCount: 8,
    createdAt: "2024-01-10",
    status: "active",
  },
  {
    id: "3",
    title: "UI/UX Designer",
    description: "Design user interfaces and experiences",
    applicantCount: 15,
    createdAt: "2024-01-08",
    status: "closed",
  },
  {
    id: "4",
    title: "DevOps Engineer",
    description: "AWS and Docker expertise needed",
    applicantCount: 5,
    createdAt: "2024-01-05",
    status: "pending",
  },
]

const getStatusIcon = (status: string) => {
  switch (status) {
    case "active":
      return <CheckCircle className="h-4 w-4" />
    case "closed":
      return <XCircle className="h-4 w-4" />
    case "pending":
      return <Clock className="h-4 w-4" />
    default:
      return null
  }
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case "active":
      return "default"
    case "closed":
      return "destructive"
    case "pending":
      return "secondary"
    default:
      return "default"
  }
}

export function JobsList() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [newJob, setNewJob] = useState({ title: "", description: "", status: "pending" })
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)
  const [editJob, setEditJob] = useState({ title: "", description: "", status: "pending" })
  const [searchQuery, setSearchQuery] = useState("")
  const [isFormLoading, setIsFormLoading] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const handleGetJobs = async () => {
    setIsLoading(true)
    let res = await getJobsList()
    console.log(res)
    setJobs(
      res.map((job) => ({
        id: job.id,
        title: job.title,
        description: job.description,
        applicantCount: job.applications.length,
        createdAt: job.created_at,
        status: job.status as Job['status'],
      }))
    )
    setIsLoading(false)
  }

  useEffect(() => {
    handleGetJobs()
  }, [])

  const filteredJobs = jobs.filter(
    (job) =>
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleCreateJob = async () => {
    if (newJob.title && newJob.description && newJob.status) {
      setIsFormLoading(true)
      const job = await createJob(newJob.title, newJob.description, newJob.status)
      await generateJobQualifications(job.id)
      await handleGetJobs()
      setIsDialogOpen(false)
      setNewJob({ title: "", description: "", status: "pending" })
      setIsFormLoading(false)
    }
  }

  const handleEditJob = (job: Job) => {
    setEditingJob(job)
    setEditJob(job)
    setIsEditDialogOpen(true)
  }

  const handleUpdateJob = async () => {
    if (editingJob && editJob.title && editJob.description && editJob.status) {
      await updateJob(editingJob.id as number, editJob.title, editJob.description, editJob.status)
      await handleGetJobs()
      setIsEditDialogOpen(false)
      setEditJob({ title: "", description: "", status: "pending" })
      setEditingJob(null)
    }
  }

  const handleDeleteJob = async (id: number) => {
    if (!confirm("Are you sure you want to delete this job?")) return
    await deleteJob(id)
    await handleGetJobs()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Jobs</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Job
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Create New Job</DialogTitle>
              <DialogDescription>Add a new job posting to attract candidates.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Job Title</Label>
                <Input
                  id="title"
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  placeholder="e.g. Frontend Developer"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  placeholder="Describe the job requirements and responsibilities..."
                  rows={4}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={newJob.status}
                  onValueChange={(value) => setNewJob({ ...newJob, status: value as Job['status'] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>

            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button disabled={isFormLoading} onClick={handleCreateJob}>Create Job</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Job</DialogTitle>
              <DialogDescription>Update the job posting details.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Job Title</Label>
                <Input
                  id="edit-title"
                  value={editJob.title}
                  onChange={(e) => setEditJob({ ...editJob, title: e.target.value })}
                  placeholder="e.g. Frontend Developer"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={editJob.description}
                  onChange={(e) => setEditJob({ ...editJob, description: e.target.value })}
                  placeholder="Describe the job requirements and responsibilities..."
                  rows={4}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={editJob.status}
                  onValueChange={(value) => setEditJob({ ...editJob, status: value as Job['status'] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateJob}>Update Job</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search jobs by title or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Applicants</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <span className="animate-spin inline-block rounded-full border-2 border-gray-300 border-t-transparent h-5 w-5 align-middle" />
                      Loading...
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredJobs.map((job) => (
                  <TableRow key={job.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <Link href={`/jobs/${job.id}/applicants`} className="block">
                        <div>
                          <div className="font-medium">{job.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">{job.description}</div>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/jobs/${job.id}/applicants`} className="block">
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{job.applicantCount}</span>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/jobs/${job.id}/applicants`} className="block">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/jobs/${job.id}/applicants`} className="block">
                        <Badge variant={getStatusVariant(job.status)} className="flex items-center gap-1 w-fit">
                          {getStatusIcon(job.status)}
                          {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                        </Badge>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            handleEditJob(job)
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            handleDeleteJob(job.id as number)
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
              {filteredJobs.length === 0 && !isLoading && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="text-muted-foreground">
                      {searchQuery ? `No jobs found matching "${searchQuery}"` : "No jobs found"}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
