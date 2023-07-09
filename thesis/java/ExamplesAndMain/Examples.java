package ExamplesAndMain;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.List;

import DyadicsAndIntervals.Dyadic;
import DyadicsAndIntervals.DyadicIntervalCode;
import DyadicsAndIntervals.TBIntervalCode;
import FunctionsAndPredicates.CFunction;
import FunctionsAndPredicates.UCBinaryPredicate;
import FunctionsAndPredicates.UCUnaryPredicate;
import Optimisation.OptimisationHeuristic;
import Optimisation.OptimisationHeuristicDifferential;
import Optimisation.OptimisationHeuristicRandom;
import Optimisation.Optimisation;
import Regression.Regression;
import Search.SearchBinary;
import Search.SearchUnary;
import Search.SearchUnaryBranchAndBound;
import TernaryBoehm.TBEncoding;
import Utilities.Pair;

public class Examples {

    // Reals
	TBEncoding zero = new TBEncoding(0);
	TBEncoding one = new TBEncoding(1);
	TBEncoding three = new TBEncoding(3);
    TBEncoding minus_one = new TBEncoding(-1);
    TBEncoding half = new TBEncoding(new Dyadic(BigInteger.ONE, 1));
    TBEncoding minus_half = half.negate();
    TBEncoding third = one.divide(three);
    TBEncoding ninethousand = new TBEncoding(9000);
    TBEncoding sixteen = new TBEncoding(16);

    // Intervals

    // [-1,1]
    TBIntervalCode minus_one_one = new TBIntervalCode(BigInteger.valueOf(-1), 0);
    // [-2,2]
    TBIntervalCode minus_two_two = new TBIntervalCode(BigInteger.valueOf(-1), -1);
    // [-4,4]
    TBIntervalCode minus_four_four = new TBIntervalCode(BigInteger.valueOf(-1), -2);
    // [-32,-16]
    TBIntervalCode minus_thirtytwo_minus_sixteen = new TBIntervalCode(BigInteger.valueOf(-4), -3);
    // [16, 24]
    TBIntervalCode sixteen_twentyfour = new TBIntervalCode(BigInteger.valueOf(4), -2);
    
    // p(x) := | mul(x,x) - 1/2 | <= 2^-epsilon
    public void search_1(int epsilon) {
    	UCUnaryPredicate p = new UCUnaryPredicate(CFunction.pow(2), UCUnaryPredicate.eq(half, epsilon), minus_one_one);
    	new SearchUnary(p, minus_one_one).search_verbose();
    }
    
    public void search_1_branch(int epsilon) {
    	UCUnaryPredicate p = new UCUnaryPredicate(CFunction.pow(2), UCUnaryPredicate.eq(half, epsilon), minus_one_one);
    	new SearchUnaryBranchAndBound(p, minus_one_one).search_verbose();
    }
   
    // p(x,y) := |mid(x,y) - 0 | <= 2^-epsilon
    public void search_2(int epsilon) {
    	UCBinaryPredicate p = new UCBinaryPredicate(CFunction.mid(), UCUnaryPredicate.eq(zero, epsilon), 
    			new Pair<>(minus_one_one, minus_one_one));
    	new SearchBinary(p, new Pair<>(minus_one_one, minus_one_one)).search_verbose();
    }
    
    // p(x) := x^3 + 3x >= 9000
    public void search_3(int epsilon) {
    	CFunction fun = CFunction.compose(1, CFunction.add(), 
    				Arrays.asList(CFunction.pow(3), CFunction.constantMul(three)));
    	UCUnaryPredicate p 
    		= new UCUnaryPredicate(fun, UCUnaryPredicate.geq(ninethousand, epsilon), sixteen_twentyfour);
    	new SearchUnary(p, sixteen_twentyfour).search_verbose();
    }
    
    public void search_3_branch(int epsilon) {
    	CFunction fun = CFunction.compose(1, CFunction.add(), 
    				Arrays.asList(CFunction.pow(3), CFunction.constantMul(three)));
    	UCUnaryPredicate p 
    		= new UCUnaryPredicate(fun, UCUnaryPredicate.geq(ninethousand, epsilon), sixteen_twentyfour);
    	new SearchUnaryBranchAndBound(p, sixteen_twentyfour).search_verbose();
    }
    
    // f(x) := x * -1
    public void optimisation_1(int epsilon) {
    	CFunction fun = CFunction.constantMul(minus_one);
    	new Optimisation(fun, minus_one_one, epsilon).minimise_verbose();
    }
    
    public void optimisation_1_branchandbound(int epsilon) {
    	CFunction fun = CFunction.constantMul(minus_one);
    	new OptimisationHeuristic(fun, minus_one_one, epsilon).minimise_verbose();
    }
    
    // f(x) = x^6 - x^4 + x^3 + x^2
    public void optimisation_2(int epsilon) {
    	CFunction fun = CFunction.unaryPolynomial(
    	        Arrays.asList(
    	    	        new Pair<>(new TBEncoding(1),6),
    	    		    new Pair<>(new TBEncoding(-1),4),
    	    		    new Pair<>(new TBEncoding(1),3),
    	    		    new Pair<>(new TBEncoding(1),2)
    	            )
    	        );
    	new Optimisation(fun, minus_two_two, epsilon).minimise_verbose();
    }
    
