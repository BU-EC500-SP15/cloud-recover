using Newtonsoft.Json.Linq;
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
    public partial class Form4 : Form
    {
        public Form4()
        {
            InitializeComponent();
            Rectangle workingArea = Screen.GetWorkingArea(this);
            this.Location = new Point(workingArea.Right - Size.Width,
                                      workingArea.Bottom - Size.Height);
            updateListView();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            this.Hide();
            Form3 f = new Form3();
            f.Show();
        }

        private void button3_Click(object sender, EventArgs e)
        {
            this.Hide();
            Form5 f = new Form5();
            f.Show();
        }

        private void button4_Click(object sender, EventArgs e)
        {
            Console.WriteLine(DataManager.getToken());
            RecloApiCaller.getBackupList(  DataManager.getUserID() , DataManager.getToken() ,(string res) => getBackups_callback(res));
        }

        public void updateListView()
        {
            listView1.Clear();
            JsonValue backupList = DataManager.getBackupslist();
            listView1.View = View.Details;
            listView1.Columns.Add("Backup");
            listView1.Columns.Add("Date Created");
            listView1.Columns.Add("File Size");

    
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
                               listView1.Items.Add(new ListViewItem(new string[] { DataManager.cleanJSON(jarrayer[i]["file_name"].ToString()), DataManager.cleanJSON(jarrayer[i]["date_created"].ToString()), jarrayer[i]["file_size"].ToString() }));
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
               catch(NullReferenceException )
               {
                   backupListMsg.Text = "No Backups...";
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

    }
}
