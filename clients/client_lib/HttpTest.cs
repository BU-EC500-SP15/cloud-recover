using System;
using System.Json;

// command for compiling with MONO 
//  mcs /reference:System.ServiceModel.Web.dll /reference:System.Net.Http /reference:System.Runtime.Serialization *

public class HttpTest
{

    public static string user_id ="7ca2a045-94dd-41d6-a58e-b45376b6e784";
    public static string user_token = "1b3374c781174a38a8dcad4c8e68670b";
    static public void Main ()
    {
        
       //RecloApiCaller.loginUser("TestyJim@example.com", "Qwerty1", (string res) => CallBackExample(res), null);
       RecloApiCaller.getBackupList(user_id, user_token, (string res) => CallBackExample(res));
     
    }


        //This function executes when the asyncronous task of communicating to the api finishes.
       public static void CallBackExample(string res)
    {
       
       JsonValue json = JsonValue.Parse(res); //Creates JsonValue from response string
       Console.WriteLine("My Json String = "+json.ToString()); //log that a response was recieved
       
        if(json["HttpStatus"] == "200")
        {
            // Code to execute on success goes here
            Console.WriteLine("Success");
        }
        else 
        {
            // Code to execute on error goes here
            Console.WriteLine("error");
        }
    }

}

