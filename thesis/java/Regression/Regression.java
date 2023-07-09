package Regression;

import java.util.Arrays;
import java.util.List;
import DyadicsAndIntervals.TBIntervalCode;
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
	List<List<TBEncoding>> observations; // The input observations
	
	public Regression(CFunction oracle, CFunction model, List<List<TBEncoding>> observations) {
		this.oracle = oracle;
		this.model = model;
		this.observations = observations;
	}
	
	public CFunction modelOracleDistance(List<TBEncoding> observation) {
		return CFunction.compose(model.getArity() - oracle.getArity(), CFunction.diff(), 
				Arrays.asList(CFunction.constant(model.getArity() - oracle.getArity(), oracle.apply(observation)),
						model.fixPostfixArguments(observation))
				);
	}
	
	// The loss function
	public CFunction averageModelOracleDistance() {
		return CFunction.sum(model.getArity() - oracle.getArity(), 
				observations.stream().map(x -> modelOracleDistance(x)).toList()
				);
	}
		
	// f(x) := averageModelOracleDistance(Model.apply(x,observations),Oracle(observations))
	public void regressParametersViaOptimisation(TBIntervalCode compactInterval, int epsilon) {
		new Optimisation(averageModelOracleDistance(), compactInterval, epsilon).minimise_verbose();
	}
	
	public void regressParametersViaOptimisationBranchAndBound(TBIntervalCode compactInterval, int epsilon) {
		new OptimisationHeuristic(averageModelOracleDistance(), compactInterval, epsilon).minimise_verbose();
	}
	
	// p(x) := averageModelOracleDistance(Model.apply(x,observations),Oracle(observations)) <= 2^epsilon
	public void regressParametersViaSearchUnary(TBIntervalCode compactInterval, int epsilon) {
		UCUnaryPredicate p = 
				new UCUnaryPredicate(averageModelOracleDistance(),
									 UCUnaryPredicate.eq(new TBEncoding(0), epsilon),
									 compactInterval);
		new SearchUnary(p, compactInterval).search_verbose();
	}

	public void regressParametersViaSearchUnaryBranch(TBIntervalCode compactInterval, int epsilon) {
		UCUnaryPredicate p = 
				new UCUnaryPredicate(averageModelOracleDistance(),
									 UCUnaryPredicate.eq(new TBEncoding(0), epsilon),
									 compactInterval);
		new SearchUnaryBranchAndBound(p, compactInterval).search_verbose();
	}
	
	public void regressParametersViaSearchBinary(Pair<TBIntervalCode,TBIntervalCode> compactInterval, int epsilon) {
		UCBinaryPredicate p = 
				new UCBinaryPredicate(averageModelOracleDistance(),
									 UCUnaryPredicate.eq(new TBEncoding(0), epsilon),
									 compactInterval);
		new SearchBinary(p, compactInterval).search_verbose();
	}

	public void regressParametersViaSearchBinaryBranch(Pair<TBIntervalCode,TBIntervalCode> compactInterval, int epsilon) {
		UCBinaryPredicate p = 
				new UCBinaryPredicate(averageModelOracleDistance(),
									 UCUnaryPredicate.eq(new TBEncoding(0), epsilon),
									 compactInterval);
		new SearchBinaryBranchAndBound(p, compactInterval).search_verbose();
	}
	
}
