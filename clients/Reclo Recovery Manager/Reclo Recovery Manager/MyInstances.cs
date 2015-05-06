using Newtonsoft.Json.Linq;
using RecloBM;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Diagnostics;
using System.Drawing;
using System.IO;
using System.Json;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.Timers;
using System.Windows.Forms;
using System.IO.Compression;
using System.Diagnostics;

namespace Reclo_Recovery_Manager
{
    public partial class MyInstances : Form
    {
        public static System.Timers.Timer bTimer;
        public MyInstances()
        {
            //bTimer = new System.Timers.Timer();
            InitializeComponent();
            Rectangle workingArea = Screen.GetWorkingArea(this);
            this.Location = new Point(workingArea.Right - Size.Width,
                                      workingArea.Bottom - Size.Height);
            RecloApiCaller.getInstances(DataManager.getUserID(), DataManager.getToken(), (string res) => getInstances_callback(res));
            clearView();
            updateDataView();
            updateView();
            /*
            if (!DataManager.getInstanceUp() && (DataManager.getRecoveryStatus() != "finished" || DataManager.getRecoveryStatus() != "failed") && !bTimer.Enabled)
            {
               
                bTimer.Elapsed += new ElapsedEventHandler(OnTimedEvent);
                bTimer.Interval = 30000;
                bTimer.Start();
            }
             * */
            connectBTN.Show();

          
        }

        private void button4_Click(object sender, EventArgs e)
        {
            if (DataManager.getRecoveryStatus() == "failed" || DataManager.getRecoveryStatus() == "finished")
            {
                //Open Backups page
                this.Hide();
                Backups f = new Backups();
                f.Show();
            }
            else{
                updateView();
            }
          
        }

        private void button2_Click(object sender, EventArgs e)
        {
            //Open Backups page
            this.Hide();
            Backups f = new Backups();
            f.Show();
        }

        private void button3_Click(object sender, EventArgs e)
        {
            /*
            //Open Backups page
            this.Hide();
            Settings f = new Settings();
            f.Show();
            */

            if (MessageBox.Show("Are you sure you want to logout?", "Question", MessageBoxButtons.YesNo, MessageBoxIcon.Question) == DialogResult.No)
            {
            }
            else
            {
                RecloApiCaller.logoutUser(DataManager.getToken(), (string res) => logout_callback(res));
            }
          
        }

        public void logout_callback(string res)
        {
            JsonValue json = JsonValue.Parse(res); //Creates JsonValue from response string
            Console.WriteLine("My Json String = " + json.ToString()); //log that a response was recieved

            if (DataManager.cleanJSON(json["HttpStatus"].ToString()) == "200")
            {
                // Code to execute on success goes here
                Console.WriteLine("Success");
                DataManager.clearUser();
                if (System.Windows.Forms.Application.MessageLoop)
                {
                    // WinForms app
                    System.Windows.Forms.Application.Exit();
                }
                else
                {
                    // Console app
                    System.Environment.Exit(1);
                }
            }
            else
            {
                // Code to execute on error goes here
                Console.WriteLine(json["message"]);
                
            }
        
        }

        public void updateDataView()
        {
           
            JsonValue instancesList = DataManager.getInstancesList();
            try
            {
                try
                {
                    try
                    {
                        //backupListMsg.Hide();
                        JsonValue jarrayer = instancesList["instances"];
                        string array = instancesList["instances"].ToString();
                        Console.WriteLine("The json val is" + array);
                        //JArray items = JArray.Parse(array);
                        //int length = items.Count;

                              uidLBL.Text =  DataManager.cleanJSON(jarrayer["instance_id"].ToString())  ;
                              stateLBL.Text = DataManager.cleanJSON(jarrayer["instance_state"].ToString());
                              nameLBL.Text = DataManager.cleanJSON(jarrayer["instance_name"].ToString());
                              ipLBL.Text =  DataManager.cleanJSON(jarrayer["ip_address"].ToString());
                              zoneLBL.Text =  DataManager.cleanJSON(jarrayer["availability_zone"].ToString());
                              dateLBL.Text =  DataManager.cleanJSON(jarrayer["date_created"].ToString());                        
                    }
                    catch (KeyNotFoundException)
                    {
                      
                    }
                }
                catch (InvalidOperationException)
                {
                   // backupListMsg.Text = "No Backups...";
                }
            }
            catch (NullReferenceException)
            {
                //backupListMsg.Text = "No Backups...";
            }
         
        }

        public void getInstances_callback(string res)
        {
            JsonValue json = JsonValue.Parse(res); //Creates JsonValue from response string
            Console.WriteLine("My Json String = " + json.ToString()); //log that a response was recieved
            DataManager.addInstancesList(json);
            if (DataManager.cleanJSON(json["HttpStatus"].ToString()) == "200")
            {
                // Code to execute on success goes here
                Console.WriteLine("Success");
                try{
                   
                    DataManager.setInstanceID(DataManager.cleanJSON(json["instances"]["instance_id"].ToString()));
                    DataManager.setInstanceUp(true);
                    DataManager.setRecoveryStatus("finished");
                }
                catch(KeyNotFoundException)
                {
                    DataManager.setInstanceUp(false);
                }
                Console.WriteLine("SET INSTANCE IS " + DataManager.getInstanceUp());
                updateDataView();
                updateView();
            }
            else
            {
                // Code to execute on error goes here
                Console.WriteLine("error");
            }
        }

        private void label3_Click(object sender, EventArgs e)
        {

        }

