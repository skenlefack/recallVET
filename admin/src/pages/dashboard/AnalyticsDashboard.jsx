import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Row, Col, Card, Form, Button, Table, Badge } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { api, getToken } from '../../services/api'

const COLORS = ['#2d6a4f', '#40916c', '#52b788', '#74c69d', '#95d5b2', '#b7e4c7', '#d8f3dc', '#1b4332', '#081c15', '#344e41']
const PIE_COLORS = ['#2d6a4f', '#52b788', '#d62828', '#f77f00']

export default function AnalyticsDashboard() {
  const { t } = useTranslation()
  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date()
    d.setMonth(d.getMonth() - 11)
    return d.toISOString().split('T')[0].slice(0, 7) + '-01'
  })
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0])
  const [revenue, setRevenue] = useState([])
  const [encountersByVet, setEncountersByVet] = useState([])
  const [appointmentStats, setAppointmentStats] = useState(null)
  const [topProducts, setTopProducts] = useState([])
  const [vaccinationStats, setVaccinationStats] = useState([])
  const [stockAlerts, setStockAlerts] = useState({ below_reorder: [], expiring_soon: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    const token = getToken()
    const params = `date_from=${dateFrom}&date_to=${dateTo}`

    const [revRes, encRes, apptRes, prodRes, vaccRes, stockRes] = await Promise.all([
      api.get(`/v1/analytics/revenue?period=monthly&${params}`, token),
      api.get(`/v1/analytics/encounters-by-vet?${params}`, token),
      api.get('/v1/analytics/appointments-stats', token),
      api.get('/v1/analytics/top-products', token),
      api.get('/v1/analytics/vaccination-stats', token),
      api.get('/v1/analytics/stock-alerts', token)
    ])

    if (revRes.success) setRevenue(revRes.data || [])
    if (encRes.success) setEncountersByVet(encRes.data || [])
    if (apptRes.success) setAppointmentStats(apptRes.data || null)
    if (prodRes.success) setTopProducts(prodRes.data || [])
    if (vaccRes.success) setVaccinationStats(vaccRes.data || [])
    if (stockRes.success) setStockAlerts(stockRes.data || { below_reorder: [], expiring_soon: [] })
    setLoading(false)
  }

  const handleFilter = (e) => {
    e.preventDefault()
    loadData()
  }

  const pieData = appointmentStats ? [
    { name: t('analytics.scheduled'), value: appointmentStats.scheduled || 0 },
    { name: t('analytics.completed'), value: appointmentStats.completed || 0 },
    { name: t('analytics.cancelled'), value: appointmentStats.cancelled || 0 },
    { name: t('analytics.noShow'), value: appointmentStats.no_show || 0 }
  ].filter(d => d.value > 0) : []

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center py-5">
        <div className="spinner-border text-success" />
      </div>
    )
  }

  return (
    <div className="p-3">
      <div className="rv-breadcrumb">
        <Link to="/dashboard">Accueil</Link>
        <span className="separator"><i className="fas fa-chevron-right" /></span>
        <span>Analytiques</span>
      </div>
      <div className="page-title-bar">
        <h4><i className="fas fa-chart-bar me-2" />{t('analytics.title')}</h4>
      </div>

      {/* Date filter */}
      <Card className="mb-3">
        <Card.Body>
          <Form onSubmit={handleFilter} className="d-flex align-items-end gap-3 flex-wrap">
            <Form.Group>
              <Form.Label className="small mb-1">{t('analytics.dateFrom')}</Form.Label>
              <Form.Control type="date" size="sm" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            </Form.Group>
            <Form.Group>
              <Form.Label className="small mb-1">{t('analytics.dateTo')}</Form.Label>
              <Form.Control type="date" size="sm" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            </Form.Group>
            <Button type="submit" variant="success" size="sm">{t('analytics.filter')}</Button>
          </Form>
        </Card.Body>
      </Card>

      <Row className="g-3">
        {/* Revenue trend */}
        <Col xs={12} lg={8}>
          <Card className="h-100">
            <Card.Header className="bg-white fw-semibold">{t('analytics.revenueTrend')}</Card.Header>
            <Card.Body>
              {revenue.length === 0 ? (
                <p className="text-muted text-center py-4">{t('analytics.noData')}</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total_revenue" name={t('analytics.totalRevenue')} stroke="#2d6a4f" strokeWidth={2} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="invoice_count" name={t('analytics.invoiceCount')} stroke="#95d5b2" strokeWidth={2} dot={{ r: 3 }} yAxisId={0} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Appointment status pie */}
        <Col xs={12} lg={4}>
          <Card className="h-100">
            <Card.Header className="bg-white fw-semibold">{t('analytics.appointmentStatus')}</Card.Header>
            <Card.Body>
              {pieData.length === 0 ? (
                <p className="text-muted text-center py-4">{t('analytics.noData')}</p>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90}
                      paddingAngle={3} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Encounters by vet */}
        <Col xs={12} lg={6}>
          <Card className="h-100">
            <Card.Header className="bg-white fw-semibold">{t('analytics.encountersByVet')}</Card.Header>
            <Card.Body>
              {encountersByVet.length === 0 ? (
                <p className="text-muted text-center py-4">{t('analytics.noData')}</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={encountersByVet} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" tick={{ fontSize: 11 }} />
                    <YAxis dataKey="vet_name" type="category" width={100} tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="#2d6a4f" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Top products */}
        <Col xs={12} lg={6}>
          <Card className="h-100">
            <Card.Header className="bg-white fw-semibold">{t('analytics.topProducts')}</Card.Header>
            <Card.Body>
              {topProducts.length === 0 ? (
                <p className="text-muted text-center py-4">{t('analytics.noData')}</p>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={topProducts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="product_name" tick={{ fontSize: 10, angle: -30 }} height={60} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="total_quantity" name={t('analytics.quantity')} fill="#40916c" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Vaccination trend */}
        <Col xs={12}>
          <Card>
            <Card.Header className="bg-white fw-semibold">{t('analytics.vaccinationTrend')}</Card.Header>
            <Card.Body>
              {vaccinationStats.length === 0 ? (
                <p className="text-muted text-center py-4">{t('analytics.noData')}</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={vaccinationStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="count" name={t('nav.vaccinations')} fill="#52b788" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Stock alerts */}
        <Col xs={12} lg={6}>
          <Card>
            <Card.Header className="bg-white fw-semibold">
              {t('analytics.belowReorder')}
              {stockAlerts.below_reorder.length > 0 && (
                <Badge bg="danger" className="ms-2">{stockAlerts.below_reorder.length}</Badge>
              )}
            </Card.Header>
            <Card.Body className="p-0">
              {stockAlerts.below_reorder.length === 0 ? (
                <p className="text-muted text-center py-3">{t('analytics.noData')}</p>
              ) : (
                <Table size="sm" hover className="mb-0">
                  <thead>
                    <tr>
                      <th>{t('analytics.product')}</th>
                      <th>{t('analytics.sku')}</th>
                      <th className="text-end">{t('analytics.onHand')}</th>
                      <th className="text-end">{t('analytics.reorderLevel')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockAlerts.below_reorder.map((item, i) => (
                      <tr key={i}>
                        <td>{item.name}</td>
                        <td className="text-muted">{item.sku}</td>
                        <td className="text-end">
                          <Badge bg={item.total_on_hand === 0 ? 'danger' : 'warning'} text={item.total_on_hand === 0 ? undefined : 'dark'}>
                            {item.total_on_hand}
                          </Badge>
                        </td>
                        <td className="text-end">{item.reorder_level}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col xs={12} lg={6}>
          <Card>
            <Card.Header className="bg-white fw-semibold">
              {t('analytics.expiringSoon')}
              {stockAlerts.expiring_soon.length > 0 && (
                <Badge bg="warning" text="dark" className="ms-2">{stockAlerts.expiring_soon.length}</Badge>
              )}
            </Card.Header>
            <Card.Body className="p-0">
              {stockAlerts.expiring_soon.length === 0 ? (
                <p className="text-muted text-center py-3">{t('analytics.noData')}</p>
              ) : (
                <Table size="sm" hover className="mb-0">
                  <thead>
                    <tr>
                      <th>{t('analytics.product')}</th>
                      <th>{t('analytics.lotNumber')}</th>
                      <th>{t('analytics.expiryDate')}</th>
                      <th className="text-end">{t('analytics.quantity')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockAlerts.expiring_soon.map((item, i) => (
                      <tr key={i}>
                        <td>{item.product_name}</td>
                        <td className="text-muted">{item.lot_number}</td>
                        <td>
                          <Badge bg="warning" text="dark">
                            {item.expiry_date ? new Date(item.expiry_date).toLocaleDateString() : ''}
                          </Badge>
                        </td>
                        <td className="text-end">{item.quantity_on_hand}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
