import React from 'react';
import { LegalLayout } from '../components/LegalLayout';

export const PrivacyView: React.FC = () => {
  const sections = [
    {
      id: 'collection',
      title: '1. Information We Collect',
      content: (
        <div className="space-y-3">
          <p>
            To provide a secure and reliable escrow environment, we collect and process certain personal information from buyers and sellers, including:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Account Handover Data:</strong> Social media credentials, backup codes, associated recovery email accounts, and authorization cookies necessary to verify and transfer ownership of listed assets.
            </li>
            <li>
              <strong>Contact Details:</strong> Email addresses, phone numbers, WhatsApp contacts, and Telegram usernames used to send alerts, deliver credentials, and facilitate support.
            </li>
            <li>
              <strong>Transaction Logs:</strong> Record of items bought/sold, transaction IDs, timestamps, and escrow statuses. (Note: We do not store credit card or bank details; all payment processing is handled securely by Paystack).
            </li>
            <li>
              <strong>Technical Indicators:</strong> IP addresses, browser configurations, and cookies to prevent fraud, detect multilogins, and secure our system.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'usage',
      title: '2. How We Use Information',
      content: (
        <div className="space-y-3">
          <p>
            The information we collect is utilized strictly to run the account acquisition protocol. Specifically:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>To verify credentials, check audience metrics, and confirm follower stats before list approval.</li>
            <li>To securely route logins and recovery information to the designated buyer after payment validation.</li>
            <li>To arbitrate and resolve disputes during the 72-hour escrow inspection period.</li>
            <li>To notify you about changes to listings, support queries, or system updates.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'data-security',
      title: '3. Data Security & Escrow Safety',
      content: (
        <div className="space-y-3">
          <p>
            We implement high-grade organizational and technical measures to protect sensitive data:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li><strong>Automated Purging:</strong> Once a handover is verified, completed, and the 72-hour escrow period expires, account credentials and recovery emails are scrubbed from our active databases and temporary cache.</li>
            <li><strong>Restricted Access:</strong> Only authorized administrators have access to pending credential lockers to conduct metric checks.</li>
            <li><strong>Encryption:</strong> All passwords and sensitive access tokens are encrypted in transit and at rest using AES-256 standard protocols.</li>
          </ul>
        </div>
      ),
    },
    {
      id: 'sharing',
      title: '4. Third-Party Integrations & Sharing',
      content: (
        <div className="space-y-3">
          <p>
            N_Logs does not sell, rent, or lease your personal information. Data is only shared under the following conditions:
          </p>
          <ul className="list-disc pl-5 space-y-1.5">
            <li>
              <strong>Payment Processors (Paystack):</strong> Required transaction details are shared to complete secure checkout processes.
            </li>
            <li>
              <strong>Verification Assistance:</strong> Essential contact details are shared between buyer and seller only during active dispute arbitrations to facilitate resolution.
            </li>
            <li>
              <strong>Legal Compliance:</strong> We will disclose information if required to do so by law, court order, or governmental authorities.
            </li>
          </ul>
        </div>
      ),
    },
    {
      id: 'cookies',
      title: '5. Cookies & Tracking',
      content: (
        <div className="space-y-3">
          <p>
            We use essential and functional cookies to maintain your login session, remember UI settings (such as dark mode preference), and track platform performance. You can disable cookies in your browser settings, but doing so may limit your ability to access features like the Generator and Admin Panel.
          </p>
        </div>
      ),
    },
    {
      id: 'rights',
      title: '6. Your Rights & Data Deletion',
      content: (
        <div className="space-y-3">
          <p>
            You have the right to request a copy of the information we hold about you, object to processing, or request the complete deletion of your contact records.
          </p>
          <p>
            To submit a data deletion request, you can contact our support team through our official Telegram or WhatsApp support channels. Once verified, your account metadata and contact history will be permanently deleted from our records within 5 business days, provided there are no active escrow hold periods.
          </p>
        </div>
      ),
    },
  ];

  return (
    <LegalLayout
      title="Privacy Policy"
      subtitle="Details on data collection protocols, security standards, and third-party payment flows."
      lastUpdated="June 20, 2026"
      sections={sections}
    />
  );
};
