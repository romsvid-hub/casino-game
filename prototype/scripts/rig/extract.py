# Cut-out rig extractor (block A, 12.11). Builds public/rig/*.webp and src/scene/rigs.json
# from the Figma part layers listed in spec.py (transcribed from get_design_context).
# It aligns the parts to the flat pose sprite they replace, so a rig at rest matches it,
# and sets each pivot at the overlap of a part and its parent.
# Pivot markers: put the centre (stage px, 1920x1080 frame) of every Figma layer named
# "pivot / <part>" into scripts/rig/pivots.json as {"hero.idle": {"head": [x, y]}} and rerun:
#   python3 scripts/rig/extract.py [pose keys...]
# It needs the flat sprites in public/sprites for alignment (restore them from git history
# before the rig commit), so it is a one-off tool, not part of the build.
import io,os,re,sys,json,math,urllib.request
from PIL import Image, ImageChops, ImageDraw, ImageFilter
sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
from spec import P
D=os.path.dirname(os.path.abspath(__file__)); A="https://www.figma.com/api/mcp/asset/"
os.makedirs(os.path.join(D,"cache"),exist_ok=True)
ROOT=os.path.abspath(os.path.join(D,"..",".."))
OUT=f"{ROOT}/public/rig"; os.makedirs(OUT,exist_ok=True)
S=2
def get(u):
    if '.' not in u: u+='.png'
    p=os.path.join(D,'cache',u)
    import time
    for attempt in range(2):
        if not os.path.exists(p):
            d=urllib.request.urlopen(urllib.request.Request(A+u,headers={"User-Agent":"casino-prototype-build"}),timeout=180).read()
            if u.endswith('.png'):
                im=Image.open(io.BytesIO(d))
                if im.size==(32,32): print('  placeholder, retry',u,flush=True); time.sleep(5); continue
            open(p,'wb').write(d)
        return open(p,'rb').read()
    raise RuntimeError('asset not ready '+u)
def cover(im,tw,th):
    r=max(tw/im.width,th/im.height); im=im.resize((max(1,math.ceil(im.width*r)),max(1,math.ceil(im.height*r))),Image.LANCZOS)
    l=(im.width-tw)//2; t=(im.height-th)//2; return im.crop((l,t,l+tw,t+th))
def cropfill(im,w,h,L,T,W,H):
    iw,ih=round(W/100*w*S),round(H/100*h*S); big=im.resize((max(1,iw),max(1,ih)),Image.LANCZOS)
    tile=Image.new('RGBA',(round(w*S),round(h*S)),(0,0,0,0)); tile.paste(big,(round(L/100*w*S),round(T/100*h*S)),big); return tile
def render(kind,u,a):
    if kind=='svg': return svg(u,*a)
    im=Image.open(io.BytesIO(get(u))).convert('RGBA')
    if kind=='box':
        x,y,w,h=a; return cover(im,round(w*S),round(h*S)),(x*S,y*S)
    if kind=='crop':
        x,y,w,h,L,T,W,H=a; return cropfill(im,w,h,L,T,W,H),(x*S,y*S)
    ox,oy,ow,oh,iw,ih,deg,flip,cr=a
    t=cropfill(im,iw,ih,*cr) if cr else cover(im,round(iw*S),round(ih*S))
    if flip: t=t.transpose(Image.FLIP_LEFT_RIGHT)
    if deg: t=t.rotate(-deg,resample=Image.BICUBIC,expand=True)
    cx,cy=(ox+ow/2)*S,(oy+oh/2)*S; return t,(cx-t.width/2,cy-t.height/2)
def svg(u,x,y,w,h,iw,ih,deg,insY,insX):
    s=get(u).decode(); vb=[float(v) for v in re.search(r'viewBox="([^"]+)"',s).group(1).split()]
    e=re.search(r'<ellipse[^>]*cx="([\d.]+)"[^>]*cy="([\d.]+)"[^>]*rx="([\d.]+)"[^>]*ry="([\d.]+)"[^>]*fill="(#[0-9A-Fa-f]{6}|black)"(?:[^>]*fill-opacity="([\d.]+)")?',s)
    blur=float(re.search(r'stdDeviation="([\d.]+)"',s).group(1)) if 'stdDeviation' in s else 0
    cx,cy,rx,ry=[float(e.group(i)) for i in range(1,5)]; op=float(e.group(6) or 1)
    ow,oh=iw*(1+2*insX/100),ih*(1+2*insY/100); k=ow*S/vb[2]
    img=Image.new('RGBA',(round(ow*S),round(oh*S)),(0,0,0,0)); a=Image.new('L',img.size,0)
    ImageDraw.Draw(a).ellipse(((cx-rx)*k,(cy-ry)*k,(cx+rx)*k,(cy+ry)*k),fill=round(255*op))
    if blur: a=a.filter(ImageFilter.GaussianBlur(blur*k))
    img.putalpha(a); img=img.rotate(-deg,resample=Image.BICUBIC,expand=True)
    return img,((x+w/2)*S-img.width/2,(y+h/2)*S-img.height/2)
