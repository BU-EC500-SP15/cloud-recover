#!/bin/bash
# Compiles code
if [ -f HttpTest.exe] ; then
rm HttpTest.exe
fi
clear
mcs /reference:System.ServiceModel.Web.dll /reference:System.Json.dll /reference:System.Net.Http /reference:System.Runtime.Serialization HttpTest.cs RecloApiCaller.cs HttpMethods.cs 
if [ -f HttpTest.exe ] ; then
mono HttpTest.exe
fi

