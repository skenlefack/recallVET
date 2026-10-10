import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { Table, Button, Modal, Form, Badge, Spinner, Alert } from 'react-bootstrap'
import { useTranslation } from 'react-i18next'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

const ROLES = ['user', 'admin', 'vet', 'assistant', 'receptionist', 'pharmacist']

const roleBadgeVariant = (role) => {
  const map = { owner: 'danger', admin: 'warning', vet: 'primary', assistant: 'info', receptionist: 'secondary', pharmacist: 'success', user: 'light' }
  return map[role] || 'light'
}

export default function TeamManagement() {
  const { t } = useTranslation()
  const { token } = useAuth()
  const [members, setMembers] = useState([])
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Invite modal
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('user')
  const [inviting, setInviting] = useState(false)

  // Confirm remove modal
  const [removeTarget, setRemoveTarget] = useState(null)
  const [removing, setRemoving] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [membersRes, invitationsRes] = await Promise.all([
      api.get('/v1/team', token),
      api.get('/v1/team/invitations', token)
    ])
    if (membersRes.success) setMembers(membersRes.data)
    if (invitationsRes.success) setInvitations(invitationsRes.data)
    setLoading(false)
  }, [token])

  useEffect(() => { fetchData() }, [fetchData])

  const handleInvite = async (e) => {
    e.preventDefault()
    setInviting(true)
    setError('')
    const res = await api.post('/v1/team/invite', { email: inviteEmail, role: inviteRole }, token)
    setInviting(false)
    if (res.success) {
      setSuccess(t('team.inviteSent'))
      setShowInvite(false)
      setInviteEmail('')
      setInviteRole('user')
      fetchData()
    } else {
      setError(res.message)
    }
  }

  const handleRoleChange = async (userId, newRole) => {
    setError('')
    const res = await api.put(`/v1/team/${userId}/role`, { role: newRole }, token)
    if (res.success) {
      setSuccess(t('team.roleUpdated'))
      fetchData()
    } else {
      setError(res.message)
    }
  }

  const handleRemove = async () => {
    if (!removeTarget) return
    setRemoving(true)
    const res = await api.delete(`/v1/team/${removeTarget.id}`, token)
    setRemoving(false)
    setRemoveTarget(null)
    if (res.success) {
      setSuccess(t('team.memberRemoved'))
      fetchData()
    } else {
      setError(res.message)
    }
  }

  const handleCancelInvitation = async (id) => {
    const res = await api.delete(`/v1/team/invitations/${id}`, token)
    if (res.success) {
      setSuccess(t('team.invitationCancelled'))
      fetchData()
    } else {
      setError(res.message)
    }
  }

  useEffect(() => {
    if (success) { const timer = setTimeout(() => setSuccess(''), 4000); return () => clearTimeout(timer) }
  }, [success])

  if (loading) return <div className="text-center py-5"><Spinner animation="border" variant="success" /></div>

  return (
    <div className="container-fluid py-4">
      <div className="rv-breadcrumb">
        <Link to="/dashboard">Accueil</Link>
        <span className="separator"><i className="fas fa-chevron-right" /></span>
        <Link to="/settings">Paramètres</Link>
        <span className="separator"><i className="fas fa-chevron-right" /></span>
        <span>Équipe</span>
      </div>
      <div className="page-title-bar">
        <h4><i className="fas fa-users-cog me-2" />{t('team.title')}</h4>
        <Button variant="success" onClick={() => setShowInvite(true)}>
          <i className="fas fa-user-plus me-2"></i>{t('team.invite')}
        </Button>
      </div>

      {error && <Alert variant="danger" dismissible onClose={() => setError('')}>{error}</Alert>}
      {success && <Alert variant="success" dismissible onClose={() => setSuccess('')}>{success}</Alert>}

      {/* Team members */}
      <div className="card mb-4">
        <div className="card-header"><h6 className="mb-0">{t('team.members')}</h6></div>
        <div className="card-body p-0">
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>{t('team.name')}</th>
                <th>{t('auth.email')}</th>
                <th>{t('team.role')}</th>
                <th>{t('team.joined')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {members.map(m => (
                <tr key={m.id}>
                  <td>{m.first_name} {m.last_name}</td>
                  <td>{m.email}</td>
                  <td>
                    {m.role === 'owner' ? (
                      <Badge bg="danger">{t('team.roles.owner')}</Badge>
                    ) : (
                      <Form.Select size="sm" value={m.role} style={{ width: 160 }}
                        onChange={(e) => handleRoleChange(m.id, e.target.value)}>
                        {ROLES.map(r => (
                          <option key={r} value={r}>{t(`team.roles.${r}`)}</option>
                        ))}
                      </Form.Select>
                    )}
                  </td>
                  <td>{m.joined_at ? new Date(m.joined_at).toLocaleDateString() : '-'}</td>
                  <td>
                    {m.role !== 'owner' && (
                      <Button variant="outline-danger" size="sm" onClick={() => setRemoveTarget(m)}>
                        <i className="fas fa-trash"></i>
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {members.length === 0 && (
                <tr><td colSpan="5" className="text-center text-muted py-3">{t('common.noData')}</td></tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Pending invitations */}
      <div className="card">
        <div className="card-header"><h6 className="mb-0">{t('team.pendingInvitations')}</h6></div>
        <div className="card-body p-0">
          <Table responsive hover className="mb-0">
            <thead className="table-light">
              <tr>
                <th>{t('auth.email')}</th>
                <th>{t('team.role')}</th>
                <th>{t('team.invitedBy')}</th>
                <th>{t('team.expires')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {invitations.map(inv => (
                <tr key={inv.id}>
                  <td>{inv.email}</td>
                  <td><Badge bg={roleBadgeVariant(inv.role)}>{t(`team.roles.${inv.role}`)}</Badge></td>
                  <td>{inv.invited_by_first_name} {inv.invited_by_last_name}</td>
                  <td>{new Date(inv.expires_at).toLocaleDateString()}</td>
                  <td>
                    <Button variant="outline-secondary" size="sm" onClick={() => handleCancelInvitation(inv.id)}>
                      {t('common.cancel')}
                    </Button>
                  </td>
                </tr>
              ))}
              {invitations.length === 0 && (
                <tr><td colSpan="5" className="text-center text-muted py-3">{t('team.noInvitations')}</td></tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>

      {/* Invite Modal */}
      <Modal show={showInvite} onHide={() => setShowInvite(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('team.inviteUser')}</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleInvite}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>{t('auth.email')}</Form.Label>
              <Form.Control type="email" required value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder={t('team.emailPlaceholder')} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>{t('team.role')}</Form.Label>
              <Form.Select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
                {ROLES.map(r => (
                  <option key={r} value={r}>{t(`team.roles.${r}`)}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowInvite(false)}>{t('common.cancel')}</Button>
            <Button variant="success" type="submit" disabled={inviting}>
              {inviting ? <Spinner size="sm" animation="border" /> : t('team.sendInvite')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* Remove Confirmation Modal */}
      <Modal show={!!removeTarget} onHide={() => setRemoveTarget(null)}>
        <Modal.Header closeButton>
          <Modal.Title>{t('team.confirmRemove')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {removeTarget && (
            <p>{t('team.confirmRemoveText', { name: `${removeTarget.first_name} ${removeTarget.last_name}` })}</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setRemoveTarget(null)}>{t('common.cancel')}</Button>
          <Button variant="danger" onClick={handleRemove} disabled={removing}>
            {removing ? <Spinner size="sm" animation="border" /> : t('common.delete')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
