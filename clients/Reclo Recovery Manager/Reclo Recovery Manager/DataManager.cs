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
        private static string instanceId = "";
        private static bool isRecoveryPending =false; 
        private static string recoveryPercent = "0%";
        private static string recoveryStatus = "finished";
        private static string recoveryID = "";
        private static bool instanceUp = false;
        private static string userID;
        private static string token;
        private static string tempKey;
        private static string tempSecretKey;
        private static string username;
        private static JsonValue backupsList = "{\"error\":302}";
        private static JsonValue instancesList = "{\"error\":302}";
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
            string line = readFile();
            JsonValue json = JsonValue.Parse(line);
            Console.WriteLine(line);
            Console.WriteLine(json["token"]);

            if (json["token"].ToString() == "\"empty\"")
            {
                return false;
            }
            else
            {
                return true;
            }
        }

        public static void addUser(string nusername, string ntoken, string nuserid)
        {
            username = nusername;
            token = ntoken;
            userID = nuserid;
            //string userJSON = "{ \"username\":\"" + username + "\", \"token\":\""+ token+"\",\"userid\":\""+userid+"\"}";
            //System.IO.File.WriteAllText(@"userData.txt", userJSON);
        }

        public static void addBackupsList(JsonValue backups)
        {
            backupsList = backups;
        }

        public static JsonValue getBackupslist()
        {
            return backupsList;
        }

        public static void addInstancesList(JsonValue instances)
        {
            instancesList = instances;
        }

        public static JsonValue getInstancesList()
        {
            return instancesList;
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

        public static void setInstanceUp(bool set)
        {
            instanceUp = set;
        }
        public static bool getInstanceUp()
        {
            return instanceUp;
        }

        public static void setRecoveryID(string set)
        {
            recoveryID = set;
        }

        public static string getRecoveryID()
        {
            return recoveryID;
        }


        public static void setRecoveryStatus(string set)
        {
            recoveryStatus = set;
        }
        public static string getRecoveryStatus()
        {
            return recoveryStatus;
        }


        public static void setRecoveryPercent(string set)
        {
            recoveryPercent = set+"%";
        }
        public static string getRecoveryPercent()
        {
            return recoveryPercent;
        }

        public static void setInstanceID(string set)
        {
            instanceId = set;
        }
        public static string getInstanceID()
        {
            return instanceId;
        }

        public static void setIsRecoveryPending(bool input)
        {
            isRecoveryPending = input;
        }

        public static bool getIsRecoveryPending()
        {
            return isRecoveryPending;
        }
    }
  
}
