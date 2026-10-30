"""Original procedural kitsune prototype. Run with Blender 4.5 --background --python.
No external generation service. All geometry, rig and clips are built here.
"""
import bpy, math, os, json, random
from mathutils import Vector
from math import sin,cos,pi
random.seed(21)
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'../..'))
OUT=os.path.join(ROOT,'public/cinematic')
RENDER=os.path.join(ROOT,'tools/model/renders')
os.makedirs(RENDER,exist_ok=True)
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)

def material(name,color,metal=0,rough=.4):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
 return m
skin=material('warm porcelain',(0.83,.61,.53),0,.48)
hair=material('moon silver',(.78,.81,.89),.04,.42)
hairdark=material('silver shadow',(.38,.43,.56),.12,.4)
black=material('midnight silk',(.018,.024,.043),.12,.3)
red=material('oxblood silk',(.22,.028,.067),.08,.38)
rose=material('sakura pink',(.66,.26,.38),.1,.35)
ivory=material('ivory lining',(.81,.75,.69),.08,.5)
gold=material('antique rose gold',(.56,.32,.15),.75,.25)
white=material('eye ivory',(.96,.92,.88),0,.25)
eye=material('rose irises',(.47,.09,.21),.2,.23)
ink=material('ink',(.009,.009,.019),0,.4)
parts=[]

def attach(o,mat,bone):
 o.data.materials.append(mat)
 if o.type=='MESH':
  for p in o.data.polygons:p.use_smooth=True
  o.vertex_groups.new(name=bone).add(list(range(len(o.data.vertices))),1,'REPLACE')
 parts.append(o);return o

def mesh(name,verts,faces,mat,bone):
 d=bpy.data.meshes.new(name);d.from_pydata(verts,[],faces);d.update();o=bpy.data.objects.new(name,d);bpy.context.collection.objects.link(o);return attach(o,mat,bone)

def ell(name,loc,scale,mat,bone,seg=24,rings=16):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=seg,ring_count=rings,location=loc);o=bpy.context.object;o.name=name;o.scale=scale
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True);return attach(o,mat,bone)

def tube(name,pts,radius,mat,bone,res=8,taper=True,flatten=1):
 # Catmull-Rom interpolation gives editable, tapered locks and fabric piping.
 points=[Vector(p) for p in pts]; path=[]
 for k in range(len(points)-1):
  p0=points[max(0,k-1)];p1=points[k];p2=points[k+1];p3=points[min(len(points)-1,k+2)]
  for j in range(7):
   t=j/7;path.append(.5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t*t+(-p0+3*p1-3*p2+p3)*t*t*t))
 path.append(points[-1]);v=[];f=[]
 for i,p in enumerate(path):
  tang=(path[min(i+1,len(path)-1)]-path[max(0,i-1)]).normalized()
  ref=Vector((0,1,0)) if abs(tang.y)<.9 else Vector((1,0,0));n=tang.cross(ref).normalized();b=tang.cross(n).normalized()
  s=i/(len(path)-1);r=radius*((.22+.78*sin(pi*(s*.78+.1))) if taper else 1)
  if taper:r*=max(.025,(1-s)**.35)
  for j in range(res):
   a=j/res*2*pi;q=p+n*cos(a)*r+b*sin(a)*r*flatten;v.append(q)
  if i:
   for j in range(res):a=(i-1)*res+j;c=(i-1)*res+(j+1)%res;f.append((a,c,c+res,a+res))
 f.extend([tuple(reversed(range(res))),tuple((len(path)-1)*res+j for j in range(res))])
 return mesh(name,v,f,mat,bone)

def rings_mesh(name,rings,mat,bone,start=0,end=2*pi,N=48):
 v=[];f=[]
 for z,rx,ry,cy in rings:
  for j in range(N+1):
   a=start+(end-start)*j/N;fold=.04 if 'skirt' in name or name=='outer kimono' else .008;ruff=1+fold*(sin(a*16+.16*z)+.22*sin(a*32-z))/1.22;v.append((rx*sin(a)*ruff,cy-ry*cos(a)*ruff,z))
 for i in range(len(rings)-1):
  for j in range(N):a=i*(N+1)+j;f.append((a,a+1,a+N+2,a+N+1))
 return mesh(name,v,f,mat,bone)

