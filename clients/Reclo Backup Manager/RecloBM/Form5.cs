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
    public partial class Form5 : Form
    {
        public Form5()
        {

            InitializeComponent();
            Rectangle workingArea = Screen.GetWorkingArea(this);
            this.Location = new Point(workingArea.Right - Size.Width,
                                      workingArea.Bottom - Size.Height);
            username.Text = "Username: " + DataManager.getUsername();
            sourceTB.Text = DataManager.getSource();
            destTB.Text = DataManager.getDestination();
            dateTimePicker1.Format = DateTimePickerFormat.Custom;
            dateTimePicker1.CustomFormat = "HH:mm tt"; // Only use hours and minutes
            dateTimePicker1.ShowUpDown = true;
            if(DataManager.getScheduledBackups())
            {
                checkBox1.Checked = true;
                dateTimePicker1.Enabled = true;
            }
            else
            {
                checkBox1.Checked = false;
                dateTimePicker1.Enabled = false;
            }
        }

        private void button2_Click(object sender, EventArgs e)
        {
            this.Hide();
            Form4 f = new Form4();
            f.Show();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            this.Hide();
            Form3 f = new Form3();
            f.Show();
        }

        private void radioButton1_CheckedChanged(object sender, EventArgs e)
        {

        }

        private void logout_Click(object sender, EventArgs e)
        {
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

        private void selectBackupSource_Click(object sender, EventArgs e)
        {
            FolderBrowserDialog fbd = new FolderBrowserDialog();
            DialogResult result = fbd.ShowDialog();

            sourceTB.Text = fbd.SelectedPath;
         
        
        }

        private void selectDestination_Click(object sender, EventArgs e)
        {
            FolderBrowserDialog fbd = new FolderBrowserDialog();
            DialogResult result = fbd.ShowDialog();

            destTB.Text = fbd.SelectedPath;
          
        }

        private void button4_Click(object sender, EventArgs e)
        {

            //Save all data
            DataManager.setDestination(destTB.Text);
            DataManager.setSource(sourceTB.Text);
            DataManager.setScheduledBackups(checkBox1.Checked);
       
        }

        private void checkBox1_CheckedChanged(object sender, EventArgs e)
        {

            if (checkBox1.Checked)
            {
               
                dateTimePicker1.Enabled = true;
            }
            else
            {

                dateTimePicker1.Enabled = false;
            }
        }


    }
}