    public void optimisation_2_branchandbound(int epsilon) {
    	CFunction fun = CFunction.unaryPolynomial(
    	        Arrays.asList(
    	    	        new Pair<>(new TBEncoding(1),6),
    	    		    new Pair<>(new TBEncoding(-1),4),
    	    		    new Pair<>(new TBEncoding(1),3),
    	    		    new Pair<>(new TBEncoding(1),2)
    	            )
    	        );
    	new OptimisationHeuristic(fun, minus_two_two, epsilon).minimise_verbose();
    }
    
    public void regression_1_optimisation(int epsilon) {
    	CFunction model = CFunction.compose(2, CFunction.mid(), 
    			Arrays.asList(
    					CFunction.compose(2, CFunction.negate(),
    						Arrays.asList(CFunction.proj(2, 0))),
    					CFunction.proj(2, 1)));
    	CFunction oracle = model.fixPrefixArguments(Arrays.asList(third));
    	List<List<TBEncoding>> observations 
    		= Arrays.asList(Arrays.asList(minus_one),
    						Arrays.asList(zero),
    						Arrays.asList(one));
    	new Regression(oracle, model, observations).regressParametersViaOptimisation(minus_one_one, epsilon);
    }
    
    public void regression_1_optimisation_branch(int epsilon) {
    	CFunction model = CFunction.compose(2, CFunction.mid(), 
    			Arrays.asList(
    					CFunction.compose(2, CFunction.negate(),
    						Arrays.asList(CFunction.proj(2, 0))),
    					CFunction.proj(2, 1)));
    	CFunction oracle = model.fixPrefixArguments(Arrays.asList(third));
    	List<List<TBEncoding>> observations 
    		= Arrays.asList(Arrays.asList(minus_one),
    						Arrays.asList(zero),
    						Arrays.asList(one));
    	new Regression(oracle, model, observations).regressParametersViaOptimisationBranchAndBound(minus_one_one, epsilon);
    }
    
    public void regression_1_search(int epsilon) {
    	CFunction model = CFunction.compose(2, CFunction.mid(), 
    			Arrays.asList(
    					CFunction.compose(2, CFunction.negate(),
    						Arrays.asList(CFunction.proj(2, 0))),
    					CFunction.proj(2, 1)));
    	CFunction oracle = model.fixPrefixArguments(Arrays.asList(third));
    	List<List<TBEncoding>> observations 
    		= Arrays.asList(Arrays.asList(minus_one),
    						Arrays.asList(zero),
    						Arrays.asList(one));
    	new Regression(oracle, model, observations).regressParametersViaSearchUnary(minus_one_one, epsilon);
    }
    
    public void regression_1_search_branch(int epsilon) {
    	CFunction model = CFunction.compose(2, CFunction.mid(), 
    			Arrays.asList(
    					CFunction.compose(2, CFunction.negate(),
    						Arrays.asList(CFunction.proj(2, 0))),
    					CFunction.proj(2, 1)));
    	CFunction oracle = model.fixPrefixArguments(Arrays.asList(third));
    	List<List<TBEncoding>> observations 
    		= Arrays.asList(Arrays.asList(minus_one),
    						Arrays.asList(zero),
    						Arrays.asList(one));
    	new Regression(oracle, model, observations).regressParametersViaSearchUnaryBranch(minus_one_one, epsilon);
    }
    
    public void regression_2_search(int epsilon) {
    	CFunction model = CFunction.compose(3, CFunction.add(), 
    			Arrays.asList(
    					CFunction.proj(3, 0),
    					CFunction.compose(3, CFunction.multiply(),
    							Arrays.asList(CFunction.proj(3, 1), CFunction.proj(3, 2))
    							)));
    	CFunction oracle = model.fixPrefixArguments(Arrays.asList(half,minus_one));
    	List<List<TBEncoding>> observations 
    		= Arrays.asList(Arrays.asList(minus_half),
    						Arrays.asList(half));
    	new Regression(oracle, model, observations).regressParametersViaSearchBinary(
    			new Pair<>(minus_one_one, minus_one_one), epsilon);
    }
    
    public void regression_2_search_branch(int epsilon) {
    	CFunction model = CFunction.compose(3, CFunction.add(), 
    			Arrays.asList(
    					CFunction.proj(3, 0),
    					CFunction.compose(3, CFunction.multiply(),
    							Arrays.asList(CFunction.proj(3, 1), CFunction.proj(3, 2))
    							)));
    	CFunction oracle = model.fixPrefixArguments(Arrays.asList(half,minus_one));
    	List<List<TBEncoding>> observations 
    		= Arrays.asList(Arrays.asList(minus_half),
    						Arrays.asList(half));
    	new Regression(oracle, model, observations).regressParametersViaSearchBinaryBranch(
    			new Pair<>(minus_one_one, minus_one_one), epsilon);
    }

}