# Rig: actual armature with skin weights, rather than an animated image plane.
bpy.ops.object.armature_add(enter_editmode=True);rig=bpy.context.object;rig.name='iYokai_Armature';data=rig.data;data.edit_bones.remove(data.edit_bones[0])
bones={
'root':((0,0,.03),(0,0,.3),None),'hips':((0,0,1.75),(0,0,2.15),'root'),
'spine':((0,0,2.15),(0,0,2.55),'hips'),'chest':((0,0,2.55),(0,0,2.95),'spine'),
'neck':((0,0,2.95),(0,0,3.12),'chest'),'head':((0,0,3.12),(0,0,3.64),'neck'),
'upper_arm.L':((.34,0,2.85),(.62,-.02,2.38),'chest'),'forearm.L':((.62,-.02,2.38),(.76,-.10,1.99),'upper_arm.L'),'hand.L':((.76,-.10,1.99),(.79,-.13,1.82),'forearm.L'),
'upper_arm.R':((-.34,0,2.85),(-.67,-.01,2.57),'chest'),'forearm.R':((-.67,-.01,2.57),(-.92,-.09,2.95),'upper_arm.R'),'hand.R':((-.92,-.09,2.95),(-.99,-.1,3.12),'forearm.R'),
'upper_leg.L':((.18,0,1.78),(.18,-.015,1.02),'hips'),'lower_leg.L':((.18,-.015,1.02),(.18,0,.24),'upper_leg.L'),'foot.L':((.18,0,.24),(.18,-.25,.13),'lower_leg.L'),
'upper_leg.R':((-.18,0,1.78),(-.2,.03,1.02),'hips'),'lower_leg.R':((-.2,.03,1.02),(-.21,.02,.24),'upper_leg.R'),'foot.R':((-.21,.02,.24),(-.21,-.23,.13),'lower_leg.R')}
for name,(h,t,parent) in bones.items():
 b=data.edit_bones.new(name);b.head=h;b.tail=t
 if parent:b.parent=data.edit_bones[parent]
bpy.ops.object.mode_set(mode='OBJECT')
# Body and elegant fully clothed silhouette.
ell('neck',(0,0,3.04),(.082,.078,.12),skin,'neck')
face=ell('face',(0,-.01,3.45),(.272,.216,.355),skin,'head',40,28)
for vertex in face.data.vertices:
 z=vertex.co.z
 if z<-.06:vertex.co.x*=max(.64,1+(z+.06)*1.0)
 # Slight cheek volume and a less spherical lower face.
 if vertex.co.y<0 and -.16<z<.06:vertex.co.y-=.009*sin((z+.16)/.22*pi)
face.data.update()
# The face uses one continuous surface; no separate chin primitive.
ell('nose',(0,-.224,3.40),(.033,.056,.057),skin,'head')
ell('nose tip',(0,-.255,3.38),(.034,.025,.025),skin,'head')
# Deliberately stylized inset eyes, pupils and lashes.
for s in [-1,1]:
 x=s*.112
 ell('eye white',(x,-.207,3.486),(.087,.027,.041),white,'head')
 ell('iris',(x,-.233,3.486),(.033,.009,.035),eye,'head')
 ell('pupil',(x,-.241,3.487),(.014,.006,.026),ink,'head')
 ell('eye catchlight',(x-.009,-.248,3.503),(.008,.003,.009),white,'head',12,8)
 tube('upper eyelid',[(x-s*.082,-.225,3.489),(x,-.239,3.526),(x+s*.085,-.221,3.505)],.0055,ink,'head',8,False)
 tube('brow',[(x-s*.07,-.197,3.565),(x,-.211,3.585),(x+s*.065,-.192,3.577)],.008,hairdark,'head',6,True)
 ell('ear',(s*.268,.0,3.45),(.042,.035,.079),skin,'head',16,12)
