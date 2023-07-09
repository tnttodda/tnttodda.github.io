package FunctionsAndPredicates;

import java.math.BigInteger;
import java.util.function.Function;

import DyadicsAndIntervals.TBIntervalCode;
import TernaryBoehm.TBEncoding;

public class UCUnaryPredicate {
	
	private Function<TBEncoding,Boolean> predicate;
	private int delta;
	
	public UCUnaryPredicate(Function<TBEncoding,Boolean> predicate, int delta) {
		this.predicate = predicate;
		this.delta = delta;
	}

	public UCUnaryPredicate(CFunction f, UCUnaryPredicate predicate, TBIntervalCode compactInterval) {
		this.predicate = (x) -> {
//			System.out.println(x);
//			System.out.println(f.apply(x));
//			System.out.println(delta);
			return predicate.apply(f.apply(x));
		};
		this.delta = f.getUniformContinuityOracle(compactInterval).apply(predicate.getDelta()).get(0);
	}
	
	public Function<TBEncoding,Boolean> getPredicate() {
		return predicate;
	}
	
	public Integer getDelta() {
		return delta;
	}
	
	public boolean apply(TBEncoding arg) {
		return predicate.apply(arg);
	}
	
	public static UCUnaryPredicate eq(TBEncoding y, int epsilon) {
		return new UCUnaryPredicate(x -> x.approx(epsilon+1).subtract(y.approx(epsilon+1)).abs()
				.compareTo(BigInteger.ONE) <= 0, epsilon+1);
	}
	
	public static UCUnaryPredicate geq(TBEncoding y, int epsilon) {
		return new UCUnaryPredicate(x -> x.approx(epsilon).compareTo(y.approx(epsilon)) >= 0, epsilon);
	}
	
	public static UCUnaryPredicate leq(TBEncoding y, int epsilon) {
		return new UCUnaryPredicate(x -> x.approx(epsilon).compareTo(y.approx(epsilon)) <= 0, epsilon);
	}
	
	public UCUnaryPredicate not() {
		return new UCUnaryPredicate(xs -> !apply(xs), delta);
	}
	
	public UCUnaryPredicate and(UCUnaryPredicate P) {
		return new UCUnaryPredicate(xs -> apply(xs) && P.apply(xs), Integer.max(delta, P.delta));
	}
	
	public UCUnaryPredicate or(UCUnaryPredicate P) {
		return new UCUnaryPredicate(xs -> apply(xs) || P.apply(xs), Integer.max(delta, P.delta));
	}
	
}
