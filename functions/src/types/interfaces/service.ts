import { ServicePricingType } from "../enums"

export interface ServiceCategory {
    id: string
    name: string
}

export interface Service {
    id: string
    category: ServiceCategory
    name: string
    basePrice?: number
    description: string
    pricingType: ServicePricingType
    updatedAt: string
    createdAt: string
}