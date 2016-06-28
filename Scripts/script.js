Dynamsoft.WebTwainEnv.RegisterEvent('OnWebTwainReady', Dynamsoft_OnReady); // Register OnWebTwainReady event. This event fires as soon as Dynamic Web TWAIN is initialized and ready to be used

var DWObject, blankField = "", extrFieldsCount = 0;
var CurrentPathName = unescape(location.pathname);
var CurrentPath = CurrentPathName.substring(0, CurrentPathName.lastIndexOf("/") + 1);
var	strHTTPServer = location.hostname;		
var	strActionPage;

var scriptLanguages = [
	{ desc: "PHP", val: "php" },
	{ desc: "CSharp", val: "csharp" },
	{ desc: "JSP", val: "jsp" },
	{ desc: "VB.NET", val: "vbnet" },
	{ desc: "ASP", val: "asp" },
	{ desc: "ColdFusion", val: "cfm" }
];   

function languageSelected() {
	if(document.getElementById("ddlLanguages").selectedIndex > 3){
		document.getElementById("extra-fields-div-id").style.display='none';
	}
	else {
		document.getElementById("extra-fields-div-id").style.display='';
	}
}

function addAField(){
	extrFieldsCount++;
	if(extrFieldsCount == 3){
		document.getElementById('div-extra-fields').style.overflowY='scroll';
	}
	if(document.getElementById('div-extra-fields').style.display=="none")
		document.getElementById('div-extra-fields').style.display='';
	else {
		document.getElementById('div-extra-fields').appendChild(blankField);
		blankField = document.getElementsByClassName('div-fields-item')[extrFieldsCount - 1].cloneNode(true);
	}
}

function downloadPDFR() {
	Dynamsoft__OnclickCloseInstallEx();
	DWObject.Addon.PDF.Download(
		CurrentPath + '/Resources/addon/Pdf.zip',
		function() {/*console.log('PDF dll is installed');*/
		},
		function(errorCode, errorString) {
			console.log(errorString);
		}
	);
}	

function Dynamsoft_OnReady() {
	blankField = document.getElementsByClassName('div-fields-item')[0].cloneNode(true);
	Dynamsoft.Lib.addEventListener(document.getElementById('quietTip'), 'mouseover', 
		function(){document.getElementById(this.id + '-div').style.display = '';}
	);
	Dynamsoft.Lib.addEventListener(document.getElementById('directTip'), 'mouseover', 
		function(){document.getElementById(this.id + '-div').style.display = '';}
	);
	Dynamsoft.Lib.addEventListener(document.getElementById('quietTip'), 'mouseout', 
		function(){document.getElementById(this.id + '-div').style.display = 'none';}
	);
	Dynamsoft.Lib.addEventListener(document.getElementById('directTip'), 'mouseout', 
		function(){document.getElementById(this.id + '-div').style.display = 'none';}
	);
	DWObject = Dynamsoft.WebTwainEnv.GetWebTwain('dwtcontrolContainer'); // Get the Dynamic Web TWAIN object that is embeded in the div with id 'dwtcontrolContainer'
	if (DWObject) {
		
		for (var i = 0; i < scriptLanguages.length; i++)
			document.getElementById("ddlLanguages").options.add(new Option(scriptLanguages[i].desc, i));
		/*
		* Make sure the PDF Rasterizer and OCR add-on are already installedsample
		*/
		if(!Dynamsoft.Lib.env.bMac) {	
			var localPDFRVersion = DWObject._innerFun('GetAddOnVersion', '["pdf"]');	
			if(Dynamsoft.Lib.env.bIE) {
				localPDFRVersion = DWObject.getSWebTwain().GetAddonVersion("pdf");
			}
			if (localPDFRVersion != Dynamsoft.PdfVersion) {
				var ObjString = [];
				ObjString.push('<div class="ds-demo-padding" id="pdfr-install-dlg">');
				ObjString.push('The <strong>PDF Rasterizer</strong> is not installed on this PC<br />Please click the button below to get it installed');
				ObjString.push('<p class="ds-demo-center"><input type="button" value="Install PDF Rasterizer" onclick="downloadPDFR();" class="ds-demo-blue ds-demo-btn-large ds-demo-border-0 ds-demo-margin ds-font-size-18" /><hr></p>');
				ObjString.push('<i><strong>The installation is a one-time process</strong> <br />It might take some time depending on your network.</i>');
				ObjString.push('</div>');
				Dynamsoft.WebTwainEnv.ShowDialog(400,310, ObjString.join(''));
			}
			else {
				/**/
			}
		}
	}
}

