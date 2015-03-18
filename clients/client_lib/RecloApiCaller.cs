using System;
using System.Collections.Specialized;

public class RecloApiCaller
{
    
    private static string urlHead = "reclo.noip.me";
    private static string loginUrl = urlHead+"/login";
    private static string registerUrl = urlHead+"/register";
    private static string logoutUrl = urlHead+"/logout";

    /*
     * NOTE : all callback functons need to take as a parameter :
     *     HttpWebRequestCallbackState
     *     This is a class that contains the response information from
     *      the server a long with a state if you passed one through. 
     *      Check HttpSocket.cs for more info.
     */


    //Constructor 
    //  Initiates HttpSocket class
    public RecloApiCaller()
    {   
     

    }

    
    public void loginUser(string email, string password,
                     Action<HttpWebRequestCallbackState> callBack , object state = null)
    {
        
        NameValueCollection postParameters = new NameValueCollection();
        postParameters.Add("email", email);
        postParameters.Add("password", password);
    
    	 HttpSocket.PostAsync(loginUrl, postParameters, callBack, state);
    }

    public void registerUser(string email, string username, string password,
                  Action<HttpWebRequestCallbackState> callBack , object state = null)
    {
        
        NameValueCollection postParameters = new NameValueCollection();
        postParameters.Add("email", email);
        postParameters.Add("username", username);
        postParameters.Add("password", password);
    
        HttpSocket.PostAsync(registerUrl, postParameters, callBack, state);
    }

    public void logoutUser(string token,  Action<HttpWebRequestCallbackState> callBack , object state = null)
    {
        
    	NameValueCollection postParameters = new NameValueCollection();
        postParameters.Add("token", token);
    
         HttpSocket.PostAsync(logoutUrl, postParameters, callBack, state);
    }


}