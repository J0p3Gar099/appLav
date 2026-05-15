/**
 * MODELS / cost.model.ts
 * Costos operativos — solo visibles para admin.
 */
export type CostCategory =
  | 'DETERGENTE'
  | 'AGUA'
  | 'LUZ'
  | 'MANTENIMIENTO'
  | 'NOMINA'
  | 'RENTA'
  | 'TRANSPORTE'
  | 'INSUMOS'
  | 'OTRO'

export interface OperationalCost {
  id: string
  description: string
  amount: number
  category: CostCategory
  date: string        // ISO — para filtrar por día/semana/mes
  createdBy: string   // userId
  createdAt: string
}
