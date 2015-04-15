using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
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
            //Start a backup immedietly
        }

        private void label3_Click(object sender, EventArgs e)
        {

        }
    }
}
