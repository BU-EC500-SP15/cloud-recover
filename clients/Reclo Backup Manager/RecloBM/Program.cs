using RecloBM.Properties;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
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


            //Check if folder exists
            string ProgramFiles = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);
            string MyNewPath = System.IO.Path.Combine(ProgramFiles, "../Reclo");

            if (!Directory.Exists(MyNewPath))
            {
                System.IO.Directory.CreateDirectory(MyNewPath);
                Console.WriteLine("Created Reclo");
            }


            if (!System.IO.File.Exists(@"c:\Reclo\BMSettings.txt"))
            {
                File.WriteAllText(Path.Combine(MyNewPath, "BMSettings.txt"), "{ \"source\": \"Select Drive...\", \"destination\": \"Select Location...\", \"checked\": \"0\", \"time\": \"1/1/0001 12:00:00 AM\", \"count\": \"0\"}");
                Console.WriteLine("Created BMSettings.txt");
            }


            if (!System.IO.File.Exists(@"c:\Reclo\BMData.txt"))
            {
                File.WriteAllText(Path.Combine(MyNewPath, "BMData.txt"), "");
                Console.WriteLine("Created BMData.txt");
            }
            else
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
}