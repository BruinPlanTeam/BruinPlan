import CardNav from './CardNav';
import logo from '../assets/logo.svg';

export const Header = () => {
  const items = [
    {
      label: "Browse Majors",
      bgColor: "#0D0716",
      textColor: "#fff",
      links: [
        { label: "UCLA Catalog", ariaLabel: "UCLA Catalog", href: "https://catalog.registrar.ucla.edu/"},
        { label: "Bruinwalk", ariaLabel: "About Careers", href: "https://bruinwalk.com/" }
      ]
    },
    {
      label: "Projects", 
      bgColor: "#170D27",
      textColor: "#fff",
      links: [
        { label: "Featured", ariaLabel: "Featured Projects" },
        { label: "Case Studies", ariaLabel: "Project Case Studies" }
      ]
    },
    {
      label: "Contact",
      bgColor: "#271E37", 
      textColor: "#fff",
      links: [
        { label: "Email", ariaLabel: "Email us" },
        { label: "Twitter", ariaLabel: "Twitter" },
        { label: "LinkedIn", ariaLabel: "LinkedIn" }
      ]
    }
  ];

  return (
    <CardNav
      logo={logo}
      logoAlt="Bruin Plan"
      items={items}
      baseColor="rgba(255, 255, 255, 0.1)"
      menuColor="#fff"
      buttonBgColor="#fff"
      buttonTextColor="#fff"
      ease="power3.out"
    />
  );
};

