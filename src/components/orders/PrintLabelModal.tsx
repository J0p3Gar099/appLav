/**
 * PrintLabelModal.tsx
 *
 * Modal que muestra una vista previa de la etiqueta y permite imprimirla.
 * La etiqueta se diseña para impresoras térmicas 58mm/80mm o papel carta.
 *
 * Estrategia de impresión:
 *   - Se inyecta un <style> con @media print que oculta TODO menos #print-label
 *   - window.print() dispara el diálogo del sistema operativo
 *   - Al cerrar el diálogo el CSS se revierte automáticamente
 *
 * Sin dependencias extra — solo React + Framer Motion (ya instalado).
 */
import { useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Order } from '@/models/order.model'

// ── helpers ───────────────────────────────────────────────────

const SERVICE_LABELS: Record<string, string> = {
  LAVADO:   'Lavado',
  SECADO:   'Secado',
  COMPLETO: 'Lavado + Secado',
  ENCARGO:  'Por encargo',
}

const STATUS_ES: Record<string, string> = {
  CREADO:    'Creado',
  LAVANDO:   'En proceso',
  LISTO:     '✓ Listo para recoger',
  ENTREGADO: 'Entregado',
}

const DELIVERY_ES: Record<string, string> = {
  SUCURSAL:  '🏪 Recoger en sucursal',
  DOMICILIO: '🛵 Entrega a domicilio',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

// ID corto para mostrar en la etiqueta (últimos 6 chars del UUID)
function shortId(id: string) {
  return id.replace(/-/g, '').slice(-6).toUpperCase()
}

// ── Etiqueta pura (también se usa en el print) ────────────────

interface LabelProps { order: Order; preview?: boolean }

const Label = ({ order, preview }: LabelProps) => {
  const sid = shortId(order.id)

  return (
    <div
      id="print-label"
      style={{
        fontFamily: "'Courier New', Courier, monospace",
        width: preview ? '100%' : '80mm',
        maxWidth: preview ? '340px' : '80mm',
        background: '#fff',
        color: '#000',
        padding: '10px 12px',
        borderRadius: preview ? '8px' : '0',
        boxSizing: 'border-box',
      }}
    >
      {/* ── Cabecera ── */}
      <div style={{ textAlign: 'center', borderBottom: '1.5px solid #000', paddingBottom: 8, marginBottom: 8 }}>
        <p style={{ fontSize: 18, fontWeight: 700, letterSpacing: 2, margin: 0 }}>LAVANDERÍA</p>
        <p style={{ fontSize: 11, margin: '2px 0 0', color: '#555' }}>
          {formatDate(order.createdAt)}
        </p>
      </div>

      {/* ── ID del pedido grande ── */}
      <div style={{ textAlign: 'center', margin: '8px 0' }}>
        <p style={{ fontSize: 10, letterSpacing: 1, color: '#666', margin: 0 }}>PEDIDO</p>
        <p style={{ fontSize: 28, fontWeight: 700, letterSpacing: 4, margin: '0', lineHeight: 1.1 }}>
          #{sid}
        </p>
      </div>

      {/* ── Cliente ── */}
      <div style={{ borderTop: '1px dashed #ccc', borderBottom: '1px dashed #ccc', padding: '7px 0', margin: '6px 0' }}>
        <p style={{ fontSize: 10, color: '#666', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: 1 }}>Cliente</p>
        <p style={{ fontSize: 15, fontWeight: 700, margin: 0, wordBreak: 'break-word' }}>
          {order.customerName}
        </p>
      </div>

      {/* ── Detalles ── */}
      <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse', margin: '6px 0' }}>
        <tbody>
          <tr>
            <td style={{ color: '#555', paddingBottom: 3, width: '45%' }}>Servicio</td>
            <td style={{ fontWeight: 600, paddingBottom: 3 }}>{SERVICE_LABELS[order.serviceType]}</td>
          </tr>
          {order.weightKg && (
            <tr>
              <td style={{ color: '#555', paddingBottom: 3 }}>Peso</td>
              <td style={{ fontWeight: 600, paddingBottom: 3 }}>{order.weightKg} kg</td>
            </tr>
          )}
          <tr>
            <td style={{ color: '#555', paddingBottom: 3 }}>Entrega</td>
            <td style={{ fontWeight: 600, paddingBottom: 3 }}>{DELIVERY_ES[order.deliveryType]}</td>
          </tr>
          <tr>
            <td style={{ color: '#555', paddingBottom: 3 }}>Estado</td>
            <td style={{ fontWeight: 600, paddingBottom: 3 }}>{STATUS_ES[order.status]}</td>
          </tr>
          <tr>
            <td style={{ color: '#555' }}>Pago</td>
            <td style={{ fontWeight: 600 }}>
              {order.isPaid
                ? `✓ Pagado (${order.paymentMethod ?? ''})`
                : '⏳ Pendiente'}
            </td>
          </tr>
        </tbody>
      </table>

      {/* ── Notas especiales ── */}
      {order.notes && (
        <div style={{
          background: '#f5f5f5',
          border: '1px solid #ddd',
          borderRadius: 4,
          padding: '5px 8px',
          margin: '6px 0',
          fontSize: 11,
        }}>
          <p style={{ margin: '0 0 2px', fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5, color: '#555' }}>
            ⚠ Instrucciones especiales
          </p>
          <p style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{order.notes}</p>
        </div>
      )}

      {/* ── Código de barras visual (texto) ── */}
      <div style={{ textAlign: 'center', marginTop: 10, borderTop: '1px dashed #ccc', paddingTop: 8 }}>
        {/* Barras decorativas */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 1, height: 28, alignItems: 'flex-end', marginBottom: 3 }}>
          {sid.split('').flatMap((ch, ci) =>
            Array.from({ length: 3 }, (_, bi) => (
              <div
                key={`${ci}-${bi}`}
                style={{
                  width: bi === 1 ? 3 : 1.5,
                  height: bi === 1 ? 28 : 18 + ((ch.charCodeAt(0) + bi) % 10),
                  background: '#000',
                  borderRadius: 0.5,
                }}
              />
            ))
          )}
        </div>
        <p style={{ fontSize: 9, letterSpacing: 3, margin: 0, color: '#444' }}>{sid}</p>
      </div>

      {/* ── Pie ── */}
      <p style={{ textAlign: 'center', fontSize: 9, color: '#aaa', margin: '8px 0 0' }}>
        Gracias por su preferencia
      </p>
    </div>
  )
}

