import { PolicyPage } from '@/components/legal/PolicyPage';

export const metadata = {
  title: 'Terms of Service | Serviqo',
  description: 'Read the terms that apply when using the Serviqo service marketplace.',
};

const sections = [
  {
    heading: 'About Serviqo',
    paragraphs: [
      'Serviqo provides an online marketplace that helps customers find service professionals and helps professionals discover service requests. These Terms apply when you access or use Serviqo websites, mobile applications, and related services.',
      'Serviqo facilitates discovery and communication. Unless a specific service is expressly provided by Serviqo, the service agreement is between the customer and the selected professional.',
    ],
  },
  {
    heading: 'Accounts and eligibility',
    paragraphs: [
      'You must provide accurate information, keep your sign-in credentials private, and promptly update information that changes. You are responsible for activity carried out through your account and must contact us if you suspect unauthorized access.',
      'Use the account type that matches your role. Workers must provide accurate professional information and any verification material requested by the platform. Serviqo may restrict or suspend accounts where required to protect users, comply with law, or enforce these Terms.',
    ],
  },
  {
    heading: 'Service requests, proposals, and agreements',
    paragraphs: [
      'Customers are responsible for describing their work requirements accurately. Workers are responsible for submitting honest proposals, qualifications, availability, and pricing. Customers choose whether to accept a proposal; a match or recommendation is not a guarantee of suitability or quality.',
      'Once a customer accepts a proposal, the customer and worker should confirm the scope, schedule, price, and other job details before work begins. Both parties must communicate respectfully and use the platform lawfully.',
    ],
  },
  {
    heading: 'Pricing and payments',
    paragraphs: [
      'Prices, budgets, estimates, and AI-generated recommendations are informational and may not reflect the final cost. Confirm the amount and scope directly with the other party before committing.',
      'Some payment or transaction screens may be demonstrative or recordkeeping features. Unless a payment flow clearly identifies an enabled payment provider and confirms a successful transaction, do not treat a displayed status as proof that money has been transferred. Any applicable platform fee will be presented before it is charged.',
    ],
  },
  {
    heading: 'Reviews, messages, and acceptable use',
    paragraphs: [
      'Reviews should reflect genuine experiences and must not contain threats, discriminatory content, private information, or knowingly false statements. Do not harass other users, misrepresent identity or credentials, interfere with the service, attempt unauthorized access, or use Serviqo to facilitate unlawful activity.',
      'You retain responsibility for content you submit and must have the rights needed to share it. You give Serviqo permission to host and display that content as needed to operate and improve the marketplace.',
    ],
  },
  {
    heading: 'Recommendations and availability',
    paragraphs: [
      'Serviqo may use automated systems to suggest workers, categories, or price ranges based on job details and available profile information. These suggestions are decision-support tools, not endorsements, guarantees, professional advice, or a substitute for your own checks and judgment.',
      'Serviqo may change, suspend, or discontinue features and cannot guarantee uninterrupted availability, a particular match, a job outcome, or the conduct or performance of another user.',
    ],
  },
  {
    heading: 'Safety, liability, and account termination',
    paragraphs: [
      'Use reasonable care when arranging or receiving services. Verify identity, qualifications, scope, and safety arrangements as appropriate. Serviqo is not a party to the work agreement between customers and workers and is not responsible for independently performed services.',
      'To the extent permitted by applicable law, Serviqo is provided on an available basis and we exclude warranties that cannot be reasonably made for an online marketplace. Nothing in these Terms limits liability that cannot legally be excluded. You may stop using the service at any time; Serviqo may suspend or close accounts for violations, safety concerns, or legal obligations.',
    ],
  },
  {
    heading: 'Changes and contact',
    paragraphs: [
      'We may update these Terms as the platform or applicable requirements change. We will publish the updated version here and revise the effective date. Continued use after an update takes effect means you accept the revised Terms, to the extent permitted by law.',
      'Questions about these Terms can be sent to help@serviqo.com. These Terms are subject to applicable laws, including the laws applicable in Pakistan, without limiting any mandatory consumer rights.',
    ],
  },
];

export default function TermsOfServicePage() {
  return (
    <PolicyPage
      type="terms"
      title="Terms of Service"
      summary="The ground rules for using Serviqo to find services, connect with professionals, and participate in our marketplace."
      sections={sections}
    />
  );
}
