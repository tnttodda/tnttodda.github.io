// var fact_prog =
//   'let fact = rec f. λx.\n'
// + '  if (x <= 1)\n'
// + '  then 1\n'
// + '  else (x * (f (x - 1)))\n'
// + 'in\n'
// + '\n'
// + 'fact 4';

var ex1 = 'PLUS(3,TIMES(5,6))'

var ex2 =
 'bind x = 1 in\n' +
 'bind y = PLUS(x,2) in\n' +
 'TIMES(x,y)'

var ex3 =
 'bind x = PLUS(1,2) in\n' +
 'OR(EQUALS(1,0),EQUALS(x,TIMES(1,3)))'

var ex4 = 'TIMES(IF(TRUE;7,0),IF(FALSE;0,191))'

var ex5 =
  'bind z = PLUS(1,2) in\n'+
  'bind y = IF(EQAUSL(z,3);PLUS(1,z),PLUS(2,z)) in\n' +
  'bind x = PLUS(4,y) in\n'+
  'EQUALS(x,x)'
