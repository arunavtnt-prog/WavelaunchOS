import React from 'react';
import { Copy, Check, MoreHorizontal, ArrowUp, ArrowDown } from 'lucide-react';

const ColorSwatch: React.FC<{ name: string; hex: string; variable: string; dark?: boolean }> = ({ name, hex, variable, dark }) => (
  <div className="flex flex-col gap-2 group cursor-pointer">
    <div className={`h-24 w-full rounded-xl shadow-sm border border-black/5 transition-transform group-hover:scale-105 flex items-center justify-center relative ${variable.includes('bg-') ? variable : `bg-[${hex}]`}`} style={{ backgroundColor: hex }}>
       {dark ? <span className="text-white/50 text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">Preview</span> : <span className="text-black/50 text-xs font-mono opacity-0 group-hover:opacity-100 transition-opacity">Preview</span>}
    </div>
    <div className="flex flex-col">
      <span className="font-medium text-sm text-gray-900">{name}</span>
      <span className="text-xs text-gray-400 font-mono flex items-center gap-2">
        {hex}
      </span>
      <span className="text-[10px] text-gray-300 font-mono mt-0.5">{variable}</span>
    </div>
  </div>
);

const BrandingGuide: React.FC = () => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-end mb-12">
        <div>
           <h1 className="text-3xl md:text-4xl font-normal tracking-tight font-display mb-2">Branding Guide</h1>
           <p className="text-gray-500 max-w-2xl">
             This design system serves as the source of truth for the Wavelaunch application. 
             AI agents and developers should strictly adhere to these tokens to ensure consistency.
           </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: Foundation */}
        <div className="col-span-1 lg:col-span-8 space-y-16">
          
          {/* Colors Section */}
          <section>
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
               <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">1</span>
               <h2 className="text-xl font-display font-medium">Color Palette</h2>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <ColorSwatch name="Primary Blue" hex="#1713ed" variable="bg-primary" dark />
              <ColorSwatch name="Primary Hover" hex="#100dbd" variable="bg-primary-hover" dark />
              <ColorSwatch name="Surface Dark" hex="#161616" variable="bg-surface-dark" dark />
              <ColorSwatch name="Background Dark" hex="#111022" variable="bg-background-dark" dark />
              <ColorSwatch name="Background Light" hex="#f6f6f8" variable="bg-background-light" />
              <ColorSwatch name="White Surface" hex="#FFFFFF" variable="bg-white" />
              <ColorSwatch name="Accent Green" hex="#E2E8DC" variable="bg-accent-green" />
              <ColorSwatch name="Muted Text" hex="#888888" variable="text-muted-text" />
            </div>
          </section>

          {/* Typography Section */}
          <section>
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
               <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">2</span>
               <h2 className="text-xl font-display font-medium">Typography</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-8">
                 <div>
                    <span className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2 block">Display Font</span>
                    <p className="text-3xl font-display font-normal">Manrope</p>
                    <p className="text-sm text-gray-500 mt-2">Used for headings and navigation branding. Weights: 300, 400, 500, 600, 700.</p>
                 </div>
                 <div>
                    <span className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-2 block">Body Font</span>
                    <p className="text-3xl font-sans font-normal">Inter</p>
                    <p className="text-sm text-gray-500 mt-2">Used for body text, UI labels, and data visualizations. Weights: 300, 400, 500, 600.</p>
                 </div>
              </div>

              <div className="space-y-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
                <div>
                  <p className="text-4xl font-display font-normal text-gray-900">Heading 1</p>
                  <p className="text-xs text-gray-400 font-mono mt-1">text-4xl font-display font-normal tracking-tight</p>
                </div>
                <div>
                  <p className="text-2xl font-display font-medium text-gray-900">Heading 2</p>
                  <p className="text-xs text-gray-400 font-mono mt-1">text-2xl font-display font-medium</p>
                </div>
                <div>
                  <p className="text-lg font-display font-medium text-gray-900">Card Title</p>
                  <p className="text-xs text-gray-400 font-mono mt-1">text-lg font-display font-medium</p>
                </div>
                <div>
                  <p className="text-sm font-sans text-gray-600 leading-relaxed">
                    Body text is usually set in Inter, with a relaxed line height for readability. Gray-500 or Gray-600 is preferred over pure black for long form text.
                  </p>
                  <p className="text-xs text-gray-400 font-mono mt-1">text-sm font-sans text-gray-600</p>
                </div>
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Small Labels</p>
                  <p className="text-xs text-gray-400 font-mono mt-1">text-[10px] uppercase font-bold tracking-widest</p>
                </div>
              </div>
            </div>
          </section>

          {/* Components Section */}
          <section>
            <div className="flex items-center gap-4 mb-6 pb-4 border-b border-gray-100">
               <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">3</span>
               <h2 className="text-xl font-display font-medium">UI Components</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Cards */}
              <div className="space-y-4">
                 <h3 className="font-medium text-gray-900 mb-4">Card Styles</h3>
                 
                 {/* Standard Card */}
                 <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 relative">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="text-lg font-medium font-display">Standard Card</h4>
                      <MoreHorizontal className="w-5 h-5 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-500">
                      bg-gray-50 rounded-2xl p-6 border border-gray-100
                    </p>
                 </div>

                 {/* Primary Card */}
                 <div className="bg-primary text-white rounded-2xl p-6 relative overflow-hidden">
                    <div className="relative z-10">
                      <h4 className="text-lg font-medium font-display">Primary Card</h4>
                      <p className="text-xs opacity-70 mt-2">bg-primary text-white rounded-2xl</p>
                    </div>
                    <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-2xl"></div>
                 </div>
              </div>

              {/* Interactive Elements */}
              <div className="space-y-8">
                 <div>
                    <h3 className="font-medium text-gray-900 mb-4">Buttons & Controls</h3>
                    <div className="flex flex-wrap gap-4 items-center">
                       <button className="px-4 py-2 bg-primary hover:bg-primary-hover text-white rounded-lg text-sm font-medium transition-colors">
                          Primary Button
                       </button>
                       <button className="px-4 py-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                          Secondary Button
                       </button>
                       <button className="px-4 py-1.5 rounded-full border border-gray-300 text-xs font-medium hover:bg-gray-200 transition-colors bg-transparent text-black">
                          Pill Button
                       </button>
                    </div>
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <code className="text-xs text-gray-500 font-mono block mb-2">
                           transition-colors duration-200
                        </code>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-6 bg-primary rounded-full relative cursor-pointer">
                                <div className="absolute top-1 right-1 w-4 h-4 bg-white rounded-full"></div>
                            </div>
                            <span className="text-sm text-gray-600">Toggle Active</span>
                        </div>
                    </div>
                 </div>

                 <div>
                    <h3 className="font-medium text-gray-900 mb-4">Iconography Style</h3>
                    <div className="flex gap-6 items-center">
                       <div className="flex flex-col items-center gap-2">
                          <MoreHorizontal className="w-5 h-5 text-gray-400" />
                          <span className="text-[10px] text-gray-400">Neutral</span>
                       </div>
                       <div className="flex flex-col items-center gap-2">
                          <ArrowUp className="w-5 h-5 text-black" />
                          <span className="text-[10px] text-gray-400">Active</span>
                       </div>
                       <div className="flex flex-col items-center gap-2">
                           <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shadow-sm">
                             <Check className="w-4 h-4 text-primary" />
                           </div>
                           <span className="text-[10px] text-gray-400">Container</span>
                       </div>
                    </div>
                    <p className="text-xs text-gray-400 mt-2">Icons are from <code>lucide-react</code>. Stroke width is usually default (2px).</p>
                 </div>
              </div>
            </div>
          </section>

        </div>

        {/* Right Column: Structure Info */}
        <div className="col-span-1 lg:col-span-4 space-y-8">
           <div className="bg-surface-dark text-white p-8 rounded-3xl sticky top-8">
              <h3 className="font-display text-xl mb-6">Technical Specs</h3>
              
              <div className="space-y-6">
                 <div>
                    <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Framework</span>
                    <p className="font-mono text-sm mt-1">React 18 + TypeScript</p>
                 </div>
                 
                 <div>
                    <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Styling</span>
                    <p className="font-mono text-sm mt-1">Tailwind CSS (via CDN)</p>
                 </div>

                 <div>
                    <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Icons</span>
                    <p className="font-mono text-sm mt-1">Lucide React</p>
                 </div>

                 <div>
                    <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Charts</span>
                    <p className="font-mono text-sm mt-1">Recharts</p>
                 </div>

                 <div className="h-px bg-white/10 my-4"></div>

                 <div>
                    <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Grid System</span>
                    <p className="text-sm text-gray-400 mt-2 leading-relaxed">
                       The layout uses a standard 12-column grid. 
                    </p>
                    <div className="grid grid-cols-12 gap-1 mt-3 h-8 opacity-50">
                       {[...Array(12)].map((_, i) => (
                          <div key={i} className="bg-primary/50 rounded-sm h-full col-span-1"></div>
                       ))}
                    </div>
                    <p className="font-mono text-xs text-gray-500 mt-2">gap-6 (24px)</p>
                 </div>

                 <div>
                    <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Border Radius</span>
                    <div className="flex gap-2 mt-2">
                       <div className="w-8 h-8 bg-white/10 rounded"></div>
                       <div className="w-8 h-8 bg-white/10 rounded-lg"></div>
                       <div className="w-8 h-8 bg-white/10 rounded-xl"></div>
                       <div className="w-8 h-8 bg-white/10 rounded-2xl border border-white/40"></div>
                       <div className="w-8 h-8 bg-white/10 rounded-full"></div>
                    </div>
                    <p className="font-mono text-xs text-gray-500 mt-2">
                      Most cards use <span className="text-white">rounded-2xl</span> or <span className="text-white">rounded-3xl</span>.
                    </p>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};

export default BrandingGuide;