/**
 * App.tsx — Árbol de rutas.
 *
 * [NOTIFICACIONES] Se solicita permiso de notificaciones al montar.
 * [CALENDARIO] Nueva ruta /calendar → CalendarPage
 * [HISTORIAL]  Nueva ruta /customers/:customerId/history → CustomerHistoryPage
 * [ASISTENCIA] Nueva ruta /attendance → AttendancePage (solo admin)
 * [ESTADO LOG] Nueva ruta /orders/:orderId/history → OrderStatusHistoryPage (solo admin)
 */
import { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { UserProvider }           from '@/context/UserContext'
import { AttendanceProvider }     from '@/context/AttendanceContext'
import { AuthProvider }           from '@/context/AuthContext'
import { CustomerProvider }       from '@/context/CustomerContext'
import { OrderProvider }          from '@/context/OrderContext'
import { CostProvider }           from '@/context/CostContext'
import { StatusHistoryProvider }  from '@/context/StatusHistoryContext'
import { PrivateRoute }           from '@/routes/PrivateRoute'
import { PublicRoute }            from '@/routes/PublicRoute'
import { AppLayout }              from '@/components/layout/AppLayout'
import { LoginPage }              from '@/pages/LoginPage'
import { DashboardPage }          from '@/pages/DashboardPage'
import { OrdersPage }             from '@/pages/OrdersPage'
import { CalendarPage }           from '@/pages/CalendarPage'
import { CustomersPage }          from '@/pages/CustomersPage'
import { CustomerHistoryPage }    from '@/pages/CustomerHistoryPage'
import { CostsPage }              from '@/pages/CostsPage'
import { EmployeesPage }          from '@/pages/EmployeesPage'
import { AttendancePage }         from '@/pages/AttendancePage'
import { OrderStatusHistoryPage } from '@/pages/OrderStatusHistoryPage'
import { ForbiddenPage }          from '@/pages/ForbiddenPage'
import { NotFoundPage }           from '@/pages/NotFoundPage'
import { requestNotifyPermission } from '@/utils/notify.utils'

export default function App() {
  useEffect(() => { requestNotifyPermission() }, [])

  return (
    <UserProvider>
      <AttendanceProvider>
        <AuthProvider>
          <CustomerProvider>
            <OrderProvider>
              <CostProvider>
                <StatusHistoryProvider>
                  <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />

                    <Route element={<PublicRoute />}>
                      <Route path="/login" element={<LoginPage />} />
                    </Route>

                    <Route element={<PrivateRoute />}>
                      <Route element={<AppLayout />}>
                        <Route path="/dashboard"  element={<DashboardPage />} />
                        <Route path="/orders"     element={<OrdersPage />} />
                        <Route path="/calendar"   element={<CalendarPage />} />
                        <Route path="/customers"  element={<CustomersPage />} />
                        <Route path="/customers/:customerId/history" element={<CustomerHistoryPage />} />

                        <Route element={<PrivateRoute requiredRole="admin" />}>
                          <Route path="/costs"     element={<CostsPage />} />
                          <Route path="/employees" element={<EmployeesPage />} />
                          <Route path="/attendance" element={<AttendancePage />} />
                          <Route path="/orders/:orderId/history" element={<OrderStatusHistoryPage />} />
                        </Route>
                      </Route>
                    </Route>

                    <Route path="/403" element={<ForbiddenPage />} />
                    <Route path="*"   element={<NotFoundPage />} />
                  </Routes>
                </StatusHistoryProvider>
              </CostProvider>
            </OrderProvider>
          </CustomerProvider>
        </AuthProvider>
      </AttendanceProvider>
    </UserProvider>
  )
}
