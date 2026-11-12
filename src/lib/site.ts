export const SITE = {
  name: 'Calcwise',
  tagline: 'Fast, beautiful calculators and tools.',
  /**
   * Google AdSense publisher id (e.g. "ca-pub-1234567890"). Leave empty to disable ads entirely.
   * Set PUBLIC_ADSENSE_CLIENT at build time to turn ads on.
   */
  adsenseClient: (import.meta.env.PUBLIC_ADSENSE_CLIENT as string | undefined) ?? '',
};
