using Amazon.S3;
using Amazon.S3.Transfer;
using Amazon.S3.Util;
using Amazon.S3.Internal;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RecloBM
{
    class S3Uploader
    {

        public static void uploadFile(string filePath, string existingBucketName, string AccessKey, string SecretKey, string sessionToken)
        {

            Console.WriteLine("filepath: "+filePath);
            Console.WriteLine("bucketname: " + existingBucketName);
            Console.WriteLine("ak: " + AccessKey);
            Console.WriteLine("sk: " + SecretKey);
            Console.WriteLine("st: " + sessionToken);
            try
            {
                AmazonS3Client sclient = new AmazonS3Client(AccessKey, SecretKey, sessionToken, Amazon.RegionEndpoint.USWest2);
                TransferUtility fileTransferUtility = new TransferUtility(sclient);

                /* Find way to increase time out timer because of large file size
                TransferUtilityConfig config = new TransferUtilityConfig();
                config.DefaultTimeout = 11111;
                TransferUtility utility = new TransferUtility(config);
                */
                // 1. Upload a file, file name is used as the object key name.
               fileTransferUtility.Upload(filePath, existingBucketName);
               Console.WriteLine("Upload 1 completed");
                
                /*
                // 2. Specify object key name explicitly.
                fileTransferUtility.Upload(filePath,existingBucketName, keyName);
                Console.WriteLine("Upload 2 completed");

              

                // 4.Specify advanced settings/options.
                TransferUtilityUploadRequest fileTransferUtilityRequest = new TransferUtilityUploadRequest
                {
                    BucketName = existingBucketName,
                    FilePath = filePath,
                    StorageClass = S3StorageClass.ReducedRedundancy,
                    PartSize = 6291456, // 6 MB.
                    Key = keyName
                };
                fileTransferUtility.Upload(fileTransferUtilityRequest);
                Console.WriteLine("Upload completed");
                 * */
            }
            catch (AmazonS3Exception s3Exception)
            {
                Console.WriteLine(s3Exception.Message,
                                  s3Exception.InnerException);
            }
        }
    }
 }

