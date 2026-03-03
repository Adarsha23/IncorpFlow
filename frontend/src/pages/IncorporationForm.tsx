import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Stepper } from '../components/Stepper';
import { createCompany, getCompany, addShareholders } from '../services/api';
import type {
  CompanyFormData,
  ShareholderFormData,
  CompanyType,
  ShareType,
} from '../types';

const COMPANY_ID_KEY = 'incorporation_company_id';
const STEPS = ['Company', 'Equity', 'Finalize'];

const COMPANY_TYPES: CompanyType[] = [
  'LLC', 'Corporation', 'S-Corporation', 'Partnership', 'Sole Proprietorship',
];
const SHARE_TYPES: ShareType[] = ['Common', 'Preferred', 'Restricted'];
const JURISDICTIONS = [
  'Delaware, USA', 'Wyoming, USA', 'Nevada, USA', 'California, USA',
  'New York, USA', 'Texas, USA', 'United Kingdom', 'Singapore', 'Canada',
];

function emptyCompanyForm(): CompanyFormData {
  return { 
    name: '', 
    num_shareholders: 1, 
    total_capital: 0,
    company_type: 'LLC', 
    jurisdiction: 'Delaware, USA', 
    registered_address: '', 
    email: '', 
    phone: '' 
  };
}

function emptyShareholder(): ShareholderFormData {
  return { name: '', email: '', nationality: '', share_percentage: 0, share_type: 'Common' };
}

