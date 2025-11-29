import CardNav from './ui/CardNav';
import logo from '../assets/logo.svg';

export const Header = () => {
  const items = [
    {
      label: "Browse Majors",
      bgColor: "#0D0716",
      textColor: "#fff",
      links: [
        { label: "UCLA Catalog", ariaLabel: "UCLA Catalog", href: "https://catalog.registrar.ucla.edu/" },
        { label: "Bruinwalk", ariaLabel: "Bruinwalk", href: "https://bruinwalk.com/" }
      ]
    },
    {
      label: "Guidance",
      bgColor: "#150B25",
      textColor: "#fff",
      links: [
        { 
          label: "Sample 4-Year Schedules", 
          ariaLabel: "Sample 4-Year Schedules", 
          href: "https://www.ugeducation.ucla.edu/degreepath/majors/"
        },
        { 
          label: "Degree Planning Tips", 
          ariaLabel: "Degree Planning Tips", 
          href: "https://newstudents.ucla.edu/wp-content/uploads/2017/10/Degree-Planner.pdf"
        },
        { 
          label: "Pre-Health Requirements", 
          ariaLabel: "Pre-Health Requirements", 
          href: "https://prehealth.ucla.edu/wp-content/uploads/2024/10/Pre-Health-Requirements-rev.-10.1.24.pdf"
        }
      ]
    },
    {
      label: "Contact",
      bgColor: "#271E37",
      textColor: "#fff",
      links: [
        { label: "Email", ariaLabel: "Email us", href: "mailto:info@bruinplan.com" }
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
