var ex1 = 'PLUS(3,TIMES(5,6))'

var ex2 =
 'bind x = 1 in\n' +
 'bind y = PLUS(x,2) in\n' +
 'TIMES(x,y)'

var ex3 =
  'bind z = PLUS(1,2) in\n'+
  'bind y = IF(EQUALS(z,3);PLUS(1,z),PLUS(2,z)) in\n' +
  'bind x = PLUS(4,y) in\n'+
  'AND(NOT(EQUALS(z,4)),EQUALS(x,x))'

var ex4 = 'bind fact = REC(;f.LAMBDA(;x.\n'+
          'IF(EQUALS(x,1);\n'+
          '1,\n'+
          'TIMES(x,APP(f,MINUS(x,1))))))\n'+
          'in APP(fact,5)'

var ex5 = 'new b = 10 in new a = 5 in \n'+
          'SEC(ASSIGN(a,TIMES(DEREF(a),2));'+
          'SEC(SCOPE(;w.IF(EQUALS(DEREF(a),DEREF(b));SEC(BREAK(w);ABORT(;888)),ABORT(;999)))\n'+
          ';8))'
