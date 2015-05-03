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
using System.Windows.Forms;

namespace Reclo_Recovery_Manager
{
    public partial class Backups : Form
    {
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
    }
}
