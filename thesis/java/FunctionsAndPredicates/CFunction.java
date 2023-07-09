package FunctionsAndPredicates;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.function.BiFunction;
import java.util.function.Function;

import DyadicsAndIntervals.DyadicIntervalCode;
import DyadicsAndIntervals.TBIntervalCode;
import TernaryBoehm.TBEncoding;
import Utilities.Pair;

public class CFunction {

	private int arity;
	private Function<List<DyadicIntervalCode>,DyadicIntervalCode> approximator;
	private BiFunction<List<TBEncoding>,Integer,List<Integer>> continuityOracle;
	
	// Constructors
	
	public CFunction(int arity,
			Function<List<DyadicIntervalCode>,DyadicIntervalCode> approximator,
			BiFunction<List<TBEncoding>,Integer,List<Integer>> continuityOracle) {
		this.arity = arity;
		this.approximator = approximator;
		this.continuityOracle = continuityOracle;
	}
	
	// Getters
	
	public int getArity() {
		return arity;
	}
	
	public Function<List<DyadicIntervalCode>,DyadicIntervalCode> getApproximator() {
		return approximator;
	}
	
	public BiFunction<List<TBEncoding>,Integer,List<Integer>> getContinuityOracle() {
		return continuityOracle;
	}
	
	/*
	 * TODO describe
	 */
	public Function<Integer,List<Integer>> getUniformContinuityOracle(TBIntervalCode ki) {
		Function<Integer,List<Integer>> left 
		 = n -> continuityOracle.apply(Arrays.asList(new TBEncoding(ki.downLeft(n - ki.getPrec()).getLeftEndpoint())), n);
		Function<Integer,List<Integer>> right 
		 = n -> continuityOracle.apply(Arrays.asList(new TBEncoding(ki.downRight(n - ki.getPrec()).getLeftEndpoint())), n);
		return (n -> zipMax(Arrays.asList(left.apply(n),right.apply(n))));
	}
	
	public Function<Integer,List<Integer>> getUniformContinuityOracle(List<TBIntervalCode> compactIntervals) {
		return (epsilon) -> {
			List<TBEncoding> lefts = compactIntervals.stream().map(
						x -> new TBEncoding(x.downLeft(epsilon - x.getPrec()).getLeftEndpoint())
					).toList();
			List<TBEncoding> rights = compactIntervals.stream().map(
					x -> new TBEncoding(x.downRight(epsilon - x.getPrec()).getLeftEndpoint())
				).toList();
			return zipMax(Arrays.asList(continuityOracle.apply(lefts, epsilon), continuityOracle.apply(rights, epsilon)));
		};
	}
	
	public Function<TBEncoding,TBEncoding> getDerivative(TBEncoding epsilon) {
		assert(arity == 1);
		return x -> (F_star(Arrays.asList(x.add(epsilon))).subtract(F_star(Arrays.asList(x)))).divide(epsilon);
	}
	
	// Appliers
	
	public DyadicIntervalCode applyApproximator(List<DyadicIntervalCode> args) {
		return approximator.apply(args);
	}
	
	public DyadicIntervalCode applyApproximator(DyadicIntervalCode arg) {
		assert(arity == 1);
		return applyApproximator(Arrays.asList(arg));
	}
	
	public TBEncoding apply(List<TBEncoding> args) {
		assert(arity == args.size());
		return F_star(args);
	}
	
	public TBEncoding apply(TBEncoding arg) {
		assert(arity == 1);
		return apply(Arrays.asList(arg));
	}
	
	public TBEncoding apply(TBEncoding arg1, TBEncoding arg2) {
		assert(arity == 2);
		return apply(Arrays.asList(arg1,arg2));
	}
	
	// Compose functions
	
	private static List<DyadicIntervalCode> map(List<CFunction> gs, List<DyadicIntervalCode> args) {
//		System.out.println(args.size());
		return gs.stream().map(g -> g.applyApproximator(args)).toList();
	}
	
	private static List<Integer> zipMax(List<List<Integer>> ns) {
		List<Integer> ps = new ArrayList<>();
		for (int i = 0; i < ns.get(0).size(); i++) {
			int p = ns.get(0).get(i);
			for (int j = 1; j < ns.size(); j++) {
				p = Math.max(p, ns.get(j).get(i));
			}
			ps.add(p);
		}
		return ps;
	}
	
