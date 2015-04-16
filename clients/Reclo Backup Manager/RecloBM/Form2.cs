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
    public partial class Form2 : Form
    {
        public Form2()
        {
            InitializeComponent();
            RegErrorLB.Text = "";
        }


        private void linkLabel1_LinkClicked(object sender, LinkLabelLinkClickedEventArgs e)
        {
            System.Diagnostics.Process.Start("http://reclo.github.io");
        }

        private void button3_Click(object sender, EventArgs e)
        {
            this.Hide();
            Form1 f1 = new Form1(); // This is bad
            f1.Show();
        }

        private void regBTN_Click(object sender, EventArgs e)
        {
            if (emailTB.Text != "" && passTB.Text != "" && nameTB.Text != "")
            {
                if (emailTB.Text.Contains("@"))
                {
                    RegErrorLB.Text = "";
                    RecloApiCaller.registerUser(emailTB.Text, passTB.Text, nameTB.Text, (string res) => register_callback(res));
                }
                else
                {
                    RegErrorLB.Text = "Email Invalid.";
                }
            }
            else
            {
                RegErrorLB.Text = "A Field Is Empty.";
            }
        }

        public void register_callback(string res)
        {
            JsonValue json = JsonValue.Parse(res); //Creates JsonValue from response string
            Console.WriteLine("My Json String = " + json.ToString()); //log that a response was recieved

            if (DataManager.cleanJSON(json["HttpStatus"].ToString()) == "200")
            {
                // Code to execute on success goes here
                Console.WriteLine("Success");
                RegErrorLB.Text = "";
                this.Hide();
                Form1 f = new Form1();
                f.Show();
            }
            else
            {
                // Code to execute on error goes here
                Console.WriteLine("error");
                RegErrorLB.Text = DataManager.cleanJSON(json["message"].ToString());
            }
        }

    }
}
