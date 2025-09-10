import { Command } from 'lucide-react';

const IconExtractor = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-8">
      <div className="text-center space-y-8">
        <h1 className="text-2xl font-semibold">Command Icon Extractor</h1>
        <p className="text-muted-foreground">Right-click the icon below and "Save as" to download it as an SVG</p>
        
        {/* Large version with your app's exact styling */}
        <div className="bg-card border rounded-lg p-8 inline-block">
          <Command className="h-32 w-32 text-primary" />
        </div>
        
        {/* Different sizes for reference */}
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">Available sizes:</p>
          <div className="flex items-center justify-center gap-8">
            <div className="bg-card border rounded p-4">
              <Command className="h-16 w-16 text-primary" />
              <p className="text-xs mt-2">64px</p>
            </div>
            <div className="bg-card border rounded p-4">
              <Command className="h-12 w-12 text-primary" />
              <p className="text-xs mt-2">48px</p>
            </div>
            <div className="bg-card border rounded p-2">
              <Command className="h-8 w-8 text-primary" />
              <p className="text-xs mt-2">32px</p>
            </div>
            <div className="bg-card border rounded p-1">
              <Command className="h-4 w-4 text-primary" />
              <p className="text-xs mt-2">16px</p>
            </div>
          </div>
        </div>
        
        <div className="text-sm text-muted-foreground max-w-md">
          <p>This icon uses your app's exact color scheme and styling. The border and background match your current design system.</p>
        </div>
      </div>
    </div>
  );
};

export default IconExtractor;