	// xs -> f(g1(xs),...,gj(xs))
	public static CFunction compose(int arity, CFunction f, List<CFunction> gs) {
		return new CFunction(arity, xs -> f.applyApproximator(map(gs,xs)), 
				(xs,q) -> {
					List<TBEncoding> gxs = gs.stream().map(g -> g.F_star(xs)).toList();
					List<Integer> fps = f.continuityOracle.apply(gxs, q);
					List<List<Integer>> gps = new ArrayList<>();
					for (int i = 0; i < f.arity; i++) {
						gps.add(gs.get(i).continuityOracle.apply(xs, fps.get(i)));
					}
					return zipMax(gps);
				}
			);
	}
	
	// Currying
	
	public CFunction fixPrefixArguments(List<TBEncoding> args) {
//		System.out.println(args);
		return new CFunction(getArity() - args.size(),
				(vs) -> {
					int maxPrec = Collections.max(vs.stream().map(x -> x.getPrec()).toList());
					List<DyadicIntervalCode> argIntervals = 
							args.stream().map(x -> x.toVariableFunction().apply(maxPrec)).toList();
					List<DyadicIntervalCode> ws = new ArrayList<>(argIntervals);
					ws.addAll(vs);
					return applyApproximator(ws);
				},
				(xs,e) -> {
					List<TBEncoding> args_copy = new ArrayList<>(args);
					args_copy.addAll(xs);
					return getContinuityOracle().apply(args_copy, e);
				}
				);
	}
	
	public CFunction fixPostfixArguments(List<TBEncoding> args) {
//		System.out.println(args);
		return new CFunction(getArity() - args.size(),
				(vs) -> {
					int maxPrec = Collections.max(vs.stream().map(x -> x.getPrec()).toList());
					List<DyadicIntervalCode> argIntervals = 
							args.stream().map(x -> x.toVariableFunction().apply(maxPrec)).toList();
					List<DyadicIntervalCode> ws = new ArrayList<>(vs);
					ws.addAll(argIntervals);
					return applyApproximator(ws);
				},
				(xs,e) -> {
					List<TBEncoding> ys = new ArrayList<>(xs);
					ys.addAll(args);
					return getContinuityOracle().apply(ys, e);
				}
				);
	}
	
	// Static members
	
	public static CFunction proj(int arity, int i) {
		return new CFunction(arity, (xs -> xs.get(i)), 
				(xs,q) -> {
					List<Integer> qs = new ArrayList<>();
					for (int j = 0; j < arity; j++) {
						if (i != j) {
							qs.add(0);
						} else {
							qs.add(q);
						}
					}
					return qs;
				}
			);
	}
	
	public static CFunction constant(int arity, TBEncoding y) {
		return new CFunction(arity, (xs -> new TBIntervalCode(y, xs.get(0).getPrec()).getVariableIntervalCode()),
				(xs,q) -> {
					List<Integer> qs = new ArrayList<>();
					for (int j = 0; j < arity; j++) {
							qs.add(0);
					}
					return qs;
				}
			);
	}
	
	public static CFunction negate() {
		return new CFunction(1, xs -> xs.get(0).negate(), (xs,q) -> Arrays.asList(q));
	}
	
	public static CFunction abs() {
		return new CFunction(1, xs -> xs.get(0).abs(), (xs,q) -> Arrays.asList(q));
	}
	
	public static CFunction half() {
		return new CFunction(1, xs -> xs.get(0).half(), (xs,q) -> Arrays.asList(q + 1));
	}
	
	public static CFunction add() {
		return new CFunction(2, xs -> xs.get(0).add(xs.get(1)), (xs,q) -> Arrays.asList(q + 1, q + 1));
	}
	
	public static CFunction multiply() {
		return new CFunction(2, xs -> xs.get(0).multiply(xs.get(1)), 
				(xs,q) -> {
					int p = (q + xs.get(0).approx(q).abs().add(xs.get(1).approx(q).abs()).add(BigInteger.ONE).bitLength());
					if (p % 2 == 0) {
						return Arrays.asList(p,p);
					} else {
						return Arrays.asList(p,p+1);
					}
				}
			);
	}
	
