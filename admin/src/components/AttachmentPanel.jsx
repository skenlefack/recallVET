import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { api, getToken, API_URL } from '../services/api'

export default function AttachmentPanel({ entityType, entityId }) {
  const { t } = useTranslation()
  const token = getToken()
  const fileInputRef = useRef(null)

  const [attachments, setAttachments] = useState([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (entityType && entityId) loadAttachments()
  }, [entityType, entityId])

  const loadAttachments = async () => {
    setLoading(true)
    const res = await api.get(`/v1/uploads/${entityType}/${entityId}`, token)
    if (res.success) setAttachments(res.data || [])
    setLoading(false)
  }

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('entity_type', entityType)
    formData.append('entity_id', entityId)
    const res = await api.upload('/v1/uploads', formData, token)
    if (res.success) {
      setToast({ type: 'success', message: t('attachments.uploadSuccess') })
      loadAttachments()
    } else {
      setToast({ type: 'danger', message: res.message || t('attachments.uploadError') })
    }
    setUploading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDelete = async (id) => {
    if (!window.confirm(t('attachments.deleteConfirm'))) return
    const res = await api.delete(`/v1/uploads/${id}`, token)
    if (res.success) {
      setToast({ type: 'success', message: t('attachments.deleted') })
      setAttachments(prev => prev.filter(a => a.id !== id))
    } else {
      setToast({ type: 'danger', message: res.message || t('attachments.deleteError') })
    }
  }

  const formatSize = (bytes) => {
    if (!bytes) return '-'
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDate = (d) => {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  return (
    <div className="card form-card mb-3">
      <div className="card-header d-flex justify-content-between align-items-center">
        <h6 className="mb-0"><i className="fas fa-paperclip me-2"></i>{t('attachments.title')}</h6>
        <div>
          <input type="file" ref={fileInputRef} onChange={handleUpload} className="d-none" />
          <button
            type="button"
            className="btn btn-sm btn-outline-primary"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading
              ? <><span className="spinner-border spinner-border-sm me-1"></span>{t('common.loading')}</>
              : <><i className="fas fa-upload me-1"></i>{t('attachments.upload')}</>
            }
          </button>
        </div>
      </div>
      <div className="card-body">
        {toast && (
          <div className={`alert alert-${toast.type} alert-dismissible fade show py-2`}>
            {toast.message}
            <button className="btn-close btn-close-sm" onClick={() => setToast(null)}></button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-3">
            <div className="spinner-border spinner-border-sm text-success" />
          </div>
        ) : attachments.length === 0 ? (
          <p className="text-muted mb-0"><i className="fas fa-info-circle me-1"></i>{t('attachments.noFiles')}</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm table-hover mb-0">
              <thead>
                <tr>
                  <th>{t('attachments.fileName')}</th>
                  <th>{t('attachments.fileSize')}</th>
                  <th>{t('attachments.uploadedAt')}</th>
                  <th>{t('attachments.uploadedBy')}</th>
                  <th style={{ width: 100 }}>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {attachments.map(att => (
                  <tr key={att.id}>
                    <td>
                      <i className="fas fa-file me-1 text-muted"></i>
                      {att.original_name}
                    </td>
                    <td>{formatSize(att.size_bytes)}</td>
                    <td>{formatDate(att.created_at)}</td>
                    <td>{[att.uploaded_by_first, att.uploaded_by_last].filter(Boolean).join(' ') || '-'}</td>
                    <td>
                      <a
                        href={`${API_URL}/v1/uploads/file/${att.id}`}
                        className="btn btn-sm btn-outline-success me-1"
                        target="_blank"
                        rel="noreferrer"
                        title={t('attachments.download')}
                      >
                        <i className="fas fa-download"></i>
                      </a>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(att.id)}
                        title={t('attachments.delete')}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <small className="text-muted mt-2 d-block">{t('attachments.maxSize')}</small>
      </div>
    </div>
  )
}
