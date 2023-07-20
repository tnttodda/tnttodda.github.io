package ExamplesAndMain;

import DyadicsAndIntervals.DyadicIntervalCode;

public class Main {
	
	

    public static void main(String[] args) {
        
        Examples ex2 = new Examples();
//
//        System.out.println("");
//        for (int i = 50; i < 201; i += 50) {
//        	System.out.println("prec = " + i);
//            ex2.regression_1_optimisation_branch(i);
//            System.out.println("");
//        }
//        System.out.println("");
//        for (int i = 1; i < 6; i += 1) {
//        	System.out.println("prec = " + i);
//            ex2.regression_2_search_branch(i);
//            System.out.println("");
//        }
//        System.out.println("");
//        for (int i = 5; i < 26; i += 5) {
//        	System.out.println("prec = " + i);
//            ex2.optimisation_1_branchandbound_random(i);
//            System.out.println("");
//        }
//        System.out.println("");
//        for (int i = 5; i < 26; i += 5) {
//        	System.out.println("prec = " + i);
//            ex2.optimisation_2_branchandbound(i);
//            System.out.println("");
//        }
    	DyadicIntervalCode test = new DyadicIntervalCode(1, 5, 2);
    	System.out.println(test);
    	System.out.println(test.join_prime());
    }

}
