<?	
	$fileTempName = $_FILES['RemoteFile']['tmp_name'];	
	$fileSize = $_FILES['RemoteFile']['size'];
	$fileName = $_FILES['RemoteFile']['name'];
	
	$fReadHandle = fopen($fileTempName, 'rb');
	$fileContent = fread($fReadHandle, $fileSize);
	
	// Connecting, selecting database
	$link = mysql_connect('127.0.0.1', 'root', 'ghh');
	mysql_select_db('WebTwain');    
		
	$SqlCmdText = "INSERT INTO tblImage(strImageName,imgImageData) VALUES ('".$fileName."','".addslashes($fileContent)."')";
	mysql_query($SqlCmdText, $link);	

	// Close connection 
	mysql_close($link);		
?>