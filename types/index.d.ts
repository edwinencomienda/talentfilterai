interface Applicant {
    id: string | number
    name: string
    email: string,
    [key: string]: any
}

interface Job {
    id: string | number
    title: string
    description: string
    applicantCount: number
    createdAt: string
    status: "active" | "closed" | "pending",
    applications?: Applicant[]
}