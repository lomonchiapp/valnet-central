import { ServiceCategory } from "@/types"
import { database } from "@/firebase"
import { collection, getDocs } from "firebase/firestore"

export const getServiceCategories = async (): Promise<ServiceCategory[]> => {
    const serviceCategoriesRef = collection(database, 'serviceCategories')
    const serviceCategoriesSnapshot = await getDocs(serviceCategoriesRef)
    return serviceCategoriesSnapshot.docs.map((doc) => doc.data() as ServiceCategory)
}