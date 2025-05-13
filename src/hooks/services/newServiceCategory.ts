import { ServiceCategory } from '@/types'
import { database } from '@/firebase'
import { collection, addDoc, updateDoc } from 'firebase/firestore'

export const newServiceCategory = async (serviceCategory: ServiceCategory) => {
  const serviceCategoryRef = collection(database, 'serviceCategories')
  const newServiceCategory = await addDoc(serviceCategoryRef, serviceCategory)
  updateDoc(newServiceCategory, {
    id: newServiceCategory.id
  })
  return newServiceCategory
}