tube('upper lip',[(-.055,-.203,3.282),(0,-.223,3.291),(.055,-.203,3.282)],.008,rose,'head',8,True)
tube('lower lip',[(-.045,-.205,3.278),(0,-.219,3.269),(.045,-.205,3.278)],.008,rose,'head',8,True)
# Fox ears: sculpted triangular shells with recessed pink interiors.
for s in [-1,1]:
 verts=[(s*.08,.01,3.69),(s*.36,.035,3.71),(s*.29,.035,4.10),(s*.19,.15,3.79)]
 mesh('fox ear outer',verts,[(0,1,2),(0,3,1),(1,3,2),(2,3,0)],hair,'head')
 mesh('fox ear velvet',[(s*.14,-.003,3.74),(s*.31,.012,3.76),(s*.28,.012,4.02)],[(0,1,2)],rose,'head')
# Hair cap: front opening above the brow, long individual locks behind.
v=[];f=[];N=48;R=12
for i in range(R+1):
 for j in range(N+1):
  a=2*pi*j/N;front=max(0,cos(a));maxangle=2.15-.85*front;th=.03+i/R*maxangle
  v.append((.29*sin(th)*sin(a),.012-.235*sin(th)*cos(a),3.47+.365*cos(th)))
for i in range(R):
 for j in range(N):a=i*(N+1)+j;f.append((a,a+1,a+N+2,a+N+1))
mesh('hair crown',v,f,hair,'head')
for i in range(24):
 a=.38+(2*pi-.76)*i/23; x=.25*sin(a);y=.015-.20*cos(a)
 front=cos(a)>.25;z=3.62 if front else 3.60
 endz=2.10+.34*sin(i*1.7)
 pts=[(x,y,z),(x*1.28,y+.04,3.22),(x*1.60+.045*sin(i),y+.11,2.80),(x*2.08+.08*sin(i*1.3),y+.16,endz)]
 tube('long silver lock %02d'%i,pts,.043+(i%3)*.007,hair if i%4 else hairdark,'head',12,True,.32)
for i in range(7):
 x=(i-3)*.068
 tube('side swept fringe',[(x*.9,-.13,3.76),(x+.05,-.235,3.68),(x+.11,-.23,3.58+abs(i-3)*.015)],.044,hair,'head',12,True,.13)
# Clothing.
rings_mesh('kimono torso',[(2.13,.26,.16,0),(2.35,.245,.16,0),(2.65,.32,.19,0),(2.83,.36,.17,0),(2.95,.22,.12,0)],black,'chest')
rings_mesh('inner full length skirt',[(.32,.39,.29,0),(.8,.35,.25,0),(1.4,.29,.21,0),(1.93,.30,.21,0),(2.17,.28,.18,0)],red,'hips')
rings_mesh('outer kimono',[(.24,.60,.35,.035),(.55,.55,.32,.025),(1.1,.43,.29,.01),(1.6,.34,.23,0),(2.14,.29,.19,0)],black,'hips',.32,2*pi-.32)
for s in [-1,1]:
 tube('ivory lapel',[(s*.22,-.095,2.96),(s*.26,-.174,2.80),(-s*.035,-.205,2.48),(-s*.18,-.19,2.24)],.032,ivory,'chest',8,False,.43)
 tube('gold lapel piping',[(s*.235,-.11,2.96),(s*.29,-.179,2.80),(-s*.01,-.22,2.48),(-s*.16,-.21,2.24)],.006,gold,'chest',6,False)
 pts=[(s*.29*sin(.32),-.19*cos(.32),2.14),(s*.34*sin(.32),-.23*cos(.32),1.6),(s*.43*sin(.32),-.29*cos(.32),1.1),(s*.6*sin(.32),.035-.35*cos(.32),.24)]
 tube('skirt embroidery edge',pts,.009,gold,'hips',6,False)
rings_mesh('obi belt',[(2.12,.31,.20,0),(2.14,.325,.212,0),(2.34,.31,.205,0),(2.36,.29,.193,0)],red,'spine')
for z in [2.14,2.32]:
 tube('obi gold braid',[(.325*sin(a),-.217*cos(a),z) for a in [j*2*pi/32 for j in range(33)]],.008,gold,'spine',6,False)
