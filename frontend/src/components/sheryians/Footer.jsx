import { ArrowUpRight, Brain, Clock3, Mail, MapPin, Phone } from 'lucide-react';

const aboutLinks = [
  { label: 'About Us', href: '#' },
  { label: 'Support', href: '#' },
  { label: 'Terms and Condition', href: '#' },
  { label: 'Privacy Policy', href: '#' },
  { label: 'Submit Projects', href: '#' },
];

const companyLinks = [
  { label: 'Hire From Us', href: '#' },
  { label: 'Discord', href: '#' },
  { label: 'Pricing and Refund', href: '#' },
  { label: 'Jobs', href: '#' },
  { label: 'Feedback', href: '#' },
];

const contactItems = [
  {
    icon: MapPin,
    label: 'Location',
    value: '23-B, Sector C, Indrapuri, Bhopal, MP 462022',
    href: '#',
  },
  {
    icon: Mail,
    label: 'Email',
    value: 'hello@designschool.com',
    href: 'mailto:hello@designschool.com',
  },
  {
    icon: Phone,
    label: 'Phone',
    value: '+91 99934 78545',
    href: 'tel:+919993478545',
  },
  {
    icon: Clock3,
    label: 'Timings',
    value: '11:00 AM - 8:00 PM (Mon-Sat)',
    href: '#',
  },
  {
    icon: Phone,
    label: 'Support',
    value: '+91 96917 78470',
    href: 'tel:+919691778470',
  },
];

const FooterLinkGroup = ({ title, links }) => {
  return (
    <div>
      <h3 className="text-base font-semibold uppercase tracking-[0.12em] text-white md:text-lg">
        {title}
      </h3>
      <ul className="mt-5 space-y-3 md:mt-6 md:space-y-3.5">
        {links.map((item) => (
          <li key={item.label}>
            <a
              href={item.href}
              className="group inline-flex items-center text-base font-normal tracking-tight text-zinc-300 transition-colors hover:text-brand md:text-[1.06rem]"
            >
              {item.label}
              <ArrowUpRight className="ml-1 h-4 w-4 -translate-y-[1px] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100" />
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

const FooterInfoGroup = ({ title, items }) => {
  return (
    <div>
      <h3 className="text-base font-semibold uppercase tracking-[0.12em] text-white md:text-lg">
        {title}
      </h3>

      <ul className="mt-5 space-y-4 md:mt-6">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.label}>
              <a
                href={item.href}
                className="group flex items-start gap-3 rounded-xl border border-transparent p-2 -m-2 transition-colors hover:border-white/10 hover:bg-white/[0.02]"
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                <div className="leading-tight">
                  <p className="text-xs uppercase tracking-[0.1em] text-zinc-500">{item.label}</p>
                  <p className="mt-1 text-sm text-zinc-300 transition-colors group-hover:text-white md:text-[0.95rem]">
                    {item.value}
                  </p>
                </div>
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const Footer = () => {
  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-black px-6 pb-12 pt-16 md:px-8 md:pb-14 md:pt-20">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_14%,rgba(16,185,129,0.14),transparent_38%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.2),rgba(0,0,0,0.86)_38%,#000_100%)]" />

      <div className="relative mx-auto max-w-7xl">
        <div className="border-b border-white/10 pb-10 md:pb-12">
          <div className="md:pr-8">
            <a href="/" className="inline-flex items-center gap-2.5">
              <span className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 bg-white/5">
                <Brain className="h-6 w-6 text-white" />
                <span className="absolute inset-0 rounded-2xl bg-brand/15 blur-lg" />
              </span>
              <span className="text-2xl font-semibold tracking-tight text-white md:text-[1.7rem]">
                Design School
              </span>
            </a>
            <p className="mt-4 max-w-xl text-[0.96rem] leading-relaxed text-zinc-400 md:text-base">
              Building career-ready developers with practical mentorship, modern curriculum, and
              real project experience.
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-10 md:grid-cols-3 md:gap-8">
          <FooterLinkGroup title="ABOUT" links={aboutLinks} />
          <FooterLinkGroup title="COMPANY" links={companyLinks} />
          <FooterInfoGroup title="CONTACT" items={contactItems} />
        </div>

        <div className="flex flex-col gap-3 pt-7 text-zinc-500 md:flex-row md:items-center md:justify-between">
          <p className="text-sm">Copyright 2026 Design School. All rights reserved.</p>
          <p className="text-sm">Learn. Build. Get Placed.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
