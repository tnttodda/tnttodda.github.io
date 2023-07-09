package Search;

import FunctionsAndPredicates.UCUnaryPredicate;
import DyadicsAndIntervals.TBIntervalCode;
import TernaryBoehm.TBEncoding;

/*
 * This file implements search algorithms on unary predicates, with a branching approach.
 */

public class SearchUnaryBranchAndBound {
    UCUnaryPredicate predicate; // The predicate to search for
    int delta; // The modulus of uniform continuity of the predicate
    TBIntervalCode compactInterval; // The range [a,b]
    Boolean found = false; // Whether a real has been found
    TBIntervalCode answer; // The interval that contains the real, once found
    int intervalsChecked = 0; // The number of intervals checked
    long timeTaken; // The time taken to do the search

    // Constructor    
    public SearchUnaryBranchAndBound(UCUnaryPredicate predicate, TBIntervalCode compactInterval) {
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
    	intervalsChecked++;
        if (predicate.apply(new TBEncoding(compactInterval))) {
        	found = true;
        	answer = compactInterval;
        } else {
	        for (int prec = compactInterval.getPrec()+1; prec <= delta; prec++) {
	        	if (found) { break; }
	        	TBIntervalCode current = compactInterval.downLeft(prec - compactInterval.getPrec());
	            TBIntervalCode end = compactInterval.downRight(prec - compactInterval.getPrec());
	            while (!found && current.getCode().compareTo(end.getCode()) < 0) {
	            	intervalsChecked++;
	            	if (predicate.apply(new TBEncoding(current))) {
	            		found = true;
	            		answer = current;
	            		break;
	            	} else {
	            		current = current.next();
	            	}
	            }
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

