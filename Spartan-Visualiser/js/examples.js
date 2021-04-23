var ex1 = 'PLUS (3, TIMES (5, 6))'

var ex2 =
 '// x and y are bound variables\n'+
 '// As x is used twice, it is substituted explicitly via copying\n\n'+
 'bind x = 1 in\n' +
 'bind y = PLUS (x, 2) in\n' +
 'TIMES (x, y)'

var ex3 =
  '// A much more interesting example, that features some logic too \n\n'+
  'bind z = PLUS (1, 2) in\n'+
  'bind y = IF (EQUALS (z,3) ; PLUS(1,z), PLUS(2,z)) in\n' +
  'bind x = PLUS (4, y) in\n'+
  'AND (NOT (EQUALS (z, 4)), EQUALS (x, x))'

var ex4 = '// 5! done recursively; for higher values, perhaps skip to the end\n\n'+
          'bind fact = REC (\n'+
          '; f.LAMBDA (\n'+
          '; x.IF (EQUALS (x, 1)\n'+
          '  ; 1                             // This is the "base case"\n'+
          '  , bind y = APP (f, MINUS(x, 1)) // This is the "step case"\n'+
          '  in TIMES (x, y))))\n'+
          'in APP(fact, 5)                   // Change 5 to another value for n!'

var ex5 = '// What value will this return? \n'+
          '// A trivial example to display some different kinds of imperative computation \n\n'+
          'new c = UNIT in\n'+
          'new b = 10 in\n'+
          'new a = 5 in\n'+
          'bind x = TIMES (DEREF(a), 2) in\n'+
          'SEC (ASSIGN (a, x)\n'+
          '  , SEC (BLOCK\n'+                       
          '      (c; w.IF (EQUALS (DEREF(a), DEREF(b))\n'+
          '         ; SEC ( BREAK (w,7) , ABORT (; 8))\n'+              
          '         , ABORT (; 9)))\n'+
          '      , 10))\n';

var ex6 = '// This uses callcc to explore both branches of a conditional \n'+
          '// "We can have it both ways!"\n\n'+
          'new state = UNIT in\n'+
          'bind saveState = LAMBDA (\n'+
          '; x.CALLCC (\n'+
          '  ; LAMBDA (\n'+
          '    ; c.SEC (\n'+
          '        ASSIGN (state, c)\n'+
          '      , x)\n'+
          '      )\n'+
          '  )) in\n'+
          'bind loadState = DEREF(state) in\n'+
          'IF ( APP (saveState, FALSE) ; 1, APP (loadState, TRUE))'

var ex7 = '// The divergent lambda term commonly referred to as Ω \n'+
          '// WARNING: You can\'t skip to the end of this one! \n\n'+
          'bind o = LAMBDA(;x.APP(x, x)) in \n'+
          'APP(o, o)'

var ex8 = '// This is the primality test from wikipedia.org/wiki/Primality_test\n'+
          '// Change n to whatever you like to find out whether it is prime or not!\n\n'+
          'bind n = 13 in\n'+
          'IF(LEQ(n,3)\n'+
          '  ;LEQ(2,n)\n'+
          '  ,IF(OR(EQUALS(MOD(n,2),0)\n'+
          '        ,EQUALS(MOD(n,3),0))\n'+
          '    ;FALSE\n'+
          '     ,new a = UNIT in\n'+
          '      new i = 5 in\n'+
          '      BLOCK(a \n'+
          '           ;w.IF(OR(EQUALS(MOD(n,DEREF(i)),0)\n'+
          '                  ,EQUALS(MOD(n,PLUS(DEREF(i),2)),0))\n'+
          '                ;BREAK(w,FALSE)\n'+
          '                ,SEC(ASSIGN(i,PLUS(DEREF(i),6))\n'+
          '                   ,IF(NOT(LEQ(TIMES(DEREF(i),DEREF(i)),n))\n'+
          '                       ;BREAK(w,TRUE)\n'+
          '                      ,UNIT\n'+
          '                       )\n'+
          '                    )\n'+
          '                )\n'+
          '           ) \n'+
          '     )\n'+
          ')\n';

var ex9 = '// A simple model of state effects\n'+
          'new a = 0 in\n'+
          'bind inc = LAMBDA(;x.ASSIGN(a, PLUS(DEREF(a),1))) in\n'+
          'PLUS(SEC(APP(inc, UNIT),DEREF(a)), SEC(APP(inc, UNIT),DEREF(a)))'

var ex10 ='// The same as Example 9, but using a simple state monad isntead\n'+
          '// Note that the Spartan version has a lot less steps!\n'+
          'bind map = LAMBDA(; f.(LAMBDA(; a.(LAMBDA(; s.(\n'+
          '  bind bt = APP (a, s) in\n'+
          '  bind b = FST(bt) in\n'+
          '  bind t = SND(bt) in\n'+
          '  PAIR(APP(f, b), t))))))) in\n'+
          'bind mult = LAMBDA(; att.(LAMBDA(; sa.(\n'+
          '  bind atsb = APP(att, sa) in\n'+
          '  bind at = FST(atsb) in\n'+
          '  bind sb = SND(atsb) in\n'+
          '  APP(at, sb))))) in\n'+
          'bind unit = LAMBDA(; a.(LAMBDA(; s.(PAIR (a, s))))) in\n'+
          'bind run = LAMBDA(; m.(FST(APP(m, 0)))) in\n'+
          'bind set = LAMBDA(; s.(LAMBDA(; x.(PAIR(0, s))))) in\n'+
          'bind get = LAMBDA(; s.(PAIR(s, s))) in\n'+
          'bind bnd = LAMBDA(; at.(LAMBDA(; f.(APP(mult, APP(APP(map, f), at)))))) in\n'+
          'bind plus = LAMBDA(;x.LAMBDA(;y.APP(APP(bnd,x),LAMBDA(;a.APP(APP(bnd,y),LAMBDA(;b.APP(unit,PLUS(a,b)))))))) in\n'+
          'bind inc = LAMBDA(; s.(\n'+
          '  APP(APP(bnd, get), LAMBDA(; n.\n'+
          '  APP(APP(bnd, APP(set, PLUS(n, 1))), LAMBDA(; x.get)))))) in\n'+
          'APP(run,APP(APP(plus,APP(inc, 0)), APP(inc, 0)))'

var ex11 = 'REC(;f.IF(COIN;UNIT,SEC(f,f)))'