PIVOTS=json.load(open(os.path.join(D,'pivots.json'))) if os.path.exists(os.path.join(D,'pivots.json')) else {}
SPR=json.load(open(f"{ROOT}/src/scene/sprites.json"))
only=sys.argv[1:] or list(P)
rigs=json.load(open(f"{ROOT}/src/scene/rigs.json")) if os.path.exists(f"{ROOT}/src/scene/rigs.json") else {}
report=[]
def flat(key,why):
    set_,pose=key.split('.'); spr=SPR[key]
    im=Image.open(f"{ROOT}/public/sprites/{set_}-{pose}@2x.webp").convert('RGBA'); f=f"{set_}-{pose}-whole"
    im.save(f"{OUT}/{f}@2x.webp",'WEBP',quality=74,method=6); im.resize((spr['w'],spr['h']),Image.LANCZOS).save(f"{OUT}/{f}.webp",'WEBP',quality=86,method=6)
    json.dump(rigs,open(f"{ROOT}/src/scene/rigs.json",'w'),ensure_ascii=False,indent=1)
    rigs[key]=dict(figma=spr['figma'],w=spr['w'],h=spr['h'],ax=spr['ax'],ay=spr['ay'],merged=True,flat=why,parts=[dict(name='whole',src=f"/rig/{f}.webp",src2x=f"/rig/{f}@2x.webp",x=0,y=0,w=spr['w'],h=spr['h'],z=0,parent=None,pivot=[spr['ax'],spr['ay']])])
    report.append(f"{key}: FLAT ({why})"); print(key,'flat:',why,flush=True)
