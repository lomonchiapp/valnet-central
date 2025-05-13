
export interface Task {
    id: string
    name: string
    priority: string
    patientId?: string
    assignedTo: string
    assignedBy: string
    description: string
    status: string
}