using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Windows.Forms;
using System.Json;

namespace RecloBM
{
    public partial class Form1 : Form
    {
        public Form1()
        {
            InitializeComponent();
            logErrorLB.Text = "";
        }

        private void Form1_Load(object sender, EventArgs e)
        {
             
        }

        private void loginBTN_Click(object sender, EventArgs e)
        {
            if(emailTB.Text !="" && passTB.Text.Length > 5)
            {
                if(emailTB.Text.Contains("@"))
                {
                    logErrorLB.Text = "";
                    RecloApiCaller.loginUser(emailTB.Text, passTB.Text, (string res) => login_callback(res));
                }
                else{
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
                DataManager.addUser("Default", DataManager.cleanJSON(json["token"].ToString()), DataManager.cleanJSON(json["user_id"].ToString()));
                this.Hide();
                Form3 f = new Form3();
                f.Show();
            }
            else
            {
                // Code to execute on error goes here
                Console.WriteLine("error");
                logErrorLB.Text = "Email or password is invalid";
            }
        }

        private void regBTN_Click(object sender, EventArgs e)
        {
            this.Hide();
            Form2 f = new Form2(); // This is bad
            f.Show();
          
        }
    }
}
