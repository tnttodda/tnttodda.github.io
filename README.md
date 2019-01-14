
A term in Sᴘᴀʀᴛᴀɴ is a variable, a binding, a reference, an operation or a thunk (i.e. a term that cannot yet be evaluated). For the visualiser, the syntax for a term is as follows:

```
term ::= <var>
        | bind <var> = <term> in <term> 
        | new <var> = <term> in <term> 
        | ϕ(<term>*;<thunk>*)

thunk ::= <term> | <var>.<term>
```
where `ϕ` refers to an operation that has a number of eager arguments (those terms before the `;`) and a number of deferred arguments (those thunks after the `;`). A thunk is given as either a term, or a term with a bound variable.\
*Note: We omit the `;` when there are no deferred arguments.*

Below, we have a list of operations that have been implemented in this visualiser.

|  Arithmetic Operation | Sᴘᴀʀᴛᴀɴ Operation |
|-----------------------|-------------------|
| n                     | n                 |
| succ n                | SUCC(n)           |
| n + m                 | PLUS(n,m)         |
| n - m                 | MINUS(n,m)        |
| n * m                 | TIMES(n,m)        |

| Logical Operation | Sᴘᴀʀᴛᴀɴ Operation |
|-------------------|-------------------|
| true              | TRUE              |
| false             | FALSE             |
| a && b            | AND(a,b)          |
| a || b            | OR(a,b)           |
| ¬ a               | NOT(a)            |
| a == b            | EQUALS(a,b)       |

| PCF Operation      | Sᴘᴀʀᴛᴀɴ Operation |
|--------------------|-------------------|
| if b then t else f | IF(b;t,f)         |
| λx.t               | LAMBDA(;x.t)      |
| t u                | APP(t,u)          |
| rec f.t            | REC(;f.t)         |

| Imperative Operation | Sᴘᴀʀᴛᴀɴ Operation |
|----------------------|-------------------|
| ! a                  | DEREF(a)          |
| a := n               | ASSIGN(a,n)       |
| ()                   | UNIT              |
|  a ; b               | SEC(a;b)          |

| Control Operation | Sᴘᴀʀᴛᴀɴ Operation              |
|-------------------|--------------------------------|
| callcc(f)         | CALLCC(;f)                     |
| abort(f)          | ABORT(;f)                      |
| ... break; ...    | SCOPE(;w. ... BREAK(w) ...)    |
| ... continue; ... | SCOPE(;w. ... CONTINUE(w) ...) |
