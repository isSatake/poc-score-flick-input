(()=>{var ke=(e,t)=>Math.sqrt(Math.pow(t.x-e.x,2)+Math.pow(t.y-e.y,2)),Ne=(e,t)=>({x:e.x*t,y:e.y*t}),L=(e,t)=>{let n=typeof t?.x=="number"?t.x:0,o=typeof t?.y=="number"?t.y:0;return{left:e.left+n,top:e.top+o,right:e.right+n,bottom:e.bottom+o}},I=(e,t)=>({left:e.bbox.sw.x*t,top:-e.bbox.ne.y*t,bottom:-e.bbox.sw.y*t,right:e.bbox.ne.x*t});var Te=class{constructor(t,n){this.targetClassNames=t;this.handlers=n;this.kLongDownThresholdMs=300;this.kDragThresholdMagnitude=10;this.longDownTimer=0;this.isDragging=!1}listener(t){let n=t,{className:o}=n.target;switch(t.type){case"pointerdown":if(this.targetClassNames.length>0&&!this.targetClassNames.some(s=>o.includes(s)))return;this.downClassName=o,this.downPoint=n,this.onDown(n),this.longDownTimer=setTimeout(()=>{this.onLongDown(n),this.longDownTimer=0},this.kLongDownThresholdMs);return;case"pointerup":if(!this.downPoint)return;this.onUp(n,this.downPoint),this.longDownTimer>0&&(clearTimeout(this.longDownTimer),this.onClick(n)),this.reset();return;case"pointermove":if(this.onMove(n),!this.downPoint)return;this.isDragging?this.onDrag(n,this.downPoint):ke(n,this.downPoint)>this.kDragThresholdMagnitude&&(this.isDragging=!0);return;default:return}}reset(){this.downClassName=void 0,this.downPoint=void 0,this.isDragging=!1}onMove(t){for(let n of this.handlers)n.onMove(t)}onDown(t){for(let n of this.handlers)n.onDown(t)}onUp(t,n){for(let o of this.handlers)o.onUp(t,n)}onClick(t){for(let n of this.handlers)n.onClick(t)}onLongDown(t){for(let n of this.handlers)n.onLongDown(t)}onDrag(t,n){for(let o of this.handlers)o.onDrag(t,n)}},T=(e,t)=>{let n=new Te(e,t);["pointerdown","pointermove","pointerup"].forEach(o=>{window.addEventListener(o,s=>{n.listener(s)})})};var M=1e3,b=M/4,Oe=32.5,U=40,z=30,Le=295,He=422,Re=.2,Ie=.4,Ae=.16,Fe=.5,We=.16,_=b/4,se=.5,Ue=.25,J={path2d:new Path2D("M364,-252c-245,0 -364,165 -364,339c0,202 153,345 297,464c12,10 11,12 9,24c-7,41 -14,106 -14,164c0,104 24,229 98,311c20,22 51,48 65,48c11,0 37,-28 52,-50c41,-60 65,-146 65,-233c0,-153 -82,-280 -190,-381c-6,-6 -8,-7 -6,-19l25,-145c3,-18 3,-18 29,-18c147,0 241,-113 241,-241c0,-113 -67,-198 -168,-238c-14,-6 -15,-5 -13,-17c11,-62 29,-157 29,-214c0,-170 -130,-200 -197,-200c-151,0 -190,98 -190,163c0,62 40,115 107,115c61,0 96,-47 96,-102c0,-58 -36,-85 -67,-94c-23,-7 -32,-10 -32,-17c0,-13 26,-29 80,-29c59,0 159,18 159,166c0,47 -15,134 -27,201c-2,12 -4,11 -15,9c-20,-4 -46,-6 -69,-6zM80,20c0,-139 113,-236 288,-236c20,0 40,2 56,5c15,3 16,3 14,14l-50,298c-2,11 -4,12 -20,8c-61,-17 -100,-60 -100,-117c0,-46 30,-89 72,-107c7,-3 15,-6 15,-13c0,-6 -4,-11 -12,-11c-7,0 -19,3 -27,6c-68,23 -115,87 -115,177c0,85 57,164 145,194c18,6 18,5 15,24l-21,128c-2,11 -4,12 -14,4c-47,-38 -93,-75 -153,-142c-83,-94 -93,-173 -93,-232zM470,943c-61,0 -133,-96 -133,-252c0,-32 2,-66 6,-92c2,-13 6,-14 13,-8c79,69 174,159 174,270c0,55 -27,82 -60,82zM441,117c-12,1 -13,-2 -11,-14l49,-285c2,-12 4,-12 16,-6c56,28 94,79 94,142c0,88 -67,156 -148,163z"),bbox:{ne:{x:2.684,y:4.392},sw:{x:0,y:-2.632}}},ze={path2d:new Path2D("M216 125c93 0 206 -52 206 -123c0 -70 -52 -127 -216 -127c-149 0 -206 60 -206 127c0 68 83 123 216 123zM111 63c-2 -8 -3 -16 -3 -24c0 -32 15 -66 35 -89c21 -28 58 -52 94 -52c10 0 21 1 31 4c33 8 46 36 46 67c0 60 -55 134 -124 134c-31 0 -68 -5 -79 -40z"),bbox:{ne:{x:1.688,y:.5},sw:{x:0,y:-.5}}},_e={path2d:new Path2D("M97 -125c-55 0 -97 30 -97 83c0 52 47 167 196 167c58 0 99 -32 99 -83c0 -33 -33 -167 -198 -167zM75 -87c48 0 189 88 189 131c0 7 -3 13 -6 19c-7 12 -18 21 -37 21c-47 0 -192 -79 -192 -128c0 -7 3 -14 6 -20c7 -12 19 -23 40 -23z"),bbox:{ne:{x:1.18,y:.5},sw:{x:0,y:-.5}}},Xe={path2d:new Path2D("M0 -42c0 86 88 167 198 167c57 0 97 -32 97 -83c0 -85 -109 -167 -198 -167c-54 0 -97 31 -97 83z"),bbox:{ne:{x:1.18,y:.5},sw:{x:0,y:-.5}}},$e={path2d:new Path2D("M238 -790c-5 -17 -22 -23 -28 -19s-16 13 -16 29c0 4 1 9 3 15c17 45 24 92 24 137c0 59 -9 116 -24 150c-36 85 -131 221 -197 233v239c0 12 8 15 19 15c10 0 18 -6 21 -22c16 -96 58 -182 109 -261c63 -100 115 -218 115 -343c0 -78 -26 -173 -26 -173z"),stemUpNW:{x:0,y:-.04},bbox:{ne:{x:1.056,y:.03521239682756091},sw:{x:0,y:-3.240768470618394}}},Ge={path2d:new Path2D("M240 760c-10 29 7 48 22 48c7 0 13 -4 16 -15c8 -32 28 -103 28 -181c0 -125 -61 -244 -124 -343c-51 -79 -125 -166 -142 -261c-2 -16 -15 -22 -24 -22c-8 0 -16 5 -16 15v235c134 45 184 126 221 210c15 34 40 118 40 177c0 45 -7 95 -21 137z"),stemDownSW:{x:0,y:.132},bbox:{ne:{x:1.224,y:3.232896633157715},sw:{x:0,y:-.0575672}}},Ke={path2d:new Path2D("M272 -796c-6 -13 -13 -17 -20 -17c-14 0 -22 13 -22 26c0 3 0 5 1 9c5 30 8 60 8 89c0 52 -9 101 -32 149c-69 140 -140 142 -202 144h-5v388c0 7 11 10 17 10s18 -2 20 -13c17 -106 73 -122 127 -180c72 -78 98 -106 108 -174c2 -12 3 -23 3 -36 c0 -61 -22 -121 -25 -127c-1 -3 -1 -5 -1 -7c0 -4 1 -6 1 -9c18 -37 29 -78 29 -120v-22c0 -48 -3 -105 -7 -110zM209 -459c2 -3 4 -4 7 -4c5 0 12 3 13 6c5 8 5 18 7 26c1 7 1 13 1 20c0 32 -9 63 -27 89c-33 49 -87 105 -148 105h-8c-8 0 -14 -6 -14 -10c0 -1 0 -2 1 -3 c21 -82 67 -106 114 -160c21 -24 38 -44 54 -69z"),stemUpNW:{x:0,y:-.088},bbox:{ne:{x:1.116,y:.008},sw:{x:0,y:-3.252}}},qe={path2d:new Path2D("M240 786c-3 17 5 25 17 26c12 0 19 1 24 -22c16 -80 15 -178 -21 -253c0 -3 -1 -5 -1 -9c0 -3 0 -5 1 -7c3 -6 25 -66 25 -127c0 -13 -1 -25 -3 -36c-24 -157 -221 -200 -245 -354c-2 -11 -13 -13 -20 -13c-10 0 -17 5 -17 10v387h5c62 2 143 5 212 145 c38 78 38 169 23 253zM226 456c-3 0 -5 -1 -7 -4c-16 -26 -33 -46 -54 -69c-47 -55 -103 -78 -124 -160c-1 -1 -1 -2 -1 -3c0 -5 6 -10 14 -10h8c61 0 125 56 158 105c18 26 27 56 27 89c0 6 0 13 -1 20c-2 8 -2 18 -7 25c-1 4 -8 7 -13 7z"),stemDownSW:{x:0,y:.128},bbox:{ne:{x:1.1635806326044895,y:3.2480256},sw:{x:-19418183745617774e-21,y:-.03601094374150052}}},Ye={path2d:new Path2D("M260 -673c0 -9 1 -18 1 -28c0 -43 -4 -89 -7 -95c-7 -11 -14 -16 -20 -16c-2 0 -4 1 -6 2c-7 3 -13 12 -13 24c0 2 1 4 1 7c5 29 8 57 8 85c0 48 -9 93 -31 137c-64 130 -130 132 -188 134h-5v560c0 7 8 12 14 12c10 0 17 -10 18 -19c17 -100 71 -116 121 -170 c67 -73 90 -100 101 -161c2 -9 2 -18 2 -28c0 -39 -11 -80 -20 -106c14 -29 21 -61 21 -93c0 -57 -21 -112 -23 -119c-1 -2 -1 -4 -1 -6c0 -3 0 -5 1 -7c15 -36 24 -74 26 -113zM208 -181c-55 93 -114 117 -169 117c16 -97 65 -114 114 -168c23 -25 41 -44 55 -62 c5 17 10 34 12 44c1 7 3 13 3 21c0 13 -4 28 -15 48zM219 -456c1 8 2 16 2 24c0 81 -90 177 -170 177c-9 0 -14 -9 -12 -16c22 -73 63 -95 106 -146l5 -5c17 -20 31 -37 46 -59c1 -3 4 -4 7 -4c5 0 10 3 11 6c3 7 3 15 5 23z"),stemUpNW:{x:0,y:.376},bbox:{ne:{x:1.044,y:.596},sw:{x:0,y:-3.248}}},je={path2d:new Path2D("M273 676v-11c-4 -64 -9 -75 -22 -100l-4 -7c-2 -3 -3 -5 -3 -9l3 -5v-2c4 -10 20 -53 20 -105c0 -34 -7 -72 -23 -101c9 -27 22 -71 22 -114c0 -10 0 -20 -2 -29c-11 -64 -35 -92 -105 -168c-52 -57 -109 -73 -126 -177c-1 -9 -9 -20 -19 -20c-8 0 -14 4 -14 13v589 c61 2 125 4 201 140c23 41 31 70 31 98c0 34 -12 65 -20 110c0 3 -1 5 -1 7c0 13 7 23 14 26c2 1 4 1 6 1c35 0 42 -116 42 -136zM39 268c0 -5 4 -13 13 -13h5c81 0 173 103 173 185c0 8 -1 17 -2 25c-2 8 -2 16 -5 23c-1 3 -7 6 -12 6c-3 0 -6 -1 -8 -4 c-16 -25 -32 -44 -52 -67c-45 -53 -91 -75 -112 -155zM229 243c-3 11 -8 32 -14 51c-14 -18 -32 -38 -56 -64c-52 -57 -103 -73 -120 -177c0 -1 0 -2 2 -3c57 0 118 26 175 122c12 21 16 37 16 50c0 8 -2 14 -3 21z"),stemDownSW:{x:0,y:-.448},bbox:{ne:{x:1.092,y:3.248},sw:{x:0,y:-.687477099907407}}},Je={path2d:new Path2D("M282 -109c0 -14 -12 -26 -26 -26h-230c-15 0 -26 12 -26 26v92c0 15 11 26 26 26h230c14 0 26 -11 26 -26v-92z"),originUnits:1,bbox:{ne:{x:1.128,y:.036},sw:{x:0,y:-.54}}},Qe={path2d:new Path2D("M282 24c0 -14 -12 -26 -26 -26h-230c-15 0 -26 12 -26 26v92c0 15 11 26 26 26h230c14 0 26 -11 26 -26v-92z"),originUnits:2,bbox:{ne:{x:1.128,y:.568},sw:{x:0,y:-.008}}},Ve={path2d:new Path2D("M78 -38l-49 60s-10 10 -10 24c0 8 4 19 14 29c45 47 60 90 60 127c0 72 -57 123 -61 134c-3 6 -4 11 -4 16c0 14 10 21 20 21c6 0 13 -3 18 -8c17 -17 165 -193 165 -193s4 -9 4 -19c0 -5 -1 -10 -4 -15c-26 -41 -62 -89 -66 -147v-3l-1 -7v-3c0 -56 31 -93 69 -139 c11 -12 37 -45 37 -57c0 -3 -2 -4 -5 -4c-2 0 -4 0 -8 1l-1 1c-17 6 -50 17 -79 17c-42 0 -63 -32 -63 -73c0 -9 1 -18 4 -26c2 -9 13 -36 26 -36c8 -7 16 -15 16 -24c0 -2 -1 -4 -2 -7c-1 -4 -8 -6 -15 -6c-8 0 -18 3 -26 9c-73 56 -116 105 -116 155c0 49 34 96 86 96 l8 -3h4c4 -1 12 -3 16 -3c5 0 9 1 11 5c1 1 1 3 1 4c0 2 -4 10 -6 14c-13 21 -27 40 -43 60z"),originUnits:2,bbox:{ne:{x:1.08,y:1.492},sw:{x:.004,y:-1.5}}},Ze={path2d:new Path2D("M134 107v-10c33 0 83 60 90 66c6 4 9 4 11 4c2 -1 12 -6 12 -16c-1 -5 -6 -21 -10 -39c0 0 -98 -351 -101 -353c-10 -8 -24 -10 -35 -10c-6 0 -29 1 -29 13c18 66 90 265 93 280c1 4 1 8 1 11c0 5 -1 9 -5 9c-1 0 -3 0 -5 -1c-13 -7 -22 -11 -36 -15 c-11 -4 -25 -7 -39 -7c-19 0 -38 6 -54 17c-15 12 -27 30 -27 51c0 37 30 67 67 67s67 -30 67 -67z"),originUnits:2,bbox:{ne:{x:.988,y:.696},sw:{x:0,y:-1.004}}},et={path2d:new Path2D("M208 111v-10c34 1 84 61 91 67c3 2 6 4 11 4c2 -1 10 -5 10 -11c0 -1 -1 -2 -1 -4c-2 -13 -27 -101 -27 -101s-19 -67 -45 -152l-116 -381c-4 -11 -9 -23 -38 -23c-22 0 -31 10 -31 19l1 1v1l95 283v1l1 1c0 4 -2 6 -4 6c-23 -12 -49 -21 -75 -21c-38 0 -80 27 -80 68 c0 38 30 68 68 68c37 0 68 -30 68 -68c0 -3 0 -6 -1 -10c14 0 41 12 49 31c7 15 58 164 58 180c0 5 -2 7 -5 7c-2 0 -4 -1 -7 -2c-23 -13 -51 -22 -78 -22c-38 0 -80 27 -80 68c0 38 31 68 68 68c38 0 68 -30 68 -68z"),originUnits:2,bbox:{ne:{x:1.28,y:.716},sw:{x:0,y:-2}}},tt={path2d:new Path2D("M353 419c2 0 10 -2 10 -11c0 -1 -1 -2 -1 -4c-2 -12 -26 -101 -26 -101s-172 -770 -175 -782c-4 -11 -7 -21 -39 -21c-21 0 -27 8 -27 16c0 2 0 4 1 6c2 7 71 282 71 286c0 3 -3 6 -6 6c-1 0 -2 0 -3 -1c-23 -13 -51 -22 -78 -22c-38 0 -80 27 -80 68c0 38 31 68 68 68 c38 0 68 -30 68 -68c0 -3 0 -6 -1 -10c15 1 46 14 51 35l40 164c0 5 -2 13 -7 13c-1 0 -2 0 -3 -1c-23 -12 -49 -22 -75 -22c-10 0 -19 2 -27 4c-10 3 -19 7 -27 14c-16 12 -28 30 -28 50c0 38 30 68 68 68c37 0 68 -30 68 -68c0 -3 0 -6 -1 -9c16 0 49 20 54 36l39 160v1 l1 2c0 7 -4 17 -11 17c-1 0 -3 0 -4 -1c-23 -12 -50 -22 -76 -22c-10 0 -18 2 -26 4c-10 3 -20 7 -28 14c-16 12 -28 30 -28 50c0 38 31 68 68 68c38 0 68 -30 68 -68v-9c34 0 84 61 91 66c3 2 6 4 11 4z"),originUnits:2,bbox:{ne:{x:1.452,y:1.704},sw:{x:0,y:-2}}},nt={path2d:new Path2D("M12 -170c-8 10 -12 581 -12 581c1 18 17 28 31 28c10 0 19 -6 19 -17c0 -20 -6 -260 -7 -282c0 -7 4 -14 11 -17c2 -1 3 -1 5 -1c5 0 16 9 22 14c14 9 38 17 55 17c46 -3 90 -39 90 -96c0 -46 -31 -107 -120 -169c-25 -17 -49 -44 -79 -61c0 0 -3 -2 -6 -2s-6 1 -9 5z M47 -81c0 -5 2 -15 11 -15c3 0 6 1 10 3c43 27 89 81 89 135c0 25 -12 58 -41 58c-23 0 -63 -29 -70 -49c-1 -4 -2 -16 -2 -32c0 -40 3 -100 3 -100z"),bbox:{ne:{x:.904,y:1.756},sw:{x:0,y:-.7}}},ot={path2d:new Path2D("M141 181l15 5c1 1 3 1 4 1c4 0 8 -3 8 -8v-502c0 -7 -6 -12 -12 -12h-13c-7 0 -12 5 -12 12v149c0 8 -7 11 -17 11c-29 0 -85 -24 -99 -30c-1 -1 -3 -1 -4 -1l-2 -1c-6 0 -9 3 -9 9v515c0 7 5 12 12 12h13c6 0 12 -5 12 -12v-167c0 -4 4 -5 10 -5c26 0 90 23 90 23 c1 0 2 1 4 1zM37 39v-103c0 -4 5 -6 12 -6c25 0 82 23 82 41v103c0 4 -3 5 -9 5c-24 0 -85 -26 -85 -40z"),bbox:{ne:{x:.672,y:1.364},sw:{x:0,y:-1.34}}},it={path2d:new Path2D("M237 118l-26 -10c-8 -3 -13 -22 -13 -29v-93c0 -12 7 -18 13 -18l26 10c2 1 3 1 5 1c4 0 7 -3 7 -8v-71c0 -6 -5 -14 -12 -17c0 0 -21 -8 -28 -11s-11 -15 -11 -23v-142c0 -6 -6 -11 -17 -11c-7 0 -13 5 -13 11v125c0 6 -5 18 -14 18l-2 -1h-1l-61 -25 c-5 -2 -10 -9 -10 -22v-139c0 -6 -7 -11 -17 -11c-7 0 -13 5 -13 11v123c0 5 -5 16 -12 16c-1 0 -2 0 -3 -1c-9 -3 -23 -9 -24 -9l-2 -1c-6 0 -9 3 -9 9v71c0 6 5 14 12 16c0 0 21 9 27 11c6 3 11 12 11 23v99c0 8 -6 18 -14 18l-1 -1c-8 -4 -23 -10 -24 -10l-2 -1 c-6 0 -9 3 -9 9v71c0 6 5 14 12 16c0 0 20 8 26 11s12 13 12 27v135c0 6 6 11 16 11c7 0 14 -5 14 -11v-120c0 -8 3 -20 12 -20c17 4 51 18 63 25c9 6 12 19 13 29v130c0 6 6 11 16 11c8 0 14 -5 14 -11v-122c0 -8 7 -13 14 -13c5 1 25 9 25 9c2 1 3 1 5 1c4 0 7 -3 7 -8 v-71c0 -6 -5 -14 -12 -17zM168 -45c2 9 4 37 4 64s-2 52 -4 57c-2 4 -8 6 -15 6c-25 0 -71 -21 -73 -38c-2 -8 -3 -43 -3 -74c0 -24 1 -46 3 -50c1 -3 6 -5 12 -5c23 0 70 20 76 40z"),bbox:{ne:{x:.996,y:1.4},sw:{x:0,y:-1.392}}};var Q=new Map([[8,$e],[16,Ke],[32,Ye]]),V=new Map([[8,Ge],[16,qe],[32,je]]),Z=new Map([[1,Je],[2,Qe],[4,Ve],[8,Ze],[16,et],[32,tt]]),ee=new Map([["sharp",it],["natural",ot],["flat",nt]]),st=new Map([[8,1],[16,2],[32,3]]),$=e=>{switch(e){case 1:return ze;case 2:return _e;default:return Xe}},at=e=>e===1?He:Le;var X="#FF0000",mt=({note:e,stemDirection:t,beamed:n=!1,pointing:o})=>{let s=[],a=[],i=[];for(let l of e.pitches){if(!l.accidental)continue;let{pitch:u,accidental:Y}=l,oe=k(0,u,1);i.push(I(ee.get(Y),b)),s.push({type:"accidental",position:{x:0,y:oe},accidental:Y})}a.push(...i);let c=0;i.length>0&&(c=i[0].right+pt(1));let h=e.pitches.map(l=>l.pitch),d=Math.min(...h),p=Math.max(...h),m=Bt(e.duration),r=[];if(d<=0)for(let l=0;l>=d;l-=2){let u=k(0,l,1);s.push({type:"ledger",width:m,position:{x:c,y:u}}),r.push({left:c,right:c+m,top:u-U,bottom:u+U})}if(p>=12)for(let l=12;l<p+1;l+=2){let u=k(0,l,1);s.push({type:"ledger",width:m,position:{x:c,y:u}}),r.push({left:c,right:c+m,top:u-U,bottom:u+U})}a.push(...r);let g=0;r.length>0?g=r[0].left+rt(1):i.length>0&&(g=i[0]?.right+pt(1)*2),t||(t=lt(h));let v=[],B=[],y=dt(e.pitches,"asc");if(t==="up")for(let l=0;l<y.length;l++)l===0?v.push(y[l]):y[l].pitch-y[l-1].pitch==1?(B.push(y[l]),l+1<y.length&&v.push(y[++l])):v.push(y[l]);else{let l=y.concat().reverse();for(let u=0;u<l.length;u++)u===0?B.push(l[u]):l[u-1].pitch-l[u].pitch==1?(v.push(l[u]),u+1<l.length&&B.push(l[++u])):B.push(l[u])}let w=[];for(let l of v){let u={x:g,y:k(0,l.pitch,1)};s.push({type:"head",position:u,duration:e.duration}),w.push(L(I($(e.duration),b),u))}let x=g;if(v.length>0&&(x=w[0].right),a.push(...w),!n){let{elements:l,bboxes:u}=ht({left:x,duration:e.duration,direction:t,lowest:y[0],highest:y[y.length-1]});s.push(...l),a.push(...u)}for(let l of B){let u={x:g,y:k(0,l.pitch,1)};s.push({type:"head",position:u,duration:e.duration}),a.push(L(I($(e.duration),b),u))}console.log("note bboxes",a);let S=ct(a);return{element:{type:"note",note:e,elements:s,...o?{color:X}:void 0},width:S.right-S.left,stemOffsetLeft:x,bbox:S}},ct=e=>{let t;for(let n of e)t?(n.left<t.left&&(t.left=n.left),n.top<t.top&&(t.top=n.top),n.right>t.right&&(t.right=n.right),n.bottom>t.bottom&&(t.bottom=n.bottom)):t=n;return t},rt=e=>b*Re*e,Bt=e=>at(e)+rt(1)*2,lt=e=>{let t=6-Math.min(...e),n=Math.max(...e)-6;return t>n?"up":n>t?"down":Ct(e)<6?"up":"down"},Ct=e=>{let t=e.reduce((n,o)=>n+o)/e.length;return Math.round(t)},ae=({dnp:e,direction:t,lowest:n,highest:o,extension:s=0})=>{let{topOfStaff:a,scale:i,duration:c}=e,h=a+M*i/2,d,p;if(t==="up"){if(p=k(a,n.pitch,i)-5,o.pitch<0)d=h;else{let m=c<32?o.pitch+7:o.pitch+8;d=k(a,m,i)}d-=s}else{if(d=k(a,o.pitch,i),n.pitch>12)p=h;else{let m=c<32?n.pitch-7:n.pitch-8;p=k(a,m,i)}p+=s}return{top:d,bottom:p}},pt=e=>b/4*e,ht=({left:e,duration:t,direction:n,lowest:o,highest:s,beamed:a})=>{if(t===1)return{elements:[],bboxes:[]};let i=[],{top:c,bottom:h}=ae({dnp:{topOfStaff:0,scale:1,duration:t},direction:n,lowest:o,highest:s}),d,p=[];if(n==="up")if(d=e-z/2,a)c=a.top;else{let r=Q.get(t),g=d-z/2;if(r){let v={x:g+b*r.stemUpNW.x,y:c+b*r.stemUpNW.y};i.push({type:"flag",position:v,duration:t,direction:n}),p.push(L(I(r,b),v))}}else if(d=e+z/2,a)h=a.bottom;else{let r=V.get(t);if(r){let g={x:d-z/2+b*r.stemDownSW.x,y:h+b*r.stemDownSW.y};i.push({type:"flag",position:g,duration:t,direction:n}),p.push(L(I(r,b),g))}}let m={type:"stem",center:d,top:c,bottom:h,width:z};return i.push(m),p.push({left:m.center-m.width/2,top:m.top,right:m.center+m.width/2,bottom:m.bottom}),{elements:i,bboxes:p}},Dt=(e,t)=>{let n=Z.get(e.duration),o=b*n.originUnits,s={x:0,y:o},a=L(I(n,b),{y:o});return{element:{type:"rest",rest:e,position:s,...t?{color:X}:{}},bbox:a,width:a.right-a.left}},Et=(e,t)=>{let n=Ae*b,o=Ie*b;if(e.subtype==="single")return{element:{type:"bar",bar:e,...t?{color:X}:{},elements:[{type:"line",position:{x:0,y:0},height:M,lineWidth:n}]},width:n,bbox:{left:0,top:0,right:n,bottom:M}};if(e.subtype==="double")return{element:{type:"bar",bar:e,...t?{color:X}:{},elements:[{type:"line",position:{x:0,y:0},height:M,lineWidth:n},{type:"line",position:{x:n+o,y:0},height:M,lineWidth:n}]},width:o+n*2,bbox:{left:0,top:0,right:o+n*2,bottom:M}};{let s=Fe*b,a=We*b,i=_*2+a+n+o+s;return{element:{type:"bar",bar:e,...t?{color:X}:{},elements:[{type:"dot",position:{x:0,y:b+b/2}},{type:"line",position:{x:_*2+a,y:0},height:M,lineWidth:n},{type:"line",position:{x:_*2+a+n+o,y:0},height:M,lineWidth:s}]},width:i,bbox:{left:0,top:0,right:i,bottom:M}}}},k=(e,t,n)=>{let o=M*n/8;return e+b*4.5*n+o-t*o},Mt=({dnp:e,stemDirection:t,beamed:n,arr:o})=>{let s=n[0],a=n[n.length-1],i=b/2*3*e.scale,c=o[o.length-1].left+o[o.length-1].stemOffsetLeft-(o[0].left+o[0].stemOffsetLeft),h,d;if(t==="up"){if(n.length===1)h=0;else{let w=s.pitches[s.pitches.length-1].pitch,x=a.pitches[a.pitches.length-1].pitch,S=k(e.topOfStaff,w,e.scale),u=k(e.topOfStaff,x,e.scale)-S;w>x?h=(u>=i?i:u)/c:h=(-u>=i?-i:u)/c}let v=n.map((w,x)=>({note:w,leftOfStem:o[x].left+o[x].stemOffsetLeft})).sort((w,x)=>x.note.pitches[x.note.pitches.length-1].pitch-w.note.pitches[w.note.pitches.length-1].pitch)[0],B=v.leftOfStem,y=ae({dnp:e,direction:t,lowest:{pitch:v.note.pitches[0].pitch},highest:{pitch:v.note.pitches[v.note.pitches.length-1].pitch}}).top;d={x:B,y}}else{if(n.length===1)h=0;else{let w=s.pitches[0].pitch,x=a.pitches[0].pitch,S=k(e.topOfStaff,w,e.scale),u=k(e.topOfStaff,x,e.scale)-S;w>x?h=(u>=i?i:u)/c:h=(-u>=i?-i:u)/c}let v=n.map((w,x)=>({note:w,leftOfStem:o[x].left+o[x].stemOffsetLeft})).sort((w,x)=>w.note.pitches[0].pitch-x.note.pitches[0].pitch)[0],B=v.leftOfStem,y=ae({dnp:e,direction:t,lowest:{pitch:v.note.pitches[0].pitch},highest:{pitch:v.note.pitches[v.note.pitches.length-1].pitch}}).bottom;d={x:B,y}}let{x:p,y:m}=d,r=-p*h+m;return g=>g*h+r},St=({scale:e,stemDirection:t,beamLeft:n,beamRight:o,stemLinearFunc:s,offsetY:a=0})=>{let i=b*se*e,c=s(n)+(t==="up"?a:-a),h={x:n,y:t==="up"?c:c-i},d={x:n,y:t==="up"?c+i:c},p=s(o)+(t==="up"?a:-a),m={x:o,y:t==="up"?p:p-i},r={x:o,y:t==="up"?p+i:p};return{nw:h,ne:m,se:r,sw:d}},dt=(e,t)=>{let n=(o,s)=>t==="asc"?o.pitch<s.pitch:s.pitch<o.pitch;return e.sort((o,s)=>n(o,s)?-1:o.pitch===s.pitch?0:1)},ut=e=>{let{beamedNotes:t,notePositions:n,linearFunc:o,stemDirection:s,duration:a=8,headOrTail:i}=e;console.log("determineBeamStyle",a);let c=!1,{beam:h}=t[t.length-1];(h==="continue"||h==="begin")&&(a>8?c=i==="tail":c=!0);let d=n[0].left+n[0].stemOffsetLeft,p=n[n.length-1].left+n[n.length-1].stemOffsetLeft+(c?b:0);a>8&&t.length===1&&(i==="head"?p=d+b:i==="tail"&&(d=p-b));let m=[],r=(b*se+b*Ue)*(st.get(a)-1),g=St({scale:1,stemDirection:s,beamLeft:d,beamRight:p,stemLinearFunc:o,offsetY:r});if(m.push({element:{type:"beam",...g},width:p-d,bbox:{left:g.sw.x,top:g.ne.y,right:g.ne.x,bottom:g.sw.y}}),a===32)return m;let v=a*2,B=[],y=0,w=0,x;for(;w<t.length;){if(t[w].duration>=v){if(!x){let l;w===0?l="head":w===t.length-1&&(l="tail"),x={start:w,end:w,headOrTail:l},B.push(x)}}else x&&(B[y].end=w,y++,x=void 0);w++}x&&(B[y].end=t.length,B[y].headOrTail="tail"),console.log(B);for(let{start:S,end:l,headOrTail:u}of B)m.push(...ut({...e,beamedNotes:t.slice(S,l),notePositions:n.slice(S,l),duration:v,headOrTail:u}));return m},kt=(e,t,n,o,s)=>{let a=e.flatMap(r=>r.pitches).map(r=>r.pitch),i=lt(a),c=[],h=[],d=0;for(let r in e){let g=Number(r),v=s?.type==="note"&&s.index===g+o?s:void 0,B=mt({note:e[g],stemDirection:i,beamed:!0,pointing:v});c.push({left:d,stemOffsetLeft:B.stemOffsetLeft});let y={index:g+o};h.push({caretOption:y,index:g+o,...B}),d+=B.width,h.push(ft({width:n,height:M,caretOption:{...y,index:g+o,defaultWidth:!0}})),d+=n}let p=Mt({dnp:{topOfStaff:0,scale:1,duration:t},stemDirection:i,beamed:e,arr:c}),m=ut({beamedNotes:e,notePositions:c,linearFunc:p,stemDirection:i});for(let r in e){let{pitches:g}=e[r],v=dt(g,"asc"),B=p(c[r].left+c[r].stemOffsetLeft),y;i==="up"?y={top:B}:y={bottom:B};let w=ht({left:c[r].stemOffsetLeft,duration:t,direction:i,lowest:v[0],highest:v[v.length-1],beamed:y}),x=h[Number(r)*2],S=x.element;x.bbox=ct([x.bbox,...w.bboxes]),S.elements.push(...w.elements)}return[...m,...h]},ft=({width:e,height:t,caretOption:n})=>({element:{type:"gap"},width:e,bbox:{left:0,top:0,right:e,bottom:t},caretOption:n}),Nt=(e,t,n)=>{let o=I(J,b),s=k(0,4,1);return{element:{type:"clef",clef:e,...n?{color:X}:{}},width:o.right-o.left,bbox:L(o,{y:s}),index:t}},ce=function*(e,t,n,o){let s=ft({width:t,height:M}),a=0;if(console.log("left",a),n&&(yield s,a+=t,console.log("left",a),n.clef)){let c=o?.index===-1?o:void 0,h=Nt(n.clef,-1,c);yield h,a+=h.width,console.log("left",a)}yield{...s,caretOption:{index:-1,defaultWidth:!0}},a+=t,console.log("left",a);let i=0;for(;i<e.length;){let c=e[i];if(c.type==="note")if(c.beam==="begin"){let h=[c],d=o?.index===i?o:void 0,p=i+1,m=e[p];for(;m?.type==="note"&&(m.beam==="continue"||m.beam==="end");)d||(d=o?.index===p?o:void 0),h.push(m),m=e[++p];let r=kt(h,c.duration,t,i,d);for(let g of r)yield g;i+=h.length}else{let h=o?.index===i?o:void 0,d=mt({note:c,pointing:h});yield{caretOption:{index:i},index:i,...d},a+=d.width,yield{...s,caretOption:{index:i,defaultWidth:!0}},a+=t,i++}else if(c.type==="rest"){let h=o?.index===i?o:void 0,d=Dt(c,h);yield{caretOption:{index:i},index:i,...d},a+=d.width,yield{...s,caretOption:{index:i,defaultWidth:!0}},a+=t,i++}else if(c.type==="bar"){let h=o?.index===i?o:void 0,d=Et(c,h);yield{caretOption:{index:i},index:i,...d},a+=d.width,yield{...s,caretOption:{index:i,defaultWidth:!0}},a+=t,i++}}};var te=({dpr:e,leftPx:t,topPx:n,width:o,height:s,_canvas:a})=>{let i=a??document.createElement("canvas");i.style.position="absolute",i.style.top=`${n}px`,i.style.left=`${t}px`,i.style.width=`${o}px`,i.width=o*e,i.height=s*e,i.style.height=`${s}px`,i.getContext("2d")?.scale(e,e)},G=(e,t,n,o,s,a)=>{e.save(),e.rotate(Math.PI/180*180),e.translate(-t,-n),e.scale(-o,o),e.fillStyle=a||"#000",e.fill(s.path2d),e.restore()},Tt=(e,t,n,o)=>{let s=k(o,4,1);G(e,n,s,1,J,t.color)},re=(e,t,n,o,s)=>{let a=b*s;for(let i=0;i<5;i++){let c=n+a*i;e.save(),e.strokeStyle="#000",e.lineWidth=Oe*s,e.beginPath(),e.moveTo(t,c),e.lineTo(t+o,c),e.closePath(),e.stroke(),e.restore()}},Ot=(e,t)=>{let n=t.color??"#000";for(let o of t.elements){if(e.save(),o.type==="line")e.translate(o.position.x+o.lineWidth/2,o.position.y),e.strokeStyle=n,e.lineWidth=o.lineWidth,e.beginPath(),e.moveTo(0,0),e.lineTo(0,o.height),e.closePath(),e.stroke();else{let s=_;e.translate(o.position.x+s,o.position.y),e.fillStyle=n,e.beginPath(),e.arc(0,0,s,0,Math.PI*2),e.fill(),e.beginPath(),e.arc(0,b,s,0,Math.PI*2),e.fill()}e.restore()}},Lt=({ctx:e,element:t})=>{let n=t.color??"#000";for(let o of t.elements)if(o.type==="head"){let{duration:s,position:a}=o;e.save(),e.translate(a.x,a.y);let i=$(s);G(e,0,0,1,i,n),e.restore()}else if(o.type==="ledger"){let{width:s,position:a}=o;e.save(),e.translate(a.x,a.y),e.strokeStyle=n,e.lineWidth=U,e.beginPath(),e.moveTo(0,0),e.lineTo(s,0),e.closePath(),e.stroke(),e.restore()}else if(o.type==="accidental"){let{position:s,accidental:a}=o,i=ee.get(a);e.save(),e.translate(s.x,s.y),G(e,0,0,1,i,n),e.restore()}else if(o.type==="flag"){let{duration:s,direction:a,position:i}=o,c=a==="up"?Q.get(s):V.get(s);c&&G(e,i.x,i.y,1,c,n)}else if(o.type==="stem"){let{top:s,bottom:a,center:i,width:c}=o;e.save(),e.translate(i,s),e.strokeStyle=n,e.lineWidth=c,e.beginPath(),e.moveTo(0,0),e.lineTo(0,a-s),e.stroke(),e.restore()}},Ht=({ctx:e,element:t})=>{let{rest:n,position:o,color:s}=t,a=Z.get(n.duration);e.save(),e.translate(o.x,o.y),G(e,0,0,1,a,s),e.restore()},Rt=(e,t)=>{e.save(),e.fillStyle="#000",e.beginPath(),e.moveTo(t.nw.x,t.nw.y),e.lineTo(t.sw.x,t.sw.y),e.lineTo(t.se.x,t.se.y),e.lineTo(t.ne.x,t.ne.y),e.closePath(),e.fill(),e.restore()},le=(e,{element:t})=>{let{type:n}=t;n==="clef"?Tt(e,t,0,0):n==="note"?Lt({ctx:e,element:t}):n==="rest"?Ht({ctx:e,element:t}):n==="beam"?Rt(e,t):n==="bar"&&Ot(e,t)};var bt=({ctx:e,scale:t,caret:n})=>{let{x:o,y:s,width:a}=n,i=M*t;e.save(),e.fillStyle="#FF000055",e.fillRect(o,s,a,i),e.restore()},pe=({ctx:e,width:t,height:n,fillStyle:o})=>{e.save(),e.fillStyle=o,e.fillRect(0,0,t,n),e.restore()};var O=class{constructor(){}onMove(t){}onDown(t){}onUp(t,n){}onClick(t){}onLongDown(t){}onDrag(t,n){}onDoubleClick(t){}},he=class extends O{constructor(){super();this.translated={x:0,y:0};this.keyboardEl=document.getElementById("keyboard")}onUp(t,n){this.translated.x+=t.x-n.x,this.translated.y+=t.y-n.y}onDrag(t,n){let o=this.translated.x+t.x-n.x,s=this.translated.y+t.y-n.y;this.keyboardEl.style.transform=`translate(${o}px, ${s}px)`}},de=class extends O{constructor(){super();this.translated={x:0,y:0};this.pointerEl=document.getElementById("pointer")}onDown(t){this.pointerEl.style.opacity="0.8",this.pointerEl.style.top=`${t.y-50/2}px`,this.pointerEl.style.left=`${t.x-50/2}px`}onUp(t,n){this.pointerEl.style.opacity="0"}onDrag(t,n){this.pointerEl.style.top=`${t.y-50/2}px`,this.pointerEl.style.left=`${t.x-50/2}px`}},me=class extends O{constructor(t){super();this.callback=t;this.changeButton=document.getElementsByClassName("changeNoteRest")[0]}onUp(){let t=this.callback.isNoteInputMode(),n=t?"rest":"note";this.changeButton.className=this.changeButton.className.replace(t?"note":"rest",n),this.callback.change()}},ue=class extends O{constructor(t){super();this.callback=t;this.changeButton=document.getElementsByClassName("changeBeam")[0]}onUp(){let t=this.callback.getMode(),n=t==="nobeam"?"beam":"nobeam";this.changeButton.className=this.changeButton.className.replace(t,n),this.callback.change(n)}onDoubleClick(t){console.log("double")}},fe=class extends O{constructor(){super()}onDown(t){this.target=t.target,this.target.className+=" pressed"}onUp(){!this.target||(this.target.className=this.target.className.replace(" pressed",""))}},be=class extends O{constructor(t){super();this.callback=t;this.candidateContainer=document.querySelector(".bars .candidateContainer")}onClick(t){this.callback.commit({type:"bar",subtype:"single"})}onLongDown(t){this.candidateContainer.style.visibility="visible"}onUp(t,n){let[o]=t.target.className.split(" ").filter(s=>s.match(/single|double|repeat/));o&&this.callback.commit({type:"bar",subtype:o}),this.candidateContainer.style.visibility="hidden"}},ye=class extends O{constructor(t){super();this.callback=t;this.elMap=new Map([["sharp",document.querySelector(".sharp")],["natural",document.querySelector(".natural")],["flat",document.querySelector(".flat")]])}onClick(t){this.callback.next();let n=this.callback.getMode();for(let[o,s]of this.elMap.entries())o===n?s.className=s.className+" selected":s.className=o}},ge=class extends O{constructor(t){super();this.callback=t;this.posToDurationMap=new Map([["12",1],["13",2],["14",4],["22",8],["23",16],["24",32]]);this.targetClassNames=[]}get duration(){let t=this.targetClassNames.find(n=>n.match(/k[0-9][0-9]/))?.replace("k","");if(!!t)return this.posToDurationMap.get(t)}isBackspace(){return this.targetClassNames.some(t=>t==="backspace")}onDown(t){let n=t.target;this.targetClassNames=n.className.split(" ")}onClick(t){this.duration&&this.callback.commit(this.duration),this.finish()}onLongDown(t){this.isBackspace()||this.callback.startPreview(this.duration,t.x,t.y)}onDrag(t,n){this.dragDy=n.y-t.y,this.callback.updatePreview(this.duration,this.dragDy)}onUp(t,n){this.isBackspace()?this.callback.backspace():this.duration&&this.callback.commit(this.duration,this.dragDy??0),this.finish()}finish(){this.targetClassNames=[],this.dragDy=void 0,this.callback.finish()}},xe=class extends O{constructor(t){super();this.callback=t}onClick(t){let{className:n}=t.target;n.match(/.*toLeft.*/)?this.callback.back():n.match(/.*toRight.*/)&&this.callback.forward()}},Pe=class extends O{constructor(t){super();this.callback=t}onMove(t){this.callback.onMove({x:t.offsetX,y:t.offsetY})}};var yt=["sharp","natural","flat"];var ne=e=>e.sort((t,n)=>t.pitch===n.pitch?t.accidental===n.accidental||!t.accidental&&n.accidental==="natural"||t.accidental==="natural"&&!n.accidental?0:t.accidental==="flat"&&n.accidental!=="flat"||(t.accidental==="natural"||!t.accidental)&&n.accidental==="sharp"?-1:1:t.pitch<n.pitch?-1:1);var K=[void 0,...yt],ve=window.devicePixelRatio,q=.08,A=.08,we=250,Be=2e3,It=50;window.onload=()=>{let e=window.innerWidth,t=window.innerHeight,n=300,o=400,s=document.getElementById("mainCanvas"),a=document.getElementById("previewCanvas"),i=s.getContext("2d"),c=a.getContext("2d"),h=Array.from(document.getElementsByClassName("note")),d=document.getElementsByClassName("changeNoteRest")[0],p=[],m=[],r=0,g=!0,v="nobeam",B=0,y,w=[],x=[],S,l=()=>{console.log("main","start"),pe({ctx:i,width:e,height:t,fillStyle:"#fff"}),m=[],x=[],i.save(),i.scale(q,q),i.translate(we,Be),re(i,0,0,b*100,1),w=[...ce(p,b,{clef:{type:"g"}},S)];let C=0;for(let f of w){console.log("style",f);let{width:D,element:E,caretOption:N,bbox:F,index:H}=f;if(le(i,f),x.push({bbox:L(F,{x:C}),elIdx:H}),N){let{index:j,defaultWidth:R}=N,W=R?It:D;m.push({x:C+(R?D/2-W/2:0),y:0,width:W,elIdx:j})}E.type!=="beam"&&(C+=D,i.translate(D,0))}i.restore(),console.log("carets",m),console.log("current caret",m[r]),i.save(),i.scale(q,q),i.translate(we,Be),m[r]&&bt({ctx:i,scale:1,caret:m[r]}),i.restore(),console.log("main","end")},u=(P,C)=>{console.log("preview","start"),pe({ctx:c,width:n,height:o,fillStyle:"#fff"});let{elements:f,insertedIndex:D}=De({caretIndex:r,elements:p,newElement:C,beamMode:P});console.log("insertedIdx",D),console.log("preview",f);let E=o/2-M*A/2,N=[...ce(f,b)],F=new Map,H=0;for(let R of N){let{width:W,element:ie,index:Se}=R;console.log("style",R),Se!==void 0&&F.set(Se,H+W/2),ie.type!=="beam"&&(H+=W)}console.log("elIdxToX",F),c.save(),c.translate(0,E),c.scale(A,A),re(c,0,0,b*100,1),c.restore(),c.save(),c.translate(n/2,E),c.scale(A,A);let j=F.get(D);console.log("centerX",j),c.translate(-j,0);for(let R of N){let{width:W,element:ie}=R;le(c,R),ie.type!=="beam"&&c.translate(W,0)}c.restore(),console.log("preview","end")},Y={isNoteInputMode(){return g},change(){h.forEach(P=>{P.className=P.className.replace(this.isNoteInputMode()?"note":"rest",this.isNoteInputMode()?"rest":"note")}),d.className=d.className.replace(this.isNoteInputMode()?"rest":"note",this.isNoteInputMode()?"note":"rest"),g=!g}},oe={getMode(){return v},change(P){h.forEach(f=>{f.className=f.className.replace(P==="nobeam"?"beamed":"nobeam",P==="nobeam"?"nobeam":"beamed")}),v=P;let C=p[y];if(C){let f=p[y-1],D=p[y+1];Ce(C,f,D),l()}}},gt={getMode(){return K[B]},next(){B=B===K.length-1?0:B+1}},xt={startPreview(P,C,f){let D=C-n/2,E=f-o/2;te({dpr:ve,leftPx:D,topPx:E,width:n,height:o,_canvas:a});let N=g?{type:"note",duration:P,pitches:[{pitch:Ee(A,0,6),accidental:K[B]}]}:{type:"rest",duration:P};if(r>0&&r%2!=0){let F=r===1?0:(r-1)/2,H=p[F];N.type==="note"&&H.type==="note"&&N.duration===H.duration&&(N.pitches=ne([...H.pitches,...N.pitches]))}u(v,N),a.style.visibility="visible"},updatePreview(P,C){let f=g?{type:"note",duration:P,pitches:[{pitch:Ee(A,C,6),accidental:K[B]}]}:{type:"rest",duration:P};if(r>0&&r%2!=0){let D=r===1?0:(r-1)/2,E=p[D];f.type==="note"&&E.type==="note"&&f.duration===E.duration&&(f.pitches=ne([...E.pitches,...f.pitches]))}u(v,f)},commit(P,C){let f;g?f={type:"note",duration:P,pitches:[{pitch:Ee(A,C??0,6),accidental:K[B]}]}:f={type:"rest",duration:P};let{elements:D,insertedIndex:E,caretAdvance:N}=De({caretIndex:r,elements:p,newElement:f,beamMode:v});y=E,r+=N,p=D,l()},backspace(){let P=m[r].elIdx;if(P<0)return;let C=p.splice(P,1)[0];if(C.type==="note"){let D=p[P-1],E=p[P];C.beam==="begin"&&E?E.beam="begin":C.beam==="end"&&D&&(D.beam="end")}let f=r-1;for(;f>-1;)f===0?(r=0,f=-1):m[f].elIdx!==P?(r=f,f=-1):f--;l()},finish(){a.style.visibility="hidden"}},Pt={back(){if(r%2!=0){let P=r===1?0:(r-1)/2;if(P===y){let C=p[y],f=p[P-1],D=p[P+1];Ce(C,f,D)}}r=Math.max(r-1,0),l()},forward(){if(r%2==0){let P=r/2-1;if(P===y){let C=p[y],f=p[P-1],D=p[P+1];Ce(C,f,D)}}r=Math.min(r+1,m.length-1),l()}},vt={commit(P){let{elements:C,insertedIndex:f,caretAdvance:D}=De({caretIndex:r,elements:p,newElement:P,beamMode:v});y=f,r+=D,p=C,l()}},wt={onMove(P){let C;for(let f in x){let{type:D}=w[f].element;if(!(D==="gap"||D==="beam")&&At(Ne(P,1/q),L(x[f].bbox,{x:we,y:Be}))){let{elIdx:E}=x[f];E!==void 0&&(C={index:E,type:D})}}S!==C&&(S=C,l())}};T(["keyboardBottom","keyboardHandle"],[new he]),T(["changeNoteRest"],[new me(Y)]),T(["changeBeam"],[new ue(oe)]),T(["grayKey","whiteKey"],[new fe]),T(["note","rest","backspace"],[new ge(xt)]),T(["toLeft","toRight"],[new xe(Pt)]),T(["bars","candidate"],[new be(vt)]),T(["accidentals"],[new ye(gt)]),T([],[new de]),T(["mainCanvas"],[new Pe(wt)]),te({dpr:ve,leftPx:0,topPx:0,width:window.innerWidth,height:window.innerHeight,_canvas:s}),te({dpr:ve,leftPx:0,topPx:0,width:n,height:o,_canvas:a}),l()};function Me(e,t,n,o){t.type==="note"&&e!=="nobeam"?n?.type==="note"&&o?.type==="note"&&n.beam&&o.beam?n.beam==="begin"?o.beam==="begin"?(t.beam="continue",o.beam="continue"):t.beam="continue":n.beam==="continue"&&(o.beam==="begin"?t.beam="end":t.beam="continue"):(t.beam="begin",n?.type==="note"&&(n?.beam==="begin"||n?.beam==="continue")&&(t.beam="continue"),o?.type==="note"&&o?.beam==="begin"&&(o.beam="continue")):(o?.type==="note"&&(o?.beam==="continue"?o.beam="begin":o?.beam==="end"&&delete o.beam),n?.type==="note"&&(n?.beam==="begin"?delete n.beam:n?.beam==="continue"&&(n.beam="end")))}function Ce(e,t,n){e.type==="note"&&(e.beam==="begin"||e.beam==="continue")&&(!n||n?.type==="note"&&(!n?.beam||n?.beam==="begin"))&&(t?.type==="note"&&(t?.beam==="begin"||t?.beam==="continue")?e.beam="end":delete e.beam)}function De({caretIndex:e,elements:t,newElement:n,beamMode:o}){let s=[...t],a=0,i=0;if(e===0){let c=s[e];Me(o,n,void 0,c),s.splice(e,0,n),i=2}else if(e%2==0){let c=e/2,h=s[c-1],d=s[c];console.log("insertIdx",c,"left",h,"right",d),Me(o,n,h,d),s.splice(c,0,n),i=2,a=c}else{let c=e===1?0:(e-1)/2,h=s[c];n.type==="note"&&h.type==="note"&&n.duration===h.duration&&(n.pitches=ne([...h.pitches,...n.pitches]));let d=s[c-1],p=s[c+1];Me(o,n,d,p),s.splice(c,1,n),a=c}return{elements:s,insertedIndex:a,caretAdvance:i}}var Ee=(e,t,n)=>{let o=b/2*e;return Math.round(t/o+n)};var At=({x:e,y:t},{left:n,top:o,right:s,bottom:a})=>n<=e&&e<=s&&o<=t&&t<=a;})();
//# sourceMappingURL=out.js.map
