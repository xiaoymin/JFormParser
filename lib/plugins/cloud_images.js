/***
 * 图集上传组件
 * author:xiaoymin@foxmail.com
 * plugin-dependency:、jquery.js
 * 调用方法  $(selector).images(); selector 最好是input隐藏表单域
 * @param $
 */
(function($){
	$.fn.images=function(options){
		var method=arguments[0];
		if(imagesMethods[method]) {
			method = imagesMethods[method];
			arguments = Array.prototype.slice.call(arguments, 1);
		} else if( typeof(method) == 'object' || !method ) {
			method = imagesMethods.init;
		} else {
			$.log( 'Method ' +  method + ' does not exist on jQuery.pluginName' );
			return this;
		}
		return method.apply(this, arguments);
	}
	
	var imagesMethods={
		init:function(options){
			return this.each(function(){
				var that=$(this);
				var settings = that.data('images');
				if(typeof(settings) == 'undefined') {
					var defaults = {
						autoUpload:true,
						multipleFilesUpload:true, 
						uploadUrl: "/api/cms/material/uploadMaterial",
						fileInputName: 'file',
						browseTemplate: 'success'
					}
					settings = $.extend({}, defaults, options);
					that.data('images', settings);
				} else {
					settings = $.extend({}, settings, options);
				}
				var image=that;
				var id=image.attr("id");
				var bodydiv=$("<div></div>");
				bodydiv.attr("id",id+"_images_body");

				var maindiv=$("<div></div>");
				maindiv.attr("id",id+"_main");
				maindiv.addClass("cloud-img-main");

				var buttondiv=$("<div style='margin-top: 5px;margin-bottom: 5px;'></div>");
				buttondiv.attr("id",id+"_button");
				bodydiv.append(buttondiv).append(maindiv);

				//创建上传按钮
				var btnupload=$('<button class="btn start-btn" style="background: #3d76f5;color: #fff;">上传</button>');
				buttondiv.append(btnupload);

				var hiddendiv=$('<div style="display: none;"></div>');
				buttondiv.append(hiddendiv);
				//创建伪file对象
				var file=$('<input type="file" />');
				file.attr("name",settings.fileInputName);
				//创建iframe
				var iframe=$('<iframe name="'+id+'_frame" style="display: none;"></iframe>');
				hiddendiv.append(iframe);
				//创建表单
				//表单文件提交形式
				var form=$('<form method="post" enctype="multipart/form-data"></form>')
				form.attr("action",settings.uploadUrl);
				form.attr("target",id+"_frame");
				form.append(file);
				hiddendiv.append(form);
				//注册button上传事件
				btnupload.on("click",function (e) {
					e.preventDefault();
					file.click();
				})
				//注册filechange事件
				file.on("change",function () {
					console.log("file change...");
					var val=$(this).val();
					if(val!=""){
						//提交表单
						form[0].submit();
						//iframe绑定load事件
						iframe.bind("load",function () {
							console.log("上传回调")
							$(this).unbind('load');
							var framebody=$(this).contents().find("body");
							var ret=framebody.html();
							//是否存在pre标签
							if(framebody.find("pre").length>0){
								ret=framebody.find("pre").html();
							}
							var res=JSON.parse(ret);
							var url=res.data[0].url;
							var uploadId=res.data[0].id;
							console.log(url);
							console.log(res);
							//main div中创建div预览展示
							var ctdiv=$('<div class="cloud-img-body"></div>');

							//创建图片预览div
							var previewdiv=$('<div class="cloud-img-preview"></div>');

							var img=$('<img src="'+url+'" width="308" height="260"/>');
							previewdiv.append(img);


							//previewdiv.css("background-image","url("+url+") no-repeat;");
							//创建操作栏toolbar
							var headerdiv=$('<div class="cloud-img-header"></div>');
							//创建ul
							var ul=$('<ul></ul>');

							var li_up=$('<li><a><img src="../../../images/cloud_images/up.png"></a></li>');
							var li_down=$('<li><a><img src="../../../images/cloud_images/down.png"></a></a></li>');
							var li_del=$('<li><a><img src="../../../images/cloud_images/cross.png"></a></a></li>');
							ul.append(li_up).append(li_down).append(li_del);
							//赋予点击事件
							li_del.on("click",function () {
								var cbdiv=$(this).parents(".cloud-img-body");
								//记录删除id
								var mdata=that.data("images");
								var delImages=mdata.delImages;
								if(typeof(delImages)=="undefined"){
									delImages=new Array();
								}
								var delid=cbdiv.find("input:hidden").attr("data-id");
								delImages.push({id:delid});
								var settiongs=$.extend({},{delImages:delImages});
								that.data("images",settiongs);
								//remove div
								cbdiv.remove();
							})

							//上移
							li_up.on("click",function () {
								//获取统计parents元素
								var pdiv=$(this).parents(".cloud-img-body");
								//获取上一级
								var prediv=pdiv.prev();
								if(prediv.length>0){
									prediv.insertAfter(pdiv);
								}
							})
							//下移
							li_down.on("click",function () {
								//获取统计parents元素
								var pdiv=$(this).parents(".cloud-img-body");
								//获取上一级
								var nextdiv=pdiv.next();
								if(nextdiv.length>0){
									nextdiv.insertBefore(pdiv);
								}
							})

							headerdiv.append(ul);
							previewdiv.append(headerdiv);

							ctdiv.append(previewdiv);
							//追加文本
							var textar=$('<textarea></textarea>');
							ctdiv.append(textar);

							//隐藏表单域，存放image-url值
							var ipt=$('<input  type="hidden" />')
							ipt.val(url);
							ipt.attr("data-id",uploadId);
							ctdiv.append(ipt);

							maindiv.append(ctdiv);
							//上传成功后 重置maindiv高度
							var length=maindiv.find(".cloud-img-preview").length;
							var len=parseInt(length);
							var hei=350;
							var ht;
							if(len%3==0){
								ht=(parseInt(len/3)-1)*hei+hei;
							}else{
								ht=parseInt(len/3)*hei+hei;
							}
							console.log(len);
							console.log("ht:"+ht);
							//获取图片image数量
							maindiv.css("height",ht+"px");
							//注册mouse事件
							$(".cloud-img-preview").on("mouseover",function(){
								$(this).find(".cloud-img-header").slideDown();
							});
							$(".cloud-img-preview").on("mouseleave",function(){
								$(this).find(".cloud-img-header").slideUp();
							});
						})
					}
				});
				$(image).append(bodydiv);
			})
		},setValue:function (value) {
            //获取图集值
            var that=this.eq(0);
            var id=that.attr("id");
            var mainid=id+"_main";
            var maindiv=$("#"+mainid);
            for(var i=0;i<value.length;i++){
                var val=value[i];
                var url=val.url;
                var uploadId=val.id;
                var descirption=val.description;
                console.log(url);
                //main div中创建div预览展示
                var ctdiv=$('<div class="cloud-img-body"></div>');

                //创建图片预览div
                var previewdiv=$('<div class="cloud-img-preview"></div>');

                var img=$('<img src="'+url+'" width="308" height="260"/>');
                previewdiv.append(img);


                //previewdiv.css("background-image","url("+url+") no-repeat;");
                //创建操作栏toolbar
                var headerdiv=$('<div class="cloud-img-header"></div>');
                //创建ul
                var ul=$('<ul></ul>');

                var li_up=$('<li><a><img src="../../../images/cloud_images/up.png"></a></li>');
                var li_down=$('<li><a><img src="../../../images/cloud_images/down.png"></a></a></li>');
                var li_del=$('<li><a><img src="../../../images/cloud_images/cross.png"></a></a></li>');
                ul.append(li_up).append(li_down).append(li_del);
                //赋予点击事件
                li_del.on("click",function () {
                    var cbdiv=$(this).parents(".cloud-img-body");
                    //记录删除id
                    var mdata=that.data("images");
                    var delImages=mdata.delImages;
                    if(typeof(delImages)=="undefined"){
                        delImages=new Array();
                    }
                    var delid=cbdiv.find("input:hidden").attr("data-id");
                    delImages.push({id:delid});
                    var settiongs=$.extend({},{delImages:delImages});
                    that.data("images",settiongs);
                    //remove div
                    cbdiv.remove();
                })

                //上移
                li_up.on("click",function () {
                    //获取统计parents元素
                    var pdiv=$(this).parents(".cloud-img-body");
                    //获取上一级
                    var prediv=pdiv.prev();
                    if(prediv.length>0){
                        prediv.insertAfter(pdiv);
                    }
                })
                //下移
                li_down.on("click",function () {
                    //获取统计parents元素
                    var pdiv=$(this).parents(".cloud-img-body");
                    //获取上一级
                    var nextdiv=pdiv.next();
                    if(nextdiv.length>0){
                        nextdiv.insertBefore(pdiv);
                    }
                })

                headerdiv.append(ul);
                previewdiv.append(headerdiv);

                ctdiv.append(previewdiv);
                //追加文本
                var textar=$('<textarea></textarea>');
                textar.val(descirption);
                ctdiv.append(textar);

                //隐藏表单域，存放image-url值
                var ipt=$('<input  type="hidden" />')
                ipt.val(url);
                ipt.attr("data-id",uploadId);
                ctdiv.append(ipt);

                maindiv.append(ctdiv);
                //上传成功后 重置maindiv高度
                var length=maindiv.find(".cloud-img-preview").length;
                var len=parseInt(length);
                var hei=350;
                var ht;
                if(len%3==0){
                    ht=(parseInt(len/3)-1)*hei+hei;
                }else{
                    ht=parseInt(len/3)*hei+hei;
                }
                console.log(len);
                console.log("ht:"+ht);
                //获取图片image数量
                maindiv.css("height",ht+"px");
                //注册mouse事件
                $(".cloud-img-preview").on("mouseover",function(){
                    $(this).find(".cloud-img-header").slideDown();
                });
                $(".cloud-img-preview").on("mouseleave",function(){
                    $(this).find(".cloud-img-header").slideUp();
                });
            }
		},getValue:function () {
			//获取图集值
			var that=this.eq(0);
			console.log("image  getValue...")
			var value=new Array();
			var id=that.attr("id");
			$("#"+id).find(".cloud-img-body").each(function (i,f) {
				var t=$(f);
				//获取url
				var obj={show_sort:i,url:t.find("input:hidden").val(),description:t.find("textarea").val(),pkid:t.find("input:hidden").attr("data-id")};
				console.log("images value...")
				console.log(obj)
				value.push(obj);
			})
			console.log(value);
			return value;
		}
	}
})(jQuery)