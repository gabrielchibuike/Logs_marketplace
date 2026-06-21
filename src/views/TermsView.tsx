import React from 'react';
import { LegalLayout } from '../components/LegalLayout';

export const TermsView: React.FC = () => {
  const sections = [
    {
      id: 'acceptance',
      title: '1. Acceptance of Terms',
      content: (
        <div className="space-y-3">
          <p>
            Welcome to N_Logs ("we," "our," "us," or "the Platform"). By accessing our website, purchasing listed accounts, or using our escrow services, you agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, you must not use our services.
          </p>
          <p>
            These Terms govern your use of the N_Logs account procurement protocol, including transactions, listing queries, and support channels (such as our official Telegram and WhatsApp groups).
          </p>
        </div>
      ),
    },
    {
      id: 'eligibility',
      title: '2. Platform Operations & Eligibility',
      content: (
        <div className="space-y-3">
          <p>
            N_Logs acts as a secure, escrow-backed catalog platform connecting verified sellers of social media assets (including Instagram, Twitter/X, TikTok, YouTube, and Facebook) with prospective buyers.
          </p>
          <p>
            To utilize this platform, you must:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Be at least 18 years of age or the legal age of majority in your jurisdiction.</li>
            <li>Maintain an active contact method (such as an email, phone number, or Telegram username) to facilitate the secure transfer of credentials.</li>
            <li>Not use the Platform for any illegal purposes or to procure accounts intended for deceptive practices, malicious impersonation, or distributing spam.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'escrow-checkout',
      title: '3. Payments & Escrow Protection',
      content: (
        <div className="space-y-3">
          <p>
            To guarantee absolute safety for buyers, all payments made on N_Logs are secured by our customized Escrow holding mechanism. 
          </p>
          <p>
            Transactions are processed through Paystack, a highly secure payment rail. When a buyer initiates a checkout:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>The payment is verified and held securely in our neutral escrow pool.</li>
            <li>Funds are <strong>not</strong> sent directly to the seller upon checkout.</li>
            <li>Funds are locked for a mandatory verification period of <strong>72 hours</strong> from the moment account credentials are delivered to the buyer, allowing full inspections.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'handover-protocol',
      title: '4. Account Verification & Secure Handover',
      content: (
        <div className="space-y-3">
          <p>
            Once a payment is secured in escrow, the platform initiates the handover protocol:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>We request and verify the login credentials directly from the seller or leverage automated systems to lock the account.</li>
            <li>Credentials are delivered to the buyer's designated email/dashboard.</li>
            <li>The buyer is required to verify the account metrics (niche, follower count, engagement ratios) and immediately secure the asset by changing the recovery email, password, and adding two-factor authentication (2FA).</li>
          </ul>
          <div className="p-3 bg-brand-navy/5 border-l-2 border-brand-red text-[11px] text-brand-muted font-sans italic">
            <strong>Warning:</strong> Failure to change recovery details immediately upon credential receipt transfers all liability for subsequent access issues directly to the buyer.
          </div>
        </div>
      ),
    },
    {
      id: 'prohibited-conduct',
      title: '5. Prohibited Activities',
      content: (
        <div className="space-y-3">
          <p>
            To maintain a trustworthy environment, users are strictly prohibited from:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>Attempting to bypass our escrow system by negotiating direct payments with sellers outside the Platform.</li>
            <li>Filing fraudulent chargebacks or dispute reports without valid justification (e.g. reporting an account as "defective" after changing recovery details and locking out the seller).</li>
            <li>Altering, modifying, or using the acquired account to violate the target social media platform's respective terms of service (such as posting prohibited or illegal content).</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'warranties',
      title: '6. Limitation of Liability & Warranties',
      content: (
        <div className="space-y-3">
          <p>
            All listed accounts are provided "as-is." While N_Logs screens each asset for follower authenticity and metric validity, we do not guarantee the post-handover performance or lifespan of the account.
          </p>
          <p>
            N_Logs is not responsible for actions taken by social media platforms (such as suspensions, bans, shadow-bans, or demographic updates) after a successful, verified handover.
          </p>
          <p>
            In no event shall N_Logs or its operators be liable for indirect, incidental, or consequential damages resulting from transaction failures or account suspensions.
          </p>
        </div>
      ),
    },
    {
      id: 'governing-law',
      title: '7. Amendments & Governing Law',
      content: (
        <div className="space-y-3">
          <p>
            We reserve the right to amend these Terms of Service at any time. Changes will take effect immediately upon being posted on this page with an updated revision date.
          </p>
          <p>
            These terms shall be governed by and construed in accordance with the laws applicable in our operating jurisdiction, without regard to conflict of law principles. Any dispute arising under these terms shall be subject to the exclusive arbitration protocols outlined on our Platform.
          </p>
        </div>
      ),
    },
  ];

  return (
    <LegalLayout
      title="Terms of Service"
      subtitle="Operating regulations, account transfer protocols, and buyer-seller agreements."
      lastUpdated="June 20, 2026"
      sections={sections}
    />
  );
};
