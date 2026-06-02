export default function BrandLogo({ className = '', variant = 'full' }) {
  // prefer vector wordmark; use mark for compact usage
  const src = variant === 'mark' ? '/pwa-icon.svg' : '/weekend-mojo-logo.svg';
  const imageClassName = variant === 'mark'
    ? 'h-9 w-9 shrink-0'
    : 'w-40 h-auto shrink-0 sm:w-52 lg:w-56';

  return (
    <img
      src={src}
      alt="Weekend Mojo"
      loading="lazy"
      className={`${imageClassName} ${className}`}
      style={{ objectFit: 'contain' }}
    />
  );
}