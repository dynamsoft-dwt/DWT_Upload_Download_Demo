Dynamsoft.WebTwainEnv.RegisterEvent('OnWebTwainReady', Dynamsoft_OnReady); // Register OnWebTwainReady event. This event fires as soon as Dynamic Web TWAIN is initialized and ready to be used

var DWObject, blankField = "", extrFieldsCount = 0, upload_returnSth = true;
var CurrentPathName = unescape(location.pathname);
var CurrentPath = CurrentPathName.substring(0, CurrentPathName.lastIndexOf("/") + 1);
var strHTTPServer = location.hostname;
var strActionPage;

var scriptLanguages = [
	{ desc: "PHP", val: "php" },
    { desc: "PHP-MySQL", val: "phpMySQL" },
	{ desc: "CSharp", val: "csharp" },
    { desc: "CSharp-MSSQL", val: "csMSSQL" },
	{ desc: "VB.NET", val: "vbnet" },
    { desc: "VBNET-MSSQL", val: "vbnetMSSQL" },
    { desc: "JSP", val: "jsp" },
    { desc: "JSP-Oracle", val: "jspOracle" },
	{ desc: "ASP", val: "asp" },
	{ desc: "ASP-MSSQL", val: "aspMSSQL" },
    { desc: "ColdFusion", val: "cfm" },
	{ desc: "CS-Azure", val: "csAzure" }
];

function languageSelected() {
    document.getElementById("currentLANGUAGE").innerHTML = scriptLanguages[document.getElementById("ddlLanguages").value].desc;
    if (document.getElementById("ddlLanguages").selectedIndex > 7)
        upload_returnSth = false;
    else
        upload_returnSth = true;
    if ([0, 2, 4, 6].indexOf(document.getElementById("ddlLanguages").selectedIndex) == -1) {
        document.getElementById("extra-fields-div-id").style.display = 'none';
        document.getElementById('div-extra-fields').style.display = 'none';
    }
    else {
        document.getElementById("extra-fields-div-id").style.display = '';
        if (document.getElementById('div-extra-fields').children.length > 1 ||
        document.getElementById('div-extra-fields').children[0].children[0].children[0].value != '') {
            document.getElementById('div-extra-fields').style.display = '';
        }
    }
}


function addAField() {
    extrFieldsCount++;
    if (extrFieldsCount == 3) {
        document.getElementById('div-extra-fields').style.overflowY = 'scroll';
    }
    if (document.getElementById('div-extra-fields').style.display == "none")
        document.getElementById('div-extra-fields').style.display = '';
    else {
        document.getElementById('div-extra-fields').appendChild(blankField);
        blankField = document.getElementsByClassName('div-fields-item')[extrFieldsCount - 1].cloneNode(true);
    }
}

function downloadPDFR() {
    Dynamsoft__OnclickCloseInstallEx();
    DWObject.Addon.PDF.Download(
        CurrentPath + '/Resources/addon/Pdf.zip',
        function () {/*console.log('PDF dll is installed');*/
        },
        function (errorCode, errorString) {
            console.log(errorString);
        }
    );
}

