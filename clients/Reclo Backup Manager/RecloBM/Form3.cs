using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Json;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace RecloBM
{
    public partial class Form3 : Form
    {
        public Form3()
        {
            InitializeComponent();
            Rectangle workingArea = Screen.GetWorkingArea(this);
            this.Location = new Point(workingArea.Right - Size.Width,
                                      workingArea.Bottom - Size.Height);
            label1.Text = "Hey, " + DataManager.getUsername() + " how are you? Scheduled Backups are off and your system has not been backed up. We suggest you click the \"Start Backup Now Button.\"";
        }

        private void button2_Click(object sender, EventArgs e)
        {
            // Open form 4 aka mybackups
            this.Hide();
            Form4 f = new Form4();
            f.Show();
        }

        private void button3_Click(object sender, EventArgs e)
        {
            // Open form 5 aka settings
            this.Hide();
            Form5 f = new Form5();
            f.Show();
        }

        private void button4_Click(object sender, EventArgs e)
        {
            //Make api call
            //First find out what type of backup is needed to be done
            //Second Reschedule todays backup
            //Start a backup immedietly
            //Check that source and destination are set up

            
            if (DataManager.getSource() == "Select Drive..." || DataManager.getDestination() == "Select Location...")
            {
                MessageBox.Show("Please Setup Your Source And Destination Folders In the Settings Tab.");
            }
            else{
                BackupTools bt = new BackupTools();
                bt.deleteFolder();
                statusLB.Text = "Creating VHD and Uploading it.";
                pictureBox1.Image = Properties.Resources.backingup;
                 String[] source = { DataManager.getSource()}; //"d:\\BackupTarget"
                 String destination = DataManager.getDestination();
                //StartBackup is the function you need
                BackupTools Backup = new BackupTools();
                InitTimer();
                Backup.StartBackup(source, destination, 0);
                //Create name
                string dater = DateTime.Now.ToString("MMddyyyyhmmtt");
                string nameVHD = "Backup-"+dater+".vhd";
                DataManager.setVHDName(nameVHD);

                RecloApiCaller.authorizeUpload(DataManager.getUserID(), DataManager.getToken(), DataManager.getVHDName(), "20", (string res) => upload_callback(res));
            }
          
        }

        public void upload_callback(string res)
        {
            JsonValue json = JsonValue.Parse(res); //Creates JsonValue from response string
            Console.WriteLine("My Json String = " + json.ToString()); //log that a response was recieved
            if (DataManager.cleanJSON(json["HttpStatus"].ToString()) == "200")
            {
                // Code to execute on success goes here
                Console.WriteLine("Success");
                // find file rename it
                System.IO.File.Move(DataManager.getDestination() +"test.vhd", DataManager.getDestination() + DataManager.getVHDName());
        
                S3Uploader.uploadFile(DataManager.getDestination() +  DataManager.getVHDName(),
                    "reclo-client-backups/" + DataManager.getUserID(), 
                    DataManager.cleanJSON(json["credentials"]["AccessKeyId"].ToString()), 
                    DataManager.cleanJSON(json["credentials"]["SecretAccessKey"].ToString()),
                    DataManager.cleanJSON(json["credentials"]["SessionToken"].ToString()));


                pictureBox1.Image = Properties.Resources.backed;
                statusLB.Text = "System is backed up.";
                label1.Text = "Hey, " + DataManager.getUsername() + " Scheduled Backups are off and your last backup was on MM/DD/YYYY HH:MM tt";
            }
            else
            {
                // Code to execute on error goes here
                Console.WriteLine(json["message"]);
            }
        }

        public static void threader()
        {

        }
        private void label3_Click(object sender, EventArgs e)
        {

        }

        private Timer timer1;
        public void InitTimer()
        {
            timer1 = new Timer();
            timer1.Tick += new EventHandler(timer1_Tick);
            timer1.Interval = 2000; // in miliseconds
            timer1.Start();
        }

        private void timer1_Tick(object sender, EventArgs e)
        {
            switch(DataManager.getBackupStatus())
            {
                case 0:
                    timer1.Stop();
                    break;
                case 1:
                    Console.WriteLine("Case 2");
                    break;
                default:
                    Console.WriteLine("Default case");
                    break;
            }
        }

        private void pictureBox1_Click(object sender, EventArgs e)
        {

        }
    }
}
