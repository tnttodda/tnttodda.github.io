// var fact_prog =
//   'let fact = rec f. λx.\n'
// + '  if (x <= 1)\n'
// + '  then 1\n'
// + '  else (x * (f (x - 1)))\n'
// + 'in\n'
// + '\n'
// + 'fact 4';

var fact_prog =
 'bind y = 3 in bind x = IF(EQUALS(y,5);PLUS(2,3),0) in PLUS(x,x)';
