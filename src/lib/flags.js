const COUNTRY_ALIASES = {
  argentina: 'AR',
  australia: 'AU',
  austria: 'AT',
  belgium: 'BE',
  belgica: 'BE',
  bolivia: 'BO',
  bosnia: 'BA',
  'bosnia and herzegovina': 'BA',
  'bosnia & herzegovina': 'BA',
  brazil: 'BR',
  brasil: 'BR',
  bulgaria: 'BG',
  cameroon: 'CM',
  camerun: 'CM',
  canada: 'CA',
  chile: 'CL',
  china: 'CN',
  colombia: 'CO',
  'costa rica': 'CR',
  croatia: 'HR',
  croacia: 'HR',
  cuba: 'CU',
  czechia: 'CZ',
  'czech republic': 'CZ',
  'republica checa': 'CZ',
  'south korea': 'KR',
  'korea republic': 'KR',
  'corea del sur': 'KR',
  'north korea': 'KP',
  denmark: 'DK',
  dinamarca: 'DK',
  ecuador: 'EC',
  egypt: 'EG',
  egipto: 'EG',
  england: 'GB',
  'estados unidos': 'US',
  'united states': 'US',
  espana: 'ES',
  spain: 'ES',
  france: 'FR',
  francia: 'FR',
  germany: 'DE',
  alemania: 'DE',
  'west germany': 'DE',
  'alemania occidental': 'DE',
  ghana: 'GH',
  greece: 'GR',
  grecia: 'GR',
  honduras: 'HN',
  hungary: 'HU',
  hungria: 'HU',
  iceland: 'IS',
  islandia: 'IS',
  iran: 'IR',
  iraq: 'IQ',
  ireland: 'IE',
  italia: 'IT',
  italy: 'IT',
  jamaica: 'JM',
  japan: 'JP',
  japon: 'JP',
  mexico: 'MX',
  morocco: 'MA',
  marruecos: 'MA',
  'netherlands': 'NL',
  holland: 'NL',
  'paises bajos': 'NL',
  nigeria: 'NG',
  norway: 'NO',
  paraguay: 'PY',
  peru: 'PE',
  poland: 'PL',
  polonia: 'PL',
  portugal: 'PT',
  qatar: 'QA',
  romania: 'RO',
  russia: 'RU',
  rusia: 'RU',
  'saudi arabia': 'SA',
  'arabia saudita': 'SA',
  scotland: 'GB',
  senegal: 'SN',
  serbia: 'RS',
  slovakia: 'SK',
  slovenia: 'SI',
  'south africa': 'ZA',
  sudafrica: 'ZA',
  sweden: 'SE',
  suecia: 'SE',
  switzerland: 'CH',
  suiza: 'CH',
  tunisia: 'TN',
  tunez: 'TN',
  turkey: 'TR',
  turquia: 'TR',
  uruguay: 'UY',
  venezuela: 'VE',
  wales: 'GB',
  yugoslavia: 'RS',
  'soviet union': 'RU',
  urss: 'RU',
  ussr: 'RU',
  'czechoslovakia': 'CZ',
  checoslovaquia: 'CZ',
  zaire: 'CD',
  'new zealand': 'NZ',
  'trinidad and tobago': 'TT',
  'trinidad y tobago': 'TT',
  ukraine: 'UA',
  croacia: 'HR',
  mexico: 'MX',
  'republic of ireland': 'IE',
  'united arab emirates': 'AE',
  'emiratos arabes unidos': 'AE',
  panama: 'PA',
  'el salvador': 'SV',
  'cote d ivoire': 'CI',
  'ivory coast': 'CI',
  'tbd': null,
  'por confirmar': null
};

function normalizeCountryName(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.'’`]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function toFlagEmoji(code) {
  if (!code || code.length !== 2) {
    return '';
  }

  const points = code
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...points);
}

export function getCountryFlag(countryName) {
  const code = getCountryCode(countryName);
  return toFlagEmoji(code);
}

export function getCountryCode(countryName) {
  const normalized = normalizeCountryName(countryName);
  return COUNTRY_ALIASES[normalized] || null;
}

export function formatCountryWithFlag(countryName) {
  const label = String(countryName || '').trim();
  if (!label) {
    return '';
  }

  const flag = getCountryFlag(label);
  return flag ? `${flag} ${label}` : label;
}

export function formatHostWithFlags(hostText) {
  const raw = String(hostText || '').trim();
  if (!raw) {
    return '';
  }

  const parts = splitHostCountries(raw);
  if (parts.length <= 1) {
    return formatCountryWithFlag(raw);
  }

  return parts.map((part) => formatCountryWithFlag(part)).join(' · ');
}

export function splitHostCountries(hostText) {
  const raw = String(hostText || '').trim();
  if (!raw) {
    return [];
  }

  return raw.split(/\s*,\s*|\s+y\s+|\s+and\s+/i).filter(Boolean);
}
