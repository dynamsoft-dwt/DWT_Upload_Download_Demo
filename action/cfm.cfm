<cfset uploadFolderPath = GetDirectoryFromPath(GetCurrentTemplatePath()) />
<cfset newFolder = uploadFolderPath & "\UploadedImages\" />
<cffile action="upload" filefield="RemoteFile" destination="#newFolder#" nameconflict="OVERWRITE" />