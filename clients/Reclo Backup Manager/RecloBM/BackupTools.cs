using System;
using System.Collections;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Management.Automation;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.IO.Compression;

namespace RecloBM
{
    class BackupTools
    {
        public static String workingPath = "C:\\MyCloudRecovery";
        public static String[] folderOutput = new string[10];
        //place to store log
        public static String logPath = workingPath + "\\BackupLog";
        //location of Cobian Backup 8
        public static String CobianPath = workingPath + "\\Cobian Backup 8\\";
        public String date;
        public String disk2vhdPath = workingPath + "\\Disk2vhd\\";


        public void initialize(String lstName, String path, String taskName, String ID, String backupType, String Source, String Destination, String Schedule)
        {
            using (PowerShell PowerShellInstance = PowerShell.Create())
            {
                //Create a new .lst file
                PowerShellInstance.AddScript("New-Item " + path + " -type file -force");
                //Add basic information into .lst file
                PowerShellInstance.AddScript("$original_file = '" + CobianPath + "DB\\BaseBackup.lst'");
                PowerShellInstance.Invoke();
                PowerShellInstance.AddScript("$destination_file = '" + CobianPath + "DB\\" + lstName + "'");
                PowerShellInstance.Invoke();
                PowerShellInstance.AddScript("(Get-Content $original_file) | Foreach-Object {$_ -Replace 'MYNAME', '" + taskName + "' -Replace 'MYID', '" + ID + "' -Replace 'MYBACKUPTYPE', '" + backupType + "' -Replace 'MYSOURCE', '" + Source + "' -Replace 'MYDESTINATION', '" + Destination + "' -Replace 'SCHEDULETYPE', '" + Schedule + "' } | Set-Content $destination_file");
                PowerShellInstance.Invoke();
            }
        }

        public void writeLog(taskManagement task)
        {
            DirectoryInfo di = Directory.CreateDirectory(logPath);
            StringBuilder sb = new StringBuilder();
            String lstName = task.returnLst();
            String path = task.returnPath();
            String taskName = task.returnTaskName();
            String ID = task.returnID();
            String backupType = task.returnBackupType();
            String Source = task.returnSource();
            String Destination = task.returnDestination();
            String Schedule = task.returnSchedule();
            sb.AppendLine(lstName);
            sb.AppendLine(path);
            sb.AppendLine(taskName);
            sb.AppendLine(ID);
            sb.AppendLine(backupType);
            sb.AppendLine(Source);
            sb.AppendLine(Destination);
            sb.AppendLine(Schedule);
            using (StreamWriter outfile = File.AppendText(logPath + "\\Log.txt"))
            {
                //write log into .txt
                outfile.Write(sb.ToString());
            }
        }

        public void createNewTask(String lstName, String path, String taskName, String ID, String backupType, String Source, String Destination, String Schedule)
        {
            taskManagement t = new taskManagement(lstName, path, taskName, ID, backupType, Source, Destination, Schedule);
            tasks.Add(t);
            writeLog(t);
        }

        public void WriteLog(taskManagement task)
        {
            StringBuilder sb = new StringBuilder();
            String lstName = task.returnLst();
            String path = task.returnPath();
            String taskName = task.returnTaskName();
            String ID = task.returnID();
            String backupType = task.returnBackupType();
            String Source = task.returnSource();
            String Destination = task.returnDestination();
            String Schedule = task.returnSchedule();
            sb.AppendLine(lstName);
            sb.AppendLine(path);
            sb.AppendLine(taskName);
            sb.AppendLine(ID);
            sb.AppendLine(backupType);
            sb.AppendLine(Source);
            sb.AppendLine(Destination);
            sb.AppendLine(Schedule);
            using (StreamWriter outfile = File.AppendText(logPath + "\\Log.txt"))
            {
                //write log into .txt
                outfile.Write(sb.ToString());
            }
        }

        public string[] getFile(string date, string destination)
        {
            using (PowerShell PowerShellInstance = PowerShell.Create())
            {
                PowerShellInstance.AddScript("dir " + destination + " | ?{$_.lastwritetime -gt '" + date + "'};");
                // use "AddParameter" to add a single parameter to the last command/script on the pipeline.
                //PowerShellInstance.AddParameter("param1", "parameter 1 value!");
                Collection<PSObject> PSOutput = PowerShellInstance.Invoke();
                int i = 0;
                foreach (PSObject outputItem in PSOutput)
                {
                    // if null object was dumped to the pipeline during the script then a null
                    // object may be present here. check for null to prevent potential NRE.
                    if (outputItem != null)
                    {
                        //TODO: do something with the output item 
                        // outputItem.BaseOBject
                        folderOutput[i] = outputItem.BaseObject.ToString();
                        i += 1;
                    }
                }
                return folderOutput;
            }
        }

