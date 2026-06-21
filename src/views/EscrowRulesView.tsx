import React, { useState } from 'react';
import { LegalLayout } from '../components/LegalLayout';
import { Lock, Key, Clock, CheckCircle2, ShieldAlert, CheckSquare } from 'lucide-react';

export const EscrowRulesView: React.FC = () => {
  const [activeStep, setActiveStep] = useState<number>(0);
  const [checklist, setChecklist] = useState({
    login: false,
    recoveryEmail: false,
    phoneAnd2fa: false,
    metricsCheck: false,
    sellerAccessRevoked: false,
  });

  const steps = [
    {
      title: '1. Lock Funds',
      icon: <Lock className="w-5 h-5" />,
      desc: 'Buyer locks purchase price via Paystack.',
      details: 'When you check out, your payment is processed securely via Paystack and held in our neutral escrow pool. The seller is notified that payment is confirmed but cannot access the funds until the trade is finalized.',
      tips: ['Ensure your card or bank account has sufficient limits.', 'Only pay via our official Paystack portal.', 'Never send cash or direct transfers outside the site.'],
    },
    {
      title: '2. Credential Handover',
      icon: <Key className="w-5 h-5" />,
      desc: 'System delivers login information to Buyer.',
      details: 'Once funds are locked, we pull the validated login details (username, password, recovery key) and deliver them to your dashboard or email. This starts the verification sequence.',
      tips: ['Log in from a clean browser or residential IP.', 'Avoid using spammy VPNs that could trigger instant lockouts.', 'Ensure the username matches the listing exactly.'],
    },
    {
      title: '3. 72-Hour Audit',
      icon: <Clock className="w-5 h-5" />,
      desc: 'Buyer inspects assets and updates security.',
      details: 'You have exactly 72 hours from credentials delivery to inspect the account metrics, niche validity, and change all security details to lock the seller out permanently.',
      tips: ['Immediately change the password and recovery email.', 'Enable a fresh Two-Factor Authentication (2FA) app.', 'Audit follower quality and engagement analytics.'],
    },
    {
      title: '4. Final Release',
      icon: <CheckCircle2 className="w-5 h-5" />,
      desc: 'Escrow pays Seller; transfer completes.',
      details: 'If you are satisfied with the account, you can manually release the funds to the seller. If the 72-hour window expires without a dispute or manual release, the system auto-releases the funds.',
      tips: ['Double check everything before releasing; actions are irreversible.', 'Once funds are released, seller support for that asset terminates.', 'Leave feedback on the seller profile.'],
    },
  ];

  const handleToggleCheck = (key: keyof typeof checklist) => {
    setChecklist(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const sections = [
    {
      id: 'rules-overview',
      title: '1. Overview of Escrow Protection',
      content: (
        <div className="space-y-3">
          <p>
            N_Logs employs a strict, security-first escrow system designed to eliminate exit scams, recovery frauds, and misleading account sales. 
          </p>
          <p>
            Our core protocol is simple: <strong>Funds are held in secure neutral custody until the buyer takes complete ownership of the asset and verifies its stats.</strong>
          </p>
          <div className="flex gap-3 p-4 rounded bg-brand-navy/5 border border-brand-border text-xs text-brand-muted leading-relaxed">
            <ShieldAlert className="text-brand-red w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-brand-navy block uppercase mb-1">Critical Rule</span>
              Buyers must not request, negotiate, or accept direct payments outside our escrow dashboard. Doing so voids all buyer protection, makes you ineligible for dispute support, and results in immediate account suspension.
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'interactive-timeline',
      title: '2. Interactive Escrow Flow Visualizer',
      content: (
        <div className="space-y-6">
          <p className="text-xs text-brand-muted">
            Click on any phase below to trace the transfer milestones, requirements, and best practices:
          </p>
          
          {/* Stepper Header */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {steps.map((step, idx) => (
              <button
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`flex flex-col items-center text-center p-3 rounded border transition-all duration-200 cursor-pointer ${
                  activeStep === idx
                    ? 'bg-brand-navy text-white border-brand-navy shadow'
                    : 'bg-brand-card hover:bg-brand-navy/5 border-brand-border text-brand-navy'
                }`}
              >
                <div className={`p-2 rounded-full mb-2 ${activeStep === idx ? 'bg-brand-red text-white' : 'bg-brand-navy/10 text-brand-navy'}`}>
                  {step.icon}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider font-sans">{step.title}</span>
                <span className="text-[9px] opacity-70 mt-1 line-clamp-1">{step.desc}</span>
              </button>
            ))}
          </div>

          {/* Stepper Details Panel */}
          <div className="p-5 rounded bg-brand-navy/5 border border-brand-border space-y-4 transition-smooth">
            <div className="flex items-center justify-between border-b border-brand-border pb-3">
              <h4 className="text-xs font-bold text-brand-navy uppercase tracking-wider font-sans">
                Phase Info: {steps[activeStep].title}
              </h4>
              <span className="text-[9px] font-mono bg-brand-red/10 text-brand-red font-bold px-2 py-0.5 rounded">
                Active View
              </span>
            </div>
            <p className="text-xs text-brand-navy font-sans leading-relaxed">
              {steps[activeStep].details}
            </p>
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-brand-navy block uppercase tracking-wider">Operational Tips:</span>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-brand-muted font-sans list-disc pl-5">
                {steps[activeStep].tips.map((tip, i) => (
                  <li key={i}>{tip}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'audit-checklist',
      title: '3. Buyer 72-Hour Audit Checklist',
      content: (
        <div className="space-y-4">
          <p>
            The 72-hour window starts the second credentials are released. Use this interactive inspection checklist to guarantee that you have locked down the account securely before the escrow timer runs out:
          </p>

          <div className="space-y-2 bg-brand-card border border-brand-border p-4 rounded">
            <h4 className="text-[10px] font-bold uppercase text-brand-muted tracking-wider mb-3 flex items-center gap-1">
              <CheckSquare size={12} /> Interactive Checklist (Click items as you complete them)
            </h4>
            
            <div className="space-y-2.5">
              {[
                { key: 'login', label: 'Log into account successfully using credentials' },
                { key: 'recoveryEmail', label: 'Change recovery email to a brand new secure address' },
                { key: 'phoneAnd2fa', label: 'Update recovery phone number & bind a mobile 2FA generator code' },
                { key: 'metricsCheck', label: 'Cross-reference current follower count & demographics with listings' },
                { key: 'sellerAccessRevoked', label: 'Revoke other active sessions and log out unauthorized devices' }
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex items-center gap-3 p-2.5 rounded bg-brand-bg/50 border border-brand-border hover:bg-brand-navy/5 transition cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    checked={checklist[item.key as keyof typeof checklist]}
                    onChange={() => handleToggleCheck(item.key as keyof typeof checklist)}
                    className="w-3.5 h-3.5 text-brand-red rounded border-brand-border focus:ring-brand-red focus:ring-offset-0 accent-brand-red cursor-pointer"
                  />
                  <span className={`text-xs font-sans ${checklist[item.key as keyof typeof checklist] ? 'line-through text-brand-muted' : 'text-brand-navy font-bold'}`}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'auto-release',
      title: '4. Automatic Release Clause',
      content: (
        <div className="space-y-3">
          <p>
            The escrow holding system is regulated by automatic schedules. If the buyer does not manually release funds or file an official dispute ticket within <strong>72 hours</strong> from the credential dispatch timestamp, the system will execute an automatic payout release.
          </p>
          <p>
            Once funds are released (either automatically or manually), the transaction is flagged as <strong>Closed</strong>. Funds are disbursed to the seller’s local bank account, and N_Logs cannot recover, reverse, or refund the transaction under any circumstances.
          </p>
        </div>
      ),
    },
    {
      id: 'invalid-reclaims',
      title: '5. Protection Against Account Reclaims',
      content: (
        <div className="space-y-3">
          <p>
            If a seller reclaims or pulls back an account via primary email support after the escrow release:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>N_Logs will conduct a thorough lookup. If proof of reclaim is verified, the seller's security deposit is seized, their account is banned, and their details are blacklisted.</li>
            <li>We strongly advise buyers to change the associated primary registration email of the account where possible to prevent reclaim actions.</li>
          </ul>
        </div>
      ),
    },
  ];

  return (
    <LegalLayout
      title="Buyer Escrow Rules"
      subtitle="Complete rules governing transaction timelines, security checklists, and funds protection."
      lastUpdated="June 20, 2026"
      sections={sections}
    />
  );
};
