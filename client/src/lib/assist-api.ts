// Assist.org API integration utilities
// Note: API access is currently limited to educational institutions

interface AssistInstitution {
  id: string;
  name: string;
  type: string;
  code?: string;
}

interface AssistAgreement {
  key: string;
  receivingInstitutionId: string;
  sendingInstitutionId: string;
  academicYearId: string;
  categoryCode: string;
}

interface AssistAgreementsResponse {
  reports: AssistAgreement[];
}

interface FetchAgreementsParams {
  receivingInstitutionId: string;
  sendingInstitutionId: string;
  academicYearId: string;
  categoryCode: string;
}

export async function fetchAssistInstitutions(institutionId?: string): Promise<AssistInstitution[]> {
  try {
    const url = institutionId 
      ? `/api/assist/institutions/${institutionId}/agreements`
      : '/api/assist/institutions';
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.institutions || data || [];
  } catch (error) {
    console.error('Failed to fetch Assist.org institutions:', error);
    throw new Error('Unable to access Assist.org API. This may be due to API access restrictions.');
  }
}

export async function fetchAgreements(params: FetchAgreementsParams): Promise<AssistAgreement[]> {
  try {
    const searchParams = new URLSearchParams(params);
    const response = await fetch(`/api/assist/agreements?${searchParams}`);
    
    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }
    
    const data: AssistAgreementsResponse = await response.json();
    return data.reports || [];
  } catch (error) {
    console.error('Failed to fetch Assist.org agreements:', error);
    throw new Error('Unable to access Assist.org API. This may be due to API access restrictions.');
  }
}

export async function fetchAgreementDocument(agreementKey: string): Promise<Blob> {
  try {
    const response = await fetch(`https://assist.org/api/artifacts/${agreementKey}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch agreement document: ${response.status} ${response.statusText}`);
    }
    
    return await response.blob();
  } catch (error) {
    console.error('Failed to fetch agreement document:', error);
    throw new Error('Unable to fetch agreement document from Assist.org.');
  }
}

export function getAssistOrgUrl(sendingInstitutionCode?: string, receivingInstitutionCode?: string, major?: string): string {
  let url = 'https://assist.org';
  
  if (sendingInstitutionCode && receivingInstitutionCode) {
    url += `/transfer/results?year=74&institution=${sendingInstitutionCode}&agreement=${receivingInstitutionCode}`;
    
    if (major) {
      url += `&agreementType=major&major=${encodeURIComponent(major)}`;
    }
  }
  
  return url;
}

// Helper function to validate API availability
export async function checkAssistApiAvailability(): Promise<boolean> {
  try {
    const response = await fetch('/api/assist/institutions/113/agreements'); // Test with De Anza College
    return response.ok;
  } catch {
    return false;
  }
}

// Academic year mapping (Assist.org uses numeric IDs)
export const ACADEMIC_YEARS = {
  '2023-2024': '74',
  '2022-2023': '73',
  '2021-2022': '72',
  '2020-2021': '71',
} as const;

export function getAcademicYearId(academicYear: string): string {
  return ACADEMIC_YEARS[academicYear as keyof typeof ACADEMIC_YEARS] || '74';
}

// Common institution codes for reference
export const COMMON_INSTITUTIONS = {
  // Community Colleges
  'DE_ANZA': '113',
  'FOOTHILL': '44',
  
  // UC System
  'UC_BERKELEY': '76',
  'UC_LOS_ANGELES': '77',
  'UC_SAN_DIEGO': '79',
  'UC_DAVIS': '78',
  
  // CSU System
  'SAN_JOSE_STATE': '138',
  'SF_STATE': '139',
  'CAL_POLY_SLO': '140',
} as const;
