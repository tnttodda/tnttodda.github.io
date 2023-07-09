package Optimisation;

import java.util.ArrayList;

import DyadicsAndIntervals.DyadicIntervalCode;
import DyadicsAndIntervals.TBIntervalCode;
import FunctionsAndPredicates.CFunction;
import Utilities.Pair;

/*
 * Unlike with search, we can't use some heuristic to speed up optimisation when 
 * considering intervals at the requested precision level. This is because we need to
 * consider all intervals at the requested precision level, since we don't know which
 * one will be the minimum.
 * 
 * We can, however, use a heuristic to potentially speed up the search when 
 * considering intervals at a higher precision level. This is because we can
 * use the heuristic to rule out intervals that we know can't contain the minimum.
 * Pruning the search space at lower precision levels can reduce the search
 * space at higher precision levels.
 * 
 * This form of optimisation algorithm is called 'branch-and-bound'.
 * 
 * Beginning from the input ternary interval code, we *branch* into the two 
 * (almost) disjoint ternary interval codes below it. We then apply the function
 * to these and receive dyadic interval codes, which give the *bounds*
 * on the outputs that the function could return on these input intervals. 
 * 
 * Then, if we have a dyadic interval code which is "eclipsed" by the current 
 * minimum output, then we know that this code cannot contain the minimum output, 
 * and so we can remove it from the frontier without considering any of 
 * its subintervals.
 */
public class OptimisationHeuristic extends Optimisation {
	int delta;
	
    public OptimisationHeuristic(CFunction function, TBIntervalCode compactInterval, int epsilon) {
        super(function, compactInterval, epsilon);
        delta = function.getUniformContinuityOracle(compactInterval).apply(epsilon).get(0);
    }

    // Methods

    /*
     * Initialise the frontier with the initial interval and its output.
     */
    ArrayList<Pair<TBIntervalCode,DyadicIntervalCode>> initialise() {
        DyadicIntervalCode input = compactInterval.getVariableIntervalCode();
        DyadicIntervalCode output = function.applyApproximator(input);
        frontier.add(new Pair<TBIntervalCode,DyadicIntervalCode>(compactInterval, output));
        return frontier;
    }

    /*
     * Check the next interval in the frontier. If it is eclipsed by the current
     * minimum output, then remove it from the frontier without considering any
     * of its subintervals. Otherwise, add its subintervals to the frontier.
     * 
     * If we are at the right precision level, then we can check if the output
     * is less than the current minimum output. If it is, then we have found
     * a new minimum output, and we can add the interval to the answers.
     */
    Boolean check() {
        Pair<TBIntervalCode,DyadicIntervalCode> intervalOutput = frontier.remove(0);
        TBIntervalCode interval = intervalOutput.getFst();
        TBIntervalCode leftsi = interval.downLeft();
        TBIntervalCode rightsi = interval.downRight();
        DyadicIntervalCode leftvi = function.applyApproximator(leftsi.getVariableIntervalCode());
        DyadicIntervalCode rightvi = function.applyApproximator(rightsi.getVariableIntervalCode());

        Pair<TBIntervalCode,DyadicIntervalCode> left = new Pair<TBIntervalCode,DyadicIntervalCode>(leftsi, leftvi);
        Pair<TBIntervalCode,DyadicIntervalCode> right = new Pair<TBIntervalCode,DyadicIntervalCode>(rightsi, rightvi);

//        System.out.println(leftsi.getVariableIntervalCode().toDoubleString() + " ---> " + leftvi.toDoubleString());
//        System.out.println(rightsi.getVariableIntervalCode().toDoubleString() + " ---> " + rightvi.toDoubleString());
        
        if (!eclipsed(leftvi, rightvi) && !eclipsed(leftvi , answers)) {
            if (leftsi.getPrec() >= delta || leftvi.join_prime().getPrec() >= epsilon) {
                if (this.output == null) {
                    this.input = leftsi;
                    this.output = leftvi;
                    answers.add(leftvi);
                } else {
                    if (TBIntervalCode.lessThan(leftvi, this.output)) {
                        this.input = leftsi;
                        this.output = leftvi;
                        answers.add(leftvi);
                    } 
                }
            } else {
//            	System.out.println(" >>" + left);
                frontier.add(left);
                removeEclipsedFromFrontier(leftvi);
            }
        }
            
        if (!eclipsed(rightvi, leftvi) && !eclipsed(rightvi , answers)) {
            if (rightsi.getPrec() >= delta || rightvi.join_prime().getPrec() >= epsilon) {
                if (this.output == null) {
                    this.input = rightsi;
                    this.output = rightvi;
                    answers.add(rightvi);
                } else {
                    if (TBIntervalCode.lessThan(rightvi, this.output)) {
                        this.input = rightsi;
                        this.output = rightvi;
                        answers.add(rightvi);
                    } 
                }
            } else {
//            	System.out.println(" >>" + right);
                frontier.add(right);
                removeEclipsedFromFrontier(rightvi);
            }
        }

        return false;
        
    }

    void minimise() {
        long startTime = System.nanoTime();     
        initialise();
        while (frontier.size() > 0) {
            intervalsChecked++;
            check();
        }
        timeTaken = System.nanoTime() - startTime;
    }
    
    /*
     * This function returns true if the given interval is eclipsed by any of
     * the intervals in the frontier.
     */
    boolean eclipsed(DyadicIntervalCode vi) {
        for (Pair<TBIntervalCode,DyadicIntervalCode> p : frontier) {
            if (DyadicIntervalCode.eclipses(p.getSnd() , vi)) {
                return true;
            }
        }
        return false;
    }

    /*
     * This function returns true if the given interval is eclipsed by any of
     * the frontier or another given interval.
     */
    boolean eclipsed(DyadicIntervalCode vi, DyadicIntervalCode vi2) {
        if (DyadicIntervalCode.eclipses(vi,vi2)) {
            return true;
        }
        return eclipsed(vi);
    }

    /*
     * This function returns true if the given interval is eclipsed by any of
     * the intervals the answers.
     */
    boolean eclipsed(DyadicIntervalCode vi, ArrayList<DyadicIntervalCode> answers) {
        for (DyadicIntervalCode v : answers) {
            if (DyadicIntervalCode.eclipses(v,vi)) {
                return true;
            }
        }
        return false;
    }
    
    /*
     * This function removes every interval from the frontier that is eclipsed by the
     * parameter 'output'
     */
    public void removeEclipsedFromFrontier(DyadicIntervalCode output) {
        for (int i = 0; i < frontier.size(); i++) {
            Pair<TBIntervalCode,DyadicIntervalCode> intervalOutput = frontier.get(i);
            DyadicIntervalCode output2 = intervalOutput.getSnd();
            if (DyadicIntervalCode.eclipses(output, output2)) {
            	frontier.remove(i);
                i--;
            }
        }
    }
    
}