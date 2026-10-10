const AFRICAN_COUNTRIES = [
  { code: 'DZ', name: 'Algerie' }, { code: 'AO', name: 'Angola' }, { code: 'BJ', name: 'Benin' },
  { code: 'BW', name: 'Botswana' }, { code: 'BF', name: 'Burkina Faso' }, { code: 'BI', name: 'Burundi' },
  { code: 'CM', name: 'Cameroun' }, { code: 'CV', name: 'Cap-Vert' }, { code: 'CF', name: 'Centrafrique' },
  { code: 'TD', name: 'Tchad' }, { code: 'KM', name: 'Comores' }, { code: 'CG', name: 'Congo' },
  { code: 'CD', name: 'RD Congo' }, { code: 'CI', name: "Cote d'Ivoire" }, { code: 'DJ', name: 'Djibouti' },
  { code: 'EG', name: 'Egypte' }, { code: 'GQ', name: 'Guinee equatoriale' }, { code: 'ER', name: 'Erythree' },
  { code: 'SZ', name: 'Eswatini' }, { code: 'ET', name: 'Ethiopie' }, { code: 'GA', name: 'Gabon' },
  { code: 'GM', name: 'Gambie' }, { code: 'GH', name: 'Ghana' }, { code: 'GN', name: 'Guinee' },
  { code: 'GW', name: 'Guinee-Bissau' }, { code: 'KE', name: 'Kenya' }, { code: 'LS', name: 'Lesotho' },
  { code: 'LR', name: 'Liberia' }, { code: 'LY', name: 'Libye' }, { code: 'MG', name: 'Madagascar' },
  { code: 'MW', name: 'Malawi' }, { code: 'ML', name: 'Mali' }, { code: 'MR', name: 'Mauritanie' },
  { code: 'MU', name: 'Maurice' }, { code: 'MA', name: 'Maroc' }, { code: 'MZ', name: 'Mozambique' },
  { code: 'NA', name: 'Namibie' }, { code: 'NE', name: 'Niger' }, { code: 'NG', name: 'Nigeria' },
  { code: 'RW', name: 'Rwanda' }, { code: 'ST', name: 'Sao Tome-et-Principe' }, { code: 'SN', name: 'Senegal' },
  { code: 'SC', name: 'Seychelles' }, { code: 'SL', name: 'Sierra Leone' }, { code: 'SO', name: 'Somalie' },
  { code: 'ZA', name: 'Afrique du Sud' }, { code: 'SS', name: 'Soudan du Sud' }, { code: 'SD', name: 'Soudan' },
  { code: 'TZ', name: 'Tanzanie' }, { code: 'TG', name: 'Togo' }, { code: 'TN', name: 'Tunisie' },
  { code: 'UG', name: 'Ouganda' }, { code: 'ZM', name: 'Zambie' }, { code: 'ZW', name: 'Zimbabwe' }
]

export default function CountrySelect({ value, onChange, className = 'form-select', disabled = false }) {
  return (
    <select className={className} value={value || 'CM'} onChange={onChange} disabled={disabled}>
      <option value="">-- Pays --</option>
      {AFRICAN_COUNTRIES.sort((a, b) => a.name.localeCompare(b.name)).map(c => (
        <option key={c.code} value={c.code}>{c.name}</option>
      ))}
    </select>
  )
}
