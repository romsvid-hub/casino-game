# Pose part specs transcribed from Figma get_design_context (12.11).
# kinds: box(x,y,w,h) | crop(x,y,w,h,L,T,W,H) | rot(ox,oy,ow,oh,iw,ih,deg,flip,crop) | svg(shadow; x,y,w,h,iw,ih,deg,insY,insX)
HB=(400,391,324.545,374.059)
def box(n,u,b): return (n,u,'box',b)
P={}
P['hero.idle']=dict(parts=[box(n,u,HB) for n,u in [
 ('cape back','e411be62-9216-41d5-b1db-5e7260c23f44'),('arm L','15eaf155-d0e2-466c-a5e6-f95009803332'),('cape front','32d7bb86-f68a-45a6-baf2-388abd92a8da'),
 ('leg R','08bfd8d0-fa0e-4248-b9ab-040e11df7bf7'),('thigh L','b1b340c4-e038-428c-b9ed-dcf43339ec89'),('thigh R','dfe7fbbe-6df1-446d-8415-c3ba8aa01675'),
 ('arm R','d06e44cf-cc29-4047-a3a4-1f2032b67f15'),('fist R','6f7524d0-16cf-4c3e-8705-53e72642f61c'),('hips','e048c2ac-1b0d-4d79-96dc-cf5fbb3e5233'),
 ('torso','c0bb4706-0626-40b5-9e1e-b66ef7126e3b'),('shield','c27eec8a-86d9-45a9-a94c-b214e4a173e9'),('fist L + sword','6ecf7ec9-8aff-435b-ace4-34640e357ea7'),
 ('head','7b032a69-b469-45a6-b475-eb60bf6fb5b9'),('visor','c7793205-3bf0-4462-a3f5-7ae560b28e2b'),('cape collar','35ec2dad-03f7-4fd4-a2bf-fc4be43e1036')]],
 tree={'hips':None,'thigh L':'hips','thigh R':'hips','leg R':'thigh R','torso':'hips','head':'torso','visor':'head','arm L':'torso','fist L + sword':'arm L',
       'arm R':'torso','fist R':'arm R','shield':'fist R','cape back':'torso','cape front':'torso','cape collar':'torso'})
def c(n,u,x,y,w,h,L,T,W,H): return (n,u,'crop',(x,y,w,h,L,T,W,H))
P['hero.walk']=dict(parts=[c('leg R','44cbc693-9051-4f76-9dd1-2d9deb613076',615,638,118,132,-491.53,-328.03,730.16,582.16),
 c('leg L','1a2ad0f5-a88a-44e1-bd88-66217c242e54',493,653,103,111,-444.66,-403.6,836.49,692.3),
 c('body','867457bf-7c94-4606-a6c9-e148bcb5978a',461,516,201,232,-211.94,-134.05,428.65,331.23),
 c('head','867457bf-7c94-4606-a6c9-e148bcb5978a',568,414,83,106,-642.17,-197.17,1038.05,724.95),
 c('shield','845dc159-765e-4aa6-bca7-59bf122ca3f3',630,509,75,150,-793.33,-202.67,1148.78,512.3),
 c('arm','e3f69d1a-cc84-43bf-87b7-c00e1ce0a9b8',520,521,61,115,-795.08,-274.78,1412.44,668.22),
 c('cape','9b141515-0a2f-4866-a9f4-c98db7c068ca',427,476,188,210,-208.51,-129.05,458.29,365.93)],
 tree={'body':None,'leg R':'body','leg L':'body','head':'body','shield':'body','arm':'body','cape':'body'})
