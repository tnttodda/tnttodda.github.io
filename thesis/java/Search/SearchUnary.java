package Search;

import FunctionsAndPredicates.UCUnaryPredicate;
import DyadicsAndIntervals.TBIntervalCode;
import TernaryBoehm.TBEncoding;

/*
 * This file implements search algorithms on unary predicates of the 
 * ternary Boehm encodings.
 * 
 * The goal of these algorithms is to search a given Predicate, which has
 * modulus of uniform continuity delta; i.e., given a predicate P and input 
 * ternary interval code, (k,p), find a value x such that P(x) = true, 
 * with k/2^p <= x <= (k+2)/2^p.
 *    
 * This file describes the unary case, while another describes the binary case.
 *
 * The methods return values so that the search can be done in a step-by-step 
 * manner, and the intermediate results can be inspected, but a search can 
 * also be done in one step. It also provides timing information, so that the 
 * time taken to do the search can be analysed, as well as the number of
 * intervals that were checked.
 */

public class SearchUnary {
    UCUnaryPredicate predicate; // The predicate to search for
    int delta; // The modulus of uniform continuity of the predicate
    TBIntervalCode compactInterval; // The range [a,b]
    Boolean found = false; // Whether a real has been found
    TBIntervalCode answer; // The interval that contains the real, once found
    int intervalsChecked = 0; // The number of intervals checked
    long timeTaken; // The time taken to do the search

    // Constructor    
    public SearchUnary(UCUnaryPredicate predicate, TBIntervalCode compactInterval) {
        this.predicate = predicate;
        this.delta = predicate.getDelta();
        this.compactInterval = compactInterval;
    }

    // Getters
    public UCUnaryPredicate getPredicate() {
        return predicate;
    }

    public Boolean getFound() {
        return found;
    }

    public TBIntervalCode getAnswer() {
        return answer;
    }

    public TBEncoding getAnswerReal() {
        return new TBEncoding(getAnswer().getLeftEndpoint());
    }

    public Double getAnswerDouble() {
    	return getAnswerReal().toDouble(delta);
    }
    
    public long getTimeTaken() {
        return timeTaken;
    }

    public long getTimeTakenMillis() {
        return timeTaken / 1000000;
    }

    public int getIntervalsChecked() {
        return intervalsChecked;
    }

    // Methods
 
    Boolean search() {
        long startTime = System.nanoTime();
        TBIntervalCode current = compactInterval.downLeft(delta - compactInterval.getPrec());
        TBIntervalCode end = compactInterval.downRight(delta - compactInterval.getPrec());
        while (!found && current.getCode().compareTo(end.getCode()) < 0) {
        	intervalsChecked++;
        	if (predicate.apply(new TBEncoding(current))) {
        		found = true;
        		answer = current;
        	} else {
        		current = current.next();
        	}
        }
        timeTaken = System.nanoTime() - startTime;
        return found;
    }

    public Boolean search_verbose() {
        search();
        System.out.println("Intervals checked: " + intervalsChecked);
        System.out.println("Time taken: " + getTimeTakenMillis() + "ms");
        if (found) {
        	System.out.println("Interval found: " + getAnswer());
            System.out.println("Real found: " + getAnswerDouble());
        } else {
            System.out.println("No real found");
        }
        return found;
    }

}

