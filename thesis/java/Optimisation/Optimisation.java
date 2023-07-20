package Optimisation;

import java.util.ArrayList;
import java.util.List;

import DyadicsAndIntervals.DyadicIntervalCode;
import DyadicsAndIntervals.TernaryIntervalCode;
import FunctionsAndPredicates.CFunction;
import TernaryBoehm.TBEncoding;
import Utilities.Pair;

/*
 * This file implements optimisation algorithms, in particular the minimisation
 * of functions over intervals.
 * 
 * We can minimise functions to arbitrary precision, returning the interval
 * which minimises the output of the function over the input interval.
 * 
 * It provides timing information, so that the time taken to do the search can
 * be analysed, as well as the number of intervals that were checked. It also
 * provides an array of intermediate minimum intervals and outputs.
 */
public class Optimisation {
    CFunction function; // The function to search
    int epsilon; // The requested output precision level
    TernaryIntervalCode compactInterval; // The compact interval in which to optimise the function
    TernaryIntervalCode input; // The current interval that contains the minimum
    DyadicIntervalCode output; // The output of the function on the current minimum interval
    int intervalsChecked = 0; // The number of intervals checked
    long timeTaken; // The time taken to perform the search
    
    // Array to keep track of intermediate minimum intervals
    ArrayList<DyadicIntervalCode> answers = new ArrayList<DyadicIntervalCode>();
    // Array to keep track of the intervals to check, along with their corresponding outputs
    ArrayList<Pair<TernaryIntervalCode,DyadicIntervalCode>> frontier = new ArrayList<Pair<TernaryIntervalCode,DyadicIntervalCode>>(); 

    // Constructor
    public Optimisation(CFunction function, TernaryIntervalCode compactInterval, int epsilon) {
        this.function = function;
        this.compactInterval = compactInterval;
        this.epsilon = epsilon;
    }

    // Getters
    public ArrayList<Pair<TernaryIntervalCode,DyadicIntervalCode>> getFrontier() {
        return frontier;
    }

    public int getFrontierSize() {
        return frontier.size();
    }

    public TernaryIntervalCode getAnswer() {
        return input;
    }

    public TBEncoding getAnswerReal() {
        return new TBEncoding(input.getLeftEndpoint());
    }

    public Double getAnswerDouble(Integer precision) {
        TBEncoding tbr = getAnswerReal();
        return tbr.toDouble(precision);
    }

    public Double getAnswerDouble() {
        return getAnswerDouble(epsilon);
    }

    public long getTimeTaken() {
        return timeTaken;
    }

    public long getTimeTakenMillis() {
        return timeTaken / 1000000;
    }

    public DyadicIntervalCode getOutput() {
        return output;
    }

    public TBEncoding getOutputReal() {
        return new TBEncoding(output.getLeftEndpoint());
    }

    public Double getOutputDouble(Integer precision) {
        TBEncoding tbr = getOutputReal();
        return tbr.toDouble(precision);
    }

    public Double getOutputDouble() {
        return getOutputDouble(epsilon);
    }

    public ArrayList<DyadicIntervalCode> getAnswers() {
        return answers;
    }

    public String getAnswersString() {
        String s = "";
        for (DyadicIntervalCode answer : answers) {
            TBEncoding tbr = new TBEncoding(answer.getLeftEndpoint());
            s += tbr.toDouble(epsilon) + "\n";
        }
        return s;
    }

    public String getAnswersOutputsString() {
        String s = "";
        for (DyadicIntervalCode answer : answers) {
            DyadicIntervalCode output = function.applyApproximator(answer);
            TBEncoding tbr = new TBEncoding(answer.getLeftEndpoint());
            TBEncoding ans = new TBEncoding(output.getLeftEndpoint());
            s += tbr.toDouble(epsilon) + " -> " + ans.toDouble(epsilon) + "\n";
        }
        return s;
    }

    public void printAnswersOutputsString() {
        for (DyadicIntervalCode answer : answers) {
            DyadicIntervalCode output = function.applyApproximator(answer);
            TBEncoding tbr = new TBEncoding(answer.getLeftEndpoint());
            TBEncoding ans = new TBEncoding(output.getLeftEndpoint());
            System.out.println(tbr.toDouble(epsilon) + " -> " + ans.toDouble(epsilon));
        }
    }

    public int getAnswersSize() {
        return answers.size();
    }

    

    // Methods
    
    ArrayList<Pair<TernaryIntervalCode,DyadicIntervalCode>> initialise() {
        int delta = function.getUniformContinuityOracle(compactInterval).apply(epsilon).get(0);
        List<TernaryIntervalCode> inputs = compactInterval.discretize(delta);
        for (TernaryIntervalCode interval : inputs) {
            DyadicIntervalCode output = function.applyApproximator(interval.getDyadicIntervalCode());
            frontier.add(new Pair<TernaryIntervalCode,DyadicIntervalCode>(interval, output));
        }

        input = frontier.get(0).getFst();
        output = frontier.get(0).getSnd();

        return frontier;
    }

    Boolean check() {
        Pair<TernaryIntervalCode,DyadicIntervalCode> intervalOutput = frontier.remove(0);
        TernaryIntervalCode interval = intervalOutput.getFst();
        DyadicIntervalCode output = intervalOutput.getSnd();
        if (TernaryIntervalCode.lessThan(output, this.output)) {
        	this.input = interval;
            this.output = output;
            answers.add(interval.getDyadicIntervalCode());
            return true;
        } else {
            return false;
        }
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

    public void minimise_verbose() {
        long startTime = System.nanoTime();
        minimise();
        timeTaken = System.nanoTime() - startTime;
        System.out.println("Intervals checked: " + intervalsChecked);
        System.out.println("Time taken: " + getTimeTakenMillis() + "ms");
        System.out.println("Minimum interval code: " + getAnswer());
        System.out.println("Minimum interval: " + getAnswerDouble());
        System.out.println("Minimum output: " + getOutputDouble());
    }

    void minimise_verbose_number_answers() {
        minimise_verbose();
        System.out.println("Number of answers: " + getAnswersSize());
    }

}