P['hero.attack']=dict(parts=[c('hips','599d73e4-4ab4-4adb-a6bb-4916f8211246',668.38,545.1,312,195,-117.95,-234.31,338.38,482.88),
 c('leg L','8e68c813-0971-4fda-9300-af69117f7ea4',554.38,652.1,178,115,-142.7,-490.34,593.11,818.79),
 c('leg R','3e534d11-2da6-4f91-88a9-ac5e76549e78',860.38,622.1,94,145,-595.74,-368.2,1123.12,649.39),
 c('head','c82c700c-cc65-4f78-bec7-3efee21cced1',842.38,450.1,98,112,-553.06,-323.12,1077.28,840.73),
 c('arm + sword','71c14a51-55b7-4c34-8de4-2f42dec396a4',843.38,519.1,384,51,-141.41,-844.9,274.93,1846.3),
 c('cape','8698aba0-2ab7-4d99-9973-cb0e74918a53',597.38,487.1,325,175,-91.3,-227.94,324.84,538.06)],
 tree={'hips':None,'leg L':'hips','leg R':'hips','head':'hips','arm + sword':'hips','cape':'hips'})
P['hero.hit']=dict(parts=[c('head','7f8e7066-dae7-48cc-a83f-bb3d1545dafe',481.13,439,87,91,-583.91,-432.32,1425.87,1215.83),
 c('body','7a04dc00-8604-402c-a093-794a4ff54009',411.13,481,288,238,-152.08,-183.19,430.79,464.94),
 c('shield','912684a0-131f-481a-b3b1-e01aeb56522c',627.13,461,124,160,-527.42,-260,1000.55,691.6),
 c('shield shards','d99f3d6e-faf0-463f-8ce4-34d5cd319dc9',678.13,462,100,105,-705,-397.14,1240.68,1053.87),
 c('cape','554c6bbb-134f-41c3-af7e-8d7c01b83394',411.13,461,228,139,-192.11,-299.28,544.16,796.09),
 c('leg R','54e93d4b-86b9-422a-b2a5-cb1620e7346f',622.13,623,128,133,-507.03,-434.59,969.28,832.01),
 c('leg L','359c522a-fd10-4d4c-acf8-6420d3965510',443.13,632,136,124,-345.59,-473.39,912.27,892.39),
 c('arm + sword','e84a3dfe-e7aa-4df6-835e-4083c7f03bd3',427.13,530,201,237,-225.87,-204.64,617.25,466.91)],
 tree={'body':None,'head':'body','shield':'body','shield shards':'shield','cape':'body','leg R':'body','leg L':'body','arm + sword':'body'})
P['hero.dead']=dict(parts=[box('hero dead','afbd1960-3bed-4a52-acef-b48b3d33d0d5',(-120,-68,1413,1261))],tree={'hero dead':None},merged=True)
P['hero.caged']=dict(parts=[c('knight in cage','70547bb9-86d3-4736-880e-6164f15dd1fc',561.3,449,240.63,373,-184.68,-82.99,470.73,270.85)],tree={'knight in cage':None},merged=True)
P['hero.victory']=dict(parts=[c('cape','b29886d7-5005-43a8-b753-c23c11db92d6',570,446,160,195,-162.21,-144.1,552.19,404.1),
 c('thigh L','430b320a-2720-4146-b212-2839928c79b6',686,580,62,86,-605.7,-482.56,1425.01,916.28),
 c('leg L','b1598782-5c24-488a-98ca-b2628961af5a',661,631,75,108,-467.38,-431.48,1178.01,729.63),
 c('thigh R','0d02080f-1031-4cb9-8250-f5c468cc5ea2',740,579,70,78,-613.62,-530.77,1262.15,1010.26),
 c('leg R','1d14349a-d9db-402a-a50f-3319f4da4f4f',769,627,99,107,-463.16,-431.78,892.43,736.45),
 c('torso','3847fbe9-e192-44d2-aa9b-5041b6abb70c',706,456,85,88,-465.33,-330.68,1039.42,895.45),
 c('head','2a3128e8-0cf2-4ff9-82f4-26ddf21ea763',704,374,82,103,-479.92,-202.91,1077.44,765.05),
 c('hips','c6d9c81c-6667-4eb9-a1c4-0067bc21b681',653,524,153,134,-223.88,-267.91,577.45,588.06),
 c('arm + sword','4baf97c9-721a-4feb-b219-f8c3253352b1',669,216,91,303,-393.99,-16.83,970.88,260.07),
 c('shield','1572029b-9fe5-4c0e-be1f-0bfd6f9b2094',762,462,91,167,-496,-177.84,970.88,471.86)],
 tree={'hips':None,'thigh L':'hips','leg L':'thigh L','thigh R':'hips','leg R':'thigh R','torso':'hips','head':'torso','arm + sword':'torso','shield':'torso','cape':'torso'})