function Dynamsoft_OnReady() {
    blankField = document.getElementsByClassName('div-fields-item')[0].cloneNode(true);
    Dynamsoft.Lib.addEventListener(document.getElementById('ddlLanguages'), 'mouseover',
        function () { document.getElementById(this.id + '-div').style.display = ''; }
    );
    Dynamsoft.Lib.addEventListener(document.getElementById('ddlLanguages'), 'mouseout',
        function () {
            setTimeout(function () {
                document.getElementById('ddlLanguages-div').style.display = 'none';
            }, 1000);
        }
    );
    Dynamsoft.Lib.addEventListener(document.getElementById('quietTip'), 'mouseover',
        function () { document.getElementById(this.id + '-div').style.display = ''; }
    );
    Dynamsoft.Lib.addEventListener(document.getElementById('directTip'), 'mouseover',
        function () { document.getElementById(this.id + '-div').style.display = ''; }
    );
    Dynamsoft.Lib.addEventListener(document.getElementById('quietTip'), 'mouseout',
        function () { document.getElementById(this.id + '-div').style.display = 'none'; }
    );
    Dynamsoft.Lib.addEventListener(document.getElementById('directTip'), 'mouseout',
        function () { document.getElementById(this.id + '-div').style.display = 'none'; }
    );
    DWObject = Dynamsoft.WebTwainEnv.GetWebTwain('dwtcontrolContainer'); // Get the Dynamic Web TWAIN object that is embeded in the div with id 'dwtcontrolContainer'
    if (DWObject) {

        for (var i = 0; i < scriptLanguages.length; i++)
            document.getElementById("ddlLanguages").options.add(new Option(scriptLanguages[i].desc, i));
        document.getElementById("ddlLanguages").options.selectedIndex = 2;
        /*
        * Make sure the PDF Rasterizer and OCR add-on are already installedsample
        */
        if (!Dynamsoft.Lib.env.bMac) {
            var localPDFRVersion = DWObject._innerFun('GetAddOnVersion', '["pdf"]');
            if (Dynamsoft.Lib.env.bIE) {
                localPDFRVersion = DWObject.getSWebTwain().GetAddonVersion("pdf");
            }
            if (localPDFRVersion != Dynamsoft.PdfVersion) {
                var ObjString = [];
                ObjString.push('<div class="p15" id="pdfr-install-dlg">');
                ObjString.push('The <strong>PDF Rasterizer</strong> is not installed on this PC<br />Please click the button below to get it installed');
                ObjString.push('<p class="tc mt15 mb15"><input type="button" value="Install PDF Rasterizer" onclick="downloadPDFR();" class="btn lgBtn bgBlue" /><hr></p>');
                ObjString.push('<i><strong>The installation is a one-time process</strong> <br />It might take some time depending on your network.</i>');
                ObjString.push('</div>');
                Dynamsoft.WebTwainEnv.ShowDialog(400, 310, ObjString.join(''));
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
            OnAcquireImageSuccess = OnAcquireImageFailure = function () {
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
        function ds_load_pdfa(bSave, filesCount, index, path, filename) {
            nCount = filesCount;
            if (nCount == -1) {
                Dynamsoft.Lib.detect.hideMask();
                return;
            }
            var filePath = path + "\\" + filename, _oFile = {};
            _oFile._filePath = filePath;
            _oFile._fileIsPDF = false;
            if ((filename.substr(filename.lastIndexOf('.') + 1)).toLowerCase() == 'pdf') {
                _oFile._fileIsPDF = true;
            }
            aryFilePaths.push(_oFile);
            if (aryFilePaths.length == nCount) {
                var i = 0;
                function loadFileOneByOne() {
                    if (aryFilePaths[i]._fileIsPDF) {
                        DWObject.Addon.PDF.SetResolution(200);
                        DWObject.Addon.PDF.SetConvertMode(EnumDWT_ConverMode.CM_RENDERALL);
                    }
                    DWObject.LoadImage(aryFilePaths[i]._filePath,
                        function () {
                            console.log('Load Image:' + aryFilePaths[i]._filePath + ' -- successful');
                            i++;
                            if (i != nCount)
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
        DWObject.RegisterEvent('OnPostLoad', function (path, name, type) {
            nCountLoaded++;
            console.log('load' + nCountLoaded);
            if (nCountLoaded == nCount) {
                DWObject.UnregisterEvent('OnGetFilePath', ds_load_pdfa);
                Dynamsoft.Lib.detect.hideMask();
            }
        });
        DWObject.ShowFileDialog(false, "BMP, JPG, PNG, PDF and TIF | *.bmp;*.jpg;*.png;*.pdf;*.tif;*.tiff", 0, "", "", true, true, 0)
        Dynamsoft.Lib.detect.showMask();
    }
}
function OnHttpUploadSuccess() {
    console.log('successful');
}

function OnHttpServerReturnedSomething(errorCode, errorString, sHttpResponse) {
    //console.log(errorString);
    var textFromServer = sHttpResponse;
    _printUploadedFiles(textFromServer);
}

function _printUploadedFiles(info) {
    //console.log(info);
    if (info.indexOf('DWTUploadFileName') != -1) {
        var url, _strPort;
        DWObject.IfSSL = DynamLib.detect.ssl;
        _strPort = location.port == "" ? 80 : location.port
        url = 'http://' + location.hostname + ':' + location.port
        if (DynamLib.detect.ssl == true) {
            _strPort = location.port == "" ? 443 : location.port;
            url = 'https://' + location.hostname + ':' + location.port
        }
        var savedIntoToDB = false, imgIndexInDB = "-1";
        if (info.indexOf("DWTUploadFileIndex:") != -1) {
            savedIntoToDB = true;
            imgIndexInDB = info.substring(info.indexOf('DWTUploadFileIndex') + 19, info.indexOf('DWTUploadFileName'));
            //console.log(imgIndexInDB);
        }
        var fileName = info.substring(info.indexOf('DWTUploadFileName') + 18, info.indexOf('UploadedFileSize'));
        var fileSize = info.substr(info.indexOf('UploadedFileSize') + 17);
        if (savedIntoToDB) {
            if (info.indexOf('CSHARP') != -1) {
                url += CurrentPath + 'action/csharp-db.aspx?imgID=' + imgIndexInDB;
            }
            else if (info.indexOf('VBNET') != -1) {
                url += CurrentPath + 'action/vbnet-db.aspx?imgID=' + imgIndexInDB;
            }
			else if (info.indexOf('PHP') != -1) {
                url += CurrentPath + 'action/php-mysql.php?imgID=' + imgIndexInDB;
            }			
			else if (info.indexOf('JSP') != -1) {
                url += CurrentPath + 'action/jsp-oracle.jsp?imgID=' + imgIndexInDB;
            }
        }
        else {
            url += CurrentPath + 'action/UploadedImages/' + encodeURI(fileName);
        }
        var newTR = document.createElement('tr');
        _str = "<td class='tc'><a class='bluelink'" + ' href="' + url + '" target="_blank">' + fileName + "</a></td>"
            + "<td class='tc'>" + fileSize + '</td>';
        if (info.indexOf("FieldsTrue:") != -1)
            _str += "<td class='tc'><a class='bluelink'" + '" href="' + url.substring(0, url.length - 4) + '_1.txt' + '" target="_blank">Fields</td>';
        else {
            _str += "<td class='tc'>No Fields</td>";
        }
        newTR.innerHTML = _str;
        document.getElementById('div-uploadedFile').appendChild(newTR);
    }
}

function upload_preparation(_name) {
    DWObject.IfShowCancelDialogWhenImageTransfer = !document.getElementById('quietScan').checked;
    strActionPage = CurrentPath + 'action/';
    switch (document.getElementById("ddlLanguages").options.selectedIndex) {
        case 0: strActionPage += "php.php"; break;
        case 2: strActionPage += "csharp.aspx"; break;
        case 6: strActionPage += "jsp.jsp"; break;
        case 4: strActionPage += "vbnet.aspx"; break;
        case 8: strActionPage += "asp.asp"; break;
        case 10: strActionPage += "cfm.cfm"; break;
        case 1: strActionPage += "php-mysql.php?imgID=new"; break;
        case 7: strActionPage += "jsp-oracle.jsp?imgID=new"; break;
        case 3: strActionPage += "csharp-db.aspx?imgID=new"; break;
        case 5: strActionPage += "vbnet-db.aspx?imgID=new"; break;
        case 9: strActionPage += "asp-db.asp"; break;
        case 11: preparetoUploadtoAzure(_name); break;
        default: break;
    }
    DWObject.IfSSL = DynamLib.detect.ssl;
    var _strPort = location.port == "" ? 80 : location.port;
    if (DynamLib.detect.ssl == true)
        _strPort = location.port == "" ? 443 : location.port;
    DWObject.HTTPPort = _strPort;
    if ([0, 2, 4, 6].indexOf(document.getElementById("ddlLanguages").selectedIndex) != -1) {
        /* Add Fields to the Post */
        var fields = document.getElementsByClassName('div-fields-item');

        DWObject.ClearAllHTTPFormField();
        for (var n = 0; n < fields.length; n++) {
            var o = fields[n];
            if (o.children[0].children[0].value != '')
                DWObject.SetHTTPFormField(o.children[0].children[0].value, o.children[1].children[0].value);
        }
    }
}
function UploadImage_inner() {
    if (DWObject.HowManyImagesInBuffer == 0)
        return;

    var Digital = new Date();
    var uploadfilename = Digital.getMilliseconds(); // Uses milliseconds according to local time as the file name
    upload_preparation(uploadfilename);

    // Upload the image(s) to the server asynchronously
    if (document.getElementById("ddlLanguages").options.selectedIndex == 11 /*Azure*/) return;

    if (document.getElementsByName('ImageType')[0].checked) {
        var uploadIndexes = [];
        for (var i = DWObject.HowManyImagesInBuffer - 1; i > -1 ; i--) {
            uploadIndexes.push(i);
        }
        var uploadJPGsOneByOne = function (errorCode, errorString, sHttpResponse) {
            if (upload_returnSth)
                _printUploadedFiles(sHttpResponse);
            if (uploadIndexes.length > 0) {
                var _index = uploadIndexes.pop();
                if (upload_returnSth)
                    DWObject.HTTPUploadThroughPost(strHTTPServer, _index, strActionPage, uploadfilename + "-" + _index.toString() + ".jpg", OnHttpUploadSuccess, uploadJPGsOneByOne);
                else
                    DWObject.HTTPUploadThroughPost(strHTTPServer, _index, strActionPage, uploadfilename + "-" + _index.toString() + ".jpg", uploadJPGsOneByOne, OnHttpServerReturnedSomething);
            }
        }
        var _index = uploadIndexes.pop();
        if (upload_returnSth)
            DWObject.HTTPUploadThroughPost(strHTTPServer, _index, strActionPage, uploadfilename + "-" + _index.toString() + ".jpg", OnHttpUploadSuccess, uploadJPGsOneByOne);
        else
            DWObject.HTTPUploadThroughPost(strHTTPServer, _index, strActionPage, uploadfilename + "-" + _index.toString() + ".jpg", uploadJPGsOneByOne, OnHttpServerReturnedSomething);
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
        if (document.getElementById('uploadDirectly').checked) {
            DWObject.IfShowCancelDialogWhenImageTransfer = false;
            function ds_load_file_to_upload_directly(bSave, filesCount, index, path, filename) {
                nCount = filesCount;
                var filePath = path + "\\" + filename;
                aryFilePaths.push(filePath);
                if (aryFilePaths.length == nCount) {
                    upload_preparation();
                    var i = 0;
                    function uploadFileOneByOne() {
                        DWObject.HTTPUploadThroughPostDirectly(strHTTPServer, filePath, strActionPage, filename,
                            function () {
                                console.log('Upload Image:' + aryFilePaths[i] + ' -- successful');
                                i++;
                                if (i != nCount)
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
            DWObject.ShowFileDialog(false, "Any File | *.*", 0, "", "", true, true, 0);
        }
        else {
            UploadImage_inner();
        }
    }
}


/*******************/
/* Upload to Azure */

var Base64Binary = {
    _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
    decode: function (input, arrayBuffer) {
        //get last chars to see if are valid
        var lkey1 = this._keyStr.indexOf(input.charAt(input.length - 1));
        var lkey2 = this._keyStr.indexOf(input.charAt(input.length - 2));
        var bytes = (input.length / 4) * 3;
        if (lkey1 == 64) bytes--; //padding chars, so skip
        if (lkey2 == 64) bytes--; //padding chars, so skip		
        var uarray;
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;
        var j = 0;
        if (arrayBuffer)
            uarray = new Uint8Array(arrayBuffer);
        else
            uarray = new Uint8Array(bytes);
        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
        for (i = 0; i < bytes; i += 3) {
            //get the 3 octects in 4 ascii chars
            enc1 = this._keyStr.indexOf(input.charAt(j++));
            enc2 = this._keyStr.indexOf(input.charAt(j++));
            enc3 = this._keyStr.indexOf(input.charAt(j++));
            enc4 = this._keyStr.indexOf(input.charAt(j++));
            chr1 = (enc1 << 2) | (enc2 >> 4);
            chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
            chr3 = ((enc3 & 3) << 6) | enc4;
            uarray[i] = chr1;
            if (enc3 != 64) uarray[i + 1] = chr2;
            if (enc4 != 64) uarray[i + 2] = chr3;
        }
        return uarray;
    }
}

function uploadImageInner_azure(blobSasUrl, fileDataAsArrayBuffer) {
    var ajaxRequest = new XMLHttpRequest();
    try {
        ajaxRequest.open('PUT', blobSasUrl, true);
        ajaxRequest.setRequestHeader('x-ms-blob-type', 'BlockBlob');
        ajaxRequest.send(fileDataAsArrayBuffer);
        ajaxRequest.onreadystatechange = function () {
            if (ajaxRequest.readyState == 4) {
                console.log('Upload image to azure server successfully.');
            }
        }
    }
    catch (e) {
        console.log("can't upload the image to server.\n" + e.toString());
    }
}

function preparetoUploadtoAzure(__name) {
    var uploadfilename = '';
    //For JPEG, upload the current image
    if (document.getElementsByName('ImageType')[0].checked) {
        DWObject.SelectedImagesCount = 1;
        DWObject.SetSelectedImageIndex(0, DWObject.CurrentImageIndexInBuffer);
        DWObject.GetSelectedImagesSize(EnumDWT_ImageType.IT_JPG);
        uploadfilename = __name + '.jpg';
    }
    else { //For TIFF, PDF, upload all images
        var count = DWObject.HowManyImagesInBuffer;
        DWObject.SelectedImagesCount = count;
        for (var i = 0; i < count; i++) {
            DWObject.SetSelectedImageIndex(i, i);
        }
        if (document.getElementsByName('ImageType')[1].checked) {
            DWObject.GetSelectedImagesSize(EnumDWT_ImageType.IT_TIF);
            uploadfilename = __name + '.tif';
        }
        else {
            DWObject.GetSelectedImagesSize(EnumDWT_ImageType.IT_PDF);
            uploadfilename = __name + '.pdf';
        }
    }

    var strImg, aryImg, _uint8_STR, _bin_ARR, _blobImg;
    strImg = DWObject.SaveSelectedImagesToBase64Binary();
    // convert base64 to Uint8Array
    var bytes = (strImg.length / 4) * 3;
    var _temp = new ArrayBuffer(bytes);
    _uint8_STR = Base64Binary.decode(strImg, _temp);

    // convert Uint8Array to blob
    _blobImg = new Blob([_uint8_STR]);
    // upload to Azure server
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            uploadImageInner_azure(xhr.responseText, _blobImg);
        }
    }
    var actionPageFullPath = CurrentPath + 'action/' + 'azure.aspx?imageName=' + uploadfilename;
    xhr.open('GET', actionPageFullPath, true);
    xhr.send();
}
/*******************/