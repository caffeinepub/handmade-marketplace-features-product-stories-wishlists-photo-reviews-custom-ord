import { SiCoffeescript } from 'react-icons/si';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const appIdentifier = typeof window !== 'undefined' ? window.location.hostname : 'handmade-marketplace';

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Handmade Marketplace. All rights reserved.
          </p>
          <p className="flex items-center space-x-1 text-sm text-muted-foreground">
            <span>Built with</span>
            <SiCoffeescript className="h-4 w-4 text-primary" />
            <span>using</span>
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(appIdentifier)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