VB=(979.7,423.7,574.75,383.167)
P['vovkulak.idle']=dict(parts=[box(n,u,VB) for n,u in [('head','1b5c5704-2678-460b-8a4c-51ebba425673'),('leg L','d03f8954-d54b-4918-ae6a-379f8f23b8a5'),('arm L','1638dfca-8196-4a50-b075-4132b6cafaed'),
 ('leg R','40497b43-a791-4f71-a7e5-faaffe82404c'),('arm R','a9cf00b1-c04b-464f-8349-54cce33bbb3b'),('body','e6cfbfb7-6013-4dfb-8832-00bb2004d428'),('jaw','9c045278-4ce7-48e3-9f8b-570c75b30633')]],
 tree={'body':None,'head':'body','jaw':'head','leg L':'body','leg R':'body','arm L':'body','arm R':'body'})
VH=(896,154,927.433,827.18)
P['vovkulak.hit']=dict(parts=[box('hips + legs','b5da475b-b316-4fde-8b34-2d57d5d2bd46',VH),box('torso','5f4ba8a8-5753-429a-b63e-1375787384f7',VH),box('arm L','cc16a2ce-f868-44fb-9ae9-9f73f2ffe829',VH),
 box('arm R','4d1d22bc-0bbd-4c22-aec8-b8d6e78ec1f0',VH),box('head','c480b596-5a97-4532-b103-8c703d260a5b',(896,154.52,927.433,827.18))],
 tree={'hips + legs':None,'torso':'hips + legs','arm L':'torso','arm R':'torso','head':'torso'},merged=['hips + legs'])
VA=(559.08,80.22,1051.219,937.586)
P['vovkulak.attack']=dict(parts=[('arm L','450e2799-e9c2-4330-904f-374ded8bd406','rot',(383,-155,1403.393,1408.03,1051.219,937.586,46.65,False,None)),
 box('leg L','5d63a391-fce8-45be-9b05-14a96e5bcb57',VA),box('arm R','1feefb73-62f2-4465-be08-f26ef43ea21f',VA),box('body','3fc04785-0973-4deb-a6bd-6b965c57a51f',VA),
 box('jaw','d6f65eaf-349f-4faf-8dbd-9aa9b34940b4',VA),box('head','d673b498-e512-468c-9c0f-b965ef5e0839',(559.08,80.64,1051.219,937.586))],
 tree={'body':None,'arm L':'body','leg L':'body','arm R':'body','head':'body','jaw':'head'})
P['vovkulak.dead']=dict(parts=[('dead','5d75cee0-d05a-45fc-b7d5-8559a3a1da26','rot',(662,-1,1369,1220.747,1369,1220.747,0,True,None))],tree={'dead':None},merged=True)
VV=(660,119,1002.084,893.761)
P['vovkulak.victory']=dict(parts=[box('body','d59c0a17-34c8-431c-9de6-0bfe832e068c',VV),box('leg L','f779aa16-4150-4881-abd8-2ff726485e98',VV),box('arm R','d3ad915c-c962-4661-9eff-a75685409df7',VV),
 box('arm L','3dd772b6-4b2b-4335-bbdb-5ad67cf9777a',VV),box('jaw','5a9955e5-b306-4921-bf3a-4b3b33e3268d',VV),box('head','49ed1af7-acb6-43e2-ae30-35cac18ce32e',(660,119.24,1002.084,893.761))],
 tree={'body':None,'leg L':'body','arm R':'body','arm L':'body','head':'body','jaw':'head'})
