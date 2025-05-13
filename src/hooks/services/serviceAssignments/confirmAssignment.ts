import { ServiceAssignment } from "@/types"
import { ServiceAssignmentStatus } from "@/types/enums"
import { updateDoc, doc } from "firebase/firestore"
import { database } from "@/firebase"

export const confirmAssignment = async (assignment: ServiceAssignment) => {
  const assignmentRef = doc(database, 'serviceAssignments', assignment.id)
  await updateDoc(assignmentRef, {
    status: ServiceAssignmentStatus.ACTIVE
  })
}