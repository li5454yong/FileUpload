/**
 * Created by lxg on 2016/12/20.
 */

/**
 * 文件对象
 */
var fileObj = {
    upLoadSize : 0
};

/**
 * 上传配置
 */
var opt = {
    blodSize : 1024*1024*10, //文件分片大小
    method : 'post', //请求方式
    fileObjName : 'file', //后台接收的文件名（后台使用spring mvc时此项不必要）
    uploadUrl : 'http://localhost:8080/FileSys/v1/uploadFile', //文件上传地址
    getUploadedSizeUrl : 'http://localhost:8080/FileSys/v1/uploadSize' //获取文件已上传大小地址
};
$(function () {
    $("#myupload").change(function (e) {
    	var file = e.target.files[0];
        fileObj.name = file.name;
        fileObj.size = file.size;//文件初始大小
        fileObj.oldFile = file;
        fileObj.upLoadSize = 0;
        afterChange(file);
    });
    
    //监听选择文件按钮
    $("#upload").click(function (e) {
        $("#myupload").click()
    });
    
    
    //选择文件之后
    var afterChange = function(file){
    	var str = '<div class="progress" style="width:400px;">'
    		  +'<div id="progress" class="progress-bar progress-bar-success progress-bar-striped" role="progressbar" '
    		  +'aria-valuenow="60" aria-valuemin="0" aria-valuemax="100" style="width:0%;">'
    		  +'</div></div>'
    		  +'&nbsp;&nbsp;<span id="filename">'+fileObj.name+'</span>&nbsp;&nbsp;<button class="btn btn-primary fileupload">上传</button>&nbsp;&nbsp;';
    	$("#cont").append(str);
    	
    	$('.fileupload').on('click',(function(){
 			return function(){upload();}
 		})(file));

    }

    //点击上传按钮事件后响应函数
    var upload = function(){
    	sendBlob(opt.uploadUrl,getBlod(fileObj.oldFile),{'name':fileObj.name});
    }

    /**
     * 分割文件
     * @param file
     * @returns {string|Blob|Array.<T>|ArrayBuffer|*}
     */
    var getBlod = function (file) {
    	var upLoadSize = 0;
    	if(!fileObj.upLoadSize > 0){
    		upLoadSize = getUpLoadSize(file);
    	}else{
    		upLoadSize = fileObj.upLoadSize;
    	}
        
        var BoldFile = file.slice(upLoadSize,upLoadSize+opt.blodSize);

        return BoldFile;
    }

    /**
     * 获取已上传文件大小
     * @param file
     * @returns {number}
     */
    var getUpLoadSize = function (file) {

        var uploadedSize = 0;
        $.ajax({
            url : opt.getUploadedSizeUrl,
            data : {'name':fileObj.name,'size':fileObj.size},
            async : false,
            type : 'POST',
            success : function(returnData){
                uploadedSize = returnData;
            }
        });

        return uploadedSize;
    }

    /**
     * 上传文件块
     * @param url
     * @param file
     * @param formdata
     */
    var sendBlob = function(url,file,formdata){
        var xhr=new XMLHttpRequest();
        xhr.open(opt.method, url, true);
        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        var fd = new FormData();
        fd.append(opt.fileObjName,file);
        if(formdata){
            for(key in formdata){
                fd.append(key,formdata[key]);
            }
        }
        xhr.send(fd);

        xhr.upload.addEventListener("progress", function(e) {
            onProgress(file, e.loaded, fileObj.size);
        }, false);

        xhr.onreadystatechange = function(e) {
            if (xhr.readyState == 4) {
                fileObj.uploadOver = true;
                if (xhr.status == 200) {
                    //console.log("over")
                    fileObj.upLoadSize = getUpLoadSize(file);
                    if(fileObj.upLoadSize < fileObj.size){
                    	//console.log(fileObj.upLoadSize)
                        sendBlob(opt.uploadUrl,getBlod(fileObj.oldFile),{'name':fileObj.name});
                    }
                }
            }
        }
    }

    /**
     * 进度条处理
     * @param file
     * @param loaded
     * @param size
     */
    var onProgress = function (file, loaded, size) {
    	console.log("本次已上传："+loaded)
    	console.log("upLoadSize:"+fileObj.upLoadSize)
    	
    	var p = (((parseInt(loaded)+parseInt(fileObj.upLoadSize))/parseInt(fileObj.size))*100).toFixed(2)
        console.log(p)
        $("#progress").css('width',p+'%');
    	var percentText = p > 100 ? '100.00%' : p +'%';
    	$("#bfb").html(percentText);
    }

});