BI=(853,189,896.849,799.902)
P['vovkulakBoss.idle']=dict(parts=[box(n,u,BI) for n,u in [('foot L','c368526e-3001-4e35-9347-bd6990f62460'),('thigh L','4b9063f4-f11d-4899-81cb-b1ffa68da3ab'),('foot wraps','cbae4651-5647-4876-9c9e-7f3fb3af5f0b'),
 ('body','2cf9405b-9262-409e-962a-d169c4300b06'),('foot R','5da6df8a-4c9c-4f48-8e2a-083a911d548f'),('thigh R','b75b2329-bc22-488e-a928-523eab949cdc'),('arm L','6f613d2b-082a-442a-91eb-a8dcac23687b'),
 ('jaw','0e2700eb-b41b-4d61-808c-ceb8a836cb9f'),('head','19a82c60-b233-44f2-ad74-bc4d4a37a2f5'),('club ribbon R','620a17c9-7713-45d9-9ca0-f89618cd731f'),('club ribbon L','7abcb760-9890-41be-b01c-2a0ed5ff3b25'),('arm R + club','8475ab43-c81b-451e-95c1-a022ee0c07f0')]],
 tree={'body':None,'thigh L':'body','foot L':'thigh L','thigh R':'body','foot R':'thigh R','foot wraps':'body','arm L':'body','arm R + club':'body','club ribbon R':'arm R + club','club ribbon L':'arm R + club','head':'body','jaw':'head'})
def r(n,u,o,i,deg): return (n,u,'rot',(o[0],o[1],o[2],o[3],i[0],i[1],deg,False,None))
O=(820.99,161.39,971.188,875.685); I=(931,830.362)
P['vovkulakBoss.hit']=dict(parts=[r('hips + legs','90557810-0ecd-4271-8cf4-a0e0cd5b3eac',O,I,2.85),r('arm L','9e69890c-903f-4d0f-8502-f8e25195553d',O,I,2.85),r('torso','79be07c5-327c-46e0-8428-09b9c8196934',O,I,2.85),
 r('arm R','43b32dc5-f0ba-4a9d-aad2-17752e546813',O,I,2.85),r('head','3e76f325-64f5-4aac-9233-8a4306a7e21c',(820.98,161.52,971.188,875.685),I,2.85),r('club','b06d644b-644a-43d9-9363-90b8b4d11ab9',(845.98,287.01,946.115,847.345),I,-1.05)],
 tree={'hips + legs':None,'torso':'hips + legs','arm L':'torso','arm R':'torso','head':'torso','club':'auto:arm L,arm R'},merged=['hips + legs'])
O=(696.65,88.51,987.386,901.108); I=(903.729,806.039)
P['vovkulakBoss.attack']=dict(parts=[r('body','755716ac-6a2c-4b55-a58f-9dead19c04fe',O,I,-6.35),r('lower cape','4ce109f3-13d2-4220-8188-b44177768044',O,I,-6.35),r('cape','c91f9bf4-1a3e-42c3-9973-0592392a830f',O,I,-6.35),
 r('leg L','d615ab0e-f04a-4a5c-91f8-fc17b38857ab',O,I,-6.35),r('leg R','943bfe3a-0fe7-4f78-a232-e138c66f2680',O,I,-6.35),r('arm R','6ffcbe9a-baf1-476d-adf3-61ca3fa17056',O,I,-6.35),
 r('jaw','7a8e70ec-5a66-46cf-8b12-954f06d5fef7',O,I,-6.35),r('head','6b34b768-b663-4849-95b7-f76a3cd5b1b0',O,I,-6.35),r('arm L + club','d2eefaa9-4c31-4527-82fb-e8010f004d87',O,I,-6.35),
 r('club ribbon','e8daca03-7ef9-4fa0-ae2c-2497b3a01ade',(319.02,-238,1089.703,1140.323),(896.849,799.902),-113.33)],
 tree={'body':None,'lower cape':'body','cape':'body','leg L':'body','leg R':'body','arm R':'body','head':'body','jaw':'head','arm L + club':'body','club ribbon':'arm L + club'})
