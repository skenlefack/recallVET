import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api, getToken } from '../services/api'

export default function DetailOffcanvas({ show, onClose, entityType, entityId, editUrl }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (show && entityId) loadData()
    if (!show) setData(null)
  }, [show, entityId])

  const endpoints = {
    party: `/v1/clinic/parties/${entityId}`,
    animal: `/v1/clinic/animals/${entityId}`,
    appointment: `/v1/clinic/appointments/${entityId}`,
    encounter: `/v1/clinic/encounters/${entityId}`,
    vaccination: `/v1/clinic/vaccinations/${entityId}`,
    prescription: `/v1/clinic/prescriptions/${entityId}`,
    invoice: `/v1/clinic/invoices/${entityId}`,
    farm: `/v1/farm/farms/${entityId}`,
    herd: `/v1/farm/herds/${entityId}`,
    visit: `/v1/farm/visits/${entityId}`,
    healthEvent: `/v1/farm/health-events/${entityId}`,
    product: `/v1/pharmacy/products/${entityId}`,
    supplier: `/v1/pharmacy/suppliers/${entityId}`,
    purchaseOrder: `/v1/pharmacy/purchase-orders/${entityId}`,
    sale: `/v1/pharmacy/sales/${entityId}`,
    dispense: `/v1/pharmacy/dispensing/${entityId}`,
  }

  const loadData = async () => {
    setLoading(true)
    const endpoint = endpoints[entityType]
    if (!endpoint) { setLoading(false); return }
    const res = await api.get(endpoint, getToken())
    if (res.success) setData(res.data)
    setLoading(false)
  }

  const formatDate = (d) => {
    if (!d) return '-'
    return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })
  }

  const formatMoney = (v) => v ? new Intl.NumberFormat('fr-FR').format(v) + ' XAF' : '-'

  const renderFields = () => {
    if (!data) return null

    const fields = {
      party: [
        { label: 'Code', value: data.client_code, icon: 'fa-hashtag' },
        { label: 'Nom', value: data.display_name, icon: 'fa-user', bold: true },
        { label: 'Type', value: data.party_type === 'individual' ? 'Individu' : data.party_type === 'organization' ? 'Organisation' : data.party_type },
        { label: 'Téléphone', value: data.phone_primary, icon: 'fa-phone' },
        { label: 'Email', value: data.email, icon: 'fa-envelope' },
        { label: 'WhatsApp', value: data.whatsapp_number, icon: 'fa-whatsapp' },
        { label: 'Ville', value: data.city },
        { label: 'Région', value: data.region },
        { label: 'Pays', value: data.country_code },
        { label: 'Créé le', value: formatDate(data.created_at) },
        ...(data.animals?.length ? [{ label: 'Animaux', value: data.animals.map(a => a.name).join(', '), icon: 'fa-paw' }] : []),
      ],
      animal: [
        { label: 'Code', value: data.animal_code, icon: 'fa-hashtag' },
        { label: 'Nom', value: data.name, icon: 'fa-paw', bold: true },
        { label: 'Espèce', value: data.species_name },
        { label: 'Race', value: data.breed_name },
        { label: 'Sexe', value: data.sex === 'M' ? 'Mâle' : data.sex === 'F' ? 'Femelle' : data.sex },
        { label: 'Date naissance', value: formatDate(data.date_of_birth) },
        { label: 'Poids', value: data.weight_kg ? `${data.weight_kg} kg` : '-' },
        { label: 'Puce', value: data.microchip_number, icon: 'fa-microchip' },
        { label: 'Propriétaire', value: data.owner_name, icon: 'fa-user' },
        { label: 'Téléphone proprio', value: data.owner_phone, icon: 'fa-phone' },
        { label: 'Statut', value: data.is_alive !== false ? 'Vivant' : 'Décédé' },
      ],
      appointment: [
        { label: 'Date', value: formatDate(data.scheduled_date), icon: 'fa-calendar', bold: true },
        { label: 'Heure', value: data.start_time ? `${data.start_time} - ${data.end_time || ''}` : '-', icon: 'fa-clock' },
        { label: 'Patient', value: data.animal_name, icon: 'fa-paw' },
        { label: 'Propriétaire', value: data.owner_name, icon: 'fa-user' },
        { label: 'Vétérinaire', value: data.vet_name, icon: 'fa-user-md' },
        { label: 'Type', value: data.appointment_type },
        { label: 'Urgence', value: data.urgency_level },
        { label: 'Statut', value: data.status },
        { label: 'Motif', value: data.reason },
        { label: 'Instructions', value: data.special_instructions },
      ],
      encounter: [
        { label: 'Date', value: formatDate(data.encounter_date), icon: 'fa-calendar', bold: true },
        { label: 'Patient', value: data.animal_name, icon: 'fa-paw' },
        { label: 'Propriétaire', value: data.owner_name, icon: 'fa-user' },
        { label: 'Vétérinaire', value: data.vet_name, icon: 'fa-user-md' },
        { label: 'Type', value: data.encounter_type },
        { label: 'Motif', value: data.visit_reason },
        { label: 'Température', value: data.temperature_c ? `${data.temperature_c}°C` : '-' },
        { label: 'Fréq. cardiaque', value: data.heart_rate_bpm ? `${data.heart_rate_bpm} bpm` : '-' },
        { label: 'Fréq. resp.', value: data.resp_rate_bpm ? `${data.resp_rate_bpm}/min` : '-' },
        { label: 'Poids', value: data.weight_kg ? `${data.weight_kg} kg` : '-' },
        { label: 'Examen clinique', value: data.clinical_findings },
        { label: 'Diagnostic', value: data.diagnostic_hypotheses },
        { label: 'Code diagnostic', value: data.primary_diagnosis_code },
        { label: 'Statut', value: data.status },
      ],
      invoice: [
        { label: 'N° Facture', value: data.invoice_number, icon: 'fa-hashtag', bold: true },
        { label: 'Date', value: formatDate(data.invoice_date), icon: 'fa-calendar' },
        { label: 'Client', value: data.party_name, icon: 'fa-user' },
        { label: 'Sous-total', value: formatMoney(data.subtotal) },
        { label: 'Remise', value: formatMoney(data.discount_amount) },
        { label: 'TVA', value: formatMoney(data.tax_amount) },
        { label: 'Total', value: formatMoney(data.total_amount), bold: true },
        { label: 'Statut', value: data.status },
        { label: 'Échéance', value: formatDate(data.due_date) },
        ...(data.lines?.length ? [{ label: 'Lignes', value: `${data.lines.length} poste(s)` }] : []),
        ...(data.payments?.length ? [{ label: 'Paiements', value: `${data.payments.length} paiement(s)` }] : []),
      ],
      product: [
        { label: 'Nom', value: data.name, icon: 'fa-pills', bold: true },
        { label: 'SKU', value: data.sku, icon: 'fa-barcode' },
        { label: 'Catégorie', value: data.category_name },
        { label: 'Description', value: data.description },
        { label: 'Unité', value: data.unit },
        { label: 'Prix unitaire', value: formatMoney(data.unit_price) },
        { label: 'TVA', value: data.vat_rate ? `${data.vat_rate}%` : '0%' },
        { label: 'Seuil réappro', value: data.reorder_level },
        { label: 'Ordonnance', value: data.is_prescription_only ? 'Oui' : 'Non' },
        { label: 'Vaccin', value: data.is_vaccine ? 'Oui' : 'Non' },
      ],
      supplier: [
        { label: 'Nom', value: data.name, icon: 'fa-truck', bold: true },
        { label: 'Contact', value: data.contact_person, icon: 'fa-user' },
        { label: 'Email', value: data.email, icon: 'fa-envelope' },
        { label: 'Téléphone', value: data.phone, icon: 'fa-phone' },
        { label: 'Ville', value: data.city },
        { label: 'Pays', value: data.country_code },
        { label: 'N° fiscal', value: data.tax_id },
        { label: 'Délai paiement', value: data.payment_terms_days ? `${data.payment_terms_days} jours` : '-' },
      ],
      farm: [
        { label: 'Code', value: data.farm_code, icon: 'fa-hashtag' },
        { label: 'Nom', value: data.name, icon: 'fa-tractor', bold: true },
        { label: 'Type', value: data.farm_type },
        { label: 'Superficie', value: data.total_area_ha ? `${data.total_area_ha} ha` : '-' },
        { label: 'Propriétaire', value: data.owner_name, icon: 'fa-user' },
        { label: 'Ville', value: data.city },
        { label: 'Région', value: data.region },
      ],
    }

    // Fallback: affiche toutes les propriétés
    const fieldList = fields[entityType] || Object.entries(data).filter(([k]) => !['id','tenant_id','created_by','updated_at'].includes(k)).map(([k, v]) => ({
      label: k.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase()),
      value: typeof v === 'object' ? JSON.stringify(v) : v
    }))

    return fieldList.filter(f => f.value !== null && f.value !== undefined && f.value !== '')
  }

  const titles = {
    party: 'Détail client', animal: 'Détail animal', appointment: 'Détail RDV',
    encounter: 'Détail consultation', vaccination: 'Détail vaccination',
    prescription: 'Détail ordonnance', invoice: 'Détail facture',
    farm: 'Détail exploitation', herd: 'Détail troupeau', visit: 'Détail visite',
    healthEvent: 'Détail événement', product: 'Détail produit',
    supplier: 'Détail fournisseur', purchaseOrder: 'Détail commande',
    sale: 'Détail vente', dispense: 'Détail dispensation',
  }

  if (!show) return null

  return (
    <>
      <div className="offcanvas-backdrop" onClick={onClose} />
      <div className="offcanvas-panel">
        <div className="offcanvas-header">
          <h5><i className="fas fa-info-circle me-2" />{titles[entityType] || 'Détails'}</h5>
          <button className="offcanvas-close" onClick={onClose}>
            <i className="fas fa-times" />
          </button>
        </div>

        <div className="offcanvas-body">
          {loading ? (
            <div className="loading-container">
              <div className="spinner-border text-success" />
              <p>Chargement...</p>
            </div>
          ) : data ? (
            <div className="offcanvas-fields">
              {renderFields()?.map((field, i) => (
                <div key={i} className="offcanvas-field">
                  <div className="offcanvas-field-label">
                    {field.icon && <i className={`fas ${field.icon} me-1`} />}
                    {field.label}
                  </div>
                  <div className={`offcanvas-field-value ${field.bold ? 'fw-bold' : ''}`}>
                    {field.value || '-'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <i className="fas fa-exclamation-circle empty-icon" />
              <p>Données non disponibles</p>
            </div>
          )}
        </div>

        {editUrl && (
          <div className="offcanvas-footer">
            <Link to={editUrl} className="btn btn-rv-primary w-100" onClick={onClose}>
              <i className="fas fa-edit me-1" />Modifier
            </Link>
          </div>
        )}
      </div>
    </>
  )
}
