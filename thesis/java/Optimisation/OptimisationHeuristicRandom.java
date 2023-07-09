package Optimisation;

import DyadicsAndIntervals.DyadicIntervalCode;
import DyadicsAndIntervals.TBIntervalCode;
import FunctionsAndPredicates.CFunction;
import Utilities.Pair;

/*
 * This class is a modification of the minimisation_heuristic class, which 
 * chooses a random interval from the frontier to check, rather than always
 * checking the first interval in the frontier.
 */
public class OptimisationHeuristicRandom extends OptimisationHeuristic {
    public OptimisationHeuristicRandom(CFunction function, TBIntervalCode compactInterval, int epsilon) {
        super(function, compactInterval, epsilon);
    }

    void sort() {
        int index = (int) (Math.random() * frontier.size());
        Pair<TBIntervalCode,DyadicIntervalCode> intervalOutput = frontier.remove(index);
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