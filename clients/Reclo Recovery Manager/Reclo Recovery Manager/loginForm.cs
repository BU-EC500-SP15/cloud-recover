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
    public partial class loginForm : Form
    {
        public loginForm()
        {
            InitializeComponent();
            logErrorLB.Text = "";
        }

        private void loginBTN_Click(object sender, EventArgs e)
        {
            if (emailTB.Text != "" && passTB.Text.Length > 5)
            {
                if (emailTB.Text.Contains("@"))
                {
                    logErrorLB.Text = "";
                    RecloApiCaller.loginUser(emailTB.Text, passTB.Text, (string res) => login_callback(res));
                }
                else
                {
                    logErrorLB.Text = "Email Or Password Missing.";
                }
            }
            else
            {
                logErrorLB.Text = "Email Or Password Missing.";
            }
        }


        public void login_callback(string res)
        {
            JsonValue json = JsonValue.Parse(res); //Creates JsonValue from response string
            Console.WriteLine("My Json String = " + json.ToString()); //log that a response was recieved

            if (DataManager.cleanJSON(json["HttpStatus"].ToString()) == "200")
            {
                // Code to execute on success goes here
                Console.WriteLine("Success");
                logErrorLB.Text = "";
                DataManager.addUser(DataManager.cleanJSON(json["username"].ToString()), DataManager.cleanJSON(json["token"].ToString()), DataManager.cleanJSON(json["user_id"].ToString()));
                RecloApiCaller.getBackupList(DataManager.getUserID(), DataManager.getToken(), (string res1) => getBackups_callback(res));


            }
            else
            {
                // Code to execute on error goes here
                Console.WriteLine("error");
                logErrorLB.Text = "Email or password is invalid";
            }
        }


        public void getBackups_callback(string res1)
        {
            JsonValue json = JsonValue.Parse(res1); //Creates JsonValue from response string
            Console.WriteLine("My Json String = " + json.ToString()); //log that a response was recieved

            if (DataManager.cleanJSON(json["HttpStatus"].ToString()) == "200")
            {
                // Code to execute on success goes here
                Console.WriteLine("Success");
                DataManager.addBackupsList(json);
            }
            else
            {
                // Code to execute on error goes here
                Console.WriteLine("error");

            }
            this.Hide();
            MyInstances f = new MyInstances();
            f.Show();
        }
    }
}
