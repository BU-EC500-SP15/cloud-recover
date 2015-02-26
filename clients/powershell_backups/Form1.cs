using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Management.Automation;
using System.Collections.ObjectModel;
using System.Diagnostics;

namespace CloudRecovery
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
        }
        public static string[] folderOutput = new string[100];
        public string date;
        public void getFile()
        {
            using (PowerShell PowerShellInstance = PowerShell.Create())
            {
                //PowerShellInstance.AddScript("param($param1) $d = get-date; $s = 'test string value'; " + "$d; $s; $param1; get-service");
                //PowerShellInstance.AddScript("date;");
                PowerShellInstance.AddScript("dir d: | ?{$_.lastwritetime -gt '2/23/2014 7:56:41 PM'};");
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
                        //richTextBox1.Text = richTextBox1.Text + "\n" + folderOutput[i];
                        //i += 1;
                    }
                }
                //richTextBox1.Text = richTextBox1.Text + "\nFinished";
            }
        }

        public void startFullBackup()
        {
            //Folder and disk to backup
            string[] path = new string[100];
            path[0] = "d:";
            path[1] = "c:\\include";
            string stringInclude = "";
            for (int i = 0; i < path.Length; i++)
            {
                if (path[i] != null)
                    stringInclude += "'"+path[i]+"\\',";
            }
            char[] charInclude = stringInclude.ToCharArray();
            for (int j = 0; j < charInclude.Length - 1; j++)
            {
                charInclude[j] = charInclude[j + 1];
            }
            char[] resultInclude = new char[(charInclude.Length - 3)];
            for (int k = 0; k < resultInclude.Length; k++)
            {
                resultInclude[k] = charInclude[k];
            }
            string Include = new string(resultInclude);
            //Place to store the vhd image, has to be a disk
            string backupTarget = "e:";
            //textBox1.Text += " WBADMIN START BACKUP -backuptarget:" + backupTarget + " -include:" + Include + " -quiet";
            //WBADMIN START BACKUP command
            ProcessStartInfo wbadminStartInfo = new ProcessStartInfo("C:\\windows\\system32\\wbadmin.exe", " START BACKUP -backuptarget:" + backupTarget + " -include:" + Include + " -quiet");
            wbadminStartInfo.CreateNoWindow = true;
            wbadminStartInfo.UseShellExecute = false;
            wbadminStartInfo.RedirectStandardInput = true;
            wbadminStartInfo.RedirectStandardOutput = true;
            wbadminStartInfo.RedirectStandardError = true;
            Process wbadminProcess = new Process();
            wbadminProcess.StartInfo = wbadminStartInfo;
            //start progress
            wbadminProcess.Start();
            wbadminProcess.BeginOutputReadLine();
            wbadminProcess.WaitForExit();
            //textBox1.Text = textBox1.Text + "Finished";
        }

        public void startIncrementalBackup()
        {
            //not finished
            string include = "d:";
            string backupTarget = "e:";
            ProcessStartInfo wbadminStartInfo = new ProcessStartInfo("C:\\windows\\system32\\wbadmin.exe", " START BACKUP -backuptarget:" + backupTarget + " -include:" + include + " -quiet");
            wbadminStartInfo.CreateNoWindow = true;
            wbadminStartInfo.UseShellExecute = false;
            wbadminStartInfo.RedirectStandardInput = true;
            wbadminStartInfo.RedirectStandardOutput = true;
            wbadminStartInfo.RedirectStandardError = true;
            Process wbadminProcess = new Process();
            wbadminProcess.StartInfo = wbadminStartInfo;
            wbadminProcess.Start();
            wbadminProcess.BeginOutputReadLine();
            wbadminProcess.WaitForExit();
            textBox1.Text = textBox1.Text + "Finished";
        }

        public void getDate()
        {
            using (PowerShell dateInstance = PowerShell.Create())
            {
                dateInstance.AddScript("Get-Item e:\\WindowsImageBackup | Foreach {$_.LastWriteTime};");
                Collection<PSObject> PSOutput = dateInstance.Invoke();
                foreach (PSObject outputItem in PSOutput)
                {
                    // if null object was dumped to the pipeline during the script then a null
                    // object may be present here. check for null to prevent potential NRE.
                    if (outputItem != null)
                    {
                        //TODO: do something with the output item 
                        // outputItem.BaseOBject
                        date = outputItem.BaseObject.ToString();
                        richTextBox1.Text = richTextBox1.Text + "\n" + date;
                    }
                }
            }
        }

        public void reName()
        {
            using (PowerShell reNameInstance = PowerShell.Create())
            {
                reNameInstance.AddScript("Rename-Item e:\\WindowsImageBackup 1;");
                reNameInstance.Invoke();
                richTextBox1.Text += "rename finished";
            }
        }

        private void button1_Click(object sender, EventArgs e)
        {
            //Start a full backup. Other three functions are for incremental backup
            startFullBackup();
            //reName();
            //getDate();
            //getFile();
            //startIncrementalBackup();
        }
    }
}