        public void reName(string newName, string oldName)
        {
            using (PowerShell reNameInstance = PowerShell.Create())
            {
                reNameInstance.AddScript("Rename-Item \"" + oldName + "\" \"" + newName + "\";");
                //richTextBox1.Text += "\nRename-Item \"" + oldName + "\" \"" + newName + "\";";
                reNameInstance.Invoke();
                //richTextBox1.Text += "\nrename finished";
            }
        }

        public void CobianBackup(string lstName)
        {
            //start backup, lstName is the name of .lst
            ProcessStartInfo CobianStartInfo = new ProcessStartInfo(CobianPath + "Cobian.exe", "Cobian.exe \"-list:" + CobianPath + "DB\\" + lstName + "\" -bu -nogui -autoclose");
            CobianStartInfo.CreateNoWindow = true;
            CobianStartInfo.UseShellExecute = false;
            CobianStartInfo.RedirectStandardInput = true;
            CobianStartInfo.RedirectStandardOutput = true;
            CobianStartInfo.RedirectStandardError = true;
            Process CobianProcess = new Process();
            CobianProcess.StartInfo = CobianStartInfo;
            //start progress
            CobianProcess.Start();
            CobianProcess.BeginOutputReadLine();
            CobianProcess.WaitForExit();
        }

        public static ArrayList tasks = new ArrayList();

        //A new data structure to store basic info of task.
        public class taskManagement
        {
            String lstName;
            String path;
            String taskName;
            String ID;
            String backupType;
            String Source;
            String Destination;
            String Schedule;
            public string returnLst()
            {
                return lstName;
            }
            public string returnPath()
            {
                return path;
            }
            public string returnTaskName()
            {
                return taskName;
            }
            public string returnID()
            {
                return ID;
            }
            public string returnBackupType()
            {
                return backupType;
            }
            public string returnSource()
            {
                return Source;
            }
            public string returnDestination()
            {
                return Destination;
            }
            public string returnSchedule()
            {
                return Schedule;
            }
            public taskManagement(string getLst, string getPath, string getTaskName, string getID, string getBackupType, string getSource, string getDestination, string getSchedule)
            {
                lstName = getLst;
                path = getPath;
                taskName = getTaskName;
                ID = getID;
                backupType = getBackupType;
                Source = getSource;
                Destination = getDestination;
                Schedule = getSchedule;
            }
        }

        public void copyItems(String source, String destination)
        {
            using (PowerShell PowerShellInstance = PowerShell.Create())
            {
                PowerShellInstance.AddScript("$items = (Get-ChildItem " + destination + source + ").FullName");
                PowerShellInstance.AddScript("foreach ($item in $items){Copy-Item $item " + destination + "}");
                PowerShellInstance.Invoke();
            }
        }

        public void deleteFolder(String destination)
        {
            String[] outputFolder = new String[50];
            using (PowerShell PowerShellInstance = PowerShell.Create())
            {
                PowerShellInstance.AddScript("dir " + destination);
                Collection<PSObject> PSOutput = PowerShellInstance.Invoke();
                int i = 0;
                foreach (PSObject outputItem in PSOutput)
                {
                    if (outputItem != null)
                    {
                        outputFolder[i] = outputItem.BaseObject.ToString();
                        i += 1;
                    }
                }
            }
            foreach (String s in outputFolder)
            {
                using (PowerShell PowerShellInstance = PowerShell.Create())
                {
                    PowerShellInstance.AddScript("Remove-Item " + destination + s + " -recurse");
                    PowerShellInstance.Invoke();
                }
            }
        }

        //create .vhd
        public void createVHD(String destination, String name)
        {
            ProcessStartInfo disk2vhdStartInfo = new ProcessStartInfo();
            //disk2vhdStartInfo.WorkingDirectory = disk2vhdPath;
            disk2vhdStartInfo.FileName = disk2vhdPath + "disk2vhd.exe";
            //List<string> arguments = new List<string>();
            //arguments.Add("disk2vhd e:");
            //arguments.Add("e:\\a.vhd");
            //disk2vhdStartInfo.Arguments = disk2vhdPath + "\\disk2vhd e: e:\\a.vhd";
            Console.WriteLine(disk2vhdPath + "\\disk2vhd e: e:\\a.vhd");
            disk2vhdStartInfo.CreateNoWindow = true;
            disk2vhdStartInfo.UseShellExecute = false;
            disk2vhdStartInfo.RedirectStandardInput = true;
            disk2vhdStartInfo.RedirectStandardOutput = true;
            disk2vhdStartInfo.RedirectStandardError = true;
            Process disk2vhdProcess = new Process();
            disk2vhdProcess.StartInfo = disk2vhdStartInfo;
            //start progress
            disk2vhdProcess.Start();
            Console.WriteLine("Unselect \"use vhdx\" checkbox\nChoose \"" + destination + "\" in the Volume\nSet the vhd file name to \"" + destination + name + ".vhd\"\nClick create and wait until backup finishes");
            disk2vhdProcess.BeginOutputReadLine();
            disk2vhdProcess.WaitForExit();
            //Console.WriteLine("vhd Created");
            //richTextBox1.Text += "\nvhd created";
        }

