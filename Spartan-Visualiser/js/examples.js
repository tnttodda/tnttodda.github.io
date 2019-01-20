var ex1 = 'PLUS (3, TIMES (5, 6))'

var ex2 =
 'bind x = 1 in\n' +
 'bind y = PLUS (x, 2) in\n' +
 'TIMES (x, y)'

var ex3 =
  'bind z = PLUS (1, 2) in\n'+
  'bind y = IF (EQUALS (z,3) ; PLUS(1,z), PLUS(2,z)) in\n' +
  'bind x = PLUS (4, y) in\n'+
  'AND (NOT (EQUALS (z, 4)), EQUALS (x, x))'

var ex4 = 'bind fact = REC (\n'+
          '; f.LAMBDA (\n'+
          '; x.IF (EQUALS (x, 1)\n'+
          '  ; 1\n'+
          '  , bind y = APP (f, MINUS(x, 1))\n'+
          '  in TIMES (x, y))))\n'+
          'in APP(fact, 5)'

var ex5 = 'new b = 10 in\n'+
          'new a = 5 in\n'+
          'bind x = TIMES (DEREF(a), 2) in\n'+
          'SEC (ASSIGN (a, x)\n'+
          '  ; SEC (SCOPE\n'+
          '      (; w.IF (EQUALS (DEREF(a), DEREF(b))\n'+
          '         ; SEC ( BREAK (w)\n'+
          '             ; ABORT (; 8))\n'+
          '         , ABORT (; 9)))\n'+
          '      ; 10))'

var ex6 = 'new state = UNIT in\n'+
          'bind saveState = LAMBDA (\n'+
          '; x.CALLCC (\n'+
          '  ; LAMBDA (\n'+
          '    ; c.SEC (\n'+
          '        ASSIGN (state, c)\n'+
          '      ; x)\n'+
          '      )\n'+
          '  )) in\n'+
          'bind loadState = DEREF(state) in\n'+
          'IF ( APP (saveState, FALSE) ; 1, APP (loadState, TRUE))'