export const IncorporationForm: React.FC = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [company, setCompany] = useState<CompanyFormData>(emptyCompanyForm());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [shareholders, setShareholders] = useState<ShareholderFormData[]>([emptyShareholder()]);
  const [shareholderErrors, setShareholderErrors] = useState<Record<string, string>[]>([{}]);

  // On mount: restore draft from localStorage
  const restoreDraft = useCallback(async () => {
    const savedId = localStorage.getItem(COMPANY_ID_KEY);
    if (!savedId) return;
    try {
      const draft = await getCompany(savedId);
      if (draft.status === 'DRAFT') {
        setCompanyId(draft.id);
        setCompany({
          name: draft.name,
          num_shareholders: draft.num_shareholders,
          total_capital: draft.total_capital,
          company_type: draft.company_type,
          jurisdiction: draft.jurisdiction,
          registered_address: draft.registered_address,
          email: draft.email,
          phone: draft.phone ?? '',
        });
        setStep(2);
      } else {
        localStorage.removeItem(COMPANY_ID_KEY);
      }
    } catch {
      localStorage.removeItem(COMPANY_ID_KEY);
    }
  }, []);

  useEffect(() => { restoreDraft(); }, [restoreDraft]);

  const validateStep1 = (): boolean => {
    const e: Record<string, string> = {};
    if (!company.name.trim()) e.name = 'Required';
    if (company.num_shareholders < 1) e.num_shareholders = 'Min 1';
    if (company.total_capital <= 0) e.total_capital = 'Must be > 0';
    if (!company.jurisdiction) e.jurisdiction = 'Select one';
    if (!company.registered_address.trim()) e.registered_address = 'Required';
    if (!company.email.trim()) e.email = 'Required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(company.email)) e.email = 'Invalid';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep1()) return;
    setLoading(true);
    try {
      const result = await createCompany(company);
      setCompanyId(result.id);
      localStorage.setItem(COMPANY_ID_KEY, result.id);
      
      const count = Math.min(Math.max(company.num_shareholders, 1), 20);
      setShareholders(Array(count).fill(null).map(() => emptyShareholder()));
      setShareholderErrors(Array(count).fill(null).map(() => ({})));
      
      toast.success('Information saved');
      setStep(2);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to save';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const updateShareholder = (index: number, field: keyof ShareholderFormData, value: string | number) => {
    setShareholders(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  const addShareholder = () => {
    setShareholders(prev => [...prev, emptyShareholder()]);
    setShareholderErrors(prev => [...prev, {}]);
  };

  const removeShareholder = (index: number) => {
    if (shareholders.length === 1) return;
    setShareholders(prev => prev.filter((_, i) => i !== index));
    setShareholderErrors(prev => prev.filter((_, i) => i !== index));
  };

  const totalShares = shareholders.reduce((sum, s) => sum + Number(s.share_percentage || 0), 0);

  const validateStep2 = (): boolean => {
    const errs = shareholders.map(s => {
      const e: Record<string, string> = {};
      if (!s.name.trim()) e.name = 'Required';
      if (!s.email.trim()) e.email = 'Required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email)) e.email = 'Invalid';
      if (!s.nationality.trim()) e.nationality = 'Required';
      if (!s.share_percentage || s.share_percentage <= 0) e.share_percentage = '> 0%';
      return e;
    });
    setShareholderErrors(errs);
    const anyError = errs.some(e => Object.keys(e).length > 0);
    if (anyError) return false;
    if (Math.abs(totalShares - 100) > 0.01) {
      toast.error(`Total must be 100% (currently ${totalShares.toFixed(2)}%)`);
      return false;
    }
    return true;
  };

  const handleStep2Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId || !validateStep2()) return;
    setLoading(true);
    try {
      await addShareholders(companyId, {
        shareholders: shareholders.map(s => ({ ...s, share_percentage: Number(s.share_percentage) })),
      });
      localStorage.removeItem(COMPANY_ID_KEY);
      toast.success('Application submitted');
      setStep(3);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to submit';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) {
    return (
      <div className="form-page">
        <div className="success-card">
          <h1>Incorporation Complete</h1>
          <p>Your application has been received and is being processed.</p>
          <button className="btn btn-primary" onClick={() => { setStep(1); setCompany(emptyCompanyForm()); setShareholders([emptyShareholder()]); setCompanyId(null); }}>
            Start New Incorporation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <header className="top-bar">
        <div className="brand">
          <span className="brand-name">FounderDesk</span>
        </div>
        <a href="/admin" className="btn btn-secondary btn-sm">Admin Dashboard</a>
      </header>

      <div className="form-container">
        <Stepper currentStep={step} steps={STEPS} />

        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="form-body" noValidate>
            <h2 className="step-title">Company Information</h2>
            <p className="step-desc">Enter the primary details for your incorporation.</p>

            <div className="form-grid">
              <div className={`form-field span-2 ${errors.name ? 'has-error' : ''}`}>
                <input id="name" type="text" placeholder=" " value={company.name} onChange={e => setCompany(p => ({ ...p, name: e.target.value }))} />
                <label htmlFor="name">Company Name</label>
                {errors.name && <span className="error-msg">{errors.name}</span>}
              </div>

              <div className={`form-field ${errors.num_shareholders ? 'has-error' : ''}`}>
                <input id="num_shareholders" type="number" min="1" max="20" placeholder=" " value={company.num_shareholders} onChange={e => setCompany(p => ({ ...p, num_shareholders: parseInt(e.target.value) || 0 }))} />
                <label htmlFor="num_shareholders">Shareholders</label>
                {errors.num_shareholders && <span className="error-msg">{errors.num_shareholders}</span>}
              </div>

              <div className={`form-field ${errors.total_capital ? 'has-error' : ''}`}>
                <input id="total_capital" type="number" min="0" step="1000" placeholder=" " value={company.total_capital} onChange={e => setCompany(p => ({ ...p, total_capital: parseFloat(e.target.value) || 0 }))} />
                <label htmlFor="total_capital">Total Capital ($)</label>
                {errors.total_capital && <span className="error-msg">{errors.total_capital}</span>}
              </div>

              <div className="form-field">
                <select id="company_type" value={company.company_type} onChange={e => setCompany(p => ({ ...p, company_type: e.target.value as CompanyType }))}>
                  {COMPANY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <label htmlFor="company_type">Company Type</label>
              </div>

              <div className={`form-field ${errors.jurisdiction ? 'has-error' : ''}`}>
                <select id="jurisdiction" value={company.jurisdiction} onChange={e => setCompany(p => ({ ...p, jurisdiction: e.target.value }))}>
                  <option value="">Select jurisdiction</option>
                  {JURISDICTIONS.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
                <label htmlFor="jurisdiction">Jurisdiction</label>
                {errors.jurisdiction && <span className="error-msg">{errors.jurisdiction}</span>}
              </div>

              <div className={`form-field span-2 ${errors.registered_address ? 'has-error' : ''}`}>
                <input id="registered_address" type="text" placeholder=" " value={company.registered_address} onChange={e => setCompany(p => ({ ...p, registered_address: e.target.value }))} />
                <label htmlFor="registered_address">Registered Address</label>
                {errors.registered_address && <span className="error-msg">{errors.registered_address}</span>}
              </div>

              <div className={`form-field ${errors.email ? 'has-error' : ''}`}>
                <input id="email" type="email" placeholder=" " value={company.email} onChange={e => setCompany(p => ({ ...p, email: e.target.value }))} />
                <label htmlFor="email">Business Email</label>
                {errors.email && <span className="error-msg">{errors.email}</span>}
              </div>

              <div className="form-field">
                <input id="phone" type="tel" placeholder=" " value={company.phone ?? ''} onChange={e => setCompany(p => ({ ...p, phone: e.target.value }))} />
                <label htmlFor="phone">Phone (Optional)</label>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading && <span className="spinner" style={{ marginRight: '8px' }} />}
                {loading ? 'Saving' : 'Continue'}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="form-body" noValidate>
            <h2 className="step-title">Equity Details</h2>
            <p className="step-desc">Distribute shares among the {company.num_shareholders} shareholders.</p>

            <div className={`shares-bar ${Math.abs(totalShares - 100) < 0.01 ? 'valid' : ''}`}>
              <div className="shares-fill" style={{ width: `${Math.min(totalShares, 100)}%` }} />
            </div>
            <div className="shares-label" style={{ marginBottom: '24px', textAlign: 'right', fontSize: '11px', color: 'var(--text-muted)' }}>
              Total: {totalShares.toFixed(1)}% / 100%
            </div>

            <div className="shareholders-list">
              {shareholders.map((sh, idx) => (
                <div key={idx} className="shareholder-card">
                  <div className="shareholder-header">
                    <span className="shareholder-num">Shareholder {idx + 1}</span>
                    {shareholders.length > 1 && (
                      <button type="button" className="btn-remove" onClick={() => removeShareholder(idx)}>Remove</button>
                    )}
                  </div>

                  <div className="form-grid">
                    <div className={`form-field ${shareholderErrors[idx]?.name ? 'has-error' : ''}`}>
                      <input id={`sh-name-${idx}`} type="text" placeholder=" " value={sh.name} onChange={e => updateShareholder(idx, 'name', e.target.value)} />
                      <label htmlFor={`sh-name-${idx}`}>Full Name</label>
                      {shareholderErrors[idx]?.name && <span className="error-msg">{shareholderErrors[idx].name}</span>}
                    </div>

                    <div className={`form-field ${shareholderErrors[idx]?.email ? 'has-error' : ''}`}>
                      <input id={`sh-email-${idx}`} type="email" placeholder=" " value={sh.email} onChange={e => updateShareholder(idx, 'email', e.target.value)} />
                      <label htmlFor={`sh-email-${idx}`}>Email</label>
                      {shareholderErrors[idx]?.email && <span className="error-msg">{shareholderErrors[idx].email}</span>}
                    </div>

                    <div className={`form-field ${shareholderErrors[idx]?.nationality ? 'has-error' : ''}`}>
                      <input id={`sh-nat-${idx}`} type="text" placeholder=" " value={sh.nationality} onChange={e => updateShareholder(idx, 'nationality', e.target.value)} />
                      <label htmlFor={`sh-nat-${idx}`}>Nationality</label>
                      {shareholderErrors[idx]?.nationality && <span className="error-msg">{shareholderErrors[idx].nationality}</span>}
                    </div>

                    <div className={`form-field ${shareholderErrors[idx]?.share_percentage ? 'has-error' : ''}`}>
                      <input id={`sh-pc-${idx}`} type="number" placeholder=" " min="0.01" max="100" step="0.01" value={sh.share_percentage || ''} onChange={e => updateShareholder(idx, 'share_percentage', parseFloat(e.target.value) || 0)} />
                      <label htmlFor={`sh-pc-${idx}`}>Equity (%)</label>
                      {shareholderErrors[idx]?.share_percentage && <span className="error-msg">{shareholderErrors[idx].share_percentage}</span>}
                    </div>

                    <div className="form-field">
                      <select id={`sh-type-${idx}`} value={sh.share_type} onChange={e => updateShareholder(idx, 'share_type', e.target.value as ShareType)}>
                        {SHARE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <label htmlFor={`sh-type-${idx}`}>Share Type</label>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" className="btn btn-ghost" onClick={addShareholder}>+ Add Shareholder</button>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>Back</button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading && <span className="spinner" style={{ marginRight: '8px' }} />}
                {loading ? 'Processing' : 'Finalize Application'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
