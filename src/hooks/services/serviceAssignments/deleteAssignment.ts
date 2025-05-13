import { deleteDoc, doc } from "firebase/firestore"
import { database } from "@/firebase"
import { ServiceAssignment } from "@/types"

export const deleteAssignment = async (assignment: ServiceAssignment) => {
  const assignmentRef = doc(database, 'serviceAssignments', assignment.id)
  await deleteDoc(assignmentRef)
}