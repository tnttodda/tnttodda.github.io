package ExamplesAndMain;

public class Main {
	
	

    public static void main(String[] args) {
        
        Examples ex2 = new Examples();

//        System.out.println("");
//        for (int i = 1; i < 6; i += 1) {
//        	System.out.println("prec = " + i);
//            ex2.regression_2_search(i);
//            System.out.println("");
//        }
        System.out.println("");
        for (int i = 1; i < 6; i += 1) {
        	System.out.println("prec = " + i);
            ex2.regression_2_search_branch(i);
            System.out.println("");
        }
//        System.out.println("");
//        for (int i = 5; i < 26; i += 5) {
//        	System.out.println("prec = " + i);
//            ex2.optimisation_1_branchandbound_random(i);
//            System.out.println("");
//        }
//        System.out.println("");
//        for (int i = 5; i < 26; i += 5) {
//        	System.out.println("prec = " + i);
//            ex2.optimisation_2_branchandbound_random(i);
//            System.out.println("");
//        }
    }

}
