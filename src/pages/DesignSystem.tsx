import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, Download, Palette, Type, Square, Layers } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import PageTransition from "@/components/PageTransition";

const DesignSystem = () => {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2000);
  };

  const colors = [
    { name: "Background", var: "--background", class: "bg-background" },
    { name: "Foreground", var: "--foreground", class: "bg-foreground" },
    { name: "Primary", var: "--primary", class: "bg-primary" },
    { name: "Primary Foreground", var: "--primary-foreground", class: "bg-primary-foreground" },
    { name: "Secondary", var: "--secondary", class: "bg-secondary" },
    { name: "Muted", var: "--muted", class: "bg-muted" },
    { name: "Accent", var: "--accent", class: "bg-accent" },
    { name: "Destructive", var: "--destructive", class: "bg-destructive" },
    { name: "Card", var: "--card", class: "bg-card" },
    { name: "Border", var: "--border", class: "bg-border" },
  ];

  const buttonVariants = ["default", "secondary", "outline", "ghost", "link", "accent", "glass", "glass-secondary", "destructive"] as const;
  const buttonSizes = ["sm", "default", "lg", "xl", "icon"] as const;

  const typography = [
    { name: "Display", class: "font-display text-5xl", sample: "Healing Buds" },
    { name: "Heading", class: "font-heading text-3xl", sample: "Medical Cannabis" },
    { name: "Body", class: "font-sans text-base", sample: "High-quality therapeutic solutions for patients worldwide." },
    { name: "Mono", class: "font-mono text-sm", sample: "code { healing: buds; }" },
  ];

  const shadows = [
    { name: "Shadow XS", var: "--shadow-xs", class: "shadow-xs" },
    { name: "Shadow SM", var: "--shadow-sm", class: "shadow-sm" },
    { name: "Shadow MD", var: "--shadow-md", class: "shadow-md" },
    { name: "Shadow LG", var: "--shadow-lg", class: "shadow-lg" },
    { name: "Shadow Elegant", var: "--shadow-elegant", class: "shadow-elegant" },
  ];

  const radii = [
    { name: "Radius SM", value: "0.5rem", class: "rounded-sm" },
    { name: "Radius MD", value: "0.75rem", class: "rounded-md" },
    { name: "Radius LG", value: "1rem", class: "rounded-lg" },
    { name: "Radius XL", value: "1.25rem", class: "rounded-xl" },
    { name: "Radius 2XL", value: "1.5rem", class: "rounded-2xl" },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-xl">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl text-foreground">Design System</h1>
              <p className="text-sm text-muted-foreground">Healing Buds Component Library</p>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <Button variant="outline" size="sm" asChild>
                <a href="/design-system-export/README.md" download>
                  <Download className="w-4 h-4 mr-2" />
                  Download Package
                </a>
              </Button>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-6 py-12 space-y-16">
          {/* Colors Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Palette className="w-6 h-6 text-primary" />
              <h2 className="font-heading text-2xl text-foreground">Colors</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {colors.map((color) => (
                <motion.div
                  key={color.name}
                  whileHover={{ scale: 1.02 }}
                  className="group cursor-pointer"
                  onClick={() => copyToClipboard(`var(${color.var})`, color.var)}
                >
                  <div
                    className={`h-24 rounded-xl ${color.class} border border-border shadow-md transition-shadow group-hover:shadow-lg`}
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground text-sm">{color.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{color.var}</p>
                    </div>
                    {copiedItem === color.var ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Typography Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Type className="w-6 h-6 text-primary" />
              <h2 className="font-heading text-2xl text-foreground">Typography</h2>
            </div>
            <div className="space-y-6">
              {typography.map((type) => (
                <Card key={type.name} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-mono text-muted-foreground">{type.name}</CardTitle>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(type.class, type.name)}
                      >
                        {copiedItem === type.name ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className={type.class}>{type.sample}</p>
                    <p className="mt-2 text-xs text-muted-foreground font-mono">.{type.class.replace(/ /g, " .")}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Buttons Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Square className="w-6 h-6 text-primary" />
              <h2 className="font-heading text-2xl text-foreground">Buttons</h2>
            </div>
            
            {/* Variants */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-foreground mb-4">Variants</h3>
              <div className="flex flex-wrap gap-4 p-6 rounded-xl bg-muted/30 border border-border">
                {buttonVariants.map((variant) => (
                  <div key={variant} className="text-center">
                    <Button variant={variant}>
                      {variant.charAt(0).toUpperCase() + variant.slice(1)}
                    </Button>
                    <p className="mt-2 text-xs text-muted-foreground font-mono">variant="{variant}"</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div>
              <h3 className="text-lg font-medium text-foreground mb-4">Sizes</h3>
              <div className="flex flex-wrap items-end gap-4 p-6 rounded-xl bg-muted/30 border border-border">
                {buttonSizes.map((size) => (
                  <div key={size} className="text-center">
                    <Button size={size}>
                      {size === "icon" ? "★" : size.toUpperCase()}
                    </Button>
                    <p className="mt-2 text-xs text-muted-foreground font-mono">size="{size}"</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Shadows Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Layers className="w-6 h-6 text-primary" />
              <h2 className="font-heading text-2xl text-foreground">Shadows</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {shadows.map((shadow) => (
                <motion.div
                  key={shadow.name}
                  whileHover={{ scale: 1.05 }}
                  className="group cursor-pointer"
                  onClick={() => copyToClipboard(shadow.class, shadow.name)}
                >
                  <div className={`h-24 rounded-xl bg-card ${shadow.class} border border-border`} />
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground text-sm">{shadow.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">.{shadow.class}</p>
                    </div>
                    {copiedItem === shadow.name ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Border Radius Section */}
          <section>
            <div className="flex items-center gap-3 mb-8">
              <Square className="w-6 h-6 text-primary" />
              <h2 className="font-heading text-2xl text-foreground">Border Radius</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {radii.map((radius) => (
                <motion.div
                  key={radius.name}
                  whileHover={{ scale: 1.05 }}
                  className="group cursor-pointer"
                  onClick={() => copyToClipboard(radius.class, radius.name)}
                >
                  <div className={`h-24 bg-primary ${radius.class}`} />
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground text-sm">{radius.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">{radius.value}</p>
                    </div>
                    {copiedItem === radius.name ? (
                      <Check className="w-4 h-4 text-primary" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Installation Section */}
          <section className="pb-12">
            <Card className="bg-muted/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="w-5 h-5" />
                  Quick Start
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-2">1. Install Dependencies</h4>
                  <pre className="p-4 rounded-lg bg-background border border-border text-sm overflow-x-auto">
                    <code className="text-muted-foreground">
                      npm install class-variance-authority clsx tailwind-merge tailwindcss-animate
                    </code>
                  </pre>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">2. Copy Design System Files</h4>
                  <p className="text-muted-foreground text-sm">
                    Download the design-system-export folder and copy files to your project:
                  </p>
                  <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li><code className="text-primary">src/styles/</code> → CSS variables and tokens</li>
                    <li><code className="text-primary">src/lib/utils.ts</code> → Utility functions</li>
                    <li><code className="text-primary">src/components/ui/</code> → UI components</li>
                    <li><code className="text-primary">tailwind.config.ts</code> → Tailwind configuration</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">3. Import Styles</h4>
                  <pre className="p-4 rounded-lg bg-background border border-border text-sm overflow-x-auto">
                    <code className="text-muted-foreground">
                      {`import "./styles/index.css";`}
                    </code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          </section>
        </main>
      </div>
    </PageTransition>
  );
};

export default DesignSystem;
