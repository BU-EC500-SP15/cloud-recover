using System;
 

// command for compiling with MONO 
//  mcs /reference:System.ServiceModel.Web.dll /reference:System.Net.Http /reference:System.Runtime.Serialization *

public class HttpTest
{
    static public void Main ()
    {
    	 RecloApiCaller.loginUser("ksparakis@example.com", "Qwerty1",  (string hi) => callBackTest(hi), null);


    }

    public static void callBackTest(string res)
    {
    	//log that a response was recieved
        Console.Write("Data Sent and response Recieved\n");
    }
    


}

