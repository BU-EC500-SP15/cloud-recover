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
    public partial class Settings : Form
    {
        public Settings()
        {
            InitializeComponent();
        }

        private void button2_Click(object sender, EventArgs e)
        {
            // open Backups
            this.Hide();
            Backups f = new Backups();
            f.Show();
        }

        private void button1_Click(object sender, EventArgs e)
        {
            // open my instances
            this.Hide();
            MyInstances f = new MyInstances();
            f.Show();
        }
    }
}
