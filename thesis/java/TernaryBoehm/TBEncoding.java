package TernaryBoehm;

import java.math.BigInteger;
import java.util.Arrays;
import java.util.function.Function;

import DyadicsAndIntervals.Dyadic;
import DyadicsAndIntervals.DyadicIntervalCode;
import DyadicsAndIntervals.TernaryIntervalCode;
import FunctionsAndPredicates.CFunction;

public class TBEncoding {

	private Function<Integer,BigInteger> approx;
	
	// Constructors
	
	public TBEncoding(Dyadic x) {
		this.approx = (prec) -> {
			int p = x.getDen();
			if (prec == p) {
				return x.getNum();
			} else if (prec < p) {
				return x.upRight(p - prec).getNum();
			} else {
				return x.downLeft(prec - p).getNum();
			}
		};
	}
	
	public TBEncoding(int n) {
		Dyadic x = new Dyadic(n);
		this.approx = (prec) -> {
			int p = x.getDen();
			if (prec == p) {
				return x.getNum();
			} else if (prec < p) {
				return x.upRight(p - prec).getNum();
			} else {
				return x.downLeft(prec - p).getNum();
			}
		};
	}
	
	public TBEncoding(Function<Integer,TernaryIntervalCode> x) {
		this.approx = (prec) -> {
			Dyadic kp = x.apply(prec).getLeftEndpoint();
			return kp.upRight(kp.getDen() - prec).getNum();
		};
	}
	
	public TBEncoding(TernaryIntervalCode s) {
		this.approx = (prec) -> {
			Dyadic x = s.getLeftEndpoint();
			int p = x.getDen();
			if (prec == p) {
				return x.getNum();
			} else if (prec < p) {
				return x.upRight(p - prec).getNum();
			} else {
				return x.downLeft(prec - p).getNum();
			}
		};
	}
	
	// Getters
	
	public BigInteger approx(int prec) {
		return approx.apply(prec);
	}
	
	public TernaryIntervalCode approxAsTernaryIntervalCode(int prec) {
		return new TernaryIntervalCode(approx(prec), prec);
	}
		
	public Function<Integer,TernaryIntervalCode> toSpecificFunction() {
		return (n -> new TernaryIntervalCode(approx(n), n));
	}
	
	public Function<Integer,DyadicIntervalCode> toVariableFunction() {
		return (n -> toSpecificFunction().apply(n).getDyadicIntervalCode());
	}
	
	// To Dyadics
	
	private Dyadic lower(int n) {
		return new Dyadic(approx(n), n);
	}
	
	private Dyadic upper(int n) {
		return lower(n).next();
	}
	
	// Functions
	
	public TBEncoding negate() {
		return CFunction.negate().apply(Arrays.asList(this));
	}
	
	public TBEncoding abs() {
		return CFunction.abs().apply(Arrays.asList(this));
	}
	
	public TBEncoding half() {
		return CFunction.half().apply(Arrays.asList(this));
	}
	
	public TBEncoding add(TBEncoding y) {
		return CFunction.add().apply(Arrays.asList(this, y));
	}
	
	public TBEncoding mid(TBEncoding y) {
		return CFunction.mid().apply(Arrays.asList(this, y));
	}
	
	public TBEncoding subtract(TBEncoding y) {
		return CFunction.subtract().apply(Arrays.asList(this, y));
	}
	
	public TBEncoding multiply(TBEncoding y) {
		return CFunction.multiply().apply(Arrays.asList(this, y));
	}
	
	public TBEncoding inverse() {
		return new TBEncoding((prec) -> {
			int prec_ = prec + 1;
			BigInteger left = approx(prec_);
			BigInteger right = approx(prec_).add(BigInteger.TWO);
			while (left == BigInteger.ZERO || right == BigInteger.ZERO) {
				prec_++;
				left = approx(prec_);
				right = approx(prec_).add(BigInteger.TWO);
			}
			BigInteger fourPowP = BigInteger.valueOf(4).pow(prec_);
			return new TernaryIntervalCode(fourPowP.divide(left), prec_);
		});
	}
	
	public TBEncoding divide(TBEncoding y) {
		return multiply(y.inverse());
	}
	
	// Printers
	
	public String toString(int n) {
		return "[" + lower(n).toString() + "," + upper(n).toDouble() + "]"; 
	}
	
	public double toDouble(int n) {
		return lower(n).toDouble();
	}
	
	public String toString() {
		String str = "";
		for (int i = 0; i <= 20; i++) {
			str += toString(i) + "\n";
		}
		return str;
	}
	
}