# Obi flower and cascading cords.
for i in range(5):
 a=i*2*pi/5;o=ell('obi sakura petal',(.055*cos(a),-.23,2.24+.055*sin(a)),(.034,.016,.06),rose,'spine',16,10);o.rotation_euler[1]=pi/2-a
ell('obi pearl',(0,-.255,2.24),(.029,.022,.029),gold,'spine',16,10)
for s in [-1,1]:
 tube('obi hanging cord',[(s*.07,-.24,2.24),(s*.22,-.25,1.98),(s*.20,-.27,1.61),(s*.27,-.28,1.48)],.008,gold,'hips',6,False)
 ell('cord bead',(s*.27,-.28,1.49),(.022,.022,.028),gold,'hips',12,8)
 for j in range(6):tube('silk tassel',[(s*.27+(j-2.5)*.007,-.28,1.46),(s*.27+(j-2.5)*.01,-.285,1.32)],.004,rose,'hips',4,False)
# Limbs, sleeve forms and articulated fingers.
for s,side in [(1,'L'),(-1,'R')]:
 shoulder=Vector(bones['upper_arm.'+side][0]);elbow=Vector(bones['upper_arm.'+side][1]);wrist=Vector(bones['forearm.'+side][1])
 tube('upper arm', [shoulder,elbow],.10,skin,'upper_arm.'+side,12,False)
 tube('forearm',[elbow,wrist],.072,skin,'forearm.'+side,12,False)
 # Hanging silk sleeve, swept around the upper-arm axis.
 v=[];f=[];axis=(elbow-shoulder).normalized();n=Vector((0,1,0));b=axis.cross(n).normalized();rows=9;cols=24
 for i in range(rows+1):
  t=i/rows;c=shoulder.lerp(elbow,t*2) if t<.5 else elbow.lerp(wrist,(t-.5)*2);rad=.11+.13*sin(pi*t)
  for j in range(cols):
   a=j/cols*2*pi;q=c+n*cos(a)*rad+b*sin(a)*rad*.55;q.z-=(.5+.5*sin(a))*.48*sin(pi*t);v.append(q)
  if i:
   for j in range(cols):a=(i-1)*cols+j;k=(i-1)*cols+(j+1)%cols;f.append((a,k,k+cols,a+cols))
 mesh('draped kimono sleeve',v,f,black,'upper_arm.'+side)
 cuff=[v[rows*cols+j] for j in range(cols)]+[v[rows*cols]]
 tube('sleeve ivory cuff',cuff,.018,ivory,'upper_arm.'+side,8,False)
 tube('sleeve gold cuff',[(p.x,p.y-.008,p.z-.024) for p in cuff],.005,gold,'upper_arm.'+side,6,False)
 ell('palm',wrist+Vector((s*.015,-.01,-.06 if side=='L' else .07)),(.055,.032,.085),skin,'hand.'+side,20,12)
 for j in range(4):
  x=wrist.x+(j-1.5)*.025;z=wrist.z+(-.11 if side=='L' else .12);d=-1 if side=='L' else 1
  tube('finger',[(x,-.12,z),(x+s*.012,-.14,z+d*.07),(x+s*.017,-.16,z+d*.105)],.011,skin,'hand.'+side,8,True)
 tube('thumb',[(wrist.x-s*.05,-.12,wrist.z),(wrist.x-s*.085,-.15,wrist.z+.035),(wrist.x-s*.09,-.18,wrist.z+.075)],.015,skin,'hand.'+side,8,True)
 hip=Vector(bones['upper_leg.'+side][0]);knee=Vector(bones['upper_leg.'+side][1]);ankle=Vector(bones['lower_leg.'+side][1])
 tube('covered thigh',[hip,knee],.13,black,'upper_leg.'+side,16,False)
 tube('high boot',[knee,ankle],.095,black,'lower_leg.'+side,16,False)
 ell('boot foot',(ankle.x,-.12,.10),(.105,.23,.085),black,'foot.'+side)
 for z in [.38,.56,.74,.92]:
  tube('boot lacing',[(ankle.x-.07,-.082,z),(ankle.x+.07,-.091,z+.08)],.005,gold,'lower_leg.'+side,5,False)
