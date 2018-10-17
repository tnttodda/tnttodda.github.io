// var fact_prog =
//   'let fact = rec f. λx.\n'
// + '  if (x <= 1)\n'
// + '  then 1\n'
// + '  else (x * (f (x - 1)))\n'
// + 'in\n'
// + '\n'
// + 'fact 4';

var fact_prog =
  'bind z = 1 in\n'
+ 'bind x = PLUS(z,PLUS(2,z)) in\n'
+ 'PLUS(2,PLUS(z,x))';
