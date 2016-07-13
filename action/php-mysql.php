<?php	
	$fileTempName = $_FILES['RemoteFile']['tmp_name'];	
	$fileSize = $_FILES['RemoteFile']['size'];
	$fileName = $_FILES['RemoteFile']['name'];

	$fReadHandle = fopen($fileTempName, 'rb');
	$fileContent = fread($fReadHandle, $fileSize);
    fclose($fReadHandle);

	// Connecting, selecting database
	$link = mysql_connect('127.0.0.1', 'root', 'awesome');
	if($link){
		mysql_select_db('dwt_documents_stock');    
			
		$SqlCmdText = "INSERT INTO documents(document_name,document_data) VALUES ('".$fileName."','".addslashes($fileContent)."')";
        mysql_query($SqlCmdText, $link) or die('Error, query failed'); 
		// Close connection 
		mysql_close($link);	
	}
	else echo "data base failed to connect";	
?>
