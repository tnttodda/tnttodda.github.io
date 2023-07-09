package DyadicsAndIntervals;

import java.math.BigInteger;

/*
 * This class implements dyadic rationals Z[1/2].
 * The idea is that an element (num,den) : Z[1/2] is used to represent the number num/2^den.
 */
public class Dyadic {
	
	private BigInteger num;
	private int den;
	
	// Constructors
	
	public Dyadic(BigInteger n, int d) {
		this.num = n;
		this.den = d;
	}
	
	public Dyadic(int n, int d) {
		this.num = BigInteger.valueOf(n);
		this.den = d;
	}
	
	public Dyadic(int n) {
		this.num = BigInteger.valueOf(n);
		this.den = 0;
	}
	
	// Getters and setters
	
	public BigInteger getNum() {
		return num;
	}
	
	public void setNum(int n) {
		this.num = BigInteger.valueOf(n);
	}
	
	public int getDen() {
		return den;
	}
	
	// Structural
	
	public Dyadic downLeft() {
		return new Dyadic(num.shiftLeft(1), den + 1);
	}
	
	public Dyadic downLeft(int n) {
		if (n <= 0) {
			return this;
		} else {
			return new Dyadic(num.shiftLeft(n), den + n);
		}
	}
	
	public Dyadic downRight() {
		return downLeft().next();
	}
	
	public Dyadic downRight(int n) {
		if (n <= 0) {
			return this;
		} else {
			return next().downLeft(n).prev();
		}
	}
	
	public Dyadic upRight() {
		if (isIntermediary() && isNegative()) {
			return new Dyadic(num.divide(BigInteger.TWO).subtract(BigInteger.ONE), den - 1);
		} else {
			return new Dyadic(num.divide(BigInteger.TWO), den - 1);
		}
	}
	
	public Dyadic upRight(int n) {
		if (n <= 0) {
			return this;
		} else {
			return upRight().upRight(n-1);
		}
	}
	
	public Dyadic next() {
		return new Dyadic(num.add(BigInteger.TWO), den);
	}
	
	public Dyadic prev() {
		return new Dyadic(num.subtract(BigInteger.TWO), den);
	}
	
	// Helpers
	
	public boolean isIntermediary() {
		return (num.divide(BigInteger.TWO) == BigInteger.ONE);
	}
	
	public boolean isNegative() {
		return (num.compareTo(BigInteger.ZERO) == -1);
	}
	
	// Arithmetic
	
	public Dyadic negate() {
		return new Dyadic(num.negate(), den);
	}
	
	public Dyadic abs() {
		if (isNegative()) {
			return negate();
		} else {
			return this;
		}
	}
	
	public Dyadic half() {
		return new Dyadic(num, den+1);
	}

	public Dyadic add(Dyadic y) {
		if (den == y.den) {
			return new Dyadic(num.add(y.num), den);
		} else {
			int minDen = Math.min(den, y.den);
			BigInteger addNum = num.shiftLeft(y.den-minDen).add(y.num.shiftLeft(den-minDen));
			return new Dyadic(addNum, Math.max(den,y.den));
		}
	}
	
	public Dyadic mid(Dyadic y) {
		return add(y).half();
	}
	
	public Dyadic subtract(Dyadic y) {
		return add(y.negate());
	}
	
	public Dyadic multiply(Dyadic y) {
		return new Dyadic(num.multiply(y.num), den+y.den);
	}
	
	// Minimum and maximum
	
	public int compare(Dyadic y) {
		if (den == y.den) {
			return num.compareTo(y.num);
		} else {
			int maxDen = Math.max(den, y.den);
			return downLeft(maxDen - den).compare(y.downLeft(maxDen - y.den));
		}
	}
	
	public Dyadic min(Dyadic y) {
		if (compare(y) < 0) { // i.e. this < y
			return this;
		} else {
			return y;
		}
	}
	
	public Dyadic max(Dyadic y) {
		if (compare(y) > 0) { // i.e. this > y
			return this;
		} else {
			return y;
		}
	}
	
	// Printers
	
	public double toDouble() {
		return num.doubleValue() / Math.pow(2, den);
	}
	
	public String toString() {
		return "(" + num + "," + den + ") = " + toDouble();
	}

}
