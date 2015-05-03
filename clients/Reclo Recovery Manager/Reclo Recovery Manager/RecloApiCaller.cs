using System;
using System.Collections.Specialized;
using System.Collections.Generic;


// command for compiling with MONO 
//  mcs /reference:System.ServiceModel.Web.dll /reference:System.Net.Http /reference:System.Runtime.Serialization *
public class RecloApiCaller
{
    private static string loginUrl = "login";
    private static string registerUrl = "register";
    private static string logoutUrl = "logout";
    private static string backupsURL = "backups/";
    private static string uploadsURL = "uploads/";
    private static string recoveryURL = "recovery/";
    private static string instancesURL = "instances/";

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
                     Action<string> callBack)
    {
         
    
         IEnumerable<KeyValuePair<string, string>> nameValueCollection = new[]{
        new KeyValuePair<string, string>("email", email),
        new KeyValuePair<string, string>("password", password)};

        HttpMethods.httpPOST(nameValueCollection, loginUrl, callBack);
    	
    }



    public static void registerUser(string email, string password, string username,  Action<string> callBack)
    {
              IEnumerable<KeyValuePair<string, string>> nameValueCollection = new[] 
            {
                new KeyValuePair<string, string>("username", username),
                new KeyValuePair<string, string>("email", email),
                new KeyValuePair<string, string>("password", password)
            };

            HttpMethods.httpPOST(nameValueCollection, registerUrl, callBack);
    }


    public static void logoutUser(string token,  Action<string> callBack)
    {
        IEnumerable<KeyValuePair<string, string>> nameValueCollection = new[] 
            {
                new KeyValuePair<string, string>("token", token)
            };
            
            HttpMethods.httpPOST(nameValueCollection, logoutUrl, callBack);

    }

    public static void getBackup(string userID, string token, string backupID, Action<string> callBack)
    {
        string newURL = backupsURL+userID+"/"+backupID+"?token="+token;
        HttpMethods.httpGET(newURL,callBack);
    }


    public static void getBackupList(string userID,string token, Action<string> callBack)
    {
        string newURL = backupsURL+userID+"?token="+token;
        HttpMethods.httpGET(newURL,callBack);
    }

    public static void getInstances(string userID, string token, Action<string> callBack)
    {
        string newURL = recoveryURL + userID + "?token=" + token;
        HttpMethods.httpGET(newURL, callBack);
    }



     public static void startRecovery(string userID,string token,string fileName, string fileSize, Action<string> callBack)
    {
            string newURL = backupsURL+userID+"?token="+token;
               IEnumerable<KeyValuePair<string, string>> nameValueCollection = new[] 
            {
                new KeyValuePair<string, string>("file_name", fileName),
                new KeyValuePair<string, string>("file_size", fileSize),
            };
            
            HttpMethods.httpPOST(nameValueCollection, newURL, callBack);

    }

     public static void getProgress(string recoveryID, string token, Action<string> callBack)
     {
         string newURL = recoveryURL + recoveryID + "?token=" + token;
         HttpMethods.httpGET(newURL, callBack);
     }

     public static void stopInstance(string instanceID, string token, Action<string> callBack)
     {
         string newURL = recoveryURL + instancesURL +instanceID + "?token=" + token;
         HttpMethods.httpDELETE(newURL, callBack);
     }

}