        public void clearView()
        {
            uidLBL.Text = "";
            stateLBL.Text = "";
            nameLBL.Text = "";
            ipLBL.Text = "";
            zoneLBL.Text = "";
            dateLBL.Text = "";
        }
       
        public void hideView()
        {
            uidLBL.Hide();
            stateLBL.Hide();
            nameLBL.Hide();
            ipLBL.Hide();
            zoneLBL.Hide();
            dateLBL.Hide();
            label5.Hide();
            label6.Hide();
            label7.Hide();
            label3.Hide();
            label4.Hide();
            label1.Hide();
        }

        public void showView()
        {
            uidLBL.Show();
            stateLBL.Show();
            nameLBL.Show();
            ipLBL.Show();
            zoneLBL.Show();
            dateLBL.Show();
            label5.Show();
            label6.Show();
            label7.Show();
            label3.Show();
            label4.Show();
            label1.Show();
        }
        public static String workingPath = "C:\\Reclo";
        public static void startConnection()
        {
            //ProcessStartInfo StartInfo = new ProcessStartInfo(workingPath + "\\OpenVPN\\bin\\openvpn-gui-1.0.3.exe", "C:\\MyCloudRecovery\\OpenVPN\\bin\\openvpn-gui-1.0.3.exe --connect client.ovpn");
            ProcessStartInfo StartInfo = new ProcessStartInfo();
            StartInfo.FileName = workingPath + "\\OpenVPN\\bin\\openvpn-gui-1.0.3.exe";
            StartInfo.CreateNoWindow = true;
            StartInfo.UseShellExecute = false;
            StartInfo.RedirectStandardInput = true;
            StartInfo.RedirectStandardOutput = true;
            StartInfo.RedirectStandardError = true;
            Process openvpnProcess = new Process();
            openvpnProcess.StartInfo = StartInfo;
            //start progress
            openvpnProcess.Start();
            openvpnProcess.BeginOutputReadLine();
        }
        public static void initialize()
        {
            
            //try
            //{
                DirectoryInfo di = Directory.CreateDirectory(workingPath);
                Assembly _assembly;
                Stream _lstStream;
                _assembly = Assembly.GetExecutingAssembly();
                _lstStream = _assembly.GetManifestResourceStream("RecloRecoveryManager.Resources.OpenVPN.zip");
                using (var fileStream = File.Create(workingPath + "\\OpenVPN.zip"))
                {
                    _lstStream.Seek(0, SeekOrigin.Begin);
                    _lstStream.CopyTo(fileStream);
                }
                string zipPath = workingPath + "\\OpenVPN.zip";
                string extractPath = workingPath;
                ZipFile.ExtractToDirectory(zipPath, extractPath);
            //}
            //catch
            //{
            //}
        }
        private void button5_Click(object sender, EventArgs e)
        {
            initialize();
            startConnection();
        }
        
        public void updateView()
        {
           
            if (DataManager.getInstanceUp())
            {
                showView();
                nextBTN.Hide();
                connectBTN.Show();
                stopBTN.Show();
                pictureBox1.Hide();
                spinMSG.Text = "Instance is running succesfully.";
                /*
                if (bTimer.Enabled)
                {
                    bTimer.Stop();
                }
                 * */
            }
            else
            {
                hideView();
                nextBTN.Show();
                connectBTN.Hide();
                stopBTN.Hide();
                pictureBox1.Show();
                Console.WriteLine("RECO STAT: " + DataManager.getRecoveryStatus());
                    if (DataManager.getRecoveryStatus() == "finished")
                    {
                        pictureBox1.Image = Properties.Resources.backed1;

                        nextBTN.Text = "Start Recovery";
                        spinMSG.Text = "Select a backup to spin up.";
                        /*
                        if (bTimer.Enabled)
                        {
                            bTimer.Stop();
                        }
                         * */
                    }
                    else if (DataManager.getRecoveryStatus() == "failed")
                    {
                        pictureBox1.Image = Properties.Resources.backed1;
                        nextBTN.Text = "Start Recovery";
                        spinMSG.Text = "Instance has failed spining up... please try again.";
                        /*
                        if (bTimer.Enabled)
                        {
                            bTimer.Stop();
                        }
                         * */
                    }
                    else
                    {
                        pictureBox1.Image = Properties.Resources.backingup;
                        nextBTN.Text = "Refresh Status";
                                spinMSG.Text = "Instance is currently " +
                             DataManager.getRecoveryStatus() +
                             " at " +
                             DataManager.getRecoveryPercent();
                    }
            }

        }


        //Timer for check the status
        private void OnTimedEvent(object source, ElapsedEventArgs e)
        {
            //do something with the timer
            updateView();
        }

        private void stopBTN_Click(object sender, EventArgs e)
        {
              RecloApiCaller.stopInstance(DataManager.getInstanceID() ,DataManager.getToken(), (string res) => stopI_callback(res));
        }

        public void stopI_callback(string res)
        {
            try
            {

                JsonValue json = JsonValue.Parse(res); //Creates JsonValue from response string
                Console.WriteLine("My Json String = " + json.ToString()); //log that a response was recieved

                if (DataManager.cleanJSON(json["HttpStatus"].ToString()) == "200")
                {
                    // Code to execute on success goes here
                    Console.WriteLine("Success");
                    DataManager.setInstanceUp(false);
                }
                else
                {
                    // Code to execute on error goes here
                    Console.WriteLine(json["message"]);
                }
            }
            catch (KeyNotFoundException)
            {

            }
        }

        private void pictureBox1_Click(object sender, EventArgs e)
        {

        }
    }
}
