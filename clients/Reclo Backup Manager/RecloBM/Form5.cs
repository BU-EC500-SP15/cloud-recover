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
    public partial class Form5 : Form
    {
        public Form5()
        {

            InitializeComponent();
            Rectangle workingArea = Screen.GetWorkingArea(this);
            this.Location = new Point(workingArea.Right - Size.Width,
                                      workingArea.Bottom - Size.Height);
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
    }
}