for key in only:
    spec=P[key]; spr=SPR[key]; set_,pose=key.split('.')
    layers=[]
    try:
        for n,u,kind,a in spec['parts']:
            im,(px,py)=render(kind,u,a); layers.append((n,im,px,py))
    except Exception as e:
        flat(key,str(e)); continue
    minx=min(px for _,_,px,_ in layers); miny=min(py for _,_,_,py in layers)
    maxx=max(px+im.width for _,im,px,_ in layers); maxy=max(py+im.height for _,im,_,py in layers)
    ox,oy=math.floor(minx)-200,math.floor(miny)-200; CW,CH=math.ceil(maxx-ox)+200,math.ceil(maxy-oy)+200
    canv={}
    for n,im,px,py in layers:
        c=canv.get(n) or Image.new('RGBA',(CW,CH),(0,0,0,0))
        l=Image.new('RGBA',(CW,CH),(0,0,0,0)); l.paste(im,(round(px-ox),round(py-oy)),im); canv[n]=Image.alpha_composite(c,l)
    names=list(dict.fromkeys(n for n,*_ in layers))
    full=Image.new('RGBA',(CW,CH),(0,0,0,0))
    for n in names: full=Image.alpha_composite(full,canv[n])
    old=Image.open(f"{ROOT}/public/sprites/{set_}-{pose}@2x.webp").convert('RGBA'); W,H=old.size
    fa=full.getchannel('A'); oa=old.getchannel('A'); bb=fa.point(lambda v:255 if v>8 else 0).getbbox()
    def score(dx,dy,st=1):
        c=fa.crop((dx,dy,dx+W,dy+H)); o=oa
        if st>1: c=c.resize((W//st,H//st)); o=oa.resize((W//st,H//st))
        h=ImageChops.difference(c,o).histogram(); return sum(i*v for i,v in enumerate(h))
    best=min((score(dx,dy,4),dx,dy) for dx in range(bb[0]-48,bb[0]+49,4) for dy in range(bb[1]-48,bb[1]+49,4))
    _,dx,dy=min((score(x,y),x,y) for x in range(best[1]-4,best[1]+5) for y in range(best[2]-4,best[2]+5))
    rest=full.crop((dx,dy,dx+W,dy+H))
    bg=Image.new('RGBA',(W,H),(40,40,48,255)); hd=ImageChops.difference(Image.alpha_composite(bg,rest).convert('RGB'),Image.alpha_composite(bg,old).convert('RGB')).convert('L').histogram()
    diff=sum(i*v for i,v in enumerate(hd))/sum(hd)
    parts=[];alpha={}
    for z,n in enumerate(names):
        im=canv[n].crop((dx,dy,dx+W,dy+H)); b=im.getchannel('A').point(lambda v:255 if v>4 else 0).getbbox()
        if not b: continue
        im=im.crop(b); slug=re.sub(r'[^a-z0-9]+','-',n.lower()).strip('-')
        f=f"{set_}-{pose}-{slug}"
        im.save(f"{OUT}/{f}@2x.webp",'WEBP',quality=74,method=6)
        im.resize((max(1,round(im.width/2)),max(1,round(im.height/2))),Image.LANCZOS).save(f"{OUT}/{f}.webp",'WEBP',quality=86,method=6)
        alpha[n]=(b,im.getchannel('A'))
        parts.append(dict(name=n,src=f"/rig/{f}.webp",src2x=f"/rig/{f}@2x.webp",x=b[0]/S,y=b[1]/S,w=(b[2]-b[0])/S,h=(b[3]-b[1])/S,z=z,parent=None,pivot=[0,0]))
    # parents and pivots (sprite coords @2x for the overlap test)
    byname={p['name']:p for p in parts}
    def mask(n):
        b,a=alpha[n]; m=Image.new('L',(W,H),0); m.paste(a.point(lambda v:255 if v>32 else 0),(b[0],b[1])); return m
    def overlap(a,b):
        m=ImageChops.multiply(mask(a),mask(b)); bb=m.getbbox()
        if not bb: return 0,None
        h=m.crop(bb); n=0;sx=0;sy=0
        px=h.load()
        for yy in range(0,h.height,2):
            for xx in range(0,h.width,2):
                if px[xx,yy]: n+=1;sx+=xx;sy+=yy
        return n,((bb[0]+sx/n)/S,(bb[1]+sy/n)/S) if n else None
    for p in parts:
        par=spec['tree'].get(p['name'])
        if par and par.startswith('auto:'):
            cands=[c for c in par[5:].split(',') if c in byname]; par=max(cands,key=lambda c: overlap(p['name'],c)[0])
        if par and par in byname:
            p['parent']=par; n,c=overlap(p['name'],par)
            if not c:
                q=byname[par]; c=(min(max(q['x']+q['w']/2,p['x']),p['x']+p['w']),min(max(q['y']+q['h']/2,p['y']),p['y']+p['h']))
                report.append(f"{key}: {p['name']} does not overlap {par}; pivot at the nearest edge")
            p['pivot']=[round(c[0]-p['x'],1),round(c[1]-p['y'],1)]
        else:
            if p['name']=='shadow': p['pivot']=[round(p['w']/2,1),round(p['h']/2,1)]
            else: p['pivot']=[round(p['w']/2,1),round(p['h']*0.85,1)]
        p['x']=round(p['x'],2);p['y']=round(p['y'],2);p['w']=round(p['w'],2);p['h']=round(p['h'],2)
    # Pivot markers from Figma (`pivot / <part>` layers, stage px) override the computed ones.
    marks=PIVOTS.get(key,{})
    for p in parts:
        if p['name'] in marks:
            mx,my=marks[p['name']]; p['pivot']=[round((mx*S-ox-dx)/S-p['x'],1),round((my*S-oy-dy)/S-p['y'],1)]; report.append(f"{key}: {p['name']} pivot from Figma marker")
    rigs[key]=dict(figma=spr['figma'],w=spr['w'],h=spr['h'],ax=spr['ax'],ay=spr['ay'],merged=spec.get('merged',False),parts=parts)
    print(f"{key}: {len(parts)} parts, offset {dx},{dy}, rest diff vs sprite {diff:.2f}")
json.dump(rigs,open(f"{ROOT}/src/scene/rigs.json",'w'),ensure_ascii=False,indent=1)
print('\n'.join(report))
