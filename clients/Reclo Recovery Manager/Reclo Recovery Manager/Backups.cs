using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.Data;
using System.Drawing;
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
        }

        private void button4_Click(object sender, EventArgs e)
        {

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
            // open Settings form
            this.Hide();
            Settings f = new Settings();
            f.Show();
        }
    }
}
