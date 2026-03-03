export type CompanyStatus = 'DRAFT' | 'COMPLETED';

export type CompanyType =
  | 'LLC'
  | 'Corporation'
  | 'S-Corporation'
  | 'Partnership'
  | 'Sole Proprietorship';

export type ShareType = 'Common' | 'Preferred' | 'Restricted';

export interface Shareholder {
  id: string;
  company_id: string;
  name: string;
  email: string;
  nationality: string;
  share_percentage: number;
  share_type: ShareType;
}

export interface Company {
  id: string;
  name: string;
  num_shareholders: number;
  total_capital: number;
  company_type: CompanyType;
  jurisdiction: string;
  registered_address: string;
  email: string;
  phone?: string;
  status: CompanyStatus;
  created_at: string;
  updated_at: string;
  shareholders: Shareholder[];
}

// Form data shapes (no id/timestamps)
export interface CompanyFormData {
  name: string;
  num_shareholders: number;
  total_capital: number;
  company_type: CompanyType;
  jurisdiction: string;
  registered_address: string;
  email: string;
  phone?: string;
}

export interface ShareholderFormData {
  name: string;
  email: string;
  nationality: string;
  share_percentage: number;
  share_type: ShareType;
}

export interface ShareholderBulkPayload {
  shareholders: ShareholderFormData[];
}
