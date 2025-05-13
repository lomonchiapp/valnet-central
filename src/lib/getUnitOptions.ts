import { ItemType, MeasurementUnit } from "@/types/enums"

export const getUnitOptions = (itemType: ItemType): MeasurementUnit[] => {
    switch (itemType) {
      case ItemType.MEDICINE:
        return [
          MeasurementUnit.TABLET,
          MeasurementUnit.CAPSULE,
          MeasurementUnit.PILL,
          MeasurementUnit.AMPOULE,
          MeasurementUnit.VIAL,
          MeasurementUnit.BOTTLE,
          MeasurementUnit.DROPS,
          MeasurementUnit.INHALER,
          MeasurementUnit.SYRINGE,
        ]
      case ItemType.SUPPLIES:
        return [
          MeasurementUnit.UNIT,
          MeasurementUnit.PACK,
          MeasurementUnit.SET,
          MeasurementUnit.PAIR,
          MeasurementUnit.ROLL,
          MeasurementUnit.BAG,
          MeasurementUnit.KIT,
          MeasurementUnit.METER,
          MeasurementUnit.CENTIMETER,
        ]
      case ItemType.EQUIPMENT:
        return [MeasurementUnit.UNIT, MeasurementUnit.PIECE, MeasurementUnit.SET]
      default:
        return [MeasurementUnit.UNIT]
    }
  }