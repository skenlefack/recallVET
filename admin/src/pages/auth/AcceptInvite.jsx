import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { Form, Card, Alert, Button, Spinner } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import api from '../../services/api'

export default function AcceptInvite() {
  const { t } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')

  const [invitation, setInvitation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  useEffect(() => {
    if (!token) {
      setError(t('team.invalidToken'))
      setLoading(false)
      return
    }
    // Validate token by fetching invitation info
    api.post('/auth/validate-invite', { token }).then(res => {
      if (res.success && res.data) {
        setInvitation(res.data)
        setForm(prev => ({ ...prev, email: res.data.email }))
      }
      // Even if validation endpoint doesn't exist, allow the form
      // The email from the invitation will be validated on submit
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [token, t])

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError(t('team.passwordMismatch'))
      return
    }

    if (form.password.length < 8) {
      setError(t('team.passwordTooShort'))
      return
    }

    setSubmitting(true)
    const res = await api.post('/auth/accept-invite', {
      token,
      email: form.email,
      password: form.password,
      first_name: form.first_name,
      last_name: form.last_name
    })
    setSubmitting(false)

    if (res.success) {
      setSuccess(true)
      setTimeout(() => navigate('/login'), 3000)
    } else {
      setError(res.message || t('team.acceptError'))
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
        <Spinner animation="border" variant="success" />
      </div>
    )
  }

  if (!token) {
    return (
      <div className="container" style={{ maxWidth: 500, marginTop: 80 }}>
        <Alert variant="danger">{t('team.invalidToken')}</Alert>
        <Link to="/login">{t('auth.signIn')}</Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="container" style={{ maxWidth: 500, marginTop: 80 }}>
        <Alert variant="success">
          <Alert.Heading>{t('team.inviteAccepted')}</Alert.Heading>
          <p>{t('team.redirectToLogin')}</p>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container" style={{ maxWidth: 500, marginTop: 80 }}>
      <Card>
        <Card.Header className="bg-success text-white text-center">
          <h5 className="mb-0">{t('team.acceptInvitation')}</h5>
          {invitation && (
            <small>{t('team.joinTeam', { team: invitation.tenant_name })}</small>
          )}
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>{t('auth.firstName')}</Form.Label>
              <Form.Control type="text" name="first_name" required
                value={form.first_name} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('auth.lastName')}</Form.Label>
              <Form.Control type="text" name="last_name" required
                value={form.last_name} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('auth.email')}</Form.Label>
              <Form.Control type="email" name="email" required
                value={form.email} onChange={handleChange}
                readOnly={!!invitation} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('auth.password')}</Form.Label>
              <Form.Control type="password" name="password" required
                minLength={8} value={form.password} onChange={handleChange} />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('auth.confirmPassword')}</Form.Label>
              <Form.Control type="password" name="confirmPassword" required
                minLength={8} value={form.confirmPassword} onChange={handleChange} />
            </Form.Group>

            <div className="d-grid">
              <Button variant="success" type="submit" disabled={submitting}>
                {submitting ? <Spinner size="sm" animation="border" /> : t('team.acceptAndJoin')}
              </Button>
            </div>
          </Form>

          <div className="text-center mt-3">
            <Link to="/login">{t('auth.hasAccount')} {t('auth.signIn')}</Link>
          </div>
        </Card.Body>
      </Card>
    </div>
  )
}
