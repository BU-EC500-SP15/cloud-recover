using Newtonsoft.Json.Linq;
using RecloBM;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Json;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Timers;
using System.Windows.Forms;

namespace Reclo_Recovery_Manager
{
   
    public partial class Backups : Form
    {
        public int rowIndex = 0;
        System.Timers.Timer aTimer;
        public Backups()
        {
            InitializeComponent();
         
            Rectangle workingArea = Screen.GetWorkingArea(this);
            this.Location = new Point(workingArea.Right - Size.Width,
                                      workingArea.Bottom - Size.Height);
            updateListView();
        }

        private void button4_Click(object sender, EventArgs e)
        {
            //Get backupslist
            Console.WriteLine(DataManager.getToken());
            RecloApiCaller.getBackupList(DataManager.getUserID(), DataManager.getToken(), (string res) => getBackups_callback(res));
        }

        private void button1_Click(object sender, EventArgs e)
        {
            // open instances
            this.Hide();
            MyInstances f = new MyInstances();
            f.Show();
        }   

        private void button3_Click(object sender, EventArgs e)
        {
            /*
            // open Settings form
            this.Hide();
            Settings f = new Settings();
            f.Show();
            */
            if (MessageBox.Show("Are You sure you want to logout?", "Question", MessageBoxButtons.YesNo, MessageBoxIcon.Question) == DialogResult.No)
            {
            }
            else
            {
                RecloApiCaller.logoutUser(DataManager.getToken(), (string res) => logout_callback(res));
            }

        }


        public void getBackups_callback(string res)
        {
            JsonValue json = JsonValue.Parse(res); //Creates JsonValue from response string
            Console.WriteLine("My Json String = " + json.ToString()); //log that a response was recieved
            DataManager.addBackupsList(json);
            if (DataManager.cleanJSON(json["HttpStatus"].ToString()) == "200")
            {
                // Code to execute on success goes here
                Console.WriteLine("Success");
               updateListView();
            }
            else
            {
                // Code to execute on error goes here
                Console.WriteLine("error");
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

        public void updateListView()
        {
            dataGridView1.Rows.Clear();
            JsonValue backupList = DataManager.getBackupslist();

            try
            {
                try
                {
                    try
                    {
                        backupListMsg.Hide();
                        JsonValue jarrayer = backupList["backups"];
                        string array = backupList["backups"].ToString();
                        // Console.WriteLine("The json val is" + array[0]["backup_id"]);
                        JArray items = JArray.Parse(array);
                        int length = items.Count;
                        for (int i = 0; i < length; i++)
                        {
                            this.dataGridView1.Rows.Add(jarrayer[i]["backup_id"].ToString(), i, DataManager.cleanJSON(jarrayer[i]["file_name"].ToString())
                                , jarrayer[i]["file_size"].ToString(), DataManager.cleanJSON(jarrayer[i]["date_created"].ToString()));
                            dataGridView1.Refresh();
                            //dataGridView1.Rows.Add(new ListViewItem(new string[] { DataManager.cleanJSON(jarrayer[i]["file_name"].ToString()), DataManager.cleanJSON(jarrayer[i]["date_created"].ToString()), jarrayer[i]["file_size"].ToString() }));
                        }
                    }
                    catch (KeyNotFoundException)
                    {

                    }
                }
                catch (InvalidOperationException)
                {
                    backupListMsg.Text = "No Backups...";
                }
            }
            catch (NullReferenceException)
            {
                backupListMsg.Text = "No Backups...";
            }
        }

        //Start a new instance button
        private void button5_Click(object sender, EventArgs e)
        {

            if (!DataManager.getInstanceUp() && (DataManager.getRecoveryStatus() == "finished" || DataManager.getRecoveryStatus() == "failed"))
            {
                if (dataGridView1.SelectedRows.Count > 0)
                { 
                    rowIndex = dataGridView1.SelectedRows[0].Index;
                    string backupID;
                    backupID = dataGridView1.Rows[rowIndex].Cells[0].Value.ToString();
                    RecloApiCaller.startRecovery(DataManager.getUserID(), DataManager.getToken(), backupID, (string res) => startInstance_callback(res));
                }
                else
                {
                    MessageBox.Show("Please select An Instance.");
                }
            }
            else
            {
                MessageBox.Show("Please spin down current instance inorder to run a new one.");
            }
        }

        public void startInstance_callback(string res)
        {
            JsonValue json = JsonValue.Parse(res); //Creates JsonValue from response string
            Console.WriteLine("My Json String = " + json.ToString()); //log that a response was recieved
            if (DataManager.cleanJSON(json["HttpStatus"].ToString()) == "200")
            {
                // Code to execute on success goes here
                Console.WriteLine("pending");
                DataManager.setInstanceUp(false);
                DataManager.setRecoveryStatus("start");
                DataManager.setRecoveryID(DataManager.cleanJSON(json["recovery_id"].ToString()));
                aTimer = new System.Timers.Timer();
                aTimer.Elapsed += new ElapsedEventHandler(OnTimedEvent);
                // Set the Interval to 1 minute. 1000 = 1 second.
                aTimer.Interval = 60000;
            }
            else
            {
                // Code to execute on error goes here
                Console.WriteLine("error");
            }
        }

        //Timer for check the status
        private void OnTimedEvent(object source, ElapsedEventArgs e)
        {
            //do something with the timer
            RecloApiCaller.getProgress(DataManager.getRecoveryID(), DataManager.getToken(), (string res4) => cs_callback(res4));
        }

        public void cs_callback(string res)
        {
            JsonValue json = JsonValue.Parse(res); //Creates JsonValue from response string
            Console.WriteLine("My Json String = " + json.ToString()); //log that a response was recieved
            if (DataManager.cleanJSON(json["HttpStatus"].ToString()) == "200")
            {
                // Code to execute on success goes here
                Console.WriteLine("Success");
                DataManager.setInstanceUp(false);
                try
                {
                    DataManager.setRecoveryStatus(DataManager.cleanJSON(json["current_state"].ToString()));
                    DataManager.setRecoveryPercent(DataManager.cleanJSON(json["state_progress"].ToString()));
                    if (DataManager.cleanJSON(json["current_state"].ToString()) == "finished")
                    {
                        aTimer.Stop();
                        DataManager.setInstanceUp(true);
                    }
                    if (DataManager.cleanJSON(json["current_state"].ToString()) == "failed")
                    {
                        aTimer.Stop();
                        DataManager.setInstanceUp(false);
                    }
                }catch(KeyNotFoundException)
                {
                    aTimer.Stop();
                }

            }
            else
            {
                // Code to execute on error goes here
                Console.WriteLine("error");
            }
        }
    }
}
