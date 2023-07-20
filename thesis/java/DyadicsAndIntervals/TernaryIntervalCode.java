package DyadicsAndIntervals;

import java.math.BigInteger;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import TernaryBoehm.TBEncoding;

/*
 * This class implements the type Z^2 of ternary interval codes.
 * The idea is that an element (l,p) : Z^2 is used to represent the interval [l/2^p,(l+2)/2^p].
 */
public class TernaryIntervalCode {
	
	// Every ternary interval code (l1,p1) : Z^2 is just the dyadic interval code (l,l+2,p) : Z^3
	private DyadicIntervalCode code;
	
	// Constructors
	
	public TernaryIntervalCode(BigInteger left, int prec) {
		this.code = new DyadicIntervalCode(left, left.add(BigInteger.TWO), prec);
	}
	
	public TernaryIntervalCode(Dyadic dyadic) {
		this.code = new DyadicIntervalCode(dyadic.getNum(), dyadic.getNum().add(BigInteger.TWO), dyadic.getDen());
	}
	
	public TernaryIntervalCode(TBEncoding x, int prec) {
		this.code = new DyadicIntervalCode(x.approx(prec), x.approx(prec).add(BigInteger.TWO), prec);
	}
	
	// Getter
	
	public DyadicIntervalCode getDyadicIntervalCode() {
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
	
	public TernaryIntervalCode prev() {
		return new TernaryIntervalCode(new Dyadic(code.getLeftCode().subtract(BigInteger.TWO), code.getPrec()));
	}
	
	public TernaryIntervalCode next() {
		return new TernaryIntervalCode(new Dyadic(code.getLeftCode().add(BigInteger.TWO), code.getPrec()));
	}
	
	public TernaryIntervalCode downLeft() {
		return new TernaryIntervalCode(code.downLeft());
	}
	
	public TernaryIntervalCode downMid() {
		return new TernaryIntervalCode(new Dyadic(code.getLeftCode().add(BigInteger.ONE), code.getPrec() + 1));
	}
	
	public TernaryIntervalCode downRight() {
		return new TernaryIntervalCode(code.downRight());
	}
	
	public TernaryIntervalCode downLeft(int n) {
		return new TernaryIntervalCode(code.downLeft(n));
	}
	
	public TernaryIntervalCode downRight(int n) {
		return new TernaryIntervalCode(code.downRight(n));
	}
	
	public TernaryIntervalCode upRight() {
		return new TernaryIntervalCode(code.getLeftEndpoint().upRight());
	}
	
	public TernaryIntervalCode upRight(int n) {
		return new TernaryIntervalCode(code.getLeftEndpoint().upRight(n));
	}
	
	// Conversion from dyadic interval code to ternary interval code
	
	public TernaryIntervalCode(DyadicIntervalCode variable) {
		this.code = variable.join_prime().getDyadicIntervalCode();
	}
	
	// toString
	
	public String toString() {
		return "(" + code.getLeftCode() + "," + code.getPrec() + ")";
	}
	
	// Comparisons
	
    /*
     * A ternary interval code is less than another ternary interval code if
     * the left endpoint of the first is less than the left endpoint of the
     * second.
     */
    public boolean lessThan(TernaryIntervalCode sx, TernaryIntervalCode sy) {
        DyadicIntervalCode fx = sx.getDyadicIntervalCode();
        DyadicIntervalCode fy = sy.getDyadicIntervalCode();
        if (fx.getPrec() > fy.getPrec()) {
			fy = fy.down(fx.getPrec() - fy.getPrec());
		} else if (fx.getPrec() < fy.getPrec()) {
			fx = fx.down(fy.getPrec() - fx.getPrec());
		}
		return (fx.getLeftCode().compareTo(fy.getLeftCode()) <= 0);
    }

    /*
     * A dyadic interval code is less than another dyadic interval code if
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
    public List<TernaryIntervalCode> discretize(int delta) {
		List<TernaryIntervalCode> frontier = new ArrayList<>();
        BigInteger current = downLeft(delta - getPrec()).getCode();
        BigInteger end = downRight(delta - getPrec()).getCode();
        while (current.compareTo(end) < 1) {
            frontier.add(new TernaryIntervalCode(new Dyadic(current,delta)));
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
    
    public static List<List<TernaryIntervalCode>> discretize(List<Integer> deltas, List<TernaryIntervalCode> inputs) {
    	List<List<TernaryIntervalCode>> discretised = Arrays.asList(new ArrayList<>());
    	for (int i = 0; i < inputs.size(); i++) {
    		discretised = addMany(discretised, inputs.get(i).discretize(deltas.get(i)));
    		
    	}
    	return discretised;
    }

}
