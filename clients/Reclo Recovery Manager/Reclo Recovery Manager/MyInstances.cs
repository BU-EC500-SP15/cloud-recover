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
    public partial class MyInstances : Form
    {
        public MyInstances()
        {
            InitializeComponent();
            Rectangle workingArea = Screen.GetWorkingArea(this);
            this.Location = new Point(workingArea.Right - Size.Width,
                                      workingArea.Bottom - Size.Height);
            RecloApiCaller.getInstances(DataManager.getUserID(), DataManager.getToken(), (string res) => getInstances_callback(res));
            clearView();
            updateDataView();
        }

        private void button4_Click(object sender, EventArgs e)
        {
            //Refresh
            RecloApiCaller.getInstances(DataManager.getUserID(), DataManager.getToken(), (string res) => getInstances_callback(res));

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

            if (MessageBox.Show("Are You sure you want to logout?", "Question", MessageBoxButtons.YesNo, MessageBoxIcon.Question) == DialogResult.No)
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
                updateDataView();
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
        
    }
}