# Small original fox mask at the side of the head.
maskcenter=Vector((-.31,-.085,3.68))
verts=[(-.16,0,.13),(-.12,.015,.31),(-.03,-.01,.17),(.10,.0,.24),(.13,0,.03),(.05,-.05,-.12),(-.07,-.035,-.07),(-.13,-.01,.015)]
verts=[maskcenter+Vector(v)*.68 for v in verts]
center=sum(verts,Vector())/len(verts);center.y-=.045;verts.append(center)
mesh('ceremonial fox mask',verts,[(8,j,(j+1)%8) for j in range(8)],ivory,'head')
for x in [-.065,.045]:
 tube('mask vermilion eye',[(maskcenter.x+x-.028,maskcenter.y-.045,maskcenter.z+.055),(maskcenter.x+x,maskcenter.y-.055,maskcenter.z+.035),(maskcenter.x+x+.025,maskcenter.y-.045,maskcenter.z+.06)],.008,red,'head',6,False)
tube('mask ribbon',[(-.35,.0,3.59),(-.40,.05,3.35),(-.37,.06,3.12)],.017,red,'head',8,True)
# Subtle gold sakura embroidery: individual petal meshes, not a painted screenshot.
for i in range(18):
 z=.48+(i%6)*.23;a=.6+(i//6)*.55;x=(.59-(z-.24)*.16)*sin(a);y=.02-(.35-(z-.24)*.055)*cos(a)-.009
 for k in range(5):
  angle=k*2*pi/5;o=ell('embroidered sakura',(x+.025*cos(angle),y-.006,z+.025*sin(angle)),(.012,.004,.021),gold,'hips',8,6);o.rotation_euler[1]=pi/2-angle
# Refined head/neck proportion; move all facial and hair parts together.
for o in parts:
 if 'head' in o.vertex_groups:o.location.z-=.06
# Join every visible mesh into one skinned avatar, preserving named vertex groups.
bpy.ops.object.select_all(action='DESELECT')
for o in parts:o.select_set(True)
bpy.context.view_layer.objects.active=parts[0];bpy.ops.object.join();avatar=bpy.context.object;avatar.name='iYokai_Kitsune_Prototype'
mod=avatar.modifiers.new('Kitsune skeleton','ARMATURE');mod.object=rig;avatar.parent=rig
# Gentle idle, welcoming gesture and bow, exported as separate NLA clips.
for name,duration,kind in [('Idle_Breath',96,'idle'),('Welcome',72,'welcome'),('Bow',72,'bow')]:
 action=bpy.data.actions.new(name);rig.animation_data_create();rig.animation_data.action=action
 for frame in range(1,duration+2,8):
  t=(frame-1)/duration*2*pi
  for bone in rig.pose.bones:
   bone.rotation_mode='XYZ';bone.rotation_euler=(0,0,0)
  rig.pose.bones['spine'].rotation_euler.x=.015*sin(t)
  rig.pose.bones['chest'].rotation_euler.y=.018*sin(t)
  rig.pose.bones['head'].rotation_euler.z=.025*sin(t)
  if kind=='welcome':
   rig.pose.bones['forearm.R'].rotation_euler.y=.28*sin(t)*sin(t/2)**2
   rig.pose.bones['hand.R'].rotation_euler.z=.32*sin(t*2)*sin(t/2)**2
   rig.pose.bones['head'].rotation_euler.y=.10*sin(t/2)**2
  if kind=='bow':
   rig.pose.bones['spine'].rotation_euler.x=.23*sin(t/2)**2
   rig.pose.bones['head'].rotation_euler.x=.15*sin(t/2)**2
  for bone in rig.pose.bones:
   bone.keyframe_insert(data_path='rotation_euler',frame=frame,group=bone.name)
 track=rig.animation_data.nla_tracks.new();track.name=name;track.strips.new(name,1,action);track.mute=True
rig.animation_data.action=None
for p in rig.pose.bones:p.rotation_euler=(0,0,0)
bpy.context.scene.frame_set(1)
# Save editable source and an actual web-ready animated GLB.
bpy.ops.object.select_all(action='DESELECT');avatar.select_set(True);rig.select_set(True);bpy.context.view_layer.objects.active=rig
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,'kitsune-prototype.glb'),export_format='GLB',use_selection=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_skins=True,export_force_sampling=True)
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ROOT,'tools/model/kitsune-prototype.blend'))
# Nine tails shown in the offline QA stage; runtime tails stay independently controlled.
for i in range(9):
 a=(i-4)*.35;L=1.7+.35*cos(a)
 pts=[(0,.2,1.8),(sin(a)*.55,.35,1.98),(sin(a)*L*1.15,.50,2.35+cos(a)*.6),(sin(a)*L*1.2,.35,2.9+cos(a)*1.0),(sin(a)*L,.15,3.2+cos(a)*.8)]
 tube('QA runtime tail',pts,.16,hair,'hips',10,True,.8)

