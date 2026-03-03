import axios from 'axios';
import type {
  Company,
  CompanyFormData,
  ShareholderBulkPayload,
  Shareholder,
} from '../types';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Companies ─────────────────────────────────────────────────────────────────

export const createCompany = async (data: CompanyFormData): Promise<Company> => {
  const res = await client.post<Company>('/companies', data);
  return res.data;
};

export const getCompany = async (id: string): Promise<Company> => {
  const res = await client.get<Company>(`/companies/${id}`);
  return res.data;
};

export const getAllCompanies = async (): Promise<Company[]> => {
  const res = await client.get<Company[]>('/companies');
  return res.data;
};

// ── Shareholders ──────────────────────────────────────────────────────────────

export const addShareholders = async (
  companyId: string,
  payload: ShareholderBulkPayload
): Promise<Shareholder[]> => {
  const res = await client.post<Shareholder[]>(
    `/companies/${companyId}/shareholders`,
    payload
  );
  return res.data;
};
