import Script from 'next/script';

const themeScript = `
(function() {
  try {
    const theme = localStorage.getItem('accessibility-theme') || 'light';
    const contrast = localStorage.getItem('accessibility-contrast') || 'normal';
    const fontSize = localStorage.getItem('accessibility-font-size') || '16';

    const root = document.documentElement;
    
    // Clear previous theme classes
    root.classList.remove('light', 'dark', 'high-contrast');
    
    // Add new theme classes
    root.classList.add(theme);
    if (contrast === 'high') {
      root.classList.add('high-contrast');
    }
    
    // Set font size
    root.style.fontSize = fontSize + 'px';

  } catch (e) {
    console.error('Failed to apply theme from localStorage', e);
  }
})();
`;

export function ThemeInitializer() {
  return <Script id="theme-initializer" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeScript }} />;
}
