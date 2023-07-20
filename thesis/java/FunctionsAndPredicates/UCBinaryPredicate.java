package FunctionsAndPredicates;

import java.util.Arrays;
import java.util.List;
import java.util.function.BiFunction;
import DyadicsAndIntervals.TernaryIntervalCode;
import TernaryBoehm.TBEncoding;
import Utilities.Pair;

public class UCBinaryPredicate {
	
	private BiFunction<TBEncoding,TBEncoding,Boolean> predicate;
	private Pair<Integer,Integer> delta;
	
	public UCBinaryPredicate(BiFunction<TBEncoding,TBEncoding,Boolean> predicate, Pair<Integer,Integer> delta) {
		this.predicate = predicate;
		this.delta = delta;
	}

	public UCBinaryPredicate(CFunction f, UCUnaryPredicate predicate, Pair<TernaryIntervalCode,TernaryIntervalCode> compactInterval) {
		this.predicate = (x,y) -> predicate.apply(f.apply(x,y));
		List<TernaryIntervalCode> compactIntervals = Arrays.asList(compactInterval.getFst(), compactInterval.getSnd());
		List<Integer> deltas = f.getUniformContinuityOracle(compactIntervals).apply(predicate.getDelta());
		this.delta = new Pair<>(deltas.get(0),deltas.get(1));
	}
	
	public BiFunction<TBEncoding,TBEncoding,Boolean> getPredicate() {
		return predicate;
	}
	
	public Pair<Integer,Integer> getDelta() {
		return delta;
	}
	
	public boolean apply(TBEncoding arg1, TBEncoding arg2) {
		return predicate.apply(arg1, arg2);
	}
	
}
