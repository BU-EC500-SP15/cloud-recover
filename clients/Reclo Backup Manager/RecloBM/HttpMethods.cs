using System;
using System.Collections.Specialized;
using System.Collections.Generic;
using System.Net.Http;



// command for compiling with MONO 
//  mcs /reference:System.ServiceModel.Web.dll /reference:System.Net.Http /reference:System.Runtime.Serialization *

public static class HttpMethods
{
    private static string urlHead = "http://52.11.1.237:3000/";


        public static void httpPOST(IEnumerable<KeyValuePair<string, string>> nameValueCollection, string url, Action<string> callBack)
        {   
                Console.Write("Sending Http POST to "+urlHead+url+"...\n");
                using(var client = new HttpClient())
                {
                    client.BaseAddress = new Uri(urlHead);

                    var content = new FormUrlEncodedContent(nameValueCollection);
                    var result = client.PostAsync(url, content).Result;
                    string resultContent = result.Content.ReadAsStringAsync().Result;
                    string statusCode = result.StatusCode.ToString();
                    Console.WriteLine("Content: "+resultContent);
                    Console.WriteLine("StatusCode: "+statusCode);
                    
                      if (result.IsSuccessStatusCode)
                        {
                            callBack(addStatusToJson(resultContent,"200"));
                        }
                        else
                        {
                            callBack(addStatusToJson(resultContent,"500"));
                        }
                    
                }
        }



        public static void httpGET(string url, Action<string> callBack)
        {   
                Console.Write("Sending Http GET to "+urlHead+url+"...\n");
                using(var client = new HttpClient())
                {
                    client.BaseAddress = new Uri(urlHead);

                    var result = client.GetAsync(url).Result;
                    string resultContent = result.Content.ReadAsStringAsync().Result;
                    string statusCode = result.StatusCode.ToString();
                    Console.WriteLine("Content: "+resultContent);
                    Console.WriteLine("StatusCode: "+statusCode);
                    
                      if (result.IsSuccessStatusCode)
                        {
                            callBack(addStatusToJson(resultContent,"200"));
                        }
                        else
                        {
                            callBack(addStatusToJson(resultContent,"500"));
                        }
                   
                }
        }


         public static void httpPUT(IEnumerable<KeyValuePair<string, string>> nameValueCollection, string url, Action<string> callBack)
        {   
                Console.Write("Sending Http PUT to "+urlHead+url+"...\n");
                using(var client = new HttpClient())
                {
                    client.BaseAddress = new Uri(urlHead);
                    
                    var content = new FormUrlEncodedContent(nameValueCollection);
                    var result = client.PutAsync(url,content).Result;
                                       string resultContent = result.Content.ReadAsStringAsync().Result;
                    string statusCode = result.StatusCode.ToString();
                    Console.WriteLine("Content: "+resultContent);
                    Console.WriteLine("StatusCode: "+statusCode);
                    
                      if (result.IsSuccessStatusCode)
                        {
                            callBack(addStatusToJson(resultContent,"200"));
                        }
                        else
                        {
                            callBack(addStatusToJson(resultContent,"500"));
                        }
                }
        }


        public static void httpDELETE(string url, Action<string> callBack)
        {   
                Console.Write("Sending Http DELETE to "+urlHead+url+"...\n");
                using(var client = new HttpClient())
                {
                    client.BaseAddress = new Uri(urlHead);

                    var result = client.DeleteAsync(url).Result;
                                       string resultContent = result.Content.ReadAsStringAsync().Result;
                    string statusCode = result.StatusCode.ToString();
                    Console.WriteLine("Content: "+resultContent);
                    Console.WriteLine("StatusCode: "+statusCode);
                    
                      if (result.IsSuccessStatusCode)
                        {
                            callBack(addStatusToJson(resultContent,"200"));
                        }
                        else
                        {
                            callBack(addStatusToJson(resultContent,"500"));
                        }
                }
        }

        private static string addStatusToJson(string jsonin, string status)
        {
            return (jsonin.Substring(0, jsonin.Length - 1))+",\"HttpStatus\": \""+status+"\"}";
        }

}