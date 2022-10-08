(()=>{var ve=(e,t)=>Math.sqrt(Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2));var xe=class{constructor(t,n){this.targetClassNames=t;this.handlers=n;this.kLongDownThresholdMs=300;this.kDragThresholdMagnitude=10;this.longDownTimer=0;this.isDragging=!1}listener(t){let n=t,{className:o}=n.target;switch(t.type){case"pointerdown":if(this.targetClassNames.length>0&&!this.targetClassNames.some(s=>o.includes(s)))return;this.downClassName=o,this.downPoint=n,this.onDown(n),this.longDownTimer=setTimeout(()=>{this.onLongDown(n),this.longDownTimer=0},this.kLongDownThresholdMs);return;case"pointerup":if(!this.downPoint)return;this.onUp(n,this.downPoint),this.longDownTimer>0&&(clearTimeout(this.longDownTimer),this.onClick(n)),this.reset();return;case"pointermove":if(!this.downPoint)return;this.isDragging?this.onDrag(n,this.downPoint):ve(n,this.downPoint)>this.kDragThresholdMagnitude&&(this.isDragging=!0);return;default:return}}reset(){this.downClassName=void 0,this.downPoint=void 0,this.isDragging=!1}onDown(t){this.handlers.forEach(n=>n.onDown(t))}onUp(t,n){this.handlers.forEach(o=>o.onUp(t,n))}onClick(t){this.handlers.forEach(n=>n.onClick(t))}onLongDown(t){this.handlers.forEach(n=>n.onLongDown(t))}onDrag(t,n){this.handlers.forEach(o=>o.onDrag(t,n))}},k=(e,t)=>{let n=new xe(e,t);["pointerdown","pointermove","pointerup"].forEach(o=>{window.addEventListener(o,s=>{n.listener(s)})})};var T=1e3,y=T/4,we=32.5,Ee=40,I=30,De=295,Se=422,Me=.2,Ce=.4,Ne=.16,Be=.5,ke=.16,A=y/4,Z=.5,Te=.25,$={path2d:new Path2D("M364,-252c-245,0 -364,165 -364,339c0,202 153,345 297,464c12,10 11,12 9,24c-7,41 -14,106 -14,164c0,104 24,229 98,311c20,22 51,48 65,48c11,0 37,-28 52,-50c41,-60 65,-146 65,-233c0,-153 -82,-280 -190,-381c-6,-6 -8,-7 -6,-19l25,-145c3,-18 3,-18 29,-18c147,0 241,-113 241,-241c0,-113 -67,-198 -168,-238c-14,-6 -15,-5 -13,-17c11,-62 29,-157 29,-214c0,-170 -130,-200 -197,-200c-151,0 -190,98 -190,163c0,62 40,115 107,115c61,0 96,-47 96,-102c0,-58 -36,-85 -67,-94c-23,-7 -32,-10 -32,-17c0,-13 26,-29 80,-29c59,0 159,18 159,166c0,47 -15,134 -27,201c-2,12 -4,11 -15,9c-20,-4 -46,-6 -69,-6zM80,20c0,-139 113,-236 288,-236c20,0 40,2 56,5c15,3 16,3 14,14l-50,298c-2,11 -4,12 -20,8c-61,-17 -100,-60 -100,-117c0,-46 30,-89 72,-107c7,-3 15,-6 15,-13c0,-6 -4,-11 -12,-11c-7,0 -19,3 -27,6c-68,23 -115,87 -115,177c0,85 57,164 145,194c18,6 18,5 15,24l-21,128c-2,11 -4,12 -14,4c-47,-38 -93,-75 -153,-142c-83,-94 -93,-173 -93,-232zM470,943c-61,0 -133,-96 -133,-252c0,-32 2,-66 6,-92c2,-13 6,-14 13,-8c79,69 174,159 174,270c0,55 -27,82 -60,82zM441,117c-12,1 -13,-2 -11,-14l49,-285c2,-12 4,-12 16,-6c56,28 94,79 94,142c0,88 -67,156 -148,163z"),bbox:{ne:{x:2.684,y:4.392},sw:{x:0,y:-2.632}}},Le={path2d:new Path2D("M216 125c93 0 206 -52 206 -123c0 -70 -52 -127 -216 -127c-149 0 -206 60 -206 127c0 68 83 123 216 123zM111 63c-2 -8 -3 -16 -3 -24c0 -32 15 -66 35 -89c21 -28 58 -52 94 -52c10 0 21 1 31 4c33 8 46 36 46 67c0 60 -55 134 -124 134c-31 0 -68 -5 -79 -40z"),bbox:{ne:{x:1.688,y:.5},sw:{x:0,y:-.5}}},He={path2d:new Path2D("M97 -125c-55 0 -97 30 -97 83c0 52 47 167 196 167c58 0 99 -32 99 -83c0 -33 -33 -167 -198 -167zM75 -87c48 0 189 88 189 131c0 7 -3 13 -6 19c-7 12 -18 21 -37 21c-47 0 -192 -79 -192 -128c0 -7 3 -14 6 -20c7 -12 19 -23 40 -23z"),bbox:{ne:{x:1.18,y:.5},sw:{x:0,y:-.5}}},Re={path2d:new Path2D("M0 -42c0 86 88 167 198 167c57 0 97 -32 97 -83c0 -85 -109 -167 -198 -167c-54 0 -97 31 -97 83z"),bbox:{ne:{x:1.18,y:.5},sw:{x:0,y:-.5}}},Oe={path2d:new Path2D("M238 -790c-5 -17 -22 -23 -28 -19s-16 13 -16 29c0 4 1 9 3 15c17 45 24 92 24 137c0 59 -9 116 -24 150c-36 85 -131 221 -197 233v239c0 12 8 15 19 15c10 0 18 -6 21 -22c16 -96 58 -182 109 -261c63 -100 115 -218 115 -343c0 -78 -26 -173 -26 -173z"),stemUpNW:{x:0,y:-.04},bbox:{ne:{x:1.056,y:.03521239682756091},sw:{x:0,y:-3.240768470618394}}},We={path2d:new Path2D("M240 760c-10 29 7 48 22 48c7 0 13 -4 16 -15c8 -32 28 -103 28 -181c0 -125 -61 -244 -124 -343c-51 -79 -125 -166 -142 -261c-2 -16 -15 -22 -24 -22c-8 0 -16 5 -16 15v235c134 45 184 126 221 210c15 34 40 118 40 177c0 45 -7 95 -21 137z"),stemDownSW:{x:0,y:.132},bbox:{ne:{x:1.224,y:3.232896633157715},sw:{x:0,y:-.0575672}}},Ie={path2d:new Path2D("M272 -796c-6 -13 -13 -17 -20 -17c-14 0 -22 13 -22 26c0 3 0 5 1 9c5 30 8 60 8 89c0 52 -9 101 -32 149c-69 140 -140 142 -202 144h-5v388c0 7 11 10 17 10s18 -2 20 -13c17 -106 73 -122 127 -180c72 -78 98 -106 108 -174c2 -12 3 -23 3 -36 c0 -61 -22 -121 -25 -127c-1 -3 -1 -5 -1 -7c0 -4 1 -6 1 -9c18 -37 29 -78 29 -120v-22c0 -48 -3 -105 -7 -110zM209 -459c2 -3 4 -4 7 -4c5 0 12 3 13 6c5 8 5 18 7 26c1 7 1 13 1 20c0 32 -9 63 -27 89c-33 49 -87 105 -148 105h-8c-8 0 -14 -6 -14 -10c0 -1 0 -2 1 -3 c21 -82 67 -106 114 -160c21 -24 38 -44 54 -69z"),stemUpNW:{x:0,y:-.088},bbox:{ne:{x:1.116,y:.008},sw:{x:0,y:-3.252}}},Ae={path2d:new Path2D("M240 786c-3 17 5 25 17 26c12 0 19 1 24 -22c16 -80 15 -178 -21 -253c0 -3 -1 -5 -1 -9c0 -3 0 -5 1 -7c3 -6 25 -66 25 -127c0 -13 -1 -25 -3 -36c-24 -157 -221 -200 -245 -354c-2 -11 -13 -13 -20 -13c-10 0 -17 5 -17 10v387h5c62 2 143 5 212 145 c38 78 38 169 23 253zM226 456c-3 0 -5 -1 -7 -4c-16 -26 -33 -46 -54 -69c-47 -55 -103 -78 -124 -160c-1 -1 -1 -2 -1 -3c0 -5 6 -10 14 -10h8c61 0 125 56 158 105c18 26 27 56 27 89c0 6 0 13 -1 20c-2 8 -2 18 -7 25c-1 4 -8 7 -13 7z"),stemDownSW:{x:0,y:.128},bbox:{ne:{x:1.1635806326044895,y:3.2480256},sw:{x:-19418183745617774e-21,y:-.03601094374150052}}},Fe={path2d:new Path2D("M260 -673c0 -9 1 -18 1 -28c0 -43 -4 -89 -7 -95c-7 -11 -14 -16 -20 -16c-2 0 -4 1 -6 2c-7 3 -13 12 -13 24c0 2 1 4 1 7c5 29 8 57 8 85c0 48 -9 93 -31 137c-64 130 -130 132 -188 134h-5v560c0 7 8 12 14 12c10 0 17 -10 18 -19c17 -100 71 -116 121 -170 c67 -73 90 -100 101 -161c2 -9 2 -18 2 -28c0 -39 -11 -80 -20 -106c14 -29 21 -61 21 -93c0 -57 -21 -112 -23 -119c-1 -2 -1 -4 -1 -6c0 -3 0 -5 1 -7c15 -36 24 -74 26 -113zM208 -181c-55 93 -114 117 -169 117c16 -97 65 -114 114 -168c23 -25 41 -44 55 -62 c5 17 10 34 12 44c1 7 3 13 3 21c0 13 -4 28 -15 48zM219 -456c1 8 2 16 2 24c0 81 -90 177 -170 177c-9 0 -14 -9 -12 -16c22 -73 63 -95 106 -146l5 -5c17 -20 31 -37 46 -59c1 -3 4 -4 7 -4c5 0 10 3 11 6c3 7 3 15 5 23z"),stemUpNW:{x:0,y:.376},bbox:{ne:{x:1.044,y:.596},sw:{x:0,y:-3.248}}},Ue={path2d:new Path2D("M273 676v-11c-4 -64 -9 -75 -22 -100l-4 -7c-2 -3 -3 -5 -3 -9l3 -5v-2c4 -10 20 -53 20 -105c0 -34 -7 -72 -23 -101c9 -27 22 -71 22 -114c0 -10 0 -20 -2 -29c-11 -64 -35 -92 -105 -168c-52 -57 -109 -73 -126 -177c-1 -9 -9 -20 -19 -20c-8 0 -14 4 -14 13v589 c61 2 125 4 201 140c23 41 31 70 31 98c0 34 -12 65 -20 110c0 3 -1 5 -1 7c0 13 7 23 14 26c2 1 4 1 6 1c35 0 42 -116 42 -136zM39 268c0 -5 4 -13 13 -13h5c81 0 173 103 173 185c0 8 -1 17 -2 25c-2 8 -2 16 -5 23c-1 3 -7 6 -12 6c-3 0 -6 -1 -8 -4 c-16 -25 -32 -44 -52 -67c-45 -53 -91 -75 -112 -155zM229 243c-3 11 -8 32 -14 51c-14 -18 -32 -38 -56 -64c-52 -57 -103 -73 -120 -177c0 -1 0 -2 2 -3c57 0 118 26 175 122c12 21 16 37 16 50c0 8 -2 14 -3 21z"),stemDownSW:{x:0,y:-.448},bbox:{ne:{x:1.092,y:3.248},sw:{x:0,y:-.687477099907407}}},ze={path2d:new Path2D("M282 -109c0 -14 -12 -26 -26 -26h-230c-15 0 -26 12 -26 26v92c0 15 11 26 26 26h230c14 0 26 -11 26 -26v-92z"),top:1,bbox:{ne:{x:1.128,y:.036},sw:{x:0,y:-.54}}},_e={path2d:new Path2D("M282 24c0 -14 -12 -26 -26 -26h-230c-15 0 -26 12 -26 26v92c0 15 11 26 26 26h230c14 0 26 -11 26 -26v-92z"),top:2,bbox:{ne:{x:1.128,y:.568},sw:{x:0,y:-.008}}},Xe={path2d:new Path2D("M78 -38l-49 60s-10 10 -10 24c0 8 4 19 14 29c45 47 60 90 60 127c0 72 -57 123 -61 134c-3 6 -4 11 -4 16c0 14 10 21 20 21c6 0 13 -3 18 -8c17 -17 165 -193 165 -193s4 -9 4 -19c0 -5 -1 -10 -4 -15c-26 -41 -62 -89 -66 -147v-3l-1 -7v-3c0 -56 31 -93 69 -139 c11 -12 37 -45 37 -57c0 -3 -2 -4 -5 -4c-2 0 -4 0 -8 1l-1 1c-17 6 -50 17 -79 17c-42 0 -63 -32 -63 -73c0 -9 1 -18 4 -26c2 -9 13 -36 26 -36c8 -7 16 -15 16 -24c0 -2 -1 -4 -2 -7c-1 -4 -8 -6 -15 -6c-8 0 -18 3 -26 9c-73 56 -116 105 -116 155c0 49 34 96 86 96 l8 -3h4c4 -1 12 -3 16 -3c5 0 9 1 11 5c1 1 1 3 1 4c0 2 -4 10 -6 14c-13 21 -27 40 -43 60z"),top:2,bbox:{ne:{x:1.08,y:1.492},sw:{x:.004,y:-1.5}}},Ke={path2d:new Path2D("M134 107v-10c33 0 83 60 90 66c6 4 9 4 11 4c2 -1 12 -6 12 -16c-1 -5 -6 -21 -10 -39c0 0 -98 -351 -101 -353c-10 -8 -24 -10 -35 -10c-6 0 -29 1 -29 13c18 66 90 265 93 280c1 4 1 8 1 11c0 5 -1 9 -5 9c-1 0 -3 0 -5 -1c-13 -7 -22 -11 -36 -15 c-11 -4 -25 -7 -39 -7c-19 0 -38 6 -54 17c-15 12 -27 30 -27 51c0 37 30 67 67 67s67 -30 67 -67z"),top:2,bbox:{ne:{x:.988,y:.696},sw:{x:0,y:-1.004}}},$e={path2d:new Path2D("M208 111v-10c34 1 84 61 91 67c3 2 6 4 11 4c2 -1 10 -5 10 -11c0 -1 -1 -2 -1 -4c-2 -13 -27 -101 -27 -101s-19 -67 -45 -152l-116 -381c-4 -11 -9 -23 -38 -23c-22 0 -31 10 -31 19l1 1v1l95 283v1l1 1c0 4 -2 6 -4 6c-23 -12 -49 -21 -75 -21c-38 0 -80 27 -80 68 c0 38 30 68 68 68c37 0 68 -30 68 -68c0 -3 0 -6 -1 -10c14 0 41 12 49 31c7 15 58 164 58 180c0 5 -2 7 -5 7c-2 0 -4 -1 -7 -2c-23 -13 -51 -22 -78 -22c-38 0 -80 27 -80 68c0 38 31 68 68 68c38 0 68 -30 68 -68z"),top:2,bbox:{ne:{x:1.28,y:.716},sw:{x:0,y:-2}}},Ge={path2d:new Path2D("M353 419c2 0 10 -2 10 -11c0 -1 -1 -2 -1 -4c-2 -12 -26 -101 -26 -101s-172 -770 -175 -782c-4 -11 -7 -21 -39 -21c-21 0 -27 8 -27 16c0 2 0 4 1 6c2 7 71 282 71 286c0 3 -3 6 -6 6c-1 0 -2 0 -3 -1c-23 -13 -51 -22 -78 -22c-38 0 -80 27 -80 68c0 38 31 68 68 68 c38 0 68 -30 68 -68c0 -3 0 -6 -1 -10c15 1 46 14 51 35l40 164c0 5 -2 13 -7 13c-1 0 -2 0 -3 -1c-23 -12 -49 -22 -75 -22c-10 0 -19 2 -27 4c-10 3 -19 7 -27 14c-16 12 -28 30 -28 50c0 38 30 68 68 68c37 0 68 -30 68 -68c0 -3 0 -6 -1 -9c16 0 49 20 54 36l39 160v1 l1 2c0 7 -4 17 -11 17c-1 0 -3 0 -4 -1c-23 -12 -50 -22 -76 -22c-10 0 -18 2 -26 4c-10 3 -20 7 -28 14c-16 12 -28 30 -28 50c0 38 31 68 68 68c38 0 68 -30 68 -68v-9c34 0 84 61 91 66c3 2 6 4 11 4z"),top:2,bbox:{ne:{x:1.452,y:1.704},sw:{x:0,y:-2}}},Ye={path2d:new Path2D("M12 -170c-8 10 -12 581 -12 581c1 18 17 28 31 28c10 0 19 -6 19 -17c0 -20 -6 -260 -7 -282c0 -7 4 -14 11 -17c2 -1 3 -1 5 -1c5 0 16 9 22 14c14 9 38 17 55 17c46 -3 90 -39 90 -96c0 -46 -31 -107 -120 -169c-25 -17 -49 -44 -79 -61c0 0 -3 -2 -6 -2s-6 1 -9 5z M47 -81c0 -5 2 -15 11 -15c3 0 6 1 10 3c43 27 89 81 89 135c0 25 -12 58 -41 58c-23 0 -63 -29 -70 -49c-1 -4 -2 -16 -2 -32c0 -40 3 -100 3 -100z"),bbox:{ne:{x:.904,y:1.756},sw:{x:0,y:-.7}}},qe={path2d:new Path2D("M141 181l15 5c1 1 3 1 4 1c4 0 8 -3 8 -8v-502c0 -7 -6 -12 -12 -12h-13c-7 0 -12 5 -12 12v149c0 8 -7 11 -17 11c-29 0 -85 -24 -99 -30c-1 -1 -3 -1 -4 -1l-2 -1c-6 0 -9 3 -9 9v515c0 7 5 12 12 12h13c6 0 12 -5 12 -12v-167c0 -4 4 -5 10 -5c26 0 90 23 90 23 c1 0 2 1 4 1zM37 39v-103c0 -4 5 -6 12 -6c25 0 82 23 82 41v103c0 4 -3 5 -9 5c-24 0 -85 -26 -85 -40z"),bbox:{ne:{x:.672,y:1.364},sw:{x:0,y:-1.34}}},je={path2d:new Path2D("M237 118l-26 -10c-8 -3 -13 -22 -13 -29v-93c0 -12 7 -18 13 -18l26 10c2 1 3 1 5 1c4 0 7 -3 7 -8v-71c0 -6 -5 -14 -12 -17c0 0 -21 -8 -28 -11s-11 -15 -11 -23v-142c0 -6 -6 -11 -17 -11c-7 0 -13 5 -13 11v125c0 6 -5 18 -14 18l-2 -1h-1l-61 -25 c-5 -2 -10 -9 -10 -22v-139c0 -6 -7 -11 -17 -11c-7 0 -13 5 -13 11v123c0 5 -5 16 -12 16c-1 0 -2 0 -3 -1c-9 -3 -23 -9 -24 -9l-2 -1c-6 0 -9 3 -9 9v71c0 6 5 14 12 16c0 0 21 9 27 11c6 3 11 12 11 23v99c0 8 -6 18 -14 18l-1 -1c-8 -4 -23 -10 -24 -10l-2 -1 c-6 0 -9 3 -9 9v71c0 6 5 14 12 16c0 0 20 8 26 11s12 13 12 27v135c0 6 6 11 16 11c7 0 14 -5 14 -11v-120c0 -8 3 -20 12 -20c17 4 51 18 63 25c9 6 12 19 13 29v130c0 6 6 11 16 11c8 0 14 -5 14 -11v-122c0 -8 7 -13 14 -13c5 1 25 9 25 9c2 1 3 1 5 1c4 0 7 -3 7 -8 v-71c0 -6 -5 -14 -12 -17zM168 -45c2 9 4 37 4 64s-2 52 -4 57c-2 4 -8 6 -15 6c-25 0 -71 -21 -73 -38c-2 -8 -3 -43 -3 -74c0 -24 1 -46 3 -50c1 -3 6 -5 12 -5c23 0 70 20 76 40z"),bbox:{ne:{x:.996,y:1.4},sw:{x:0,y:-1.392}}};var G=new Map([[8,Oe],[16,Ie],[32,Fe]]),Y=new Map([[8,We],[16,Ae],[32,Ue]]),q=new Map([[1,ze],[2,_e],[4,Xe],[8,Ke],[16,$e],[32,Ge]]),j=new Map([["sharp",je],["natural",qe],["flat",Ye]]),Je=new Map([[8,1],[16,2],[32,3]]),U=e=>{switch(e){case 1:return Le;case 2:return He;default:return Re}},Qe=e=>e===1?Se:De;var at=(e,t)=>({start:e,end:t??e}),z=(e,t,n)=>{let o=ee(n)*t;return at(e,e+o)},ot=({note:e,stemDirection:t,beamed:n=!1})=>{let o=[],s=[],i=[];for(let r of e.pitches){if(!r.accidental)continue;let{pitch:v,accidental:B}=r,M=C(0,v,1);i.push(z(0,1,j.get(B))),o.push({type:"accidental",position:{x:0,y:M},accidental:B})}s.push(...i);let c=0;i.length>0&&(c=i[0].end+et(1));let a=e.pitches.map(r=>r.pitch),d=Math.min(...a),h=Math.max(...a),l=rt(e.duration),m=[];if(d<=0)for(let r=0;r>=d;r-=2)o.push({type:"ledger",width:l,position:{x:c,y:C(0,r,1)}}),m.push({start:c,end:c+l});if(h>=12)for(let r=12;r<h+1;r+=2)o.push({type:"ledger",width:l,position:{x:c,y:C(0,r,1)}}),m.push({start:c,end:c+l});s.push(...m);let p=0;m.length>0?p=m[0].start+Ve(1):i.length>0&&(p=i[0]?.end+et(1)*2),t||(t=Ze(a));let D=[],x=[],P=nt(e.pitches,"asc");if(t==="up")for(let r=0;r<P.length;r++)r===0?D.push(P[r]):P[r].pitch-P[r-1].pitch==1?(x.push(P[r]),r+1<P.length&&D.push(P[++r])):D.push(P[r]);else{let r=P.concat().reverse();for(let v=0;v<r.length;v++)v===0?x.push(r[v]):r[v-1].pitch-r[v].pitch==1?(D.push(r[v]),v+1<r.length&&x.push(r[++v])):x.push(r[v])}let b=[];for(let r of D)b.push(z(p,1,U(e.duration))),o.push({type:"head",position:{x:p,y:C(0,r.pitch,1)},duration:e.duration});let g=p;if(D.length>0&&(g=b[0].end),!n){let{elements:r,section:v}=tt({left:g,duration:e.duration,direction:t,lowest:P[0],highest:P[P.length-1]});v&&b.push(v),o.push(...r)}for(let r of x)b.push(z(p,1,U(e.duration))),o.push({type:"head",position:{x:p,y:C(0,r.pitch,1)},duration:e.duration});return s.push(...b),{element:{type:"note",note:e,elements:o},width:lt(0,s).end,stemOffsetLeft:g}},Ve=e=>y*Me*e,rt=e=>Qe(e)+Ve(1)*2,Ze=e=>{let t=6-Math.min(...e),n=Math.max(...e)-6;return t>n?"up":n>t?"down":pt(e)<6?"up":"down"},pt=e=>{let t=e.reduce((n,o)=>n+o)/e.length;return Math.round(t)},te=({dnp:e,direction:t,lowest:n,highest:o,extension:s=0})=>{let{topOfStaff:i,scale:c,duration:a}=e,d=i+T*c/2,h,l;if(t==="up"){if(l=C(i,n.pitch,c)-5,o.pitch<0)h=d;else{let m=a<32?o.pitch+7:o.pitch+8;h=C(i,m,c)}h-=s}else{if(h=C(i,o.pitch,c),n.pitch>12)l=d;else{let m=a<32?n.pitch-7:n.pitch-8;l=C(i,m,c)}l+=s}return{top:h,bottom:l}},lt=(e,t)=>{if(t.length===0)return{start:e,end:e};let n=Math.min(...t.map(s=>s?.start??e)),o=Math.max(...t.map(s=>s?.end??e));return{start:n,end:o}},et=e=>y/4*e,tt=({left:e,duration:t,direction:n,lowest:o,highest:s,beamed:i})=>{if(t===1)return{elements:[]};let c=[],{top:a,bottom:d}=te({dnp:{topOfStaff:0,scale:1,duration:t},direction:n,lowest:o,highest:s}),h,l;if(n==="up")if(h=e-I/2,i)a=i.top;else{let m=G.get(t);m&&(c.push({type:"flag",position:{x:h-I/2+y*m.stemUpNW.x,y:a+y*m.stemUpNW.y},duration:t,direction:n}),l=z(e,1,m))}else if(h=e+I/2,i)d=i.bottom;else{let m=Y.get(t);m&&(c.push({type:"flag",position:{x:h-I/2+y*m.stemDownSW.x,y:d+y*m.stemDownSW.y},duration:t,direction:n}),l=z(e,1,m))}return c.push({type:"stem",center:h,top:a,bottom:d,width:I}),{elements:c,section:l??{start:e,end:e+I}}},ht=e=>{let t=q.get(e.duration),n={x:0,y:y*t.top},o=ee(t);return{element:{type:"rest",rest:e,position:n},width:o}},mt=e=>{let t=Ne*y,n=Ce*y,o=[],s=0;if(e.subtype==="single")o.push({type:"line",position:{x:0,y:0},lineWidth:t}),s=t;else if(e.subtype==="double")o.push({type:"line",position:{x:0,y:0},lineWidth:t},{type:"line",position:{x:t+n,y:0},lineWidth:t}),s=n+t*2;else{let i=Be*y,c=ke*y;o.push({type:"dot",position:{x:0,y:y+y/2}},{type:"line",position:{x:A*2+c,y:0},lineWidth:t},{type:"line",position:{x:A*2+c+t+n,y:0},lineWidth:i}),s=A*2+c+t+n+i}return{element:{type:"bar",bar:e,elements:o},width:s}},C=(e,t,n)=>{let o=T*n/8;return e+y*4.5*n+o-t*o},dt=({dnp:e,stemDirection:t,beamed:n,arr:o})=>{let s=n[0],i=n[n.length-1],c=y/2*3*e.scale,a=o[o.length-1].left+o[o.length-1].stemOffsetLeft-(o[0].left+o[0].stemOffsetLeft),d,h;if(t==="up"){if(n.length===1)d=0;else{let g=s.pitches[s.pitches.length-1].pitch,r=i.pitches[i.pitches.length-1].pitch,v=C(e.topOfStaff,g,e.scale),M=C(e.topOfStaff,r,e.scale)-v;g>r?d=(M>=c?c:M)/a:d=(-M>=c?-c:M)/a}let x=n.map((g,r)=>({note:g,leftOfStem:o[r].left+o[r].stemOffsetLeft})).sort((g,r)=>r.note.pitches[r.note.pitches.length-1].pitch-g.note.pitches[g.note.pitches.length-1].pitch)[0],P=x.leftOfStem,b=te({dnp:e,direction:t,lowest:{pitch:x.note.pitches[0].pitch},highest:{pitch:x.note.pitches[x.note.pitches.length-1].pitch}}).top;h={x:P,y:b}}else{if(n.length===1)d=0;else{let g=s.pitches[0].pitch,r=i.pitches[0].pitch,v=C(e.topOfStaff,g,e.scale),M=C(e.topOfStaff,r,e.scale)-v;g>r?d=(M>=c?c:M)/a:d=(-M>=c?-c:M)/a}let x=n.map((g,r)=>({note:g,leftOfStem:o[r].left+o[r].stemOffsetLeft})).sort((g,r)=>g.note.pitches[0].pitch-r.note.pitches[0].pitch)[0],P=x.leftOfStem,b=te({dnp:e,direction:t,lowest:{pitch:x.note.pitches[0].pitch},highest:{pitch:x.note.pitches[x.note.pitches.length-1].pitch}}).bottom;h={x:P,y:b}}let{x:l,y:m}=h,p=-l*d+m;return D=>D*d+p},ut=({scale:e,stemDirection:t,firstStemLeft:n,lastStemLeft:o,stemLinearFunc:s,offsetY:i=0})=>{let c=y*Z*e,a=s(n)+(t==="up"?i:-i),d={x:n,y:t==="up"?a:a-c},h={x:n,y:t==="up"?a+c:a},l=s(o)+(t==="up"?i:-i),m={x:o,y:t==="up"?l:l-c},p={x:o,y:t==="up"?l+c:l};return{nw:d,ne:m,se:p,sw:h}},nt=(e,t)=>{let n=(o,s)=>t==="asc"?o.pitch<s.pitch:s.pitch<o.pitch;return e.sort((o,s)=>n(o,s)?-1:o.pitch===s.pitch?0:1)},ft=(e,t,n,o)=>{let s=e.flatMap(b=>b.pitches).map(b=>b.pitch),i=Ze(s),c=[],a=[],d={element:{type:"gap"},width:n},h=0,l=!1;for(let b in e){let g=Number(b),r=ot({note:e[g],stemDirection:i,beamed:!0});c.push({left:h,stemOffsetLeft:r.stemOffsetLeft});let v={index:g+o};a.push({caretOption:v,index:g+o,...r}),h+=r.width,a.push({caretOption:{...v,index:g+o,defaultWidth:!0},...d}),h+=n}let{beam:m}=e[e.length-1];(m==="continue"||m==="begin")&&(l=!0);let p=c[0].left+c[0].stemOffsetLeft,D=c[c.length-1].left+c[c.length-1].stemOffsetLeft+(l?y:0),x=dt({dnp:{topOfStaff:0,scale:1,duration:t},stemDirection:i,beamed:e,arr:c}),P=[];for(let b=0;b<(Je.get(t)??0);b++){let g=(y*Z+y*Te)*b;P.push({element:{type:"beam",...ut({scale:1,stemDirection:i,firstStemLeft:p,lastStemLeft:D,stemLinearFunc:x,offsetY:g})},width:D-p})}for(let b in e){let{pitches:g}=e[b],r=nt(g,"asc"),v=x(c[b].left+c[b].stemOffsetLeft),B;i==="up"?B={top:v}:B={bottom:v};let{elements:M}=tt({left:c[b].stemOffsetLeft,duration:t,direction:i,lowest:r[0],highest:r[r.length-1],beamed:B});a[Number(b)*2].element.elements.push(...M)}return[...P,...a]},ne=function*(e,t,n){let o={element:{type:"gap"},width:t};n&&(yield o,n.clef&&(yield{element:{type:"clef",clef:n.clef},width:ee($)})),yield{caretOption:{index:-1,defaultWidth:!0},...o};let i=0;for(;i<e.length;){let c=e[i];if(c.type==="note")if(c.beam==="begin"){let a=[c],d=i+1,h=e[d];for(;h?.type==="note"&&(h.beam==="continue"||h.beam==="end");)a.push(h),h=e[++d];let l=ft(a,c.duration,t,i);for(let m of l)yield m;i+=a.length}else{let a=ot({note:c});yield{caretOption:{index:i},index:i,...a},yield{caretOption:{index:i,defaultWidth:!0},...o},i++}else if(c.type==="rest"){let a=ht(c);yield{caretOption:{index:i},index:i,...a},yield{caretOption:{index:i,defaultWidth:!0},...o},i++}else if(c.type==="bar"){let a=mt(c);yield{caretOption:{index:i},index:i,...a},yield{caretOption:{index:i,defaultWidth:!0},...o},i++}}},ee=e=>(e.bbox.ne.x-e.bbox.sw.x)*y;var J=(e,t,n,o,s)=>{let i=s??document.createElement("canvas");return i.style.position="absolute",i.style.top=`${t}px`,i.style.left=`${e}px`,i.width=n,i.height=o,i},_=(e,t,n,o,s)=>{e.save(),e.rotate(Math.PI/180*180),e.translate(-t,-n),e.scale(-o,o),e.fill(s.path2d),e.restore()},bt=(e,t,n)=>{let o=C(n,4,1);_(e,t,o,1,$)},oe=(e,t,n,o,s)=>{let i=y*s;for(let c=0;c<5;c++){let a=n+i*c;e.save(),e.strokeStyle="#000",e.lineWidth=we*s,e.beginPath(),e.moveTo(t,a),e.lineTo(t+o,a),e.closePath(),e.stroke(),e.restore()}},yt=(e,t)=>{for(let n of t.elements){if(e.save(),n.type==="line")e.translate(n.position.x+n.lineWidth/2,n.position.y),e.strokeStyle="#000",e.lineWidth=n.lineWidth,e.beginPath(),e.moveTo(0,0),e.lineTo(0,T),e.closePath(),e.stroke();else{let o=A;e.translate(n.position.x+o,n.position.y),e.fillStyle="#000",e.beginPath(),e.arc(0,0,o,0,Math.PI*2),e.fill(),e.beginPath(),e.arc(0,y,o,0,Math.PI*2),e.fill()}e.restore()}},gt=({ctx:e,elements:t})=>{for(let n of t)if(n.type==="head"){let{duration:o,position:s}=n;e.save(),e.translate(s.x,s.y);let i=U(o);_(e,0,0,1,i),e.restore()}else if(n.type==="ledger"){let{width:o,position:s}=n;e.save(),e.translate(s.x,s.y),e.strokeStyle="#000",e.lineWidth=Ee,e.beginPath(),e.moveTo(0,0),e.lineTo(o,0),e.closePath(),e.stroke(),e.restore()}else if(n.type==="accidental"){let{position:o,accidental:s}=n,i=j.get(s);e.save(),e.translate(o.x,o.y),_(e,0,0,1,i),e.restore()}else if(n.type==="flag"){let{duration:o,direction:s,position:i}=n,c=s==="up"?G.get(o):Y.get(o);c&&_(e,i.x,i.y,1,c)}else if(n.type==="stem"){let{top:o,bottom:s,center:i,width:c}=n;e.save(),e.translate(i,o),e.strokeStyle="#000",e.lineWidth=c,e.beginPath(),e.moveTo(0,0),e.lineTo(0,s-o),e.closePath(),e.stroke(),e.restore()}},Pt=({ctx:e,element:t})=>{let{rest:n,position:o}=t,s=q.get(n.duration);e.save(),e.translate(o.x,o.y),_(e,0,0,1,s),e.restore()},vt=(e,t)=>{e.save(),e.fillStyle="#000",e.beginPath(),e.moveTo(t.nw.x,t.nw.y),e.lineTo(t.sw.x,t.sw.y),e.lineTo(t.se.x,t.se.y),e.lineTo(t.ne.x,t.ne.y),e.closePath(),e.fill(),e.restore()},ce=(e,{element:t})=>{let{type:n}=t;n==="clef"?bt(e,0,0):n==="note"?gt({ctx:e,elements:t.elements}):n==="rest"?Pt({ctx:e,element:t}):n==="beam"?vt(e,t):n==="bar"&&yt(e,t)},ct=({ctx:e,scale:t,caret:n})=>{let{x:o,y:s,width:i}=n,c=T*t;e.save(),e.fillStyle="#FF000055",e.fillRect(o,s,i,c),e.restore()},ie=({ctx:e,width:t,height:n,fillStyle:o})=>{e.save(),e.fillStyle=o,e.fillRect(0,0,t,n),e.restore()};var L=class{constructor(){}onDown(t){}onUp(t,n){}onClick(t){}onLongDown(t){}onDrag(t,n){}onDoubleClick(t){}},se=class extends L{constructor(){super();this.translated={x:0,y:0};this.keyboardEl=document.getElementById("keyboard")}onUp(t,n){this.translated.x+=t.x-n.x,this.translated.y+=t.y-n.y}onDrag(t,n){let o=this.translated.x+t.x-n.x,s=this.translated.y+t.y-n.y;this.keyboardEl.style.transform=`translate(${o}px, ${s}px)`}},ae=class extends L{constructor(){super();this.translated={x:0,y:0};this.pointerEl=document.getElementById("pointer")}onDown(t){this.pointerEl.style.opacity="0.8",this.pointerEl.style.top=`${t.y-50/2}px`,this.pointerEl.style.left=`${t.x-50/2}px`}onUp(t,n){this.pointerEl.style.opacity="0"}onDrag(t,n){this.pointerEl.style.top=`${t.y-50/2}px`,this.pointerEl.style.left=`${t.x-50/2}px`}},re=class extends L{constructor(t){super();this.callback=t;this.changeButton=document.getElementsByClassName("changeNoteRest")[0]}onUp(){let t=this.callback.isNoteInputMode(),n=t?"rest":"note";this.changeButton.className=this.changeButton.className.replace(t?"note":"rest",n),this.callback.change()}},le=class extends L{constructor(t){super();this.callback=t;this.changeButton=document.getElementsByClassName("changeBeam")[0]}onUp(){let t=this.callback.getMode(),n=t==="nobeam"?"beam":"nobeam";this.changeButton.className=this.changeButton.className.replace(t,n),this.callback.change(n)}onDoubleClick(t){console.log("double")}},pe=class extends L{constructor(){super()}onDown(t){this.target=t.target,this.target.className+=" pressed"}onUp(){!this.target||(this.target.className=this.target.className.replace(" pressed",""))}},he=class extends L{constructor(t){super();this.callback=t;this.candidateContainer=document.querySelector(".bars .candidateContainer")}onClick(t){this.callback.commit({type:"bar",subtype:"single"})}onLongDown(t){this.candidateContainer.style.visibility="visible"}onUp(t,n){let[o]=t.target.className.split(" ").filter(s=>s.match(/single|double|repeat/));o&&this.callback.commit({type:"bar",subtype:o}),this.candidateContainer.style.visibility="hidden"}},me=class extends L{constructor(t){super();this.callback=t;this.posToDurationMap=new Map([["12",1],["13",2],["14",4],["22",8],["23",16],["24",32]]);this.targetClassNames=[]}get duration(){let t=this.targetClassNames.find(n=>n.match(/k[0-9][0-9]/))?.replace("k","");if(!!t)return this.posToDurationMap.get(t)}isBackspace(){return this.targetClassNames.some(t=>t==="backspace")}onDown(t){let n=t.target;this.targetClassNames=n.className.split(" ")}onClick(t){this.duration&&this.callback.commit(this.duration),this.finish()}onLongDown(t){this.isBackspace()||this.callback.startPreview(this.duration,t.x,t.y)}onDrag(t,n){this.dragDy=n.y-t.y,this.callback.updatePreview(this.duration,this.dragDy)}onUp(t,n){this.isBackspace()?this.callback.backspace():this.duration&&this.callback.commit(this.duration,this.dragDy??0),this.finish()}finish(){this.targetClassNames=[],this.dragDy=void 0,this.callback.finish()}},de=class extends L{constructor(t){super();this.callback=t}onClick(t){let{className:n}=t.target;n.match(/.*toLeft.*/)?this.callback.back():n.match(/.*toRight.*/)&&this.callback.forward()}};var Q=e=>e.sort((t,n)=>t.pitch===n.pitch?t.accidental===n.accidental||!t.accidental&&n.accidental==="natural"||t.accidental==="natural"&&!n.accidental?0:t.accidental==="flat"&&n.accidental!=="flat"||(t.accidental==="natural"||!t.accidental)&&n.accidental==="sharp"?-1:1:t.pitch<n.pitch?-1:1);var X=.08,W=.08,it=20,st=2e3*X,xt=50;window.onload=()=>{let e=window.innerWidth,t=window.innerHeight,n=300,o=400,s=document.getElementById("mainCanvas"),i=document.getElementById("previewCanvas"),c=s.getContext("2d"),a=i.getContext("2d"),d=Array.from(document.getElementsByClassName("note")),h=document.getElementsByClassName("changeNoteRest")[0],l=[],m=[],p=0,D=!0,x="nobeam",P,b=()=>{console.log("main","start"),ie({ctx:c,width:e,height:t,fillStyle:"#fff"});let u={type:"g"},w=0;m=[],c.save(),c.translate(it,st),c.scale(X,X),oe(c,0,0,y*100,1);let f=ne(l,y,{clef:u});for(let E of f){console.log("style",E);let{width:S,element:N,caretOption:H}=E;if(ce(c,E),H){let{index:R,defaultWidth:F}=H,O=F?xt:S;m.push({x:w+(F?S/2-O/2:0),y:0,width:O,elIdx:R})}N.type!=="beam"&&(w+=S,c.translate(S,0))}c.restore(),console.log("carets",m),console.log("current caret",m[p]),c.save(),c.translate(it,st),c.scale(X,X),m[p]&&ct({ctx:c,scale:1,caret:m[p]}),c.restore(),console.log("main","end")},g=(u,w)=>{console.log("preview","start"),ie({ctx:a,width:n,height:o,fillStyle:"#fff"});let{elements:f,insertedIndex:E}=fe({caretIndex:p,elements:l,newElement:w,beamMode:u});console.log("insertedIdx",E),console.log("preview",f);let S=o/2-T*W/2,N=[...ne(f,y)],H=new Map,R=0;for(let O of N){let{width:K,element:V,index:Pe}=O;console.log("style",O),Pe!==void 0&&H.set(Pe,R+K/2),V.type!=="beam"&&(R+=K)}console.log("elIdxToX",H),a.save(),a.translate(0,S),a.scale(W,W),oe(a,0,0,y*100,1),a.restore(),a.save(),a.translate(n/2,S),a.scale(W,W);let F=H.get(E);console.log("centerX",F),a.translate(-F,0);for(let O of N){let{width:K,element:V}=O;ce(a,O),V.type!=="beam"&&a.translate(K,0)}a.restore(),console.log("preview","end")},r={isNoteInputMode(){return D},change(){d.forEach(u=>{u.className=u.className.replace(this.isNoteInputMode()?"note":"rest",this.isNoteInputMode()?"rest":"note")}),h.className=h.className.replace(this.isNoteInputMode()?"rest":"note",this.isNoteInputMode()?"note":"rest"),D=!D}},v={getMode(){return x},change(u){d.forEach(f=>{f.className=f.className.replace(u==="nobeam"?"beamed":"nobeam",u==="nobeam"?"nobeam":"beamed")}),x=u;let w=l[P];if(w){let f=l[P-1],E=l[P+1];ue(w,f,E),b()}}},B={startPreview(u,w,f){let E=w-n/2,S=f-o/2;J(E,S,n,o,i);let N=D?{type:"note",duration:u,pitches:[{pitch:be(W,0,6)}]}:{type:"rest",duration:u};if(p>0&&p%2!=0){let H=p===1?0:(p-1)/2,R=l[H];N.type==="note"&&R.type==="note"&&N.duration===R.duration&&(N.pitches=Q([...R.pitches,...N.pitches]))}g(x,N),i.style.visibility="visible"},updatePreview(u,w){let f=D?{type:"note",duration:u,pitches:[{pitch:be(W,w,6)}]}:{type:"rest",duration:u};if(p>0&&p%2!=0){let E=p===1?0:(p-1)/2,S=l[E];f.type==="note"&&S.type==="note"&&f.duration===S.duration&&(f.pitches=Q([...S.pitches,...f.pitches]))}g(x,f)},commit(u,w){let f;D?f={type:"note",duration:u,pitches:[{pitch:be(W,w??0,6)}]}:f={type:"rest",duration:u};let{elements:E,insertedIndex:S,caretAdvance:N}=fe({caretIndex:p,elements:l,newElement:f,beamMode:x});P=S,p+=N,l=E,b()},backspace(){let u=m[p].elIdx;if(u<0)return;let w=l.splice(u,1)[0];if(w.type==="note"){let E=l[u-1],S=l[u];w.beam==="begin"&&S?S.beam="begin":w.beam==="end"&&E&&(E.beam="end")}let f=p-1;for(;f>-1;)f===0?(p=0,f=-1):m[f].elIdx!==u?(p=f,f=-1):f--;b()},finish(){i.style.visibility="hidden"}},M={back(){if(p%2!=0){let u=p===1?0:(p-1)/2;if(u===P){let w=l[P],f=l[u-1],E=l[u+1];ue(w,f,E)}}p=Math.max(p-1,0),b()},forward(){if(p%2==0){let u=p/2-1;if(u===P){let w=l[P],f=l[u-1],E=l[u+1];ue(w,f,E)}}p=Math.min(p+1,m.length-1),b()}},ge={commit(u){let{elements:w,insertedIndex:f,caretAdvance:E}=fe({caretIndex:p,elements:l,newElement:u,beamMode:x});P=f,p+=E,l=w,b()}};k(["keyboardBottom","keyboardHandle"],[new se]),k(["changeNoteRest"],[new re(r)]),k(["changeBeam"],[new le(v)]),k(["grayKey","whiteKey"],[new pe]),k(["note","rest","backspace"],[new me(B)]),k(["toLeft","toRight"],[new de(M)]),k(["bars","candidate"],[new he(ge)]),k([],[new ae]),J(0,0,window.innerWidth,window.innerHeight,s),J(0,0,n,o,i),b()};function ye(e,t,n,o){t.type==="note"&&e!=="nobeam"?n?.type==="note"&&o?.type==="note"&&n.beam&&o.beam?n.beam==="begin"?o.beam==="begin"?(t.beam="continue",o.beam="continue"):t.beam="continue":n.beam==="continue"&&(o.beam==="begin"?t.beam="end":t.beam="continue"):(t.beam="begin",n?.type==="note"&&(n?.beam==="begin"||n?.beam==="continue")&&(t.beam="continue"),o?.type==="note"&&o?.beam==="begin"&&(o.beam="continue")):(o?.type==="note"&&(o?.beam==="continue"?o.beam="begin":o?.beam==="end"&&delete o.beam),n?.type==="note"&&(n?.beam==="begin"?delete n.beam:n?.beam==="continue"&&(n.beam="end")))}function ue(e,t,n){e.type==="note"&&(e.beam==="begin"||e.beam==="continue")&&(!n||n?.type==="note"&&(!n?.beam||n?.beam==="begin"))&&(t?.type==="note"&&(t?.beam==="begin"||t?.beam==="continue")?e.beam="end":delete e.beam)}function fe({caretIndex:e,elements:t,newElement:n,beamMode:o}){let s=[...t],i=0,c=0;if(e===0){let a=s[e];ye(o,n,void 0,a),s.splice(e,0,n),c=2}else if(e%2==0){let a=e/2,d=s[a-1],h=s[a];console.log("insertIdx",a,"left",d,"right",h),ye(o,n,d,h),s.splice(a,0,n),c=2,i=a}else{let a=e===1?0:(e-1)/2,d=s[a];n.type==="note"&&d.type==="note"&&n.duration===d.duration&&(n.pitches=Q([...d.pitches,...n.pitches]));let h=s[a-1],l=s[a+1];ye(o,n,h,l),s.splice(a,1,n),i=a}return{elements:s,insertedIndex:i,caretAdvance:c}}var be=(e,t,n)=>{let o=y/2*e;return Math.round(t/o+n)};})();
//# sourceMappingURL=out.js.map
