import React from 'react';
import { motion } from 'framer-motion';

const FlowGraphic = () => {
  const nodes = [
    { id: 'social', initial: 'I', label: 'Instagram', sub: 'Discovery', color: '#FF4D4D' },
    { id: 'link', initial: 'L', label: 'Link in bio', sub: 'skriibe.com/@you', color: '#2D9CDB' },
    { id: 'pay', initial: 'P', label: 'Follower pays', sub: 'Rs.99 via UPI', color: '#27AE60' },
    { id: 'reply', initial: 'R', label: 'You reply', sub: 'Dashboard', color: '#2F80ED' },
    { id: 'earn', initial: 'E', label: 'You earn', sub: 'Rs.99 / reply', color: '#F2C94C' }
  ];

  return (
    <div className="pt-12 pb-32 px-6 bg-[#0a0a0a] border-t border-white/5 overflow-hidden">
      <div className="max-w-[1200px] mx-auto">
        <div className="text-center mb-16 md:mb-24">
          <div className="text-[14px] text-skriibe-blue font-bold tracking-[0.2em] uppercase mb-4">The Flow</div>
          <h2 className="font-garet text-[clamp(28px,5vw,56px)] font-garet leading-tight tracking-tight text-white light:text-black mb-6">
            Instagram brings the audience.<br className="hidden md:block" />
            skriibe brings the money.
          </h2>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-12 md:gap-4 relative">
          {nodes.map((node, i) => (
            <React.Fragment key={node.id}>
              {/* Node Circle */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative flex flex-col items-center z-10 group"
              >
                {/* Concentric Circles Container */}
                <div className="relative flex items-center justify-center w-[120px] h-[120px] md:w-[150px] md:h-[150px]">
                  <div 
                    className="absolute inset-0 rounded-full border border-white/10 transition-all duration-500 group-hover:scale-110"
                    style={{ borderColor: `${node.color}44`, boxShadow: `0 0 15px ${node.color}11` }}
                  />
                  <div
                    className="relative flex items-center justify-center rounded-full transition-all duration-500 w-[90px] h-[90px] md:w-[110px] md:h-[110px] group-hover:scale-105"
                    style={{
                      backgroundColor: `${node.color}22`,
                      border: `1.5px solid ${node.color}`,
                      boxShadow: `inset 0 0 30px ${node.color}22`,
                      cursor: 'pointer'
                    }}
                  >
                    <span className="font-garet text-3xl md:text-4xl font-black text-white" style={{ textShadow: `0 0 15px ${node.color}66` }}>
                      {node.initial}
                    </span>
                  </div>
                </div>

                {/* Labels - Positioned relative to circle */}
                <div className="mt-4 md:absolute md:-bottom-24 text-center w-[180px]">
                  <div className="text-white light:text-black font-bold text-sm mb-1 tracking-tight">{node.label}</div>
                  <div className="text-[#71717A] light:text-gray-500 text-[10px] font-medium uppercase tracking-[0.15em]">{node.sub}</div>
                </div>
              </motion.div>

              {/* Connector Line (Vertical on mobile, Horizontal on desktop) */}
              {i < nodes.length - 1 && (
                <div className="flex-1 flex max-md:flex-col items-center justify-center min-h-[50px] md:min-h-0 md:w-full max-w-[10px] md:max-w-none md:px-2">
                  
                  {/* --- Desktop Horizontal Line --- */}
                  <div className="hidden md:block w-full h-[10px] relative shrink-0">
                    {/* Track */}
                    <div className="absolute top-[4px] left-0 right-0 h-[2px] bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        className="absolute top-0 bottom-0 w-[60px]"
                        style={{ background: `linear-gradient(to right, transparent, ${nodes[i+1].color}88, ${nodes[i+1].color})` }}
                        animate={{ left: ['-60px', '100%'] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: i * 0.3 }}
                      />
                    </div>
                    {/* Glowing Lead Dot */}
                    <motion.div 
                      className="absolute top-[3px] w-[4px] h-[4px] rounded-full z-10"
                      style={{ backgroundColor: nodes[i+1].color, boxShadow: `0 0 12px 2px ${nodes[i+1].color}` }}
                      animate={{ left: ['0%', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: i * 0.3 }}
                    />
                    {/* Trailing Bubble */}
                    <motion.div 
                      className="absolute top-[4px] w-[2px] h-[2px] rounded-full bg-white z-10 opacity-70"
                      animate={{ left: ['-20px', '100%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear", delay: i * 0.3 }}
                    />
                  </div>

                  {/* --- Mobile Vertical Line --- */}
                  <div className="md:hidden w-[10px] h-16 relative my-2 shrink-0">
                    {/* Track */}
                    <div className="absolute left-[4px] top-0 bottom-0 w-[2px] bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        className="absolute left-0 right-0 h-[40px]"
                        style={{ background: `linear-gradient(to bottom, transparent, ${nodes[i+1].color}88, ${nodes[i+1].color})` }}
                        animate={{ top: ['-40px', '100%'] }}
                        transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: i * 0.3 }}
                      />
                    </div>
                    {/* Glowing Lead Dot */}
                    <motion.div 
                      className="absolute left-[3px] w-[4px] h-[4px] rounded-full z-10"
                      style={{ backgroundColor: nodes[i+1].color, boxShadow: `0 0 12px 2px ${nodes[i+1].color}` }}
                      animate={{ top: ['0%', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: i * 0.3 }}
                    />
                    {/* Trailing Bubble */}
                    <motion.div 
                      className="absolute left-[4px] w-[2px] h-[2px] rounded-full bg-white z-10 opacity-70"
                      animate={{ top: ['-20px', '100%'] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: i * 0.3 }}
                    />
                  </div>

                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
export default FlowGraphic;