// ── Modal principal ───────────────────────────────────────────

interface Props {
  order: Order
  onClose: () => void
}

export const PrintLabelModal = ({ order, onClose }: Props) => {
  // Inyectar CSS de impresión al montar, limpiar al desmontar
  useEffect(() => {
    const style = document.createElement('style')
    style.id = '__print-label-style'
    style.textContent = `
      @media print {
        body > *:not(#__print-portal) { display: none !important; }
        #__print-portal > *:not(#print-label) { display: none !important; }
        #print-label {
          display: block !important;
          position: fixed !important;
          top: 0 !important; left: 0 !important;
          width: 80mm !important;
          margin: 0 !important;
          padding: 10px 12px !important;
          border-radius: 0 !important;
          box-shadow: none !important;
        }
        @page { margin: 0; size: 80mm auto; }
      }
    `
    document.head.appendChild(style)
    return () => { document.getElementById('__print-label-style')?.remove() }
  }, [])

  const handlePrint = () => {
    // Mover temporalmente el label al body para que @media print funcione
    const portal = document.createElement('div')
    portal.id = '__print-portal'
    const label = document.getElementById('print-label')
    if (!label) { window.print(); return }

    const clone = label.cloneNode(true) as HTMLElement
    clone.id = 'print-label'
    portal.appendChild(clone)
    document.body.appendChild(portal)

    window.print()
    document.body.removeChild(portal)
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <motion.div
        className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden flex flex-col"
        initial={{ scale: 0.93, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: 16 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div>
            <h2 className="font-semibold text-white text-sm">Etiqueta del pedido</h2>
            <p className="text-xs text-slate-500 mt-0.5">Vista previa de impresión</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
        </div>

        {/* Preview */}
        <div className="p-5 bg-slate-950 flex justify-center">
          {/* Sombra de papel */}
          <div className="shadow-[0_4px_24px_rgba(0,0,0,0.6)] rounded-lg overflow-hidden">
            <Label order={order} preview />
          </div>
        </div>

        {/* Tip impresora térmica */}
        <div className="px-5 py-3 bg-indigo-500/5 border-t border-indigo-500/10">
          <p className="text-xs text-slate-500">
            💡 Optimizada para <span className="text-slate-400">impresora térmica 80mm</span> o impresión en papel carta recortada.
          </p>
        </div>

        {/* Acciones */}
        <div className="px-5 py-4 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-400 text-sm hover:bg-slate-800 transition-colors"
          >
            Cerrar
          </button>
          <motion.button
            onClick={handlePrint}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
          >
            <span>🖨️</span> Imprimir
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
