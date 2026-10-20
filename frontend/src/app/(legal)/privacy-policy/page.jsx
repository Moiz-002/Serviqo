import { PolicyPage } from '@/components/legal/PolicyPage';

export const metadata = {
  title: 'Privacy Policy | Serviqo',
  description: 'Learn how Serviqo handles account, job, profile, and service information.',
};

const sections = [
  {
    heading: 'Who we are and this policy',
    paragraphs: [
      'Serviqo operates a marketplace that connects customers with service professionals. This Privacy Policy explains what information we handle when you use our web and mobile services, why we use it, and the choices available to you.',
      'By using Serviqo, you acknowledge that information will be handled as described here. If you do not agree, please do not use the platform.',
    ],
  },
  {
    heading: 'Information we collect',
    paragraphs: ['Depending on how you use Serviqo, information may include:'],
    items: [
      'Account details such as your name, phone number, optional email address, password credentials, and account role.',
      'Worker profile details such as skills, service category, experience, portfolio, availability, ratings, and verification information submitted for review.',
      'Service information such as job descriptions, budgets, location, images, proposals, reviews, messages, and support requests.',
      'Technical and usage information such as device/browser details, log data, security events, and essential session information needed to operate the service.',
      'Information you provide when contacting support or using features such as recommendations and service guidance.',
    ],
  },
  {
    heading: 'How we use information',
    paragraphs: ['We use relevant information to:'],
    items: [
      'Create and secure accounts, authenticate users, verify workers, and provide role-appropriate access.',
      'Publish and manage job requests, proposals, messaging, reviews, notifications, and other marketplace features.',
      'Generate AI-assisted worker recommendations or price guidance from relevant job and professional profile information. Recommendations are suggestions, not guarantees.',
      'Respond to support requests, prevent fraud and misuse, protect users, troubleshoot issues, and improve platform reliability.',
      'Meet legal obligations and enforce our terms and safety policies.',
    ],
  },
  {
    heading: 'How information is shared',
    paragraphs: [
      'Serviqo shares information when needed to provide the service. For example, job details are shown to eligible workers; selected professional profile information is shown to customers; and the parties to a job may communicate through the platform. Do not include sensitive personal information in public profile or job content.',
      'We may use hosting, communications, security, and AI service providers to operate features. They may process relevant information on our instructions or under their own applicable privacy terms. We do not sell personal information. We may disclose information where required by law, to protect users or the platform, or as part of a business transfer with appropriate safeguards.',
    ],
  },
  {
    heading: 'Retention and security',
    paragraphs: [
      'We retain information for as long as needed to provide the service, maintain records, resolve disputes, enforce agreements, and meet legal requirements. Retention periods depend on the type and purpose of the information.',
      'We use reasonable administrative and technical safeguards, including protected authentication and access controls. No online system can be guaranteed completely secure. Keep your credentials private and contact us promptly if you believe your account has been compromised.',
    ],
  },
  {
    heading: 'Your choices and rights',
    paragraphs: [
      'You can review and update certain profile information through your account. You may contact us to request access, correction, deletion, or information about our handling of your personal data, subject to identity checks, applicable law, and records we are required or permitted to retain.',
      'You can choose whether to provide optional information such as an email address, but some features require particular information (for example, a phone number for account access). You may stop using Serviqo and request account assistance by emailing help@serviqo.com.',
    ],
  },
  {
    heading: 'Children and international processing',
    paragraphs: [
      'Serviqo is intended for adults arranging or providing services, and is not designed for children. Do not create an account if you are not legally able to enter into the relevant agreements.',
      'Information may be processed in locations where Serviqo or its service providers operate. Where required, we take steps intended to protect information when it is processed across borders.',
    ],
  },
  {
    heading: 'Updates and contact',
    paragraphs: [
      'We may revise this policy when our services or requirements change. The current version and effective date will be posted on this page.',
      'For privacy questions or requests, email help@serviqo.com. Please do not send passwords or identity documents through ordinary email unless our support team provides a secure submission method.',
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <PolicyPage
      type="privacy"
      title="Privacy Policy"
      summary="A clear explanation of the information Serviqo uses to connect customers and professionals, protect accounts, and support marketplace features."
      sections={sections}
    />
  );
}
