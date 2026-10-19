{ const MUSCAN=__DATA__("data/museum.json");
const MUS=(B=>{ const mid=(B.x0+B.x1)/2, hx0=mid-6, hx1=mid+6, by=B.y1-8, i=T;
  return {b:B,f:B,mid,hx0,hx1,by,side:[B.y0+4,B.y0+9],earth:[B.x0+2,B.x0+5],humans:[mid-3,mid+3],closed:[B.x1-5,B.x1-2],archZ:150,H:B.h-4,
    hall:{x0:hx0+i,x1:hx1-i,y0:B.y0+i,y1:by-i},west:{x0:B.x0+i,x1:hx0-i,y0:B.y0+i,y1:by-i},east:{x0:hx1+i,x1:B.x1-i,y0:B.y0+i,y1:by-i},
    earthR:{x0:B.x0+i,x1:hx0-i,y0:by+i,y1:B.y1-i},humansR:{x0:hx0+i,x1:hx1-i,y0:by+i,y1:B.y1-i},closedR:{x0:hx1+i,x1:B.x1-i,y0:by+i,y1:B.y1-i}}; })({id:'lmusfront',...WROW.mus});
