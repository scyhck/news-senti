import java.util.*;

public class Lock {
    public static void main(String args[]) {
        Scanner sc = new Scanner(System.in);
        int t = sc.nextInt(); // Number of test cases
        sc.nextLine(); // Consume the newline

        while (t-- > 0) {
            String pin = sc.nextLine(); // Read the PIN
            int sum = 0;

            for (char digit : pin.toCharArray()) {
                sum += Character.getNumericValue(digit); // Corrected method name
            }

            if (sum % 4 == 0)
                System.out.println("OPEN");
            else
                System.out.println("LOCKED");
        }

        sc.close(); // Close scanner to prevent resource leak
    }
}
