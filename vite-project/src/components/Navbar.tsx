import { useState } from "react";
import { Terminal, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navItems = ["Curriculum", "Features", "Pricing", "FAQ"];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between">
        <a href="#" className="flex items-center gap-2 font-mono text-lg font-bold text-primary text-glow-sm">
          <Terminal className="h-5 w-5" />
          <span>devops.academy</span>
        </a>

        <div className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="font-mono text-sm text-muted-foreground transition-colors hover:text-primary">
              {item}
            </a>
          ))}
          <a href="#pricing" className="rounded-md bg-primary px-4 py-2 font-mono text-sm font-semibold text-primary-foreground transition-all hover:box-glow-sm">
            Enroll Now
          </a>
        </div>

        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-border md:hidden"
          >
            <div className="container flex flex-col gap-4 py-4">
              {navItems.map((item) => (
                <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setOpen(false)} className="font-mono text-sm text-muted-foreground hover:text-primary">
                  {item}
                </a>
              ))}
              <a href="#pricing" className="rounded-md bg-primary px-4 py-2 text-center font-mono text-sm font-semibold text-primary-foreground">
                Enroll Now
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
