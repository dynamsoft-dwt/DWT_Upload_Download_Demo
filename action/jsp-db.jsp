<%@ page language="java" import="java.sql.*,java.io.*"%><%
	String strDBUser = "webtwain";
	String strDBPassword = "webtwain";
	String strDriverName = "com.microsoft.jdbc.sqlserver.SQLServerDriver";
	String strConnString = "jdbc:microsoft:sqlserver://127.0.0.1:1433;databaseName=WebTwain;";
	Connection conn=null;
	
	try
	{																	
		Class.forName(strDriverName).newInstance();
									
		conn=DriverManager.getConnection(strConnString, strDBUser, strDBPassword);
		conn.setAutoCommit(true);
	}
	catch(Exception e)
	{
	}   

	String contentType = request.getContentType();
	
	if ((contentType != null) && (contentType.indexOf("multipart/form-data") >= 0)) 
	{
		DataInputStream in = new DataInputStream(request.getInputStream());
		int formDataLength = request.getContentLength();
		byte dataBytes[] = new byte[formDataLength];
		int byteRead = 0;
		int totalBytesRead = 0;
		
		while (totalBytesRead < formDataLength) 
		{
			byteRead = in.read(dataBytes, totalBytesRead, formDataLength);
			totalBytesRead += byteRead;
		}
		
		in.close();
		
		String file = new String(dataBytes);
		String saveFile = file.substring(file.indexOf("filename=\"") + 10);
		saveFile = saveFile.substring(0, saveFile.indexOf("\n"));
		saveFile = saveFile.substring(saveFile.lastIndexOf("\\") + 1,saveFile.indexOf("\""));

		int lastIndex = contentType.lastIndexOf("=");
		String boundary = contentType.substring(lastIndex + 1, contentType.length());
		int pos;
		
		pos = file.indexOf("filename=\"");
		pos = file.indexOf("\n", pos) + 1;
		pos = file.indexOf("\n", pos) + 1;
		pos = file.indexOf("\n", pos) + 1;


		int boundaryLocation = file.indexOf(boundary, pos) - 4;
		int startPos = ((file.substring(0, pos)).getBytes()).length;
		int endPos = ((file.substring(0, boundaryLocation)).getBytes()).length;
		ByteArrayInputStream inputStream = new ByteArrayInputStream(dataBytes, startPos, (endPos - startPos));
	 
	 	try 
	 	{ 
			PreparedStatement preparedStatement = conn.prepareStatement("insert into tblImage(strImageName, imgImageData) values(?, ?)"); 
			int iImageLength = 0; 

								
			preparedStatement.setString(1, saveFile);
			preparedStatement.setBinaryStream(2, inputStream, (endPos - startPos));
					 
			preparedStatement.executeUpdate(); 
	
			inputStream.close(); 

			preparedStatement.close(); 
			conn.close();	
		} 
		catch(Exception e) 
		{ 		
		} 
	}
%>