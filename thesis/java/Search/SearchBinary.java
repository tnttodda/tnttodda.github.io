package Search;

import FunctionsAndPredicates.UCBinaryPredicate;
import DyadicsAndIntervals.TernaryIntervalCode;
import TernaryBoehm.TBEncoding;
import Utilities.Pair;

/*
 * This file implements search algorithms on binary predicates.
 */

public class SearchBinary {
    UCBinaryPredicate predicate; // The predicate to search for
    Pair<Integer,Integer> delta; // The modulus of uniform continuity of the predicate
    Pair<TernaryIntervalCode,TernaryIntervalCode> compactInterval; // The range of each argument
    Boolean found = false; // Whether a real has been found
    Pair<TernaryIntervalCode,TernaryIntervalCode> answer; // The interval that contains the real, once found
    int intervalsChecked = 0; // The number of intervals checked
    long timeTaken; // The time taken to do the search

    // Constructor    
    public SearchBinary(UCBinaryPredicate predicate, Pair<TernaryIntervalCode, TernaryIntervalCode> compactInterval) {
        this.predicate = predicate;
        this.delta = predicate.getDelta();
        this.compactInterval = compactInterval;
    }

    // Getters
    public UCBinaryPredicate getPredicate() {
        return predicate;
    }

    public Boolean getFound() {
        return found;
    }

    public Pair<TernaryIntervalCode, TernaryIntervalCode> getAnswer() {
        return answer;
    }

    public Pair<TBEncoding,TBEncoding> getAnswerReal() {
        return new Pair<>(new TBEncoding(answer.getFst()),new TBEncoding(answer.getSnd()));
    }

    public Pair<Double,Double> getAnswerDouble() {
    	return new Pair<>(getAnswerReal().getFst().toDouble(delta.getFst())
    					, getAnswerReal().getSnd().toDouble(delta.getSnd()));
    }

    public TernaryIntervalCode getAnswer2() {
        return answer.getSnd();
    }

    public TBEncoding getAnswerReal2() {
        return new TBEncoding(getAnswer2());
    }

    public Double getAnswerDouble2() {
    	return getAnswerReal2().toDouble(delta.getSnd());
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
        TernaryIntervalCode current1 = compactInterval.getFst().downLeft(delta.getFst() - compactInterval.getFst().getPrec());
        TernaryIntervalCode end1 = compactInterval.getFst().downRight(delta.getFst() - compactInterval.getFst().getPrec());
        TernaryIntervalCode start2 = compactInterval.getFst().downLeft(delta.getSnd() - compactInterval.getSnd().getPrec());
        TernaryIntervalCode current2 = start2;
        TernaryIntervalCode end2 = compactInterval.getFst().downRight(delta.getSnd() - compactInterval.getSnd().getPrec());
        while (!found && current1.getCode().compareTo(end1.getCode()) < 0) {
            while (!found && current2.getCode().compareTo(end2.getCode()) < 0) {
            	intervalsChecked++;
	        	if (predicate.apply(new TBEncoding(current1), new TBEncoding(current2))) {
	        		found = true;
	        		answer = new Pair<>(current1, current2);
	        	} else {
	        		current2 = current2.next();
	        	}
        	}
            current2 = start2;
        	current1 = current1.next();
        }
        timeTaken = System.nanoTime() - startTime;
        return found;
    }

    public Boolean search_verbose() {
        search();
        System.out.println("Intervals checked: " + intervalsChecked);
        System.out.println("Time taken: " + getTimeTakenMillis() + "ms");
        if (found) {
        	System.out.println("Intervals found: " + getAnswer());
            System.out.println("Reals found: " + getAnswerDouble());
        } else {
            System.out.println("No real found");
        }
        return found;
    }

}

