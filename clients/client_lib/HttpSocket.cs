using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Net;
using System.Collections.Specialized;
using System.IO;
using System.Threading;
using System.Threading.Tasks;
using System.Json;

  public static class HttpSocket
  {
    static HttpWebRequest CreateHttpWebRequest(string url, string httpMethod, string contentType)
    {
      var httpWebRequest = (HttpWebRequest)WebRequest.Create(url);
      httpWebRequest.ContentType = contentType;
      httpWebRequest.Method = httpMethod;
      return httpWebRequest;
    }

    static byte[] GetRequestBytes(NameValueCollection postParameters)
    {
      if (postParameters == null || postParameters.Count == 0)
        return new byte[0];
      var sb = new StringBuilder();
      foreach (var key in postParameters.AllKeys)
        sb.Append(key + "=" + postParameters[key] + "&");
      sb.Length = sb.Length - 1;
      return Encoding.UTF8.GetBytes(sb.ToString());
    }

    static void BeginGetRequestStreamCallback(IAsyncResult asyncResult)
    {
      Stream requestStream = null;
      HttpWebRequestAsyncState asyncState = null;
      try
      {
        asyncState = (HttpWebRequestAsyncState)asyncResult.AsyncState;
        requestStream = asyncState.HttpWebRequest.EndGetRequestStream(asyncResult);
        requestStream.Write(asyncState.RequestBytes, 0, asyncState.RequestBytes.Length);
        requestStream.Close();
        asyncState.HttpWebRequest.BeginGetResponse(BeginGetResponseCallback,
          new HttpWebRequestAsyncState
          {
            HttpWebRequest = asyncState.HttpWebRequest,
            ResponseCallback = asyncState.ResponseCallback,
            State = asyncState.State
          });
      }
      catch (Exception ex)
      {
        if (asyncState != null)
          asyncState.ResponseCallback(new HttpWebRequestCallbackState(ex));
        else
          throw;
      }
      finally
      {
        if (requestStream != null)
          requestStream.Close();
      }
    }

    static void BeginGetResponseCallback(IAsyncResult asyncResult)
    {
      WebResponse webResponse = null;
      Stream responseStream = null;
      HttpWebRequestAsyncState asyncState = null;
      try
      {
        asyncState = (HttpWebRequestAsyncState)asyncResult.AsyncState;
        webResponse = asyncState.HttpWebRequest.EndGetResponse(asyncResult);
        responseStream = webResponse.GetResponseStream();
        var webRequestCallbackState = new HttpWebRequestCallbackState(responseStream, asyncState.State);
        asyncState.ResponseCallback(webRequestCallbackState);
        responseStream.Close();
        responseStream = null;
        webResponse.Close();
        webResponse = null;
      }
      catch (Exception ex)
      {
        if (asyncState != null)
          asyncState.ResponseCallback(new HttpWebRequestCallbackState(ex));
        else
          throw;
      }
      finally
      {
        if (responseStream != null)
          responseStream.Close();
        if (webResponse != null)
          webResponse.Close();
      }
    }

    /// <summary>
    /// If the response from a remote server is in text form
    /// you can use this method to get the text from the ResponseStream
    /// This method Disposes the stream before it returns
    /// </summary>
    /// <param name="responseStream">The responseStream that was provided in the callback delegate's HttpWebRequestCallbackState parameter</param>
    /// <returns></returns>
    public static string GetResponseText(Stream responseStream)
    {
      using (var reader = new StreamReader(responseStream))
      {
        return reader.ReadToEnd();
      }
    }

    /// <summary>
    /// This method uses the DataContractJsonSerializer to
    /// Deserialize the contents of a stream to an instance
    /// of an object of type T.
    /// This method disposes the stream before returning
    /// </summary>
    /// <typeparam name="T"></typeparam>
    /// <param name="stream">A Stream. Typically the ResponseStream</param>
    /// <returns>An instance of an object of type T</returns>
    /*
    static T DeSerializeToJson<T>(Stream stream)
    {
      using (stream)
      {
        var deserializer = new DataContractJsonSerializer(typeof(T));
        return (T)deserializer.ReadObject(stream);
      }
    }
*/
    /// <summary>
    /// This method does an Http POST sending any post parameters to the url provided
    /// </summary>
    /// <param name="url">The url to make an Http POST to</param>
    /// <param name="postParameters">The form parameters if any that need to be POSTed</param>
    /// <param name="responseCallback">The callback delegate that should be called when the response returns from the remote server</param>
    /// <param name="state">Any state information you need to pass along to be available in the callback method when it is called</param>
    /// <param name="contentType">The Content-Type of the Http request</param>
    public static void PostAsync(string url, NameValueCollection postParameters,
      Action<HttpWebRequestCallbackState> responseCallback, object state = null,
      string contentType = "application/x-www-form-urlencoded")
    {
      var httpWebRequest = CreateHttpWebRequest(url, "POST", contentType);
      var requestBytes = GetRequestBytes(postParameters);
      httpWebRequest.ContentLength = requestBytes.Length;

      httpWebRequest.BeginGetRequestStream(BeginGetRequestStreamCallback,
        new HttpWebRequestAsyncState()
        {
          RequestBytes = requestBytes,
          HttpWebRequest = httpWebRequest,
          ResponseCallback = responseCallback,  
          State = state
        });
    }

    /// <summary>
    /// This method does an Http GET to the provided url and calls the responseCallback delegate
    /// providing it with the response returned from the remote server.
    /// </summary>
    /// <param name="url">The url to make an Http GET to</param>
    /// <param name="responseCallback">The callback delegate that should be called when the response returns from the remote server</param>
    /// <param name="state">Any state information you need to pass along to be available in the callback method when it is called</param>
    /// <param name="contentType">The Content-Type of the Http request</param>
    public static void GetAsync(string url, Action<HttpWebRequestCallbackState> responseCallback,
      object state = null, string contentType = "application/x-www-form-urlencoded")
    {
      var httpWebRequest = CreateHttpWebRequest(url, "GET", contentType);

      httpWebRequest.BeginGetResponse(BeginGetResponseCallback,
        new HttpWebRequestAsyncState()
        {
          HttpWebRequest = httpWebRequest,
          ResponseCallback = responseCallback,
          State = state
        });
    }

    public static void PostAsyncTask(string url, NameValueCollection postParameters,
      Action<HttpWebRequestCallbackState> responseCallback, object state = null,
      string contentType = "application/x-www-form-urlencoded")
    {
      var httpWebRequest = CreateHttpWebRequest(url, "POST", contentType);
      var requestBytes = GetRequestBytes(postParameters);
      httpWebRequest.ContentLength = requestBytes.Length;

      var asyncState = new HttpWebRequestAsyncState()
      {
        RequestBytes = requestBytes,
        HttpWebRequest = httpWebRequest,
        ResponseCallback = responseCallback,
        State = state
      };

      Task.Factory.FromAsync<Stream>(httpWebRequest.BeginGetRequestStream,
        httpWebRequest.EndGetRequestStream, asyncState, TaskCreationOptions.None)
        .ContinueWith<HttpWebRequestAsyncState>(task =>
        {
          var asyncState2 = (HttpWebRequestAsyncState)task.AsyncState;
          using (var requestStream = task.Result)
          {
            requestStream.Write(asyncState2.RequestBytes, 0, asyncState2.RequestBytes.Length);
          }          
          return asyncState2;
        })
        .ContinueWith(task =>
        {
          var httpWebRequestAsyncState2 = (HttpWebRequestAsyncState)task.Result;
          var hwr2 = httpWebRequestAsyncState2.HttpWebRequest;
          Task.Factory.FromAsync<WebResponse>(hwr2.BeginGetResponse,
            hwr2.EndGetResponse, httpWebRequestAsyncState2, TaskCreationOptions.None)
            .ContinueWith(task2 =>
            {
              WebResponse webResponse = null;
              Stream responseStream = null;
              try
              {
                var asyncState3 = (HttpWebRequestAsyncState)task2.AsyncState;
                webResponse = task2.Result;
                responseStream = webResponse.GetResponseStream();
                responseCallback(new HttpWebRequestCallbackState(responseStream, asyncState3));
              }
              finally
              {
                if (responseStream != null)
                  responseStream.Close();
                if (webResponse != null)
                  webResponse.Close();
              }
            });
        });
    }

    public static void GetAsyncTask(string url, Action<HttpWebRequestCallbackState> responseCallback,
      object state = null, string contentType = "application/x-www-form-urlencoded")
    {
      var httpWebRequest = CreateHttpWebRequest(url, "GET", contentType);
      Task.Factory.FromAsync<WebResponse>(httpWebRequest.BeginGetResponse,
        httpWebRequest.EndGetResponse, null).ContinueWith(task =>
          {
            var webResponse = task.Result;
            var responseStream = webResponse.GetResponseStream();
            responseCallback(new HttpWebRequestCallbackState(webResponse.GetResponseStream(), state));
            responseStream.Close();
            webResponse.Close();
          });
    }
  }

  /// <summary>
  /// This class is used to pass on "state" between each Begin/End call
  /// It also carries the user supplied "state" object all the way till
  /// the end where is then hands off the state object to the
  /// HttpWebRequestCallbackState object.
  /// </summary>
  class HttpWebRequestAsyncState
  {
    public byte[] RequestBytes { get; set; }
    public HttpWebRequest HttpWebRequest { get; set; }
    public Action<HttpWebRequestCallbackState> ResponseCallback { get; set; }
    public Object State { get; set; }
  }

  /// <summary>
  /// This class is passed on to the user supplied callback method
  /// as a parameter. If there was an exception during the process
  /// then the Exception property will not be null and will hold
  /// a reference to the Exception that was raised.
  /// The ResponseStream property will be not null in the case of
  /// a sucessful request/response cycle. Use this stream to
  /// exctract the response.
  /// </summary>
  public class HttpWebRequestCallbackState
  {
    public Stream ResponseStream { get; private set; }
    public Exception Exception { get; private set; }
    public Object State { get; set; }

    public HttpWebRequestCallbackState(Stream responseStream, object state)
    {
      ResponseStream = responseStream;
      State = state;
    }

    public HttpWebRequestCallbackState(Exception exception)
    {
      Exception = exception;
    }

  }