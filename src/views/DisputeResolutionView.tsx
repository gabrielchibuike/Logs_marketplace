import React from 'react';
import { LegalLayout } from '../components/LegalLayout';
import { FileVideo, ShieldAlert, CheckCircle, RefreshCcw } from 'lucide-react';

export const DisputeResolutionView: React.FC = () => {
  const sections = [
    {
      id: 'filing-dispute',
      title: '1. How to Initiate a Dispute',
      content: (
        <div className="space-y-3">
          <p>
            If the delivered credentials do not work, or the account credentials show significant discrepancies compared to the catalog listing, the buyer must file a dispute before the 72-hour escrow lock expires.
          </p>
          <p>
            To initiate a dispute:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Go to your dashboard under "My Accounts", locate the active transaction, and click <strong>"File Dispute"</strong>.</li>
            <li>Alternatively, message our official support admins on Telegram or WhatsApp with your Paystack Transaction Reference ID.</li>
          </ul>
          <p>
            Once a dispute is filed, the escrow timer is <strong>paused</strong> immediately, preventing any auto-release of funds to the seller.
          </p>
        </div>
      ),
    },
    {
      id: 'evidence-requirements',
      title: '2. Required Proof & Evidence Formats',
      content: (
        <div className="space-y-3">
          <p>
            To ensure fair arbitration and prevent buyer fraud, N_Logs enforces strict evidence guidelines. We require objective proof of credentials malfunction or metrics mismatch.
          </p>
          <div className="p-4 rounded border border-brand-border bg-brand-navy/5 space-y-3">
            <h4 className="text-xs font-bold text-brand-navy flex items-center gap-2 uppercase tracking-wider font-sans">
              <FileVideo className="text-brand-red w-4 h-4 shrink-0" />
              Uncut Video Screen Recording Standard
            </h4>
            <p className="text-xs text-brand-muted leading-relaxed font-sans">
              The buyer must provide a single, continuous, and uncut video screen recording demonstrating the following sequence:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-xs text-brand-muted font-sans">
              <li>Open a fresh browser window or application login screen.</li>
              <li>Copy and paste the exact username and password sent by N_Logs.</li>
              <li>Attempt to sign in, displaying the specific error message (e.g. "incorrect password", "account banned", or "requires code from unknown device").</li>
              <li>Show the device clock showing the current time during the attempt.</li>
            </ol>
          </div>
          <p className="text-[11px] text-brand-muted italic">
            Note: Edited screenshots, cropped videos, or delayed recordings (submitted hours after recovery changes) are not accepted as valid evidence.
          </p>
        </div>
      ),
    },
    {
      id: 'arbitration-process',
      title: '3. The Arbitration Process',
      content: (
        <div className="space-y-3">
          <p>
            Upon filing a dispute and uploading evidence, the transaction status is updated to <strong>Under Arbitration</strong>. The process involves:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Staff Audit (24-48 Hours):</strong> An N_Logs administrator will review the evidence video, check database logs, and test recovery links.
            </li>
            <li>
              <strong>Seller Consultation:</strong> The seller is contacted to verify if an accidental recovery or password reset occurred. They have 24 hours to respond.
            </li>
            <li>
              <strong>Resolution:</strong> The administrator issues a final, binding decision based on the evidence presented.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'resolution-scenarios',
      title: '4. Possible Resolution Outcomes',
      content: (
        <div className="space-y-4">
          <p>
            Depending on the findings, the administrator will resolve the dispute in one of the following ways:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded border border-brand-border bg-brand-card space-y-2">
              <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center">
                <CheckCircle size={18} />
              </div>
              <h5 className="text-xs font-bold text-brand-navy font-sans">Full Refund</h5>
              <p className="text-[11px] text-brand-muted leading-relaxed font-sans">
                If credentials are proved invalid, the account is banned prior to receipt, or metrics are falsified, the escrowed funds are returned to the buyer's account.
              </p>
            </div>

            <div className="p-4 rounded border border-brand-border bg-brand-card space-y-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                <RefreshCcw size={18} />
              </div>
              <h5 className="text-xs font-bold text-brand-navy font-sans">Asset Replacement</h5>
              <p className="text-[11px] text-brand-muted leading-relaxed font-sans">
                By mutual agreement, the seller can provide an alternative account of equivalent value, size, and demographic layout to replace the defective asset.
              </p>
            </div>

            <div className="p-4 rounded border border-brand-border bg-brand-card space-y-2">
              <div className="w-8 h-8 rounded-full bg-red-50 text-brand-red flex items-center justify-center">
                <ShieldAlert size={18} />
              </div>
              <h5 className="text-xs font-bold text-brand-navy font-sans">Funds Released</h5>
              <p className="text-[11px] text-brand-muted leading-relaxed font-sans">
                If the buyer fails to provide required evidence, or evidence of fraudulent claim is detected, the dispute is dismissed and funds are disbursed to the seller.
              </p>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <LegalLayout
      title="Dispute Resolution Policy"
      subtitle="Filing guidelines, evidence standards, and transaction arbitration details."
      lastUpdated="June 20, 2026"
      sections={sections}
    />
  );
};