	public static CFunction inverse() {
		return new CFunction(1, xs -> {
				BigInteger left = xs.get(0).getLeftCode();
				BigInteger right = xs.get(0).getRightCode();
				int prec = xs.get(0).getPrec();
				if (left.equals(BigInteger.ZERO) || right.equals(BigInteger.ZERO)) {
					return new DyadicIntervalCode(BigInteger.ZERO, BigInteger.ZERO, prec);
				}
				BigInteger fourPowP = BigInteger.valueOf(4).pow(xs.get(0).getPrec());
				return new DyadicIntervalCode(fourPowP.divide(right), fourPowP.divide(left), prec);			
			},(xs,q) -> Arrays.asList(q)
		);		
	}
	
	public static CFunction constantMul(TBEncoding y) {
		return multiply().fixPostfixArguments(Arrays.asList(y));
	}
	
	// Composed functions
	
	// {x,y} -> +{half(proj({x,y},0)),half(proj({x,y},0))}
	public static CFunction mid() {
		return compose(2, 
				CFunction.add(), 
				Arrays.asList(
						compose(2, CFunction.half(), Arrays.asList(proj(2,0))), 
						compose(2, CFunction.half(), Arrays.asList(proj(2,1)))
					)
			);
	}
	
	// {x,y} -> +{proj({x,y},0),-proj({x,y},1)] = +{x,-y} = x + (- y)
	public static CFunction subtract() {
		return compose(2, 
				CFunction.add(), 
				Arrays.asList(
						proj(2,0), 
						compose(2, CFunction.negate(), Arrays.asList(proj(2,1)))
					)
			);
	}
	
	// {x,y} -> *{proj({x,y},0),1/proj({x,y},1)} = *{x,1/y} = x * 1/y
	public static CFunction divide() {
		return compose(2, 
				CFunction.multiply(), 
				Arrays.asList(
						proj(2,0), 
						compose(2, CFunction.inverse(), Arrays.asList(proj(2,1)))
					)
			);
	}
	
	// {x,y} -> abs(-{proj({x,y},0),proj({x,y},1)}) = abs(x - y)
	public static CFunction diff() {
		return compose(2,
				CFunction.abs(),
				Arrays.asList(
					compose(2, CFunction.subtract(), 
							Arrays.asList(proj(2,0), proj(2,1)))
				)
			);	
	}
	
	public static CFunction pow(int n) {
		if (n <= 0) {
			return constant(1,new TBEncoding(1));
		} else if (n == 1) {
			return proj(1,0);
		} else {
			return compose(1,CFunction.multiply(),Arrays.asList(pow(n/2),pow((n+1)/2)));
		}
	}
	
	public static CFunction sum(int arity, List<CFunction> xs) {
		if (xs.size() == 1) {
			return xs.get(0);
		} else {
			return compose(arity, CFunction.add(), Arrays.asList(sum(arity, xs.subList(0, xs.size()/2)), sum(arity, xs.subList(xs.size()/2, xs.size()))));
		}
	}

	// f([x0,...,xarity-1]) = a * xi ^ n
	public static CFunction polyTerm(int arity, TBEncoding a, int i, int n) {
		return compose(arity, constantMul(a), Arrays.asList(compose(arity, pow(n), Arrays.asList(proj(arity,i)))));
	}
	
	public static CFunction polynomial(int arity, List<Pair<TBEncoding,Pair<Integer,Integer>>> ains) {
		return sum(arity, ains.stream().map(ain -> polyTerm(arity, ain.getFst(), ain.getSnd().getFst(), ain.getSnd().getSnd())).toList());
	}
	
	public static CFunction unaryPolynomial(List<Pair<TBEncoding,Integer>> ains) {
		return sum(1, ains.stream().map(ain -> polyTerm(1, ain.getFst(), 0, ain.getSnd())).toList());
	}
	
	// Convergent streams
	
	public Function<Integer,DyadicIntervalCode> F_prime(List<Function<Integer,DyadicIntervalCode>> args,
														  Function<Integer,List<Integer>> k) {
		return (n) -> {
			List<DyadicIntervalCode> args_k = new ArrayList<>();
			for (int i = 0; i < arity; i++) {
				args_k.add(args.get(i).apply(k.apply(n).get(i)));
			}
			return applyApproximator(args_k);
		};
	}
	
	public static Function<Integer,TBIntervalCode> join(Function<Integer,DyadicIntervalCode> x) {
		return (n -> x.apply(n).join_prime());
	}
	
	private TBEncoding F_star(List<TBEncoding> args) {
		return new TBEncoding(join(F_prime(args.stream().map(arg -> arg.toVariableFunction()).toList(),
						((n) -> continuityOracle.apply(args, n)))));
	}

}
