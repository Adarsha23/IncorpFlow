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
const STEPS = ['Company Info', 'Shareholders', 'Complete'];

const COMPANY_TYPES: CompanyType[] = [
  'LLC', 'Corporation', 'S-Corporation', 'Partnership', 'Sole Proprietorship',
];
const SHARE_TYPES: ShareType[] = ['Common', 'Preferred', 'Restricted'];
const JURISDICTIONS = [
  'Delaware, USA', 'Wyoming, USA', 'Nevada, USA', 'California, USA',
  'New York, USA', 'Texas, USA', 'United Kingdom', 'Singapore', 'Canada',
];

function emptyCompanyForm(): CompanyFormData {
  return { name: '', company_type: 'LLC', jurisdiction: '', registered_address: '', email: '', phone: '' };
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
          company_type: draft.company_type,
          jurisdiction: draft.jurisdiction,
          registered_address: draft.registered_address,
          email: draft.email,
          phone: draft.phone ?? '',
        });
        toast.success('Draft restored — continue where you left off');
        setStep(2);
      } else {
        // Already completed
        localStorage.removeItem(COMPANY_ID_KEY);
      }
    } catch {
      localStorage.removeItem(COMPANY_ID_KEY);
    }
  }, []);

  useEffect(() => { restoreDraft(); }, [restoreDraft]);

  // ── Step 1 validation ──────────────────────────────────────────────────────
  const validateStep1 = (): boolean => {
    const e: Record<string, string> = {};
    if (!company.name.trim()) e.name = 'Company name is required';
    if (!company.jurisdiction) e.jurisdiction = 'Please select a jurisdiction';
    if (!company.registered_address.trim()) e.registered_address = 'Address is required';
    if (!company.email.trim()) e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(company.email)) e.email = 'Valid email required';
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
      toast.success('Company draft saved!');
      setStep(2);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to save company';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Shareholder field helpers ──────────────────────────────────────────────
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

  // ── Step 2 validation ──────────────────────────────────────────────────────
  const validateStep2 = (): boolean => {
    const errs = shareholders.map(s => {
      const e: Record<string, string> = {};
      if (!s.name.trim()) e.name = 'Name required';
      if (!s.email.trim()) e.email = 'Email required';
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email)) e.email = 'Valid email required';
      if (!s.nationality.trim()) e.nationality = 'Nationality required';
      if (!s.share_percentage || s.share_percentage <= 0) e.share_percentage = 'Must be > 0%';
      return e;
    });
    setShareholderErrors(errs);
    const anyError = errs.some(e => Object.keys(e).length > 0);
    if (anyError) return false;
    if (Math.abs(totalShares - 100) > 0.01) {
      toast.error(`Shares must total 100% (currently ${totalShares.toFixed(2)}%)`);
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
      toast.success('Incorporation complete! 🎉');
      setStep(3);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? 'Failed to submit shareholders';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // ── Rendering ──────────────────────────────────────────────────────────────
  if (step === 3) {
    return (
      <div className="page-center">
        <div className="success-card">
          <div className="success-icon">✓</div>
          <h1>Incorporation Complete!</h1>
          <p>Your company has been successfully incorporated. Check your email for next steps.</p>
          <button className="btn btn-primary" onClick={() => { setStep(1); setCompany(emptyCompanyForm()); setShareholders([emptyShareholder()]); setCompanyId(null); }}>
            Start a New Incorporation
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="form-page">
      <div className="form-container">
        <div className="form-header">
          <div className="brand">
            <span className="brand-icon">⚡</span>
            <span className="brand-name">FounderDesk</span>
          </div>
          <p className="form-subtitle">Company Incorporation</p>
        </div>

        <Stepper currentStep={step} steps={STEPS} />

        {step === 1 && (
          <form onSubmit={handleStep1Submit} className="form-body" noValidate>
            <h2 className="step-title">Company Information</h2>
            <p className="step-desc">Let us start with the basics about your company.</p>

            <div className="form-grid">
              <div className={`form-group span-2 ${errors.name ? 'has-error' : ''}`}>
                <label htmlFor="name">Company Name <span className="required">*</span></label>
                <input id="name" type="text" placeholder="Acme Inc." value={company.name} onChange={e => setCompany(p => ({ ...p, name: e.target.value }))} />
                {errors.name && <span className="error-msg">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="company_type">Company Type <span className="required">*</span></label>
                <select id="company_type" value={company.company_type} onChange={e => setCompany(p => ({ ...p, company_type: e.target.value as CompanyType }))}>
                  {COMPANY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div className={`form-group ${errors.jurisdiction ? 'has-error' : ''}`}>
                <label htmlFor="jurisdiction">Jurisdiction <span className="required">*</span></label>
                <select id="jurisdiction" value={company.jurisdiction} onChange={e => setCompany(p => ({ ...p, jurisdiction: e.target.value }))}>
                  <option value="">Select jurisdiction…</option>
                  {JURISDICTIONS.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
                {errors.jurisdiction && <span className="error-msg">{errors.jurisdiction}</span>}
              </div>

              <div className={`form-group span-2 ${errors.registered_address ? 'has-error' : ''}`}>
                <label htmlFor="registered_address">Registered Address <span className="required">*</span></label>
                <input id="registered_address" type="text" placeholder="123 Main St, Wilmington, DE 19801" value={company.registered_address} onChange={e => setCompany(p => ({ ...p, registered_address: e.target.value }))} />
                {errors.registered_address && <span className="error-msg">{errors.registered_address}</span>}
              </div>

              <div className={`form-group ${errors.email ? 'has-error' : ''}`}>
                <label htmlFor="email">Business Email <span className="required">*</span></label>
                <input id="email" type="email" placeholder="hello@acme.com" value={company.email} onChange={e => setCompany(p => ({ ...p, email: e.target.value }))} />
                {errors.email && <span className="error-msg">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone <span className="optional">(optional)</span></label>
                <input id="phone" type="tel" placeholder="+1 555-000-0000" value={company.phone ?? ''} onChange={e => setCompany(p => ({ ...p, phone: e.target.value }))} />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? <span className="spinner" /> : null}
                {loading ? 'Saving…' : 'Save & Continue →'}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2Submit} className="form-body" noValidate>
            <h2 className="step-title">Shareholders</h2>
            <p className="step-desc">Add all shareholders. Total shares must equal 100%.</p>

            <div className={`shares-bar ${Math.abs(totalShares - 100) < 0.01 ? 'valid' : ''}`}>
              <div className="shares-fill" style={{ width: `${Math.min(totalShares, 100)}%` }} />
              <span className="shares-label">{totalShares.toFixed(1)}% / 100%</span>
            </div>

            <div className="shareholders-list">
              {shareholders.map((sh, idx) => (
                <div key={idx} className="shareholder-card">
                  <div className="shareholder-header">
                    <span className="shareholder-num">Shareholder {idx + 1}</span>
                    {shareholders.length > 1 && (
                      <button type="button" className="btn-remove" onClick={() => removeShareholder(idx)} aria-label="Remove shareholder">×</button>
                    )}
                  </div>

                  <div className="form-grid">
                    <div className={`form-group ${shareholderErrors[idx]?.name ? 'has-error' : ''}`}>
                      <label>Full Name <span className="required">*</span></label>
                      <input type="text" placeholder="Jane Doe" value={sh.name} onChange={e => updateShareholder(idx, 'name', e.target.value)} />
                      {shareholderErrors[idx]?.name && <span className="error-msg">{shareholderErrors[idx].name}</span>}
                    </div>

                    <div className={`form-group ${shareholderErrors[idx]?.email ? 'has-error' : ''}`}>
                      <label>Email <span className="required">*</span></label>
                      <input type="email" placeholder="jane@example.com" value={sh.email} onChange={e => updateShareholder(idx, 'email', e.target.value)} />
                      {shareholderErrors[idx]?.email && <span className="error-msg">{shareholderErrors[idx].email}</span>}
                    </div>

                    <div className={`form-group ${shareholderErrors[idx]?.nationality ? 'has-error' : ''}`}>
                      <label>Nationality <span className="required">*</span></label>
                      <input type="text" placeholder="American" value={sh.nationality} onChange={e => updateShareholder(idx, 'nationality', e.target.value)} />
                      {shareholderErrors[idx]?.nationality && <span className="error-msg">{shareholderErrors[idx].nationality}</span>}
                    </div>

                    <div className={`form-group ${shareholderErrors[idx]?.share_percentage ? 'has-error' : ''}`}>
                      <label>Share % <span className="required">*</span></label>
                      <input type="number" placeholder="50" min="0.01" max="100" step="0.01" value={sh.share_percentage || ''} onChange={e => updateShareholder(idx, 'share_percentage', parseFloat(e.target.value) || 0)} />
                      {shareholderErrors[idx]?.share_percentage && <span className="error-msg">{shareholderErrors[idx].share_percentage}</span>}
                    </div>

                    <div className="form-group">
                      <label>Share Type</label>
                      <select value={sh.share_type} onChange={e => updateShareholder(idx, 'share_type', e.target.value as ShareType)}>
                        {SHARE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button type="button" className="btn btn-ghost" onClick={addShareholder}>+ Add Shareholder</button>

            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                {loading ? <span className="spinner" /> : null}
                {loading ? 'Submitting…' : 'Complete Incorporation →'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
