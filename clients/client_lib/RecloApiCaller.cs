using System;
using System.Collections.Specialized;
using System.Collections.Generic;
using System.Net.Http;

// command for compiling with MONO 
//  mcs /reference:System.ServiceModel.Web.dll /reference:System.Net.Http /reference:System.Runtime.Serialization *
public class RecloApiCaller
{
    
    private static string urlHead = "http://52.11.1.237:3000/";
    //private static string urlHead = "http://stutorapi.sparakis.com";
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

/*
 * EXAMPLE USING HTTPSCOKET.cs which doesnt work
 
    public static void registerUser(string email, string username, string password,
                  Action<HttpWebRequestCallbackState> callBack , object state = null)
    {
        
        NameValueCollection postParameters = new NameValueCollection();
        postParameters.Add("email", email);
        postParameters.Add("username", username);
        postParameters.Add("password", password);
    
        HttpSocket.PostAsync(registerUrl, postParameters, callBack, state);
    }
    */
    



    public static void loginUser(string email, string password,
                     Action<string> callBack , object state = null)
    {
         Console.Write("login Initiated\n");
    
          using (var client = new HttpClient())
        {
            client.BaseAddress = new Uri(urlHead);
            var content = new FormUrlEncodedContent(new[] 
            {
                new KeyValuePair<string, string>("email", email),
                new KeyValuePair<string, string>("password", password)
            });

            var result = client.PostAsync("login", content).Result;
            string resultContent = result.Content.ReadAsStringAsync().Result;
            Console.WriteLine(resultContent);
            callBack(resultContent);
        }
        
    	
    }



    public static void registerUser(string email, string password, string username,  Action<string> callBack , object state = null)
    {
           using (var client = new HttpClient())
        {
            client.BaseAddress = new Uri(urlHead);
            var content = new FormUrlEncodedContent(new[] 
            {
                new KeyValuePair<string, string>("username", username),
                new KeyValuePair<string, string>("email", email),
                new KeyValuePair<string, string>("password", password)

            });

            var result = client.PostAsync("login", content).Result;
            string resultContent = result.Content.ReadAsStringAsync().Result;
            Console.WriteLine(resultContent);
            callBack(resultContent);
        }
        
    }


    public static void logoutUser(string token,  Action<string> callBack , object state = null)
    {
           using (var client = new HttpClient())
        {
            client.BaseAddress = new Uri(urlHead);
            var content = new FormUrlEncodedContent(new[] 
            {
                new KeyValuePair<string, string>("token", token)
            });

            var result = client.PostAsync("login", content).Result;
            string resultContent = result.Content.ReadAsStringAsync().Result;
            Console.WriteLine(resultContent);
            callBack(resultContent);
        }
        
    }


}