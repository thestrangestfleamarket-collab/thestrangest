// GEM CUTTING (archived, owner 10 Nov 2026): was the end of src/146d-gear.js.
// cutting a gem on the gem wheel (owner, 5 Nov 2026: gem cutting kept): a pack recipe for each stone but the geode, worth twice and more cut, trained and judged by GEMS
{ const RG={c:[-10,40],r:[10,60],s:[30,85]}, CUT=GEMS.filter(g=>g[0]!=='geode'&&!g[0].startsWith('cut_')), P=g=>Math.round(g[2]*2.2);
  FORAGE.add({names:{gem_wheel:'A GEM WHEEL',...Object.fromEntries(CUT.map(g=>['cut_'+g[0],'CUT '+g[1]]))},prices:Object.fromEntries(CUT.map(g=>['cut_'+g[0],P(g)])),
    recipes:CUT.map(g=>['cut_'+g[0],'CUT '+g[1],'gem',RG[GEMS.TIER[g[0]]]||RG.c,{[g[0]]:1},'sells for $'+P(g)])});
  for(const g of CUT)GEMS.push(['cut_'+g[0],'CUT '+g[1],P(g),0]);   // weight 0: never found, only cut
  FORAGE.CK.gem={short:'CUT',need:()=>FORAGE.has('gem_wheel')?null:'YOU NEED A GEM WHEEL (THE GEM SHOP ON MARKET ST SELLS THEM).',made:nm=>`YOU GRIND AND POLISH IT: ${nm}.`,fail:'IT CRACKS ON THE WHEEL. THE STONE IS LOST.'}; }
