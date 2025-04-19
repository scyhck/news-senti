import java.util.*;

public class Answer{
    public static void main(String args[]){
        Scanner sc = new Scanner(System.in);
        int t = sc.nextInt();
        sc.nextLine();

        while(t-- > 0){
            String moves = sc.nextLine();
            int x = 0, y= 0;

            for(char move : moves.toCharArray()){
                if (move == 'U') y++;
                else if(move == 'D') y--;
                else if (move == 'L') x--;
                else if(move == 'R') x++;
            }
                System.out.println(x + " " + y);
        }
        sc.close();
    }
}