function AcquireImage() {
	if (DWObject) {
		var bSelected = DWObject.SelectSource();
		if (bSelected) {
			var OnAcquireImageSuccess, OnAcquireImageFailure;
			OnAcquireImageSuccess = OnAcquireImageFailure = function() {
				DWObject.CloseSource();
			};

			DWObject.OpenSource();
			DWObject.IfDisableSourceAfterAcquire = true;  //Scanner source will be disabled/closed automatically after the scan.
			DWObject.AcquireImage(OnAcquireImageSuccess, OnAcquireImageFailure);
		}
	}
}

function LoadImages() {
	if (DWObject) {
		var nCount = 0, nCountLoaded = 0, aryFilePaths = [];
		DWObject.IfShowFileDialog = false;
		function ds_load_pdfa(bSave, filesCount, index, path, filename){
			nCount = filesCount;
			if(nCount == -1 ){
				Dynamsoft.Lib.detect.hideMask();
				return;
			}
			var filePath = path + "\\" +  filename, _oFile = {};
			_oFile._filePath = filePath;
			_oFile._fileIsPDF = false;
			if((filename.substr(filename.lastIndexOf('.') + 1)).toLowerCase() == 'pdf'){
				_oFile._fileIsPDF = true;
			}
			aryFilePaths.push(_oFile);
			if(aryFilePaths.length == nCount)
			{
				var i = 0;
				function loadFileOneByOne(){
					if(aryFilePaths[i]._fileIsPDF){					
						DWObject.Addon.PDF.SetResolution(200);   
						DWObject.Addon.PDF.SetConvertMode(EnumDWT_ConverMode.CM_RENDERALL);
					}
					DWObject.LoadImage(aryFilePaths[i]._filePath, 
						function() {
							console.log('Load Image:' + aryFilePaths[i]._filePath + ' -- successful');
							i++;
							if(i != nCount)
								loadFileOneByOne();
						},
						function (errorCode, errorString) {
							alert('Load Image:' + aryFilePaths[i]._filePath + errorString);
						}
					);
				}
				loadFileOneByOne();
			}
		}
		DWObject.RegisterEvent('OnGetFilePath', ds_load_pdfa);
		DWObject.RegisterEvent('OnPostLoad', function(path, name, type){
			nCountLoaded ++;
			console.log('load' + nCountLoaded);
			if(nCountLoaded == nCount){
				DWObject.UnregisterEvent('OnGetFilePath', ds_load_pdfa);
				Dynamsoft.Lib.detect.hideMask();
			}				
		});
		DWObject.ShowFileDialog(false,  "BMP, JPG, PNG, PDF and TIF | *.bmp;*.jpg;*.png;*.pdf;*.tif;*.tiff", 0, "", "", true, true, 0)		
		Dynamsoft.Lib.detect.showMask();
	}
}
function OnHttpUploadSuccess() {
            console.log('successful');
        }

function OnHttpServerReturnedSomething(errorCode, errorString, sHttpResponse) {
	var textFromServer = sHttpResponse;
	_printUploadedFiles(textFromServer);
}

function _printUploadedFiles(info){
	if(info.indexOf('DWTUploadFileName') != -1)
	{
		var url, _strPort;
		DWObject.IfSSL = DynamLib.detect.ssl;
		_strPort = location.port == "" ? 80 : location.port
		url = 'http://' + location.hostname + ':' + location.port    
        if (DynamLib.detect.ssl == true){
			_strPort = location.port == "" ? 443 : location.port;
			url = 'https://' + location.hostname + ':' + location.port            
		}
		var fileName = info.substring(info.indexOf('DWTUploadFileName') + 18, info.indexOf('UploadedFileSize'));
		var fileSize = info.substr(info.indexOf('UploadedFileSize') + 17);
		url += CurrentPath + 'action/UploadedImages/' + encodeURI(fileName);
		var newTR = document.createElement('tr');
		_str = "<td class='ds-demo-center'><a class='bluelink'" + ' href="' + url + '" target="_blank">' + fileName + "</a></td>"
			+ "<td class='ds-demo-center'>" + fileSize + '</td>';
		if(info.indexOf("FieldsTrue:") != -1)
			_str += "<td class='ds-demo-center'><a class='bluelink'" + '" href="' + url.substring(0,url.length-4) + '_1.txt' + '" target="_blank">Fields</td>';
		else {
			_str += "<td class='ds-demo-center'>No Fields</td>";
		}
		newTR.innerHTML = _str;
		document.getElementById('div-uploadedFile').appendChild(newTR);
	}
}

