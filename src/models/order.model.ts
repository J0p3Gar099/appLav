export type ServiceType   = 'LAVADO' | 'SECADO' | 'COMPLETO' | 'ENCARGO'
export type OrderStatus   = 'CREADO' | 'LAVANDO' | 'LISTO' | 'ENTREGADO'
export type PaymentMethod = 'EFECTIVO' | 'TRANSFERENCIA' | 'TARJETA'
export type DeliveryType  = 'SUCURSAL' | 'DOMICILIO'

/** Nivel de urgencia calculado a partir de promisedDate */
export type UrgencyLevel = 'ok' | 'soon' | 'late' | 'none'

export interface Order {
  id: string
  customerId: string
  customerName: string
  serviceType: ServiceType
  weightKg?: number
  price: number
  orderCost?: number
  status: OrderStatus
  isPaid: boolean
  paymentMethod?: PaymentMethod
  deliveryType: DeliveryType
  notes?: string
  promisedDate?: string   // ISO date string — fecha prometida de entrega
  readyAt?: string        // ISO date string — cuándo pasó a estado LISTO (para recordatorios)
  createdBy: string
  createdAt: string
  paidBy?: string      // userId de quien marcó como pagado
  paidByName?: string  // nombre para mostrar
  paidAt?: string      // ISO — cuándo se marcó como pagado
}