P['vovkulakBoss.dead']=dict(parts=[box('dead','6a5bc9e7-f19f-44d7-a168-adbd6b78991b',(1032,127,949,847))],tree={'dead':None},merged=True)
BV=(734.14,150,932.988,832.135)
P['vovkulakBoss.victory']=dict(parts=[box(n,u,BV) for n,u in [('cape','b6e3be7f-608d-4775-9a4c-c490dfd3bbea'),('arm R','4156cb6f-3e5b-445b-977b-6486d514d7c2'),('ribbon lower L','db99df02-9e31-4ea2-82f2-bdf213981944'),
 ('ribbon upper R','24e5b956-8232-4c2c-bcb4-4ef4bed1d2a5'),('shoulder L','92c8c3ae-9691-4ead-bccf-774158cf7a64'),('arm L + club','8c6d4d14-9b18-4793-a5a7-a2d6e45fbbc4'),('body','327c0ded-1376-4ca3-b101-77f8ce41c8b2'),('head','024e22b3-96ef-416e-b271-c1ef1a03e275')]],
 tree={'body':None,'cape':'body','arm R':'body','ribbon lower L':'body','ribbon upper R':'body','shoulder L':'body','arm L + club':'shoulder L','head':'body'})
# Baba Yaga: parts and baked shadows (same as the 10.11 recomposition)
def sv(u,*a): return ('shadow',u,'svg',a)
YB=(795,169,945.422,844.206); YI=(941.152,839.416)
def yr(n,u): return (n,u,'rot',(YB[0],YB[1],YB[2],YB[3],YI[0],YI[1],-0.29,False,None))
P['babaYaga.idle']=dict(parts=[sv('78c51e2e-bd9e-4fb7-b7dd-5e3bd40d61ef.svg',1130,722.86,420.26,54.142,420,52,-0.29,29.23,3.62),
 yr('body','c26f2619-58aa-4a73-ac68-9d468fb762be.png'),yr('leg L','c2714186-47c0-4888-bbdd-7f073dadba5d.png'),yr('arm L + broom','e4d717d7-96b9-4aab-97e0-b1b189421802.png'),yr('leg R','9d5b1561-6935-436c-a534-ba27fd8ff67c.png'),
 c('arm R + cage','7d4ffaad-c5c4-4507-b4ba-6b3b87344b4a.png',1336,375,177,217,-287.97,-97.82,533.63,388.55),yr('head','5ec866bb-7f6b-4a59-b961-712e2add06d0.png')],
 tree={'shadow':None,'body':None,'leg L':'body','arm L + broom':'body','leg R':'body','arm R + cage':'body','head':'body'})
P['babaYaga.hit']=dict(parts=[sv('510cba78-2087-4b6a-a4bc-68b3e7e77c12.svg',1272,695,136.104,109.436,120.582,63.283,-25.79,24.02,12.61),sv('1bf3ae63-3f5b-4ec0-ad0e-9bbe73596b71.svg',1553,719,55.52,44.642,49.188,25.814,-25.79,58.88,30.9),
 sv('a22254a9-d996-4521-8d8c-da78de7fcefd.svg',1727.88,737.04,94.533,66.458,85.552,44.898,15.77,33.85,17.77),
 c('body','7b948810-9f45-48f9-bdbf-207c69aabec6.png',1407.12,431.77,173.579,131.035,-227.32,-246.1,562.8,664.94),c('hair + ribbon','41074540-9e52-469d-ab25-6400bf7fe3ab.png',1500.72,362,137.842,124.228,-354.16,-203.42,708.71,701.37),
 c('head','2e6a6811-b37b-4156-884e-66a9a92125b6.png',1394.36,367.11,136.991,111.465,-278.72,-231.3,713.11,781.68),c('legs + hips','c39b8941-68b6-47a0-a98c-d7762abcc512.png',1309.27,518.56,330.14,231.439,-89.88,-176.84,295.9,376.47),
 c('arm R + cage','7680e779-ac3f-422c-9c7d-db517b877414.png',1501,453,316,275,-149.12,-120.09,301.76,308.82),c('arm L','fc0ab859-e7a8-4880-94d7-6a448eb9d5cb.png',1191,388.38,254.412,296.956,-70.15,-93.98,383.98,293.41)],
 tree={'shadow':None,'body':None,'hair + ribbon':'head','head':'body','legs + hips':'body','arm R + cage':'body','arm L':'body'},merged=['legs + hips'])
