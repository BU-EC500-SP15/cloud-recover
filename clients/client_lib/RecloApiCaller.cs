using System;
using System.Collections.Specialized;
using System.Collections.Generic;
using System.Net.Http;

// command for compiling with MONO 
//  mcs /reference:System.ServiceModel.Web.dll /reference:System.Net.Http /reference:System.Runtime.Serialization *
public class RecloApiCaller
{
    private static string loginUrl = "login";
    private static string registerUrl = "register";
    private static string logoutUrl = "logout";

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

    public static void loginUser(string email, string password,
                     Action<string> callBack , object state = null)
    {
         
    
         IEnumerable<KeyValuePair<string, string>> nameValueCollection = new[]{
        new KeyValuePair<string, string>("email", email),
        new KeyValuePair<string, string>("password", password)};

        HttpMethods.httpPOST(nameValueCollection, loginUrl, callBack);
    	
    }



    public static void registerUser(string email, string password, string username,  Action<string> callBack , object state = null)
    {
              IEnumerable<KeyValuePair<string, string>> nameValueCollection = new[] 
            {
                new KeyValuePair<string, string>("username", username),
                new KeyValuePair<string, string>("email", email),
                new KeyValuePair<string, string>("password", password)
            };

            HttpMethods.httpPOST(nameValueCollection, registerUrl, callBack);
    }


    public static void logoutUser(string token,  Action<string> callBack , object state = null)
    {
        IEnumerable<KeyValuePair<string, string>> nameValueCollection = new[] 
            {
                new KeyValuePair<string, string>("token", token)
            };
            
            HttpMethods.httpPOST(nameValueCollection, logoutUrl, callBack);

    }


}