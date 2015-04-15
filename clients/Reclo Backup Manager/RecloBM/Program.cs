using RecloBM.Properties;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace RecloBM
{
   
   
    static class Program
    {
       
        /// The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main()
        {
           
            if (DataManager.userStatus())
            {
               
                Application.Run(new Form3());
            }
            else
            {
                Application.Run(new Form1());
            }
            
        }

    
    }
}