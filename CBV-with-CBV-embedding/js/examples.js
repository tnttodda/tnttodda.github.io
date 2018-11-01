// var fact_prog =
//   'let fact = rec f. λx.\n'
// + '  if (x <= 1)\n'
// + '  then 1\n'
// + '  else (x * (f (x - 1)))\n'
// + 'in\n'
// + '\n'
// + 'fact 4';

var fact_prog =
  'bind x = 3 in bind y = PLUS(2,4) in PLUS(x,y)';