P['babaYaga.attack']=dict(parts=[sv('ad6d1e33-fa66-445d-9b8d-9157a5fa7caf.svg',1102.43,726.26,154.978,46.909,154.405,44.898,-0.75,33.85,9.84),sv('61b94a4d-6ce0-4a51-9585-2a28bbb23688.svg',845.31,721,103.342,36.908,102.887,35.569,-0.75,42.73,14.77),
 c('body','878efc6b-61e6-43c7-8490-032a8d16cf7e.png',1120.49,437.82,209.412,282.874,-221.77,-108.96,483.06,318.96),c('leg R + cage','92eaa0c5-53a6-4d5d-9427-29bee5094768.png',1240,443,303,311,-186.65,-96.42,326.43,283.42),
 c('arms + broom','101b81ca-83c2-4a56-8df3-ed9c57b2a48f.png',708,464.84,528.595,146.081,-9.82,-229.48,191.37,617.63),c('hair','5c378cd2-fd97-4b90-a94e-e7e27b29089c.png',1201.13,405.73,232.633,117.372,-234.3,-235.25,434.85,768.71),
 c('leg L','329e3508-07f0-4c9b-b666-a98e0637e755.png',1029.3,568.7,229.255,173.102,-162.8,-253.66,441.25,521.22),c('ribbon 2','93518ac6-af8b-403d-8251-d6f4ee2c53a1.png',1208.31,369,189.568,62.486,-291.31,-383.11,533.63,1443.92),
 c('ribbon','08298d79-b83b-43eb-81de-fc4c4f361862.png',1222.66,371.53,56.997,26.599,-994.07,-909.52,1774.81,3392.06),c('head','cefcc398-cc5d-47bc-989d-439810c6a954.png',1105.29,383.36,131.727,101.328,-341.03,-250.42,767.95,890.42),
 c('jaw','b14695e6-1f77-45c2-86ea-847968e2e684.png',1139.91,464,34.198,34.198,-1414.81,-977.78,2958.03,2638.27)],
 tree={'shadow':None,'body':None,'leg R + cage':'body','arms + broom':'body','hair':'head','leg L':'body','ribbon 2':'head','ribbon':'head','head':'body','jaw':'head'},merged=['arms + broom'])
P['babaYaga.dead']=dict(parts=[sv('21c4b5a6-63cd-4e08-8c9d-c2c411b1a679.svg',1037.68,722.42,604.786,55.083,604.528,52,-0.29,29.23,2.51),
 ('dead','dc196ebf-8aed-4cf0-ae4d-a50d1eb5edce','rot',(1043,606,608,196,608,196,0,True,(-1.42,-166.42,104.9,290.44))),
 ('cage','b6fb50c5-6216-436d-8000-bbf8735bce8c','rot',(1263.72,511.62,124.723,142.43,108.448,129.1,7.68,False,(-81.58,-61.19,249.32,186.8)))],
 tree={'shadow':None,'dead':None,'cage':'dead'},merged=['dead'])
P['babaYaga.victory']=dict(parts=[sv('90df276e-e26e-4d27-b816-ef985002eca8.svg',1102.24,726.26,154.978,46.909,154.405,44.898,-0.75,33.85,9.84),sv('093f9c3c-f8bc-447d-9d6b-55a0dfd6302f.svg',845.12,721,103.342,36.908,102.887,35.569,-0.75,42.73,14.77),
 c('arm R + cage','233175c7-c3a9-4b03-8293-037dcf06c563.png',1048,371,202,248,-287.97,-97.82,533.63,388.55),c('body','fbcba409-3d5b-4289-93e4-46fd806dda42.png',836.66,399.99,340.34,351.014,-92.4,-78.25,289.02,249.94),
 c('head','02960e4a-cc68-40a0-a506-87c28a196964.png',971.32,333.48,153.132,134.658,-293.3,-154.57,642.36,651.52),c('arm L + broom','bfffdeec-3a29-446b-a396-a73e17ffe0d7.png',764,206.62,377.699,309.549,-64.02,-26.26,260.43,283.42)],
 tree={'shadow':None,'body':None,'arm R + cage':'body','head':'body','arm L + broom':'body'})
