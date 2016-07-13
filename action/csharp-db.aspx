<%@ Page Language="c#" AutoEventWireup="false"%>
<%
	try
	{
		int iFileLength;
		HttpFileCollection files = HttpContext.Current.Request.Files;
		HttpPostedFile uploadfile = files["RemoteFile"];
		String strImageName = uploadfile.FileName;
	    
		iFileLength = uploadfile.ContentLength;
		Byte[] inputBuffer = new Byte[iFileLength];
		System.IO.Stream inputStream;
		inputStream = uploadfile.InputStream;
		inputStream.Read(inputBuffer,0,iFileLength);
	    
	    String strConnString = "Data Source=127.0.0.1;Initial Catalog=WebTwain;User ID=webtwain;Pwd=webtwain;";
    
		System.Data.SqlClient.SqlConnection sqlConnection = new System.Data.SqlClient.SqlConnection(strConnString);

		String SqlCmdText = "INSERT INTO tblImage (strImageName,imgImageData) VALUES (@ImageName,@Image)";
		System.Data.SqlClient.SqlCommand sqlCmdObj = new System.Data.SqlClient.SqlCommand(SqlCmdText, sqlConnection);

		sqlCmdObj.Parameters.Add("@Image",System.Data.SqlDbType.Binary,iFileLength).Value = inputBuffer;
		sqlCmdObj.Parameters.Add("@ImageName",System.Data.SqlDbType.VarChar,255).Value = strImageName;

		sqlConnection.Open();
		sqlCmdObj.ExecuteNonQuery();
		sqlConnection.Close();
	}
	catch(System.Data.SqlClient.SqlException e)
	{
	}		
%>