        public void StartTask(int index)
        {
            string date = DateTime.Now.ToString();
            //int index = taskListBox.SelectedIndex;
            taskManagement taskSelected = (taskManagement)tasks[index];
            CobianBackup(taskSelected.returnLst());
            string[] originName = getFile(date, taskSelected.returnDestination());
            ArrayList Name = new ArrayList();
            for (int i = 0; i < originName.Length; i++)
            {
                originName[i] = taskSelected.returnDestination() + originName[i];
                if (!originName[i].Equals(taskSelected.returnDestination()))
                {
                    Name.Add(originName[i]);
                }
            }
            //richTextBox1.Text += Name.Count;
            string newName = DateTime.Now.ToString("MMddyyyyHHmm");
            for (int i = 0; i < Name.Count; i++)
            {
                string s = Name[i].ToString();
                if (s.Length - 20 > 0)
                {
                    reName(s.Remove(s.Length - 20), s);
                }
                else
                {
                    continue;
                }
            }
            createVHD(taskSelected.returnDestination(), newName);
            //richTextBox1.Text += "\nBackup finished";
        }

        public void initializeSoftware()
        {
            DirectoryInfo di = Directory.CreateDirectory(workingPath);
            Assembly _assembly;
            Stream _lstStream;
            _assembly = Assembly.GetExecutingAssembly();
            _lstStream = _assembly.GetManifestResourceStream("RecloBM.Resources.Cobian Backup 8.zip");
            using (var fileStream = File.Create(workingPath + "\\Cobian Backup 8.zip"))
            {
                _lstStream.Seek(0, SeekOrigin.Begin);
                _lstStream.CopyTo(fileStream);
            }
            string zipPath = workingPath + "\\Cobian Backup 8.zip";
            string extractPath = workingPath;
            ZipFile.ExtractToDirectory(zipPath, extractPath);
            _lstStream = _assembly.GetManifestResourceStream("RecloBM.Resources.Disk2vhd.zip");
            using (var fileStream = File.Create(workingPath + "\\Disk2vhd.zip"))
            {
                _lstStream.Seek(0, SeekOrigin.Begin);
                _lstStream.CopyTo(fileStream);
            }
            zipPath = workingPath + "\\disk2vhd.zip";
            extractPath = workingPath;
            ZipFile.ExtractToDirectory(zipPath, extractPath);
            //Console.WriteLine("Initialized");
        }

        public void NewTask(String getTaskName, String getID, String getBackupType, String[] getSource, String getDestination, String getSchedule)
        {
            String lstName;
            //task name
            String taskName;
            //ID has to be unique
            String ID;
            //1 for incremental, 0 for full
            String backupType;
            //Files to be backuped
            String Source;
            //Backup target
            String Destination;
            String Schedule;
            String[] info = new String[6];
            String source = "";
            info[0] = getTaskName;
            info[1] = getID;
            info[2] = getBackupType;
            foreach (String s in getSource)
            {
                source += "1,\"\"" + s + "\"\"\",\"";
            }
            source = source.Remove(source.Length - 3);
            info[3] = source;
            info[4] = getDestination;
            info[5] = getSchedule;
            lstName = info[0] + ".lst";
            taskName = info[0];
            ID = info[1];
            backupType = info[2];
            Source = info[3];
            Destination = info[4];
            Schedule = info[5];
            //create a new task
            //path to store the lst
            String path = "\"" + CobianPath + "DB\\" + lstName + "\"";
            createNewTask(lstName, path, taskName, ID, backupType, Source, Destination, Schedule);
            initialize(lstName, path, taskName, ID, backupType, Source, Destination, Schedule);
            //Console.WriteLine("Task created, Click Load to refresh");
        }

        public void StartBackup(String[] source, String destination, int backupType)
        {
            DataManager.setBackupStatus(1); // intializing backup
            if(!Directory.Exists(workingPath))
            {
                initializeSoftware();
            }
            //MessageBox.Show("Initialized");
            if (backupType == 1)
            {
                DataManager.setBackupStatus(2); //Creating Incremental Backup
                NewTask("IncrementalBackup", "2", "1", source, destination, "2");
            }
            else
            {
                DataManager.setBackupStatus(3); //creating full backup
                NewTask("FullBackup", "1", "0", source, destination, "4");
            }


            // MessageBox.Show("Task created");
            StartTask(0);
            // MessageBox.Show("Backup Compelete");
            //StartTask(1);
        }
    }
}
