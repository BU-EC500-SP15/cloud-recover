using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using System.IO.Compression;
using System.Diagnostics;

namespace OpenVPN
{
    class Program
    {
        public static String workingPath = "C:\\MyCloudRecovery";
        public static void initialize()
        {
            try
            {
                DirectoryInfo di = Directory.CreateDirectory(workingPath);
                Assembly _assembly;
                Stream _lstStream;
                _assembly = Assembly.GetExecutingAssembly();
                _lstStream = _assembly.GetManifestResourceStream("OpenVPN.Resources.OpenVPN.zip");
                using (var fileStream = File.Create(workingPath + "\\OpenVPN.zip"))
                {
                    _lstStream.Seek(0, SeekOrigin.Begin);
                    _lstStream.CopyTo(fileStream);
                }
                string zipPath = workingPath + "\\OpenVPN.zip";
                string extractPath = workingPath;
                ZipFile.ExtractToDirectory(zipPath, extractPath);
            }
            catch
            {
            }
        }
        public static void startConnection()
        {
            //ProcessStartInfo StartInfo = new ProcessStartInfo(workingPath + "\\OpenVPN\\bin\\openvpn-gui-1.0.3.exe", "C:\\MyCloudRecovery\\OpenVPN\\bin\\openvpn-gui-1.0.3.exe --connect client.ovpn");
            ProcessStartInfo StartInfo = new ProcessStartInfo();
            StartInfo.FileName = workingPath + "\\OpenVPN\\bin\\openvpn-gui-1.0.3.exe";
            StartInfo.CreateNoWindow = true;
            StartInfo.UseShellExecute = false;
            StartInfo.RedirectStandardInput = true;
            StartInfo.RedirectStandardOutput = true;
            StartInfo.RedirectStandardError = true;
            Process openvpnProcess = new Process();
            openvpnProcess.StartInfo = StartInfo;
            //start progress
            openvpnProcess.Start();
            openvpnProcess.BeginOutputReadLine();
        }
        static void Main(string[] args)
        {
            initialize();
            startConnection();
        }
    }
}
