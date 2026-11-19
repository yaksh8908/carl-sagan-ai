export default function Logo({ size = 28 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      <defs>
        <radialGradient id="logo-core" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#fff3d6" />
          <stop offset="0.35" stopColor="#7aa7ff" />
          <stop offset="1" stopColor="#02040b" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="26" fill="url(#logo-core)" />
      <ellipse cx="32" cy="32" rx="25" ry="9" fill="none" stroke="#36e2f2" strokeWidth="1.8" transform="rotate(-28 32 32)" />
      <ellipse cx="32" cy="32" rx="25" ry="9" fill="none" stroke="#8a5cff" strokeWidth="1.8" transform="rotate(32 32 32)" opacity="0.85" />
    </svg>
  );
}