function upload_preparation() {
	DWObject.IfShowCancelDialogWhenImageTransfer = !document.getElementById('quietScan').checked;   
	strActionPage = CurrentPath + 'action/';
	switch(document.getElementById("ddlLanguages").options.selectedIndex){
		case 0:strActionPage += "php.php"; break;
		case 1:strActionPage += "csharp.aspx"; break;
		case 2:strActionPage += "jsp.jsp"; break;
		case 3:strActionPage += "vbnet.aspx"; break;
		case 4:strActionPage += "asp.asp"; break;
		case 5:strActionPage += "cfm.cfm"; break;
		default:break;
	}
	DWObject.IfSSL = DynamLib.detect.ssl;
	var _strPort = location.port == "" ? 80 : location.port;
	if (DynamLib.detect.ssl == true)
		_strPort = location.port == "" ? 443 : location.port;
	DWObject.HTTPPort = _strPort;
	if(document.getElementById("ddlLanguages").selectedIndex < 4) {
		/* Add Fields to the Post */
		var fields = document.getElementsByClassName('div-fields-item');
		
		DWObject.ClearAllHTTPFormField();
		for(var n=0;n<fields.length;n++){
			var o = fields[n];
			if(o.children[0].value !='')
				DWObject.SetHTTPFormField(o.children[0].value, o.children[1].value);
		}
	}
}
function UploadImage_inner(){
	if (DWObject.HowManyImagesInBuffer == 0)
			return;                
	upload_preparation();
	var Digital = new Date();
	var uploadfilename = Digital.getMilliseconds(); // Uses milliseconds according to local time as the file name

	// Upload the image(s) to the server asynchronously
	if (document.getElementsByName('ImageType')[0].checked) {
		var uploadIndexes = [];
		for(var i = DWObject.HowManyImagesInBuffer - 1;i > -1 ; i--) {
			uploadIndexes.push(i);
		}
		var uploadJPGsOneByOne = function(errorCode, errorString, sHttpResponse) {
			_printUploadedFiles(sHttpResponse);
			if(uploadIndexes.length > 0){
				var _index = uploadIndexes.pop();
				DWObject.HTTPUploadThroughPost(strHTTPServer, _index, strActionPage, uploadfilename + "-" + _index.toString() + ".jpg", OnHttpUploadSuccess, uploadJPGsOneByOne);
			}
		}
		var _index = uploadIndexes.pop();
		DWObject.HTTPUploadThroughPost(strHTTPServer, _index, strActionPage, uploadfilename + "-" + _index.toString() + ".jpg", OnHttpUploadSuccess, uploadJPGsOneByOne);
	}
	else if (document.getElementsByName('ImageType')[1].checked) {
		DWObject.HTTPUploadAllThroughPostAsMultiPageTIFF(strHTTPServer, strActionPage, uploadfilename + ".tif", OnHttpUploadSuccess, OnHttpServerReturnedSomething);
	}
	else if (document.getElementsByName('ImageType')[2].checked) {
		DWObject.HTTPUploadAllThroughPostAsPDF(strHTTPServer, strActionPage, uploadfilename + ".pdf", OnHttpUploadSuccess, OnHttpServerReturnedSomething);
	}
}
function UploadImage() {
	if (DWObject) {
		var nCount = 0, nCountUpLoaded = 0, aryFilePaths = [];
		if(document.getElementById('uploadDirectly').checked){
			DWObject.IfShowCancelDialogWhenImageTransfer = false;
			function ds_load_file_to_upload_directly(bSave, filesCount, index, path, filename){
				nCount = filesCount;
				var filePath = path + "\\" +  filename;
				aryFilePaths.push(filePath);
				if(aryFilePaths.length == nCount) {
					upload_preparation();
					var i = 0;
					function uploadFileOneByOne() {					
						DWObject.HTTPUploadThroughPostDirectly(strHTTPServer, filePath, strActionPage, filename,
							function() {
								console.log('Upload Image:' + aryFilePaths[i] + ' -- successful');
								i++;
								if(i != nCount)
									uploadFileOneByOne();
								else
									DWObject.UnregisterEvent('OnGetFilePath', ds_load_file_to_upload_directly);
							},
							OnHttpServerReturnedSomething
						);
					}
					uploadFileOneByOne();
				}
			}
			DWObject.RegisterEvent('OnGetFilePath', ds_load_file_to_upload_directly);
			DWObject.ShowFileDialog(false,  "Any File | *.*", 0, "", "", true, true, 0);	
		}
		else{
			UploadImage_inner();
		}
	}
}