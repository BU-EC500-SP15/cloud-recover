using RecloBM;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Windows.Forms;

namespace Reclo_Recovery_Manager
{
    static class Program
    {
        /// <summary>
        /// The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);


            //Check if folder exists
            string ProgramFiles = Environment.GetFolderPath(Environment.SpecialFolder.ProgramFiles);
            string MyNewPath = System.IO.Path.Combine(ProgramFiles, "../Reclo");

            if (!Directory.Exists(MyNewPath))
            {
                System.IO.Directory.CreateDirectory(MyNewPath);
                Console.WriteLine("Created Reclo");

            }

            if (!System.IO.File.Exists(@"c:\Reclo\RMData.txt"))
            {
                File.WriteAllText(Path.Combine(MyNewPath, "RMData.txt"), "");
                Console.WriteLine("Created RMData.txt");
            }
            else
            {
                if (DataManager.userStatus())
                {
                    Application.Run(new MyInstances());

                }
                else
                {
                    Application.Run(new loginForm());
                }
            }
        
        }
    }
}
