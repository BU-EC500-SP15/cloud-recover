using System;
using System.Collections.Generic;
using System.IO;
using System.Json;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RecloBM
{
    class DataManager
    {
        public static string cleanJSON(string input)
        {
            input = input.Remove(0, 1);
            input = input.Remove(input.Length - 1, 1);
            return input;
        }
        
        public static bool userStatus()
        {
            string line = readFile();
            JsonValue json = JsonValue.Parse(line);
            Console.WriteLine(line);
            Console.WriteLine(json["token"]);
          
           if(json["token"].ToString() == "\"empty\"")
           {
               return false;
           }
           else
           {
               return true;
           }
        }

        public static void addUser(string username, string token, string userid)
        {
            string userJSON = "{ \"username\":\"" + username + "\", \"token\":\""+ token+"\",\"userid\":\""+userid+"\"}";
            System.IO.File.WriteAllText(@"userData.txt", userJSON);
        }

        public static void clearUser()
        {
            string userJSON = "{\"username\":\"empty\", \"token\":\"empty\",\"userid\":\"empty\"}";
            System.IO.File.WriteAllText(@"userData.txt", userJSON);
        }

        private static string readFile()
        {
            string line = "error";
            try
            {
                using (StreamReader sr = new StreamReader("../../userData.txt"))
                {
                    line = sr.ReadToEnd();
                    Console.WriteLine(line);
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("The file could not be read:");
                Console.WriteLine(e.Message);
            }

            return line;
        }

        public static string getToken()
        {
            JsonValue json = JsonValue.Parse(readFile());
            return cleanJSON(json["token"].ToString());
        }

        public static string getUsername()
        {
            JsonValue json = JsonValue.Parse(readFile());
            return cleanJSON(json["username"].ToString());
        }

        public static string getUserID()
        {
            JsonValue json = JsonValue.Parse(readFile());
            return cleanJSON(json["userid"].ToString());
        }
    }

  
}
