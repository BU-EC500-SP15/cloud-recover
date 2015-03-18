using System;
 
public class HttpTest
{
    static public void Main ()
    {
    	
    	Action<HttpWebRequestCallbackState> test;
        HttpWebRequestCallbackState hi = new HttpWebRequestCallbackState(null, null);
        test = callBackTest(hi);
         RecloApiCaller.loginUser("test@test.com", "123Test", test);

    }

    public static void callBackTest(HttpWebRequestCallbackState res)
    {
    	//log that a response was recieved
    }
}