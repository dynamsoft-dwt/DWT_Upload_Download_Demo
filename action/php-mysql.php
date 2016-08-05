<?php	
	$fileTempName = $_FILES['RemoteFile']['tmp_name'];	
	$fileSize = $_FILES['RemoteFile']['size'];
	$fileName = $_FILES['RemoteFile']['name'];

	$fReadHandle = fopen($fileTempName, 'rb');
	$fileContent = fread($fReadHandle, $fileSize);
    fclose($fReadHandle);

	// Interacting with MySQL
	$servername = "127.0.0.1";
	$username = "root";
	$password = "awesome";
	$dbname = "dwtsample";
	$tablename = "uploadedimages";
	
	// Create connection
	$conn = new mysqli($servername, $username, $password);
	// Check connection
	if ($conn->connect_error) {
		die("Connection failed: " . $conn->connect_error);
	} else {
		// Check Database Existance
		$db_selected = mysqli_select_db($conn, $dbname);
		if(!$db_selected) {
			// Create database
			$sql_newDB = "CREATE DATABASE ".$dbname;
			if ($conn->query($sql_newDB) === TRUE) {
				// echo "Database created successfully";
			} else {
				die("Error creating database: " . $conn->error);
			}			
		}
		mysqli_select_db($conn, $dbname);
		
		// Check Table Existance
		$sql_showtable = "SHOW TABLES LIKE '".$tablename."'";
		$rowcount = mysqli_num_rows($conn->query($sql_showtable));
		if ($rowcount > 0) {
			// echo "the table exists";
		} else {
			// sql to create table
			$sql_newtable = "CREATE TABLE ".$tablename." (
			id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY, 
			document_name VARCHAR(30) NOT NULL,
			document_data longblob NOT NULL,
			reg_date TIMESTAMP
			)";
			if ($conn->query($sql_newtable) === TRUE) {
				// echo "Table ".$tablename." created successfully";
			} else {
				die("Error creating table: " . $conn->error);
			}
		}			
		$sql_insertdata = "INSERT INTO ".$tablename." (document_name,document_data) VALUES ('".$fileName."','".addslashes($fileContent)."')";
        if ($conn->query($sql_insertdata) === TRUE) {
			// echo "File saved in db successfully.";
		} else {
			die("Error saving file: " . $conn->error);
		}
	}
	$conn->close();
?>
