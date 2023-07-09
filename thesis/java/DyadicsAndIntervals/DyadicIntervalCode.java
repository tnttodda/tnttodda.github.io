package DyadicsAndIntervals;

import java.math.BigInteger;

import TernaryBoehm.TBEncoding;

/*
 * This class implements the type Z^3 of dyadic interval codes.
 * The idea is that an element (l,r,p) : Z^3 is used to represent the interval [l/2^p,r/2^p].
 */

public class DyadicIntervalCode { 
	
	private BigInteger left;
	private BigInteger right;
	private int prec;
	
	public DyadicIntervalCode(BigInteger left, BigInteger right, int prec) {
		this.left = left;
		this.right = right;
		this.prec = prec;
	}
	
	// Getters
	
	public BigInteger getLeftCode() {
		return left;
	}
	
	public BigInteger getRightCode() {
		return right;
	}
	
	public int getPrec() {
		return prec;
	}
	
	// Conversions to dyadics
	
	public Dyadic getLeftEndpoint() {
		return new Dyadic(left,prec);
	}
	
	public Dyadic getMidpoint() {
		return new Dyadic(left.add(right),prec+1);
	}
	
	public Dyadic getRightEndpoint() {
		return new Dyadic(right,prec);
	}
	
	// Structural operations
	
	public DyadicIntervalCode down() {
		return down(1);
	}
	
	public DyadicIntervalCode down(int n) {
		return new DyadicIntervalCode(getLeftCode().shiftLeft(n), getRightCode().shiftLeft(n), prec + n);
	}
	
	
	public DyadicIntervalCode downLeft() {
		BigInteger d = right.subtract(left);
		return new DyadicIntervalCode(left.multiply(BigInteger.TWO), right.multiply(BigInteger.TWO).subtract(d), prec + 1);
	}
	
	public DyadicIntervalCode downRight() {
		BigInteger d = right.subtract(left);
		return new DyadicIntervalCode(left.multiply(BigInteger.TWO).add(d), right.multiply(BigInteger.TWO), prec + 1);
	}
	
	public DyadicIntervalCode downLeft(int n) {
		if (n <= 0) {
			return this;
		} else {
			return downLeft().downLeft(n-1);
		}
	}
	
	public DyadicIntervalCode downRight(int n) {
		if (n <= 0) {
			return this;
		} else {
			return downRight().downRight(n-1);
		}
	}
	
	/*
	 * TODO description
	 */
	public TBIntervalCode join_prime() { // TODO Not sure about this
		return new TBIntervalCode(getLeftEndpoint().upRight(right.subtract(left).bitLength() - 2));
	}

	// Arithmetic operations
	
	// [a,b] -> [-b,-a]
	public DyadicIntervalCode negate() { 
		return new DyadicIntervalCode(right.negate(), left.negate(), prec);
	}
	
	// [a,b] -> [a/2,b/2]
	public DyadicIntervalCode half() {
		return new DyadicIntervalCode(getLeftEndpoint().getNum(),
									  getRightEndpoint().getNum(), 
									  prec+1);
	}
	
	// [a,b] -> [min(abs(a),abs(b)),max(abs(a),abs(b))]
	public DyadicIntervalCode abs() { 
		if (left.compareTo(BigInteger.ZERO) < 0) {
			if (right.compareTo(BigInteger.ZERO) < 0) {
				return this.negate();
			} else {
				return new DyadicIntervalCode(BigInteger.ZERO, right, prec);
			}
		} else {
			return this;
		}
	}
	
	// [a,b] + [c,d] -> [a+c,b+d]
	public DyadicIntervalCode add(DyadicIntervalCode y) { 
		if (prec == y.prec) {
			return new DyadicIntervalCode(left.add(y.left), right.add(y.right), prec);
		} else {
			int minDen = Math.min(prec, y.prec);
			BigInteger l = left.shiftLeft(y.prec-minDen).add(y.left.shiftLeft(prec-minDen));
			BigInteger r = right.shiftLeft(y.prec-minDen).add(y.right.shiftLeft(prec-minDen));
			return new DyadicIntervalCode(l, r, Math.max(prec,y.prec));
		}
	}
	
	// [a,b] ⊕ [c,d] -> [a ⊕ c, b ⊕ d]
	public DyadicIntervalCode mid(DyadicIntervalCode y) {
		return add(y).half();
	}
	
	// [a,b] * [c,d] = [min(ac,ad,bc,bd),max(ac,ad,bc,bd)]
	public DyadicIntervalCode multiply(DyadicIntervalCode y) { 
		BigInteger a = left.multiply(y.left);
		BigInteger b = left.multiply(y.right);
		BigInteger c = right.multiply(y.left);
		BigInteger d = right.multiply(y.right);
		BigInteger l = a.min(b).min(c).min(d);
		BigInteger r = a.max(b).max(c).max(d);
		return new DyadicIntervalCode(l, r, prec + y.prec);
	}
	
	// toString
	
	public String toDoubleString() {
		return "[" + new Dyadic(left,prec).toString() + "," + new Dyadic(right,prec) + "]";
	}
	
	public String toString() {
		return "(" + left + "," + right + "," + prec + ")";
	}
	
	// Comparisons
	
	public boolean intersectsWith(TBEncoding y) {
		BigInteger yleft = y.approxAsSpecificIntervalCode(prec).getVariableIntervalCode().getLeftCode();
		BigInteger yright = y.approxAsSpecificIntervalCode(prec).getVariableIntervalCode().getRightCode();
		return !(right.compareTo(yleft) < 0 || yright.compareTo(left) < 0);
	}

	 /*
     * A dyadic interval code is eclipsed by another dyadic interval code if
     * the right endpoint of the first is less than the left endpoint of the
     * second.
     */
    public static boolean eclipses(DyadicIntervalCode fx, DyadicIntervalCode fy) {
		if (fx.getPrec() > fy.getPrec()) {
			fy = fy.down(fx.getPrec() - fy.getPrec());
		} else if (fx.getPrec() < fy.getPrec()) {
			fx = fx.down(fy.getPrec() - fx.getPrec());
		}
		return (fx.getRightCode().compareTo(fy.getLeftCode()) < 0);
	}
}
