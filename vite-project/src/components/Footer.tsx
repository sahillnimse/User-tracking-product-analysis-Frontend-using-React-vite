import { Terminal } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container flex flex-col items-center justify-between gap-6 md:flex-row">
        <a href="#" className="flex items-center gap-2 font-mono text-sm font-bold text-primary text-glow-sm">
          <Terminal className="h-4 w-4" />
          devops.academy
        </a>
        <p className="font-mono text-xs text-muted-foreground">
          © 2026 devops.academy — Ship with confidence.
        </p>
        <div className="flex gap-6">
          {["Twitter", "GitHub", "Discord"].map((link) => (
            <a key={link} href="#" className="font-mono text-xs text-muted-foreground transition-colors hover:text-primary">
              {link}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
