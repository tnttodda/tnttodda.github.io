package DyadicsAndIntervals;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import TernaryBoehm.TBEncoding;

/*
 * This class implements the type Z^2 of ternary Boehm interval codes.
 * The idea is that an element (l,p) : Z^2 is used to represent the interval [l/2^p,(l+2)/2^p].
 */
public class TBIntervalCode {
	
	// Every ternary Boehm interval code (l1,p1) : Z^2 is just the dyadic interval code (l,l+2,p) : Z^3
	private DyadicIntervalCode code;
	
	// Constructors
	
	public TBIntervalCode(BigInteger left, int prec) {
		this.code = new DyadicIntervalCode(left, left.add(BigInteger.TWO), prec);
	}
	
	public TBIntervalCode(Dyadic dyadic) {
		this.code = new DyadicIntervalCode(dyadic.getNum(), dyadic.getNum().add(BigInteger.TWO), dyadic.getDen());
	}
	
	public TBIntervalCode(TBEncoding x, int prec) {
		this.code = new DyadicIntervalCode(x.approx(prec), x.approx(prec).add(BigInteger.TWO), prec);
	}
	
	// Getter
	
	public DyadicIntervalCode getVariableIntervalCode() {
		return code;
	}
	
	public Dyadic getLeftEndpoint() {
		return code.getLeftEndpoint();
	}
	
	public Dyadic getRightEndpoint() {
		return code.getRightEndpoint();
	}
	
	public BigInteger getCode() {
		return code.getLeftCode();
	}
	
	public int getPrec() {
		return code.getPrec();
	}
	
	// Structural operations
	
	public TBIntervalCode prev() {
		return new TBIntervalCode(new Dyadic(code.getLeftCode().subtract(BigInteger.TWO), code.getPrec()));
	}
	
	public TBIntervalCode next() {
		return new TBIntervalCode(new Dyadic(code.getLeftCode().add(BigInteger.TWO), code.getPrec()));
	}
	
	public TBIntervalCode downLeft() {
		return new TBIntervalCode(code.downLeft());
	}
	
	public TBIntervalCode downMid() {
		return new TBIntervalCode(new Dyadic(code.getLeftCode().add(BigInteger.ONE), code.getPrec() + 1));
	}
	
	public TBIntervalCode downRight() {
		return new TBIntervalCode(code.downRight());
	}
	
	public TBIntervalCode downLeft(int n) {
		return new TBIntervalCode(code.downLeft(n));
	}
	
	public TBIntervalCode downRight(int n) {
		return new TBIntervalCode(code.downRight(n));
	}
	
	public TBIntervalCode upRight() {
		return new TBIntervalCode(code.getLeftEndpoint().upRight());
	}
	
	public TBIntervalCode upRight(int n) {
		return new TBIntervalCode(code.getLeftEndpoint().upRight(n));
	}
	
	// Conversion from dyadic interval code to ternary Boehm interval code
	
	public TBIntervalCode(DyadicIntervalCode variable) {
		this.code = variable.join_prime().getVariableIntervalCode();
	}
	
	// toString
	
	public String toString() {
		return "(" + code.getLeftCode() + "," + code.getPrec() + ")";
	}
	
	// Comparisons
	
    /*
     * A specific interval code is less than another specific interval code if
     * the left endpoint of the first is less than the left endpoint of the
     * second.
     */
    public boolean lessThan(TBIntervalCode sx, TBIntervalCode sy) {
        DyadicIntervalCode fx = sx.getVariableIntervalCode();
        DyadicIntervalCode fy = sy.getVariableIntervalCode();
        if (fx.getPrec() > fy.getPrec()) {
			fy = fy.down(fx.getPrec() - fy.getPrec());
		} else if (fx.getPrec() < fy.getPrec()) {
			fx = fx.down(fy.getPrec() - fx.getPrec());
		}
		return (fx.getLeftCode().compareTo(fy.getLeftCode()) <= 0);
    }

    /*
     * A variable interval code is less than another variable interval code if
     * the left endpoint of the first is less than the left endpoint of the
     * second.
     */
    public static boolean lessThan(DyadicIntervalCode fx, DyadicIntervalCode fy) {
        if (fx.getPrec() > fy.getPrec()) {
            fy = fy.down(fx.getPrec() - fy.getPrec());
        } else if (fx.getPrec() < fy.getPrec()) {
            fx = fx.down(fy.getPrec() - fx.getPrec());
        }
        return (fx.getLeftCode().compareTo(fy.getLeftCode()) <= 0);
    }

	public static boolean lessThanRight(DyadicIntervalCode fx, DyadicIntervalCode fy) {
        if (fx.getPrec() > fy.getPrec()) {
            fy = fy.down(fx.getPrec() - fy.getPrec());
        } else if (fx.getPrec() < fy.getPrec()) {
            fx = fx.down(fy.getPrec() - fx.getPrec());
        }
        return (fx.getRightCode().compareTo(fy.getRightCode()) <= 0);
    }
	
	// Discretize functions

	//discretize the range [a,b] into 2^Epsilon intervals
    public List<TBIntervalCode> discretize(int delta) {
		List<TBIntervalCode> frontier = new ArrayList<>();
        BigInteger current = downLeft(delta - getPrec()).getCode();
        BigInteger end = downRight(delta - getPrec()).getCode();
        while (current.compareTo(end) < 1) {
            frontier.add(new TBIntervalCode(new Dyadic(current,delta)));
            current = current.add(BigInteger.TWO);
        }  
        return frontier;
    }
    
    public static <T> List<List<T>> addMany(List<List<T>> collection, List<T> toAdd) {
		List<List<T>> newCollection = new ArrayList<>();
		for (int i = 0; i < collection.size(); i++) {
			for (int j = 0; j < toAdd.size(); j++) {
				List<T> newItem = new ArrayList<>(collection.get(i));
				newItem.add(toAdd.get(j));
				newCollection.add(newItem);
			}
		}
		return newCollection;
    }
    
    public static List<List<TBIntervalCode>> discretize(List<Integer> deltas, List<TBIntervalCode> inputs) {
    	List<List<TBIntervalCode>> discretised= Arrays.asList(new ArrayList<>());
    	for (int i = 0; i < inputs.size(); i++) {
    		discretised = addMany(discretised, inputs.get(i).discretize(deltas.get(i)));
    		
    	}
    	return discretised;
    }

}
