package Optimisation;

import java.math.BigInteger;

import DyadicsAndIntervals.DyadicIntervalCode;
import DyadicsAndIntervals.TernaryIntervalCode;
import FunctionsAndPredicates.CFunction;
import Utilities.Pair;

/*
* This class is a modification of the minimisation_heuristic class, which
* ranks the intervals in the frontier by the size of their output intervals,
* and then checks the interval with the largest output interval.
* 
* Since all intervals in the frontier have the same input interval, the
* interval with the largest output interval is the one with the largest
* "derivative". After processing a few layers of precision, we would expect
* this heuristic to remove a large proportion of the frontier, and thus
* reduce the number of intervals that need to be checked.
*/ 
public class OptimisationHeuristicDifferential extends OptimisationHeuristic {
    public OptimisationHeuristicDifferential(CFunction function, TernaryIntervalCode compactInterval, int epsilon) {
        super(function, compactInterval, epsilon);
    }

    boolean isWider(DyadicIntervalCode fx, DyadicIntervalCode fy) {
        if (fx.getPrec() > fy.getPrec()) {
            fy = fy.down(fx.getPrec() - fy.getPrec());
        } else if (fx.getPrec() < fy.getPrec()) {
            fx = fx.down(fy.getPrec() - fx.getPrec());
        }
        BigInteger fxWidth = fx.getRightCode().subtract(fx.getLeftCode());
        BigInteger fyWidth = fy.getRightCode().subtract(fy.getLeftCode());
        return fxWidth.compareTo(fyWidth) > 0;
    }

    // don't need to 'sort' as such, just move the interval with the largest output to the front
    void sort() {
        int index = 0;
        DyadicIntervalCode largest = frontier.get(0).getSnd();
        for (int i = 1; i < frontier.size(); i++) {
            if (isWider(frontier.get(i).getSnd(), largest)) {
                index = i;
                largest = frontier.get(i).getSnd();
            }
        }
        Pair<TernaryIntervalCode,DyadicIntervalCode> intervalOutput = frontier.remove(index);
        frontier.add(0, intervalOutput);
    }

    void minimise() {
        long startTime = System.nanoTime();     
        initialise();
        while (frontier.size() > 0) {
            intervalsChecked++;
            sort();
            check();
        }
        timeTaken = System.nanoTime() - startTime;
    }

}