# Studio QA render with CPU Cycles, no GPU required.
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.device='CPU';scene.cycles.samples=16;scene.cycles.use_denoising=True
scene.render.resolution_x=900;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
scene.world.color=(.055,.055,.055)
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.015));floor=bpy.context.object;floor.name='QA floor';floor.data.materials.append(material('studio charcoal',(.025,.03,.045),.1,.6))
def area(name,loc,power,color,size):
 bpy.ops.object.light_add(type='AREA',location=loc);o=bpy.context.object;o.name=name;o.data.energy=power;o.data.color=color;o.data.shape='DISK';o.data.size=size;o.rotation_euler=(Vector((0,0,2))-o.location).to_track_quat('-Z','Y').to_euler()
area('soft key',(3,-5,6),700,(1,.82,.79),4)
area('rose rim',(-3,1,4),850,(1,.32,.52),3)
area('moon rim',(2,2,5),1000,(.48,.65,1),3)
area('face fill',(0,-4,3.8),150,(.8,.87,1),2)
bpy.ops.object.camera_add(location=(5.5,-10,4.5));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,2.05))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=6.3;scene.camera=cam
scene.view_settings.view_transform='AgX'
for name,loc in [('front',(1.5,-10,3.3)),('three-quarter',(6,-10,4.3)),('back',(5,10,4.0))]:
 cam.location=loc;cam.rotation_euler=(Vector((0,0,2.05))-cam.location).to_track_quat('-Z','Y').to_euler();scene.render.filepath=os.path.join(RENDER,name+'.png');bpy.ops.render.render(write_still=True)
print('KITSUNE_BUILD_COMPLETE',len(avatar.data.vertices),len(avatar.data.polygons))

scene.render.resolution_x=360;scene.render.resolution_y=480;scene.cycles.samples=6
cam.location=(1.5,-10,3.3);cam.rotation_euler=(Vector((0,0,2.05))-cam.location).to_track_quat('-Z','Y').to_euler()
rig.animation_data.use_nla=False;rig.animation_data.action=bpy.data.actions['Welcome']
for frame in range(1,74,3):
 scene.frame_set(frame);scene.render.filepath=os.path.join(RENDER,'welcome-%03d.png'%frame);bpy.ops.render.render(write_still=True)

# Transparent CPU-rendered fallback of the real model for browsers without a GPU.
for o in bpy.context.scene.objects:
 if o.name.startswith('QA runtime tail') or o.name=='QA floor':o.hide_render=True
scene.render.film_transparent=True;scene.render.resolution_x=720;scene.render.resolution_y=1080;scene.cycles.samples=16;cam.data.ortho_scale=4.7
rig.animation_data.action=None;scene.frame_set(1)
for bone in rig.pose.bones:bone.rotation_euler=(0,0,0)
cam.location=(1.5,-10,3.3);cam.rotation_euler=(Vector((0,0,2.05))-cam.location).to_track_quat('-Z','Y').to_euler()
scene.render.filepath=os.path.join(RENDER,'cutout.png');bpy.ops.render.render(write_still=True)
