package Regression;

import java.util.Arrays;
import java.util.List;
import DyadicsAndIntervals.TernaryIntervalCode;
import FunctionsAndPredicates.CFunction;
import FunctionsAndPredicates.UCBinaryPredicate;
import FunctionsAndPredicates.UCUnaryPredicate;
import Search.SearchBinary;
import Search.SearchBinaryBranchAndBound;
import Search.SearchUnary;
import Search.SearchUnaryBranchAndBound;
import Optimisation.Optimisation;
import Optimisation.OptimisationHeuristic;
import TernaryBoehm.TBEncoding;
import Utilities.Pair;

public class Regression {
	
	CFunction oracle; //The oracle function O : T^n -> T	
	CFunction model; //The model function   M : T^{m+n} -> T
	CFunction loss;
	
	public Regression(CFunction oracle, CFunction model, List<List<TBEncoding>> observations) {
		this.oracle = oracle;
		this.model = model;
		this.loss = averageModelOracleDistance(observations);
	}
	
	public CFunction modelOracleDistance(List<TBEncoding> observation) {
		return CFunction.compose(model.getArity() - oracle.getArity(), CFunction.diff(), 
				Arrays.asList(CFunction.constant(model.getArity() - oracle.getArity(), oracle.apply(observation)),
						model.fixPostfixArguments(observation))
				);
	}
	
	// The loss function
	public CFunction averageModelOracleDistance( List<List<TBEncoding>> observations) {
		return CFunction.sum(model.getArity() - oracle.getArity(), 
				observations.stream().map(x -> modelOracleDistance(x)).toList()
				);
	}
		
	// f(x) := averageModelOracleDistance(Model.apply(x,observations),Oracle(observations))
	public void regressParametersViaOptimisation(TernaryIntervalCode compactInterval, int epsilon) {
		new Optimisation(loss, compactInterval, epsilon).minimise_verbose();
	}
	
	public void regressParametersViaOptimisationBranchAndBound(TernaryIntervalCode compactInterval, int epsilon) {
		new OptimisationHeuristic(loss, compactInterval, epsilon).minimise_verbose();
	}
	
	// p(x) := averageModelOracleDistance(Model.apply(x,observations),Oracle(observations)) <= 2^epsilon
	public void regressParametersViaSearchUnary(TernaryIntervalCode compactInterval, int epsilon) {
		UCUnaryPredicate p = 
				new UCUnaryPredicate(loss,
									 UCUnaryPredicate.eq(new TBEncoding(0), epsilon),
									 compactInterval);
		new SearchUnary(p, compactInterval).search_verbose();
	}

	public void regressParametersViaSearchUnaryBranch(TernaryIntervalCode compactInterval, int epsilon) {
		UCUnaryPredicate p = 
				new UCUnaryPredicate(loss,
									 UCUnaryPredicate.eq(new TBEncoding(0), epsilon),
									 compactInterval);
		new SearchUnaryBranchAndBound(p, compactInterval).search_verbose();
	}
	
	public void regressParametersViaSearchBinary(Pair<TernaryIntervalCode,TernaryIntervalCode> compactInterval, int epsilon) {
		UCBinaryPredicate p = 
				new UCBinaryPredicate(loss,
									 UCUnaryPredicate.eq(new TBEncoding(0), epsilon),
									 compactInterval);
		new SearchBinary(p, compactInterval).search_verbose();
	}

	public void regressParametersViaSearchBinaryBranch(Pair<TernaryIntervalCode,TernaryIntervalCode> compactInterval, int epsilon) {
		UCBinaryPredicate p = 
				new UCBinaryPredicate(loss,
									 UCUnaryPredicate.eq(new TBEncoding(0), epsilon),
									 compactInterval);
		new SearchBinaryBranchAndBound(p, compactInterval).search_verbose();
	}
	
}
