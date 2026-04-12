import './BrandLogo.css';

export default function BrandLogo({ size = 'md' }) {
  return (
    <span className={`brand-logo brand-logo--${size}`} aria-label="Everest Auto Hub">
      <span className="brand-everest-auto">EVEREST AUTO</span>
      <span className="brand-hub-box">HUB</span>
    </span>
  );
}
