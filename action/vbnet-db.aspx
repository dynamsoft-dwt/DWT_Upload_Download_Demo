<%@ Page Language="VB" AutoEventWireup="false"%>
<%
	Dim files As HttpFileCollection = HttpContext.Current.Request.Files
    Dim uploadfile As HttpPostedFile = files("RemoteFile")
    
    dim strImageName = uploadfile.FileName
	dim iFileLength = uploadfile.ContentLength
	
	dim inputBuffer(iFileLength) as Byte
	dim inputStream as System.IO.Stream 
	
	inputStream = uploadfile.InputStream
	inputStream.Read(inputBuffer,0,iFileLength)
	
	dim strConnString
	strConnString = "Data Source=127.0.0.1;Initial Catalog=WebTwain;User ID=webtwain;Pwd=webtwain;"

	dim sqlConnection as new System.Data.SqlClient.SqlConnection(strConnString)

	dim SqlCmdText = "INSERT INTO tblImage (strImageName,imgImageData) VALUES (@ImageName,@Image)"
	dim sqlCmdObj as new System.Data.SqlClient.SqlCommand(SqlCmdText, sqlConnection)


	sqlCmdObj.Parameters.Add("@Image",System.Data.SqlDbType.Binary,iFileLength).Value = inputBuffer
	sqlCmdObj.Parameters.Add("@ImageName",System.Data.SqlDbType.VarChar,255).Value = strImageName

	sqlConnection.Open
	sqlCmdObj.ExecuteNonQuery
	sqlConnection.Close		
		
%>