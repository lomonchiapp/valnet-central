export enum UserRole {
  ADMIN = 'admin',
  INVENTORIST = 'inventorist',
  RECEPTIONIST = 'receptionist',
  CASHIER = 'cashier',
  ACCOUNTANT = 'accountant',
  SUPERVISOR = 'supervisor',
  PATIENT = 'patient',
  DOCTOR = 'doctor',
}

export enum ServicePricingType {
  FIXED = 'fijo',
  CALCULATED = 'calculado',
}

export enum InvoiceStatus {
  PENDING = 'pendiente',
  PAID = 'pagado',
  OVERDUE = 'vencido',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum UserGender {
  MALE = 'male',
  FEMALE = 'female',
}

export enum ServiceAssignmentStatus {
  PENDING = 'pendiente',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

export enum RecurringInvoiceFrequency {
  MONTHLY = 'monthly',
  WEEKLY = 'weekly',
  ANNUALLY = 'annually',
}

export enum ItemType {
  MEDICINE = 'Medicamento',
  SUPPLIES = 'Suministros',
  EQUIPMENT = 'Equipo',
  DESPENSES = 'Despensa (Alimentos)',
}

export enum InventoryMovementType {
  INPUT = 'entrada',
  OUTPUT = 'salida',
}

export enum AccAccountType {
  ASSETS = 'assets',
  LIABILITIES = 'liabilities',
  INCOME = 'income',
  EXPENSES = 'expenses',
}

export enum MeasurementUnit {
  // Medicamentos
  TABLET = 'tableta',
  CAPSULE = 'cápsula',
  PILL = 'píldora',
  AMPOULE = 'ampolla',
  VIAL = 'vial',
  BOTTLE = 'frasco',
  DROPS = 'gotas',
  INHALER = 'inhalador',
  SYRINGE = 'jeringa',
  
  // Suministros médicos
  PIECE = 'pieza',
  BOX = 'caja',
  PACK = 'paquete',
  SET = 'set',
  PAIR = 'par',
  ROLL = 'rollo',
  BAG = 'bolsa',
  KIT = 'kit',
  
  // Medidas básicas
  UNIT = 'unidad',
  GRAM = 'gramo',
  MILLILITER = 'mililitro',
  METER = 'metro',
  CENTIMETER = 'centímetro',
}

export enum PaymentStatus {
  PENDING = 'pendiente',
  CONFIRMED = 'confirmado',
}

export enum RecurringInvoiceStatus {
  OVERDUE = 'vencida',
  PAID = 'pagada',
  PENDING = 'pendiente',
}

export enum PaymentMethod {
  CASH = 'cash',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  TRANSFER = 'transfer',
  CHECK = 'check',
}

export enum CashRegisterStatus {
  AVAILABLE = 'available',
  IN_USE = 'in_use',
  MAINTENANCE = 'maintenance',
}

export enum CashMovementType {
  OPEN = 'open',
  CLOSE = 'close',
  INCOME = 'income',
  EXPENSE = 'expense',
  PAYMENT = 'payment',
}

export enum CashMovementStatus {
  COMPLETED = 'completed',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
}

export enum CashSessionStatus {
  ACTIVE = 'active',
  CLOSED = 'closed',
}

export enum AppointmentStatus {
  CONFIRMED = 'confirmed',
  PENDING = 'pending',
  CANCELLED = 'cancelled',
}

export enum AppointmentType {
  INITIAL = 'initial',
  FOLLOW_UP = 'follow-up',
  CONSULTATION = 'consultation',
}

export enum TicketStatus {
  PENDING = 'pending',
  BILLING = 'billing',
  IN_QUEUE = 'in_queue',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

export enum RecurringExpenseFrequency {
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
}

export enum RecurringExpenseStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export enum ExpenseStatus {
  PAID = 'paid',
  UNPAID = 'unpaid',
}

export enum ItemPackagingType {
  SINGLE = 'SINGLE',    // Unidad
  PACKAGE = 'PACKAGE',  // Paquete
  BOX = 'BOX',         // Caja
  COMPLEX = 'COMPLEX',  // Complejo (Cajas con paquetes)
}