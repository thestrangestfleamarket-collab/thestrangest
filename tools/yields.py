# BREATHS WHILE LOADING (owner, 17 Oct 2026: the artifact said "This artifact isn't responding" while the page loaded): the page's one module
# script builds the whole world in one go, and the browser hears nothing for that long. This puts a breath between its statements: after each
# `;` that sits only inside plain blocks (never in a function, an object, a call or a class), a check that gives the browser a moment back
# once 40 ms have gone by since the last (a top-level await: the module waits, the browser answers, the loading line stays up).
# The body of an if, a for or a while counts too. A place's builder (grab's, build.py) is an async function awaited at the top: its body counts as a plain block.
# yields(js) returns the script with the breaths in, and how many places it put one. Used by build.py on the module script only.
import re
HEAD="let __YT=performance.now(); const __Y=()=>new Promise(r=>{ const c=new MessageChannel(); c.port1.onmessage=()=>{ __YT=performance.now(); r(); }; c.port2.postMessage(0); });\n"
CHECK="if(performance.now()-__YT>40)await __Y();"
NEXT=re.compile(r"[\'\"`/{}()\[\];]")
WORD=re.compile(r"[A-Za-z_$][\w$]*$")
REGEX_AFTER={'return','typeof','case','in','of','delete','void','throw','new','else','do','instanceof','yield','await'}
BLOCK_AFTER={'else','try','finally','do'}
def yields(js):
    out=[]; i=0; n=len(js); st=[]   # st: 'b' a plain block, 'o' any other brace, '(' '[' ; '`' a template's ${
    cm={}; last=0; count=0; kw=[]; lastkw=None   # kw: the word before each open paren; lastkw: the one before the paren just closed (if, for, while: its body a plain block)
    def prev(k):   # the last significant thing before k: (char, word)
        j=k-1
        while j>=0 and (js[j] in ' \t\r\n' or j in cm):
            j=cm[j]-1 if j in cm else j-1   # (past whitespace and comments)
        if j<0: return ('',None)
        m=WORD.search(js[max(0,j-30):j+1]); return (js[j], m.group(0) if m else None)
    def skip_str(k,q):
        k+=1
        while True:
            c=js[k]
            if c=='\\': k+=2; continue
            if c==q: return k+1
            k+=1
    def skip_tpl(k):   # from just after a backtick (or a template's closing brace) to its end, or into a ${
        while True:
            c=js[k]
            if c=='\\': k+=2; continue
            if c=='`': return k+1,False
            if c=='$' and js[k+1]=='{': return k+2,True
            k+=1
    while True:
        m=NEXT.search(js,i)
        if not m: break
        k=m.start(); c=js[k]
        if c in '\'"': i=skip_str(k,c); continue
        if c=='`':
            i,into=skip_tpl(k+1)
            if into: st.append('`')
            continue
        if c=='/':
            d=js[k+1] if k+1<n else ''
            if d=='/': e=js.find('\n',k); i=n if e<0 else e; cm[i-1]=k; continue
            if d=='*': i=js.index('*/',k+2)+2; cm[i-1]=k; continue
            pc,pw=prev(k)
            if (pc and (pc.isalnum() or pc in '_$)]') and not (pw in REGEX_AFTER)):
                i=k+1; continue   # division
            # a regex literal: to its closing slash (past classes and escapes), then its flags
            j=k+1; cls=False
            while True:
                ch=js[j]
                if ch=='\\': j+=2; continue
                if ch=='[': cls=True
                elif ch==']': cls=False
                elif ch=='/' and not cls: break
                elif ch=='\n': raise SystemExit('yields: a regex ran to the line end at %d: %r'%(k,js[k-40:k+40]))
                j+=1
            j+=1
            while j<n and (js[j].isalnum()): j+=1
            i=j; continue
        if c=='{':
            pc,pw=prev(k)
            st.append('b' if (pc in ('',';','{','}') or pw in BLOCK_AFTER or js.endswith('async()=>',0,k) or (pc==')' and lastkw in ('if','for','while'))) else 'o'); i=k+1; continue
        if c=='}':
            if st and st[-1]=='`':
                st.pop(); i,into=skip_tpl(k+1)
                if into: st.append('`')
                continue
            if st: st.pop()
            i=k+1; continue
        if c in '([':
            w=prev(k)[1] if c=='(' else None; st.append('g' if w=='grab' else c); kw.append(w); i=k+1; continue
        if c in ')]':
            if st: st.pop()
            lastkw=kw.pop() if kw else None
            i=k+1; continue
        if c==';':
            i=k+1
            if all(x in 'bg' for x in st):
                m2=re.compile(r"\s*(?://[^\n]*\n\s*)*([A-Za-z_$]*)").match(js,i); w=m2.group(1)
                if w in ('else','catch','finally','while'): continue
                out.append(js[last:i]); out.append(CHECK); last=i; count+=1
            continue
    out.append(js[last:])
    if st: raise SystemExit('yields: unbalanced at the end: %r'%st[-10:])
    return HEAD+''.join(out),count
