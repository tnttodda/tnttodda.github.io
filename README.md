## Syntax
```
<var> ::= {variables}
<bool> ::= true | false
<num> ::= {num}
<const> ::= <bool> | <num>
<expr> ::= <var>
         | λ <var>. <expr>
         | <expr> <expr>
         | <const>
         | <expr> + <expr> | <expr> - <expr> | <expr> * <expr> | <expr> / <expr> | <expr> <= <expr>
         | <expr> && <expr> | <expr> || <expr>
         | rec <var>. <expr>
         | let <var> = <expr> in <expr>
```
