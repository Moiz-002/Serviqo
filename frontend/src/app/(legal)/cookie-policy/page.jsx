import { PolicyPage } from '@/components/legal/PolicyPage';

export const metadata = {
  title: 'Cookie Policy | Serviqo',
  description: 'Learn about essential cookies and browser storage used by Serviqo.',
};

const sections = [
  {
    heading: 'What cookies are',
    paragraphs: [
      'Cookies are small files stored by a website in your browser. Similar technologies can remember a session, support security, or help a site function across pages and visits.',
      'This policy explains how Serviqo uses cookies and related browser storage in its web services. Mobile applications may use equivalent device storage rather than browser cookies.',
    ],
  },
  {
    heading: 'How Serviqo uses them',
    paragraphs: [
      'Serviqo uses essential session and security technologies to support sign-in, maintain account state, protect requests, and keep core site features working. If these are blocked, you may be unable to sign in or use protected features.',
      'We may also use temporary browser storage to support the operation of a page or remember information during a workflow. Serviqo does not currently use cookies for third-party advertising or cross-site ad tracking.',
    ],
  },
  {
    heading: 'Third-party services',
    paragraphs: [
      'Some features rely on third-party providers, such as hosting, security, or communications services. Those providers may use their own technologies when you interact with their services; their use is governed by their respective privacy and cookie notices.',
      'Serviqo does not control cookies set directly by third-party websites. Review the relevant provider’s policy before using an external service.',
    ],
  },
  {
    heading: 'Your browser choices',
    paragraphs: [
      'Most browsers let you inspect, block, or delete cookies and clear site storage. The controls vary by browser and device. Blocking essential cookies or storage may sign you out or prevent important parts of Serviqo from working.',
      'You can usually configure your browser to notify you when cookies are set or to reject selected categories. Removing cookies does not automatically delete information already held in your Serviqo account.',
    ],
  },
  {
    heading: 'Changes and contact',
    paragraphs: [
      'We may update this policy as the platform changes. Any revised version will be published here with a new effective date.',
      'For questions about cookies or privacy, contact help@serviqo.com.',
    ],
  },
];

export default function CookiePolicyPage() {
  return (
    <PolicyPage
      type="cookies"
      title="Cookie Policy"
      summary="How Serviqo uses essential cookies and browser storage to keep sign-in secure and the core marketplace working."
      sections={sections}
    />
  );
}
