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
        private static int counter =0;
        private static DateTime date;
        private static string userID;
        private static string token;
        private static string tempKey;
        private static string tempSecretKey;
        private static string username;
        private static JsonValue backupsList = "{\"error\":302}";
        private static string destination = "Select Location...";
        private static string source = "Select Drive...";
        private static bool scheduledBackups = false;
        private static int backupStatus = 0;
       // private static string vhdName = "recloTMP.VHD";
        private static string vhdName = "test.vhd";
        public static string cleanJSON(string input)
        {
            input = input.Remove(0, 1);
            input = input.Remove(input.Length - 1, 1);
            return input;
        }
        
       
        public static bool userStatus()
        {
            string ProgramFiles = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);
            string MyNewPath = System.IO.Path.Combine(ProgramFiles, "../Reclo");
            string input = File.ReadAllText(Path.Combine(MyNewPath, "BMData.txt"));
            Console.WriteLine("input out :" + input);

            //convert to json then read values
            try
            {
                JsonValue json = JsonValue.Parse(input);
                Console.WriteLine(json["username"].ToString());
                if (DataManager.cleanJSON(json["userId"].ToString()).Length < 2)
                {
                    return false;
                }
                else
                {
                    username = DataManager.cleanJSON(json["username"].ToString());
                    token = DataManager.cleanJSON(json["token"].ToString());
                    userID = DataManager.cleanJSON(json["userId"].ToString());
                    return true;
                }
            }
            catch
            {
                return false;
            }
        }

        public static void addUser(string nusername, string ntoken, string nuserid)
        {
            username = nusername;
            token = ntoken;
            userID = nuserid;

            JsonValue json;
            string ProgramFiles = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);
            string MyNewPath = System.IO.Path.Combine(ProgramFiles, "../Reclo");

            string hi = "{ \"username\": \"" + username + "\", \"token\": \"" + token + "\", \"userId\": \"" + userID + "\"}";
            Console.WriteLine("String to be saved: " + hi);
            File.WriteAllText(Path.Combine(MyNewPath, "BMData.txt"), hi);
        }


        public static void loadSettings()
        {
            /*
            string ProgramFiles = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);
            string MyNewPath = System.IO.Path.Combine(ProgramFiles, "../Reclo");
            string input = File.ReadAllText(Path.Combine(MyNewPath, "BMSettings.txt"));
            Console.WriteLine("input out :" + input);

            //convert to json then read values
          
                JsonValue json = JsonValue.Parse(input);
              
             
                    source = DataManager.cleanJSON(json["source"].ToString());
                    destination = DataManager.cleanJSON(json["destination"].ToString());
                    string datea = DataManager.cleanJSON(json["time"].ToString());
                    counter = System.Convert.ToInt32(DataManager.cleanJSON(json["count"].ToString()));
                    if(System.Convert.ToInt32(DataManager.cleanJSON(json["checked"].ToString())) == 0)
                    {
                        scheduledBackups = false;
                    }
                    else
                    {
                        scheduledBackups = true;
                    }
                */
            
        }

        public static void saveSettings()
        {
            
            string ProgramFiles = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);
            string MyNewPath = System.IO.Path.Combine(ProgramFiles, "../Reclo");
            int on = 0;
            if (DataManager.getScheduledBackups())
            {
                on = 1;
            }
            else
            {
                on = 0;
            }

            string hi = "{\"source\": \"" + source + 
                "\", \"destination\": \"" + destination + 
                "\", \"checked\"\": " + on +
                "\", \"time\": \"" + date +
                "\", \"count\": \"" + counter+
                "\"}";
            Console.WriteLine("String to be saved: " + hi);
            File.WriteAllText(Path.Combine(MyNewPath, "BMSettings.txt"), hi);
            
        }

        public static void addBackupsList(JsonValue backups)
        {
            backupsList = backups;
        }

        public static JsonValue getBackupslist()
        {
            return backupsList;
        }

        public static void clearUser()
        {
            string ProgramFiles = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);
            string MyNewPath = System.IO.Path.Combine(ProgramFiles, "../Reclo");
            string userJSON = "{\"username\":\"\", \"token\":\"\",\"userid\":\"\"}";

            File.WriteAllText(Path.Combine(MyNewPath, "BMData.txt"), userJSON);
        }

    

        public static string getToken()
        {
          //  JsonValue json = JsonValue.Parse(readFile());
           // return cleanJSON(json["token"].ToString());
            return token;
        }

        public static string getUsername()
        {
           // JsonValue json = JsonValue.Parse(readFile());
            //return cleanJSON(json["username"].ToString());
            return username;
        }

        public static string getUserID()
        {
          //  JsonValue json = JsonValue.Parse(readFile());
           // return cleanJSON(json["userid"].ToString());
            return userID;
        }

        public static void setDestination(string ndestination)
        {
            destination = ndestination;
        }

        public static void setSource(string nsource)
        {
            source = nsource;
        }

        public static string getDestination()
        {
            return destination;
        }

        public static string getSource()
        {
            return source;
        }

        public static void setScheduledBackups(bool input)
        {
            scheduledBackups = input;
        }

        public static bool getScheduledBackups()
        {
            return scheduledBackups;
        }

        public static void setBackupStatus(int nb)
        {
            backupStatus = nb;
        }

        public static int getBackupStatus()
        {
            return backupStatus;
        }
        public static string getVHDName()
        {
            return vhdName;
        }
        public static void setVHDName(string name)
        {
            vhdName = name;
        }

        public static DateTime getDate()
        {
            return date;
        }

        public static void setDate(DateTime name)
        {
            date = name;
        }

        public static int getCount()
        {
            return counter;
        }

        public static void upCount()
        {
            counter++;
            if(counter > 6)
            {
                counter = 0;
            }
        }

    }

  
}
