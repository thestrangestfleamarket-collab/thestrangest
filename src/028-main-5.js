
STOREK.diner={dinerFloorCol,dinerWall};
}

{
function theatreSconce(x,y,n){ PNAME='wall light'; const B=[110,82,40], A=[255,176,92], bx=x+n[0]*.03;
  return prop([{x0:bx-.03,y0:y-.12,x1:bx+.03,y1:y+.12,z0:58,z1:76,foot:1,c:B,top:()=>B,fi:()=>sh(B,.8),fj:()=>B},
    {x0:bx+n[0]*.06-.06,y0:y-.1,x1:bx+n[0]*.06+.06,y1:y+.1,z0:62,z1:72,foot:0,em:1,c:A,top:()=>[255,214,150],fi:()=>A,fj:()=>sh(A,.92)}],null,{high:true}); }

