<%@ Page Language="c#" AutoEventWireup="false" %>

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
        inputStream.Read(inputBuffer, 0, iFileLength);
        inputStream.Close();
        String serverName = "TOMPC-EUROCOM";
        String userName = "test";
        String password = "Aa000000";
        String dbName = "dwtsample";
        String tableName = "uploadedimages";

        System.Data.SqlClient.SqlConnection tmpConn = new System.Data.SqlClient.SqlConnection("Data Source = " + serverName + ";User ID = " + userName + ";Pwd = " + password + ";");
        String sqlCreateDBQuery = string.Format("SELECT database_id FROM sys.databases WHERE Name = '{0}'", dbName);
        using (tmpConn)
        {
            using (System.Data.SqlClient.SqlCommand sqlCmd = new System.Data.SqlClient.SqlCommand(sqlCreateDBQuery, tmpConn))
            {
                tmpConn.Open();
                object resultObj = sqlCmd.ExecuteScalar();
                int databaseID = 0;
                if (resultObj != null)
                {
                    int.TryParse(resultObj.ToString(), out databaseID);
                }
                // Database doesn't exist, create one
                if (databaseID == 0)
                {
                    String sql_newdb = "CREATE DATABASE " + dbName;

                    using (System.Data.SqlClient.SqlCommand sqlcmd_newdb = new System.Data.SqlClient.SqlCommand(sql_newdb, tmpConn))
                    {
                        sqlcmd_newdb.ExecuteScalar();
                    }
                }
            }
            tmpConn.Close();
        }
        System.Data.SqlClient.SqlConnection Connection = new System.Data.SqlClient.SqlConnection("Data Source = " + serverName + ";User ID = " + userName + ";Pwd = " + password + ";Initial Catalog =" + dbName + ";");
        using (Connection)
        {
            Connection.Open();
            String sql_checkTable = @"IF EXISTS(SELECT * FROM INFORMATION_SCHEMA.TABLES 
                       WHERE TABLE_NAME='" + tableName + "') SELECT 1 ELSE SELECT 0";
            using (System.Data.SqlClient.SqlCommand sqlcmd_checkTable = new System.Data.SqlClient.SqlCommand(sql_checkTable, Connection))
            {
                object result_obj = sqlcmd_checkTable.ExecuteScalar();
                int table_exists = 0;
                if (result_obj != null)
                {
                    int.TryParse(result_obj.ToString(), out table_exists);
                }
                // Table doesn't exist, create one
                if (table_exists == 0)
                {
                    String sql_newTable = @"CREATE TABLE " + tableName + " (id int NOT NULL IDENTITY (1, 1), document_name varchar(255) NOT NULL, document_data image NOT NULL) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]";
                    using (System.Data.SqlClient.SqlCommand sqlcmd_newTable = new System.Data.SqlClient.SqlCommand(sql_newTable, Connection))
                    {
                        sqlcmd_newTable.ExecuteScalar();
                    }
                }
            }

            String sql_insertData = "INSERT INTO " + tableName + " (document_name, document_data) VALUES (@document_name, @document_data)";
            using (System.Data.SqlClient.SqlCommand sqlcmd_insertData = new System.Data.SqlClient.SqlCommand(sql_insertData, Connection))
            {
                sqlcmd_insertData.Parameters.Add("@document_data", System.Data.SqlDbType.Binary, iFileLength).Value = inputBuffer;
                sqlcmd_insertData.Parameters.Add("@document_name", System.Data.SqlDbType.VarChar, 255).Value = strImageName;
                sqlcmd_insertData.ExecuteScalar();
            }
            Connection.Close();
        }
    }
    catch (System.Data.SqlClient.SqlException e)
    {
        Response.Write(e.ToString());
    }
%>