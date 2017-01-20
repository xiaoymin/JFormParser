/**
 * JFormParser插件:根据json结构,生成页面,达到解放后端开发人员的目的,降低后端对前端开发要求,后端专心开发后台接口等服务程序,
 *            前期以表单元素为主,后期会增加更多页面元素的支持,敬请期待
 * JFormParser依赖:目前主要依赖bootstrap css框架、jQuery两大流行核心组件,设计之初想法是降低对各个插件的依赖耦合度,构造的
 *            页面元素使用其他插件也能达到多样化可替换,使得页面效果更加丰富
 * JFormParser元素:根据众多元素,构建丰富多彩的页面
 *            editor(富文本插件):富文本插件原打算使用百度的ueditor插件,因公司购买富文本插件强制需要使用,所以这里
 *                   使用ewebeditor插件,使用该插件需要依赖服务器环境,并且部署上线需要授权,否则无法使用.
 *            text(基本文本框):文本域,文本域是很强大的一种表单元素,JFormParser目前只要支持以下几种数据类型的文本域
 *                              normal:常规文本域,无任务效果
 *                              email:只支持邮件形式的文本输入,会自检非其他格式数据
 *                              number:整数文本域,只支持输入整数,会自检非其他格式数据
 *                              decimal:小数文本域
 *                              datetime:日期类型,目前使用的插件是My97DatePicker日期插件,所以依赖WdatePicker.js文件
 *            textarea(多行文本域):多行文本域
 *            select(下拉框):下拉框元素,下拉框涉及数据初始化的原因,所以插件提供了remote_url属性通过后台加载数据初始化
 *            panel(面板):面板组件,是一个容器组件
 *            grid(表格):表格组件,这里的表格无任何特殊意义,仅仅只是为了页面布局,同panel一样,也是容器组件
 *            checkboxGroup:复选框组组件
 *            radioGroup:单选框组组件
 *            button:按钮(普通按钮、提交按钮、返回按钮、、、、等)
 *            buttonGroup:按钮组,是一个容器组件,包含按钮的组合,
 *            datagrid:表格展示组件,依赖元数据查询组件
 *            fileupload:文件上传
 *            images:图集上传组件
 *            bMap：地图拾取经纬度坐标组件，依赖于百度js地图(http://lbsyun.baidu.com/index.php?title=jspopular)
 */
(function($){

    /***
     * 插件JFormParser
     * @param options
     */
    var JFormParser=function (options) {
        this.options=options;
    }

    /**
     * JFormParser插件类元素构造器
     * @param constructor 元素初始化json
     * @param target 元素初始化后页面jQuery对象
     */
    var mfElement=function (constructor,target) {
        this.constructor=constructor;
        this.element=target;
    }


    /**
     * JFormParser插件扩展地图元素构造器
     * @param lng 经度target
     * @param lat 纬度target
     */
    var mapElement=function (lng, lat) {
        this.lng=lng;
        this.lat=lat;
    }

    /***
     * map实例元素
     * @param id
     * @param map
     */
    var mapComponent=function (id, map) {
        this.id=id;
        this.map=map;
    }

    /***
     * 初始化
     */
    JFormParser.prototype.init=function(){
        console.time("控制台计时器init");
        console.profile('JFormParser性能分析器init');
        var $that=this;
        //try{
            layer.load();
            var opts=$that.options;
            //创建外部div层
            var div=$('<div class="frame-wrap"></div>');
            //导航栏
            var navs=opts.navs;
            $that.addNavs(navs,div);
            //创建模板页面
            $that.createTemplatePages(opts,div);
            //父元素
            var parent=$that.templatePage;
            //获取body,追加append
            $("body").append(div);
            //初始化插件
            $that.addPlugins(opts.childrens,parent);
            //初始化插件完成,如果是form模板页,还需要初始化赋值
            $that.initializedForm();
            layer.closeAll();
        console.timeEnd("控制台计时器init");
        console.profileEnd();
        /*}catch(e){
            console.error(e);
            layer.closeAll();
        }*/
    }

    /***
     * 表单初始化赋值
     */
    JFormParser.prototype.initializedForm=function () {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        //settings
        var opts=$that.options;
        //判断必须是否form模板页面
        if(opts.template_type=="form"){
            //每个表单需要id主键获取值,判断是否需要初始化
            var id=opts.id;
            if(typeof (id)!="undefined"&&id!=null&&id!=""){
                //表单有值,且不为空
                var remote_url=opts.init_url;
                var params={resource_name:opts.resource_name,id:id};
                //查询值
                $.ajax({
                    url:remote_url,
                    data:params,
                    dataType:"json",
                    type:"post",
                    async:false,
                    success:function (data) {
                        if(data.success){
                            var obj=data.data;
                            //赋值组件
                            $that.setBaseElementsValue(obj);
                        }
                    }
                })

                //初始化service组件
                var seles=$that.getServiceElements();
                if(seles.length>0){
                    for (var i=0;i<seles.length;i++){
                        var se=seles[i];
                        var target=se.element;
                        var json=se.constructor;
                        switch (json.element_type){
                            case "images":
                                $that.initImagesElement(json,target,{parent_id:id});
                                break;

                        }
                    }
                }
            }
        }
    }

    /***
     * 初始化文图集组件
     * @param json
     * @param target
     */
    JFormParser.prototype.initImagesElement=function (json, target,params) {
        var remote_url=json.remote_url;
        $.ajax({
            url:remote_url,
            type:"post",
            data:params,
            dataType:"json",
            async:false,
            success:function (data) {
                var arrs=new Array();
                for(var i=0;i<data.data.length;i++){
                    var img=data.data[i];
                    var obj={description:img.description,id:img.id,url:img.url};
                    arrs.push(obj);
                }
                $(target).images("setValue",arrs);
            }
        })
    }

    /***
     * 基础元素赋值
     * @param obj
     */
    JFormParser.prototype.setBaseElementsValue=function (obj) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        //获取所有表单元素
        var eles=$that.getAllFormElements();
        for(var i=0;i<eles.length;i++){
            var mfele=eles[i];
            var json=mfele.constructor;
            var target=mfele.element;
            //根据元素类型不同 赋值
            switch (json.element_type){
                case "text":
                    $that.setTextValue(json,target,obj);
                    break;
                case "textarea":
                    $that.setTextareaValue(json,target,obj);
                    break;
                case "editor":
                    $that.setEditorValue(json,target,obj);
                    break;
                case "select":
                    $that.setSelectValue(json,target,obj);
                    break;
                case "radioGroup":
                    $that.setRadioGroupValue(json,target,obj);
                    break;
                case "checkboxGroup":
                    $that.setCheckboxGroupValue(json,target,obj);
                    break;
                case "fileupload":
                    $that.setFileUploadValue(json,target,obj);
                    break;
                case "bMap":
                    $that.setBMapValue(json,target,obj);
                    break;
            }
        }
    }

    /***
     * 地图组件复制打点
     * @param json
     * @param target
     * @param obj
     * add by xiaoym@drore.com 2016-10-11 17:12:41
     */
    JFormParser.prototype.setBMapValue=function (json, target, obj) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        var mapEle=$that.getMapElement();
        //获取经度
        var lat=mapEle.lat;
        //纬度
        var lng=mapEle.lng;
        //地图打点
        //获取地图实例对象
        var map=$that.getMapById(json.id);
        var pt=new BMap.Point(lng.val(),lat.val());
        //获取坐标 创建点
        var marker = new BMap.Marker(pt);
        //增加点
        map.addOverlay(marker);
    }

    /***
     * 给文件上传组件赋值
     * @param json
     * @param target
     * @param obj
     */
    JFormParser.prototype.setFileUploadValue=function (json, target, obj) {
        var value=obj[json.meta_column];
        $(target).val(value);
        //文件上传还需要预览
        //赋值，设置预览
        $(target).fileupload("setValue",value);
    }

    /***
     * 普通文本框赋值
     * @param json
     * @param target
     * @param obj
     */
    JFormParser.prototype.setTextValue=function (json, target, obj) {
        //赋值
        $(target).val(obj[json.meta_column]);
    }

    /***
     * 赋值富文本框值
     * @param json 结构
     * @param target 目标
     * @param obj 值对象
     */
    JFormParser.prototype.setEditorValue=function (json, target, obj) {
        //富文本框是隐藏textarea，所以这里的target也是textarea
        //赋值需要赋值textarea，然后赋值ewebeditor的值
        var value=obj[json.meta_column];
        $(target).val(value);
        //获取ewebeditor对象
        //var editor=EWEBEDITOR.Instances[json.meta_column];
        //editor.setHTML(value);
    }

    /***
     * 赋值下拉框的值
     * @param json
     * @param target
     * @param obj
     */
    JFormParser.prototype.setSelectValue=function (json, target, obj) {
        var value=obj[json.meta_column];
        if(value!=null&&value!=""){
            $(target).val(obj[json.meta_column]);
        }
    }

    /**
     * 赋值多行文本框的值
     * @param json
     * @param target
     * @param obj
     */
    JFormParser.prototype.setTextareaValue=function (json, target, obj) {
        $(target).val(obj[json.meta_column]);
    }

    /**
     * 赋值单选框组的值,并且选中
     * @param json
     * @param target
     * @param obj
     */
    JFormParser.prototype.setRadioGroupValue=function (json, target, obj) {
        //单选框组值是放了一个hidden隐藏表单域,所以需要首先赋值隐藏表单域
        var value=obj[json.meta_column];
        $(target).val(value);
        //下层div层需要选中
        var nextDivId=json.meta_column+"_div";
        $("#"+nextDivId).find("input").each(function (i, ipt) {
            //这里只需要判断值是否相等
            if($(ipt).val()==value){
                $(ipt).prop("checked","checked");
            }
        })
    }

    /***
     * 赋值复选框组的值,并且选中
     * @param json
     * @param target
     * @param obj
     */
    JFormParser.prototype.setCheckboxGroupValue=function (json, target, obj) {
        //复选框组值是放了一个hidden隐藏表单域,所以需要首先赋值隐藏表单域
        var value=obj[json.meta_column];
        $(target).val(value);
        if(value!=null&&value!=""){
            //value值是逗号分隔,需要转换成数组
            var vals=value.split(",");
            //下层div层需要选中
            var nextDivId=json.meta_column+"_div";
            $("#"+nextDivId).find("input").each(function (i, ipt) {
                if($.inArray($(ipt).val(),vals)>-1){
                    //存在
                    $(ipt).prop("checked","checked");
                }
            })
        }
    }

    /***
     * 创建模板页面,每个页面模板只有一个
     * @param obj
     * @param parent
     */
    JFormParser.prototype.createTemplatePages=function (obj, parent) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        switch (obj.template_type){
            case "form":
                $that.createTemplateForm(obj,parent);
                break;
            case "list":
                $that.createTemplateList(obj,parent);
                break;
        }
    }

    /***
     * 添加表单
     * @param obj
     * @param parent
     */
    JFormParser.prototype.createTemplateForm=function (obj, parent) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        //初始化创建form表单
        //创建表单对象
        var form=$("<form></form>");
        form.attr("id",obj.component_name);
        //赋值给当前属性form
        //追加form
        parent.append(form);
        $that.templatePage=form;
        $that.setConstructs(obj);
    }

    /***
     * 添加list页面组件
     * @param obj
     * @param parent
     */
    JFormParser.prototype.createTemplateList=function (obj, parent) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        //创建外部div层
        var div=$('<div></div>');
        div.attr("id",obj.component_name);
        parent.append(div);
        $that.templatePage=div;
        $that.setConstructs(obj);
    }

    /***
     * 获得当前templatePage对象
     * @returns {*|HTMLElement}
     */
    JFormParser.prototype.getTemplatePage=function(){
        return this.templatePage;
    }


    /***
     * 获取关联查询属性
     * @returns {*}
     */
    JFormParser.prototype.getRelQuery=function () {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        //默认false
        var relqflag=$that.options.rel_query;
        if(typeof (relqflag)!="undefined"){
            relqflag=relqflag;
        }else{
            relqflag=false;
        }
        return relqflag;
    }

    /***
     * 获取所有关联查询信息
     * @returns {*}
     */
    JFormParser.prototype.getRels=function () {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        //默认false
        var res=$that.options.rels;
        if(typeof (res)!="undefined"){
            res=res;
        }else{
            res=new Array();
        }
        return res;
    }

    /****
     * 添加基础表单元素，只针对form元素验证，包括(text,select,textarea,editor等)
     */
    JFormParser.prototype.setBaseElements=function(json,target){
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        //获取验证元素集合
        var validateEles=$that.validateElements;
        //所有表单元素
        var allElements=$that.allElements;
        if(typeof (validateEles)=="undefined"){
            validateEles=new Array();
        }
        if (typeof (allElements)=="undefined"){
            allElements=new Array();
        }
        var ele=new mfElement(json,target);
        //add all
        allElements.push(ele);
        //判断是否需要表单验证
        if(typeof(json.is_required)!="undefined"&&json.is_required){
            validateEles.push(ele);
        }
        $that.validateElements=validateEles;
        $that.allElements=allElements;
    }

    /***
     * 设置当前页面地图元素，包含添加，根据json中的地图id来区分获取
     * @param json
     * @param mapcomponents 地图实例组件
     *  add by xiaoym on 2016-10-11 17:07:57
     */
    JFormParser.prototype.setMaps=function (json, mapcomponents) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        var maps=$that.maps;
        if(typeof (maps)=="undefined"){
            maps=new Array();
        }
        //判断id是否存在
        var flag=false;
        var id=json.id;
        if(maps.length>0){
            for(var i=0;i<maps.length;i++){
                if(id==maps[i].id){
                    flag=true;
                    break;
                }
            }
        }
        if(!flag){
            maps.push(mapcomponents)
        }
        $that.maps=maps;
    }
    /***
     * 获取所有地图组件
     * add by xiaoym on  2016-10-11 17:07:35
     */
    JFormParser.prototype.getMaps=function () {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        return $that.maps;
    }

    /***
     * 根据地图id获取当前地图实例
     * @param id
     * add by xiaoym on 2016-10-11 17:07:39
     */
    JFormParser.prototype.getMapById=function (id) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        var map;
        var maps=$that.getMaps();
        for(var i=0;i<maps.length;i++){
            var mp=maps[i];
            if(mp.id==id){
                map=mp.map;
                break;
            }
        }
        return map;
    }

    /***
     * 设置地图经纬度坐标元素
     * @param json
     * @param target
     */
    JFormParser.prototype.setMapElements=function (json, target) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        //判断是否是地图元素
        var mapEleflag=false;
        if(typeof (json.map_element)=="boolean"){
            mapEleflag=json.map_element;
        }
        if(mapEleflag){
            var mapElement=$that.mapElement;
            if(typeof (mapElement)=="undefined"){
                mapElement=new Object();
            }
            //获取point
            var point=json.point;
            if(point=="lng"){
                mapElement.lng=target;
            }
            if(point="lat"){
                mapElement.lat=target;
            }
            $that.mapElement=mapElement;
        }
    }
    /***
     * 获取地图元素
     */
    JFormParser.prototype.getMapElement=function () {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        return $that.mapElement;
    }


    /***
     * 业务组件元素
     * @param json
     * @param target
     */
    JFormParser.prototype.setServiceElements=function (json, target) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        var servicesElements=$that.serviceElements;
        if(typeof (servicesElements)=="undefined"){
            servicesElements=new Array();
        }
        var ele=new mfElement(json,target);
        servicesElements.push(ele);
        $that.serviceElements=servicesElements;
    }

    JFormParser.prototype.getServiceElements=function () {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        var seles=$that.serviceElements;
        if(typeof (seles)=="undefined"){
            return new Array();
        }
        return seles;
    }

    /***
     * 针对query列表页面查询元素扩展属性,普通表单元素(text,textarea,select等查询元素需要有属性)
     * @param json
     * @param target
     */
    JFormParser.prototype.setQueryElements=function (json, target) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        var queryEles=$that.queryElements;
        if(typeof (queryEles)=="undefined"){
            queryEles=new Array();
        }
        //默认false
        var is_query=false;
        //判断是否是查询参数
        if(typeof (json.is_query)!="undefined"){
            is_query=json.is_query;
        }
        if (is_query){
            var qe=new mfElement(json,target);
            queryEles.push(qe);
        }
        $that.queryElements=queryEles;
    }

    /***
     * 获取所有query查询元素
     */
    JFormParser.prototype.getQueryElements=function () {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        return $that.queryElements;
    }
    /***
     * 获取所有查询按钮的值
     */
    JFormParser.prototype.getQueryElementsValue=function () {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        var queryEles=$that.getQueryElements();
        var obj={};
        if(typeof (queryEles)!="undefined"&&typeof (queryEles)=="object"){
            for (var i=0;i<queryEles.length;i++){
                var qe=queryEles[i];
                var construct=qe.constructor;
                var target=qe.element;
                switch (construct.element_type){
                    case "text":
                        obj[construct.meta_column]=$that.getTextValue(construct,target);
                        break;
                    case "select":
                        obj[construct.meta_column]=$that.getSelectValue(construct,target);
                        break;
                    case "radioGroup":
                        obj[construct.meta_column]=$that.getRadioGroupValue(construct,target);
                        break;
                    case "checkboxGroup":
                        obj[construct.meta_column]=$that.getCheckboxGroupValue(construct,target);
                        break;
                }
            }
        }
        return obj;
    }

    /***
     * 将外部options接口所有插件扁平化加入到数组中,方便遍历元素
     * 例如：{{0,childrens:[{1},{2}...]}处理结果为[{0},{1},{2}...]
     * @param obj
     */
    JFormParser.prototype.setConstructs =function (obj) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        var constructs=$that.constructs;
        if(typeof (constructs)=="undefined"){
            constructs=new Array();
        }
        var t=$.extend({},obj);
        //判断obj是否有childrens属性，有则删除
        if(typeof(t.childrens)!="undefined"){
            delete t.childrens;
        }
        constructs.push(t);
        $that.constructs=constructs;
    }

    /***
     * 获取所有构造结构json元素
     * @returns {*}
     */
    JFormParser.prototype.getConstructs=function () {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        return $that.constructs;
    }

    /***
     * 获取所有基本表单元素
     */
    JFormParser.prototype.getAllFormElements=function () {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        return $that.allElements;
    }

    /***
     * 获取待验证表单元素数组
     */
    JFormParser.prototype.getValidateElements=function () {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        return $that.validateElements;
    }
    /***
     * 获取表单的值
     */
    JFormParser.prototype.getFormValues=function () {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        var eles=$that.getAllFormElements();
        var obj={};
        for (var i=0;i<eles.length;i++){
            var ele=eles[i];
            var constructor=ele.constructor;
            var target=ele.element;
            //判断元素的类型,不同类型有不同的取值规则
            switch (constructor.element_type){
                case "text":
                    obj[constructor.meta_column]=$that.getTextValue(constructor,target);
                    break;
                case "select":
                    obj[constructor.meta_column]=$that.getSelectValue(constructor,target);
                    break;
                case "textarea":
                    obj[constructor.meta_column]=$that.getTextareaValue(constructor,target);
                    break;
                case "editor":
                    obj[constructor.meta_column]=$that.getEditorValue(constructor,target);
                    break;
                case "checkboxGroup":
                    obj[constructor.meta_column]=$that.getCheckboxGroupValue(constructor,target);
                    break;
                case "radioGroup":
                    obj[constructor.meta_column]=$that.getRadioGroupValue(constructor,target);
                    break;
                case "fileupload":
                    obj[constructor.meta_column]=$that.getFileUploadValue(constructor,target);
                    break;
            }
        }
        return obj;
    }

    /***
     * 获取所有service组件值
     */
    JFormParser.prototype.getServiceValue=function () {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        var svalues=new Array();
        //获取service组件
        var serviceEles=$that.getServiceElements();
        if(serviceEles.length>0){
            for(var i=0;i<serviceEles.length;i++){
                var sele=serviceEles[i];
                var json=sele.constructor;
                var target=sele.element;
                //分组件类型获取值
                switch (json.element_type){
                    case "images":
                        svalues.push($that.getImagesValue(json,target));
                        break;
                }

            }
        }
        return svalues;

    }

    /***
     * 获取images的值
     * @param obj
     * @param target
     */
    JFormParser.prototype.getImagesValue=function (obj, target) {
        var value={};
        //获取图片值
        var imgs=$(target).images("getValue");
        value.images=imgs;
        //获取删除的值
        var del=$(target).data("images");
        if(typeof (del)!="undefined" && typeof (del.delImages)!="undefined"){
            value.delImages=del.delImages;
        }
        value.service=obj.service;
        value.resource_name=obj.fk_resource_name;
        return value;
    }
    /***
     * 获取文件上传的值，这里是隐藏表单域
     * @param obj
     * @param target
     */
    JFormParser.prototype.getFileUploadValue=function (obj, target) {
        return $(target).val();
    }

    /***
     * 获取text文本值
     * @param obj
     * @param target
     */
    JFormParser.prototype.getTextValue=function (obj, target) {
        return $(target).val();
    }
    /**
     * 获取下拉框的值
     * @param obj
     * @param target
     */
    JFormParser.prototype.getSelectValue=function (obj, target) {
        return $(target).find("option:selected").val();
    }

    /***
     * 获取多行文本框的值
     * @param obj
     * @param target
     */
    JFormParser.prototype.getTextareaValue=function (obj, target) {
        return $(target).val();
    }

    /***
     * 获取富文本框的值
     * @param obj
     * @param target
     */
    JFormParser.prototype.getEditorValue=function (obj, target) {
        //获取富文本框实例
        var editor=EWEBEDITOR.Instances[obj.meta_column];
        return editor.getHTML();
    }

    /***
     * 获取复选框组的值
     * @param obj
     * @param target
     */
    JFormParser.prototype.getCheckboxGroupValue=function (obj, target) {
        //复选框是隐藏表单域
        return $(target).val();
    }

    /***
     * 获取单选框组的值
     * @param obj
     * @param target
     * @returns {*}
     */
    JFormParser.prototype.getRadioGroupValue=function (obj, target) {
        //单选组也是隐藏表单域
        return $(target).val();
    }

    /***
     * 设置datagrid属性
     * @param obj datagrid -->json结构体
     * @param value 赋值的属性值
     */
    JFormParser.prototype.setDataGrid=function (obj, value) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        var datagrid=$that.datagrid;
        if(typeof (datagrid)=="undefined"){
            datagrid=new Object();
        }
        //判断是否有属性值
        if(typeof(datagrid.dgrid)=="undefined"){
            datagrid.dgrid=obj;
        }
        var dgrid=$.extend({},datagrid,value);
        //赋值
        $that.datagrid=dgrid;
    }


    /***
     * 获取datagrid属性值
     */
    JFormParser.prototype.getDataGrid=function () {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        return $that.datagrid;
    }

    /***
     * 表单验证
     */
    JFormParser.prototype.validate=function () {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        var flag=true;
        //获取所有需要表单验证的元素
        var validEles=$that.getValidateElements();
        if(typeof(validEles)!="undefined"){
            //表单验证,循环
            $.each(validEles,function (i, e) {
                //获取表单元素类型,批量验证
                var constructor=e.constructor;
                var target=e.element;
                switch (constructor.element_type){
                    case "text":
                        flag=$t.validateText(constructor,target);
                        break;
                    case "checkboxGroup":
                        flag=$t.validateCheckboxGroup(constructor,target);
                        break;
                    case "radioGroup":
                        flag=$t.validateRadioGroup(constructor,target);
                        break;
                    case "textarea":
                        flag=$t.validateTextArea(constructor,target);
                        break;
                    case "editor":
                        flag=$t.validateEditor(constructor,target);
                        break;
                    case "fileupload":
                        flag=$t.validateFileUpload(constructor,target);
                        break;
                    case "images":
                        flag=$t.validateImages(constructor,target);
                        break;
                }
                if (!flag){
                    return flag;
                }

            })
        }
        return flag;
    }


    /***
     * 提交表单
     * @param button 结构
     */
    JFormParser.prototype.submit=function (button) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        var opt=$that.options;
        var flag=$that.validate();
        //这里需要表单验证
        if(flag){
            //layer.msg("表单验证成功");
            //获取表单的值
            var formData=$that.getFormValues();
            //ajax提交表单
            var submitUrl=opt.submit_url;
            var pkid="";
            if(typeof (opt.id)!="undefined"&&opt.id!=""){
                pkid=opt.id;
            }
            //获取service组件值
            var params={"resource_name":opt.resource_name,"id":pkid,"sub_data":formData,"services":$that.getServiceValue()};
            $.ajax({
                url:submitUrl,
                async:false,
                type:"post",
                data:{"submit_data":JSON.stringify(params)},
                dataType:"json",
                success:function (data) {
                    if(data.success){
                        //获取that对象的params参数
                        var ps=$that.options.params;
                        var acturl=button.action_url;
                        if(typeof (acturl)!="undefined"&&acturl!=""){
                            if(typeof (ps)!="undefined"){
                                for(var key in ps){
                                    if(acturl.indexOf("?")>-1){
                                        acturl=acturl+"&"+key+"="+ps[key];
                                    }else {
                                        acturl=acturl+"?"+key+"="+ps[key];
                                    }
                                }
                            }
                            //获取自带参数
                            if(typeof (button.params)!="undefined"){
                                //有参数
                                for(var key in button.params){
                                    if(acturl.indexOf("?")>-1){
                                        acturl=acturl+"&"+key+"="+button.params[key];
                                    }else {
                                        acturl=acturl+"?"+key+"="+button.params[key];
                                    }
                                }
                            }
                            //获取按钮的relation属性,默认false
                            if(typeof (button.relation)=="boolean"){
                                if(button.relation){
                                    var up=$t.checkEmptyObject(opt.urlParams);
                                    if(!$.isEmptyObject(up)){
                                        if(acturl.indexOf("?")>-1){
                                            acturl=acturl+"&urlParams="+JSON.stringify(up);
                                        }else {
                                            acturl=acturl+"?urlParams="+JSON.stringify(up);
                                        }
                                    }
                                }
                            }
                            window.location=acturl;
                        }else {
                            layer.msg("保存成功");
                        }
                    }else{
                        layer.msg(data.message);
                    }
                },error:function (jqXHR, textStatus, errorThrown) {
                    var rt=jqXHR.responseText;
                    ///to json
                    var obj=JSON.parse(rt);
                    if(!obj.success){
                        layer.msg(obj.message);
                    }
                }
            })
        }
    }


    /***
     * query查询操作
     * @param button 结构体
     */
    JFormParser.prototype.query=function (button) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        //获取datagrid属性
        var dgrid=$that.getDataGrid();
        var dataParent=dgrid.tbody;
        //当前页码参数加入datagrid属性
        $that.setDataGrid(dgrid.dgrid,{current_page:1});
        //页面跳转，触发查询事件
        $that.loadData(dgrid.dgrid,dataParent,{current_page:1});
    }
    /***
     * 追加页面组件
     * @param plugins
     * @param parent
     */
    JFormParser.prototype.addPlugins=function (plugins,parent) {
        console.time("控制台计时器addPlugins");
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        //判断组件
        if(typeof (plugins)!="undefined" && typeof (plugins) =="object"){
            //非空，必须是数组对象
            //遍历
            $.each(plugins,function(i,p){
                switch (p.element_type){
                    case "panel":
                        $that.addPanel(p,parent);
                        break;
                    case "button":
                        $that.addButton(p,parent);
                        break;
                    case "buttonGroup":
                        $that.addButtonGroup(p,parent);
                        break;
                }
            })
        }
        console.timeEnd("控制台计时器addPlugins");
    }
    /***
     * 增加导航栏
     * @param nvas
     * @param parent
     */
    JFormParser.prototype.addNavs=function (navs, parent) {
        var ol=$('<ol class="breadcrumb"></ol>');
        $.each(navs,function (i, n) {
            var li=$('<li></li>');
            var a=$('<a></a>')
            if(typeof (n.url)=="undefined"){
                a.attr("href","javascript:void(0)");
            }else{
                a.attr("href",n.url);
            }
            a.html(n.title);
            li.append(a);
            ol.append(li);
        })
        parent.append(ol);
    }

    /***
     * 增加panel面板，接收panel对象,parent--父容器对象，这里一般指form、div等
     * @param panel
     * @param parent
     */
    JFormParser.prototype.addPanel=function(panel,parent){
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        //这里创建panel面板
        var panelDiv=$('<div  class="panel panel-default"></div>');
        //判断是否包含头部
        var headerFlag=true;
        if(typeof (panel.whether_header)!="undefined"){
            headerFlag=panel.whether_header;
        }
        var headerDiv=$('<div  class="panel-heading"></div>');
        if (headerFlag){
            //设置header的内容信息
            var headerLabel=$("<label></label>");
            headerLabel.html(panel.element_title);
            //赋值内容
            headerDiv.append(headerLabel);
            //追加panel内容
            panelDiv.append(headerDiv);
        }
        //是否需要border
        var borderFlag=true;
        if(typeof(panel.whether_border)!="undefined"){
            borderFlag=panel.whether_border;
        }
        if(!borderFlag){
            //去除border
            panelDiv.css("border","none");
        }
        //创建body
        var bodydiv=$('<div class="panel-body"></div>');
        panelDiv.append(bodydiv);
        //追加内容到parent
        parent.append(panelDiv);

        //panel在这里创建结束，需要判断子组件了
        var plugins=panel.childrens;
        if(typeof (plugins)!="undefined" && typeof (plugins) =="object"){
            //非空，必须是数组对象
            //遍历
            $.each(plugins,function(i,p){
                switch (p.element_type){
                    case "grid":
                        $that.addGrid(p,bodydiv);
                        break;
                    case "editor":
                        $that.addEditor(p,bodydiv);
                        break;
                    case "text":
                        $that.addText(p,bodydiv);
                        break;
                    case "button":
                        $that.addButton(p,bodydiv);
                        break;
                    case "datagrid":
                        $that.addDataGrid(p,bodydiv);
                        break;
                    case "fileupload":
                        $that.addFileUpload(p,bodydiv);
                        break;
                    case "buttonGroup":
                        $that.addButtonGroup(p,bodydiv);
                        break;
                    case "images":
                        $that.addImages(p,bodydiv);
                        break;
                    case "select":
                        $that.addSelect(p,bodydiv);
                        break;
                    case "textarea":
                        $that.addTextarea(p,bodydiv);
                        break;
                    case "bMap":
                        $that.addBMap(p,bodydiv);
                        break;
                }
            })
        }
        $that.setConstructs(panel);
    }

    /***
     * 添加地图容器组件
     * @param bmap
     * @param parent
     */
    JFormParser.prototype.addBMap=function (bmap, parent) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        //bmap组件只包含2个子组件、经纬度组件
        var ctdiv=$('<div></div>');
        parent.append(ctdiv);
        //panel在这里创建结束，需要判断子组件了
        var plugins=bmap.childrens;
        if(typeof (plugins)!="undefined" && typeof (plugins) =="object"){
            for (var i=0;i<plugins.length;i++){
                var plugin=plugins[i];
                switch (plugin.element_type){
                    case "text":
                        $that.addText(plugin,ctdiv);
                        break;
                }

            }
        }
        //创建图集div
        var mapdiv=$('<div></div>');
        mapdiv.attr("id",bmap.id);
        if(typeof (bmap.width)!="undefined"){
            mapdiv.css("width",bmap.width);
        }
        if(typeof (bmap.height)!="undefined"){
            mapdiv.css("height",bmap.height);
        }
        parent.append(mapdiv);
        $that.registerComponentsEvents("bMap",mapdiv,bmap);
        $that.setBaseElements(bmap,mapdiv);
        $that.setConstructs(bmap);
    }

    /***
     * 上传图集
     * @param images
     * @param parent
     */
    JFormParser.prototype.addImages=function (images, parent) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        //创建图集div
        var imagesdiv=$('<div></div>');
        imagesdiv.attr("id",images.id);
        parent.append(imagesdiv);
        $that.registerComponentsEvents("images",imagesdiv,images);
        $that.setBaseElements(images,imagesdiv);
        $that.setServiceElements(images,imagesdiv);
        $that.setConstructs(images);
    }

    /***
     * 文件上传
     * 文件上传组件，针对一个logo或者file，这里存放的是上传后的文件路径,所以元素使用hidden隐藏表单域
     * @param fileupload
     * @param parent
     */
    JFormParser.prototype.addFileUpload=function (fileupload, parent) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        //外部div
        var div=$('<div></div>');
        div.addClass("form-group");

        //创建label
        var label=$("<label class='control-label'></label>");
        label.html(fileupload.element_title);
        //parent.append(label);
        div.append(label);
        $that.setRequiredTag(fileupload,label);
        //创建文本表单域
        var input=$('<input type="hidden" />');
        input.attr("name",fileupload.meta_column);
        input.attr("id",fileupload.meta_column);
        div.append(input);
        //追加append
        parent.append(div);
        $that.registerComponentsEvents("fileupload",input,fileupload);
        $that.setBaseElements(fileupload,input);
        $that.setConstructs(fileupload);

    }

    /***
     * 添加表格组件
     * @param grid
     * @param parent
     */
    JFormParser.prototype.addGrid=function (grid,parent) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        //grid获取行数，整除，给出每个div的百分比
        var rows=grid.rows;
        //计算百分比
        var percent=100/rows-1;
        //获取childrens
        var plugins=grid.childrens;
        $that.addGridPlugins(plugins,parent,rows);
        $that.setConstructs(grid);
    }

    /***
     * 添加tableGrid组件
     * @param datagrid
     * @param parent
     */
    JFormParser.prototype.addDataGrid=function (datagrid, parent) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        //外部div
        var div=$('<div></div>');
        div.addClass("table-responsive");
        //grid插件需要先加载是否有搜索框
        if(typeof (datagrid.childrens)!="undefined"&& typeof (datagrid.childrens) =="object"){
            //headdiv
            var headdiv=$('<div></div>')
            headdiv.addClass("table-head");
            //创建table布局
            var table=$('<table></table>');
            var tr=$('<tr></tr>');
            for(var i=0;i<datagrid.childrens.length;i++){
                var plugin=datagrid.childrens[i];
                //创建leftdiv
                var leftdiv=$('<div></div>');
                leftdiv.addClass("table-left");
                leftdiv.css({"marginLeft":"0px"});
                //headdiv.append(leftdiv);
                switch (plugin.element_type){
                    case "text":
                        $that.addText(plugin,leftdiv);
                        break;
                    case "select":
                        $that.addSelect(plugin,leftdiv);
                        break;
                    case "button":
                        $that.addButton(plugin,leftdiv);
                        break;
                    case "buttonGroup":
                        $that.addButtonGroup(plugin,div);
                        break;
                }
                //创建td
                var td=$('<td></td>');
                td.append(leftdiv);
                tr.append(td);
            }
            table.append(tr);
            headdiv.append(table);
            div.append(headdiv);
        }
        //创建table
        var table=$('<table></table>');
        table.addClass("table table-bordered table-text-center");
        table.css("textAlign","center");
        //创建thead
        var thead=$('<thead></thead>');
        var th_tr=$('<tr></tr>');
        th_tr.addClass("active");
        thead.append(th_tr);
        //append
        table.append(thead);
        //表格组件需要columns
        var columns=datagrid.columns;
        for (var i=0;i<columns.length;i++){
            var column=columns[i];
            var th=$('<th></th>');
            th.html(column.title);
            th_tr.append(th);
        }
        //是否需要操作栏
        var is_operate=false;
        if(typeof (is_operate)!="undefined"){
            is_operate=datagrid.is_operate;
        }
        if (is_operate){
            var opr_th=$('<th></th>');
            if(typeof (datagrid.operate_title)!="undefined"){
                opr_th.html(datagrid.operate_title);
            }else{
                opr_th.html("操作");
            }
            th_tr.append(opr_th);
        }
        var columnsData=[];
        //是否column字段有多个值连接情况，value,value,value这种情况
        if(typeof (datagrid.columns_field_titles)=="object"){
            for(var j=0;j<datagrid.columns_field_titles.length;j++){
                var ct=datagrid.columns_field_titles[j];
                //远程加载数据源
                var params={
                    fk_resource_name:ct.resource_name,
                    fk_meta_column:ct.fk_meta_column,
                    fk_meta_column_show:ct.fk_meta_column_show
                }
                var remote_url=ct.remote_url;
                $.ajax({
                    url:remote_url,
                    type:"post",
                    dataType:"json",
                    data:params,
                    async:false,
                    success:function (data) {
                        if(data.success){
                            var ehdata=data.data;
                            var cd={jg:ct,data:data.data,field:ct.field};
                            columnsData.push(cd);
                            /*
                            $.each(ehdata,function (i,d) {
                                var option=$('<option value="'+d[select.fk_meta_column]+'">'+d[select.fk_meta_column_show]+'</option>');
                                selectEle.append(option);
                            })*/
                        }
                    }
                })

            }
        }
        //创建tbody
        var tbody=$('<tbody></tbody>');
        table.append(tbody);
        div.append(table);
        //追加parent
        parent.append(div);
        //设置page页
        $that.addDataGridPage(datagrid,div);
        //这里需要设置一个datagrid的属性
        $that.setDataGrid(datagrid,{table:table,tbody:tbody,columnsData:columnsData});
        $that.loadData(datagrid,tbody,$that.options.params);
        $that.setConstructs(datagrid);
    }

    /***
     * 加载数据
     * @param datagrid
     * @param parent 追加父级元素
     * @param searchParams 查询参数
     */
    JFormParser.prototype.loadData=function (datagrid,parent,searchParams) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        var opts=$that.options;

        var dgrid=$that.getDataGrid();
        var columnData=dgrid.columnsData;
        console.log("columnData")
        console.log(columnData)
        //url
        var url=datagrid.remote_url;
        //是否需要操作栏
        var is_operate=false;
        if(typeof (is_operate)!="undefined"){
            is_operate=datagrid.is_operate;
        }
        //获取查询元素的值
        var queryParams=$that.getQueryElementsValue();
        var sp={};
        if(typeof (searchParams)!="undefined"){
            sp=searchParams;
        }
        var up=$t.checkEmptyObject(opts.urlParams);
        var q=$.extend({},queryParams,sp,up);
        //判断是否关联查询
        var rel_query=$that.getRelQuery();
        var rels=$that.getRels();
        //resource_name,查询表，query_data查询参数
        var params={resource_name:opts.resource_name,query_data:q,rel_query:rel_query,rels:rels};
        //load data from remote
        //load
        $.ajax({
            url:url,
            data:{params:JSON.stringify(params)},
            type:"post",
            async:false,
            dataType:"json",
            success:function (data) {
                //遍历数据{success:true,data:{page:,data:ff}}
                if(data.success){
                    //清空tbody
                    //parent.html("");
                    parent.empty();
                    //这里需要判断datagrid当前页码，默认初次加载current_page为undefined，需要将外来传入参数赋值给datagrid参数值
                    var dataParams={data:data.data};
                    if(typeof (searchParams.current_page)!="undefined"){
                        dataParams=$.extend({},dataParams,searchParams);
                    }
                    $that.setDataGrid(datagrid,dataParams);
                    var dataRows=data.data.data;
                    //开始遍历
                    if($that.getRelQuery()){
                        //如果是关联查询
                        for(var f=0;f<dataRows.length;f++){
                            var tr=$('<tr></tr>');
                            //遍历columns,td
                            var columns=datagrid.columns;
                            for (var i=0;i<columns.length;i++){
                                //自动换行
                                var td=$("<td style='word-break: break-all; '></td>");
                                var column=columns[i];
                                var columnKey;
                                var relcolumn=false;
                                //判断是否是关联查询字段
                                if(typeof (column.rel_column)!="undefined"&&typeof (column.rel_column)=="boolean"){
                                    relcolumn=column.rel_column;
                                }
                                //判断主外键字段
                                if(relcolumn){
                                    //外键表
                                    key=column.rel_resource_name+"_"+column.field;
                                }else{
                                    //主表
                                    key=opts.resource_name+"_"+column.field;
                                }

                                var htmlValue;
                                //需要判断是否need_column_title字段
                                if(typeof (column.need_column_title)=="boolean"){
                                    if(column.need_column_title){
                                        var temp=$t.toString(dataRows[f][key]);
                                        //逗号分隔
                                        var temps=temp.split(",");
                                        var cdobj={};
                                        //寻找field对应的值
                                        for(var y=0;y<columnData.length;y++){
                                            if(columnData[y].field==column.field){
                                                cdobj=columnData[y];
                                                break;
                                            }
                                        }
                                        var valuecolumn=cdobj.jg.fk_meta_column;
                                        var titlecolumn=cdobj.jg.fk_meta_column_show;
                                        var tempHtmlValue=[];
                                        for(var x=0;x<temps.length;x++){
                                            var v=temps[x];
                                            //column
                                            //获取元素
                                            //遍历data的title值
                                            for(var u=0;u<cdobj.data.length;u++){
                                                if(cdobj.data[u][valuecolumn]==v){
                                                    tempHtmlValue.push(cdobj.data[u][titlecolumn]);
                                                    break;
                                                }
                                            }
                                        }
                                        htmlValue=tempHtmlValue.join(",");
                                    }else{
                                        htmlValue=$t.toString(dataRows[f][key]);
                                    }
                                }else{
                                    htmlValue=$t.toString(dataRows[f][key]);
                                }

                                td.html(htmlValue);
                                tr.append(td);
                            }
                            if(is_operate){
                                var operTd=$('<td  nowrap="nowrap"></td>');
                                $that.addDataGridOperateButtons(datagrid,operTd,dataRows[f]);
                                tr.append(operTd);
                            }
                            parent.append(tr);
                        }
                    }else{
                        for(var f=0;f<dataRows.length;f++){
                            var tr=$('<tr></tr>');
                            //遍历columns,td
                            var columns=datagrid.columns;
                            for (var i=0;i<columns.length;i++){
                                //自动换行
                                var td=$("<td style='word-break: break-all; '></td>");
                                var column=columns[i];
                                var localflag=false;
                                //判断是否本地local-select数据
                                if(typeof (column.is_local_select)!="undefined"&&typeof (column.is_local_select)=="boolean"){
                                    localflag=column.is_local_select;
                                }
                                if(localflag){
                                    var tv=$t.toString(dataRows[f][columns[i].field]);
                                    //local data
                                    var realvalue;
                                    var lcdatas=column.local_select_data;
                                    for(var j=0;j<lcdatas.length;j++){
                                        var ld=lcdatas[j];
                                        if(ld.value==tv){
                                            realvalue=ld.text;
                                            break;
                                        }
                                    }
                                    td.html(realvalue);
                                }else{
                                    var htmlValue;
                                    //需要判断是否need_column_title字段
                                    if(typeof (column.need_column_title)=="boolean"){
                                        if(column.need_column_title){
                                            var temp=$t.toString(dataRows[f][columns[i].field]);
                                            //逗号分隔
                                            var temps=temp.split(",");
                                            var cdobj={};
                                            //寻找field对应的值
                                            for(var y=0;y<columnData.length;y++){
                                                if(columnData[y].field==column.field){
                                                    cdobj=columnData[y];
                                                    break;
                                                }
                                            }
                                            var valuecolumn=cdobj.jg.fk_meta_column;
                                            var titlecolumn=cdobj.jg.fk_meta_column_show;
                                            var tempHtmlValue=[];
                                            for(var x=0;x<temps.length;x++){
                                                var v=temps[x];
                                                //column
                                                //获取元素
                                                //遍历data的title值
                                                for(var u=0;u<cdobj.data.length;u++){
                                                    if(cdobj.data[u][valuecolumn]==v){
                                                        tempHtmlValue.push(cdobj.data[u][titlecolumn]);
                                                        break;
                                                    }
                                                }
                                            }
                                            htmlValue=tempHtmlValue.join(",");
                                        }else{
                                            htmlValue=$t.toString(dataRows[f][columns[i].field])
                                        }
                                    }else{
                                        htmlValue=$t.toString(dataRows[f][columns[i].field])
                                    }
                                    //td.html($t.toString(dataRows[f][columns[i].field]));
                                    td.html(htmlValue)
                                }
                                tr.append(td);
                            }
                            if(is_operate){
                                var operTd=$('<td  nowrap="nowrap"></td>');
                                $that.addDataGridOperateButtons(datagrid,operTd,dataRows[f]);
                                tr.append(operTd);
                            }
                            parent.append(tr);
                        }
                    }
                    //这里设置分页
                    $that.resetPageComponents(datagrid,null);
                }
            }
        })

    }

    /***
     * 重置分页组件
     * @param datagrid
     * @param parent
     */
    JFormParser.prototype.resetPageComponents=function (datagrid, parent) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        //获取datagrid属性
        var dgrid=$that.getDataGrid();
        //获取分组组件div
        var pageDiv=dgrid.page;
        var totalPage=1;
        var count=0;
        var current_page=1;
        if(typeof (dgrid.data)!="undefined"){
            //不为空
            totalPage=dgrid.data.total_page;
            count=dgrid.data.count;
            current_page=dgrid.data.current_page;

        }
        $(pageDiv).empty();
        //调用laypage插件
        laypage({
            cont: $(pageDiv), //容器。值支持id名、原生dom对象，jquery对象,
            pages: totalPage, //总页数
            skip: true, //是否开启跳页
            curr:current_page,
            skin: '#AF0000',
            groups: 3, //连续显示分页数
            jump:function (obj, first) {
                if (!first){
                    var dataParent=dgrid.tbody;
                    //当前页码参数加入datagrid属性
                    $that.setDataGrid(datagrid,{current_page:obj.curr});
                    //页面跳转，触发查询事件
                    $that.loadData(datagrid,dataParent,{current_page:obj.curr});
                }
            }
        });
    }



    /***
     * 添加操作按钮数组
     * @param datagrid
     * @param parent
     * @param data 数据
     */
    JFormParser.prototype.addDataGridOperateButtons=function (datagrid, parent,data) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        //获取operate 按钮数组
        var buttons=datagrid.operate_buttons;
        if(typeof (buttons)!="undefined"){
            for (var i=0;i<buttons.length;i++){
                var btn=buttons[i];
                switch (btn.type){
                    case "edit":
                        $that.addDataGridOperateEditButton(btn,parent,data);
                        break;
                    case "detail":
                        $that.addDataGridOperateDetailButton(btn,parent,data);
                        break;
                    case "delete":
                        $that.addDataGridOperateDeleteButton(btn,parent,data);
                        break;
                    case "relation":
                        $that.addDataGridOperateRelationButton(btn,parent,data);
                        break;
                    case "gridlink":
                        $that.addDataGridOperateGridLinkButton(btn,parent,data);
                        break;
                }
            }
        }
    }

    /***
     * 详情按钮
     * @param button
     * @param parent
     * @param data
     */
    JFormParser.prototype.addDataGridOperateDetailButton=function (button, parent, data) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        var opts=$that.options;
        //创建按钮
        var a=$('<a></a>');
        a.addClass("btn btn-primary");
        var i=$('<i></i>');
        i.addClass("fa fa-list");
        a.append(i);
        a.append(button.element_title);
        var columnKey="id";
        if($that.getRelQuery()){
            columnKey=$that.options.resource_name+"_id";
        }
        a.attr("data-id",data[columnKey]);

        //赋予编辑点击事件
        a.on("click",function(e){
            e.preventDefault();
            var t=$(this);
            var id=t.attr("data-id");
            var remote_url=button.remote_url;
            //判断是否有参数
            if(typeof (button.params)!="undefined"){
                //有参数
                for(var key in button.params){
                    if(remote_url.indexOf("?")>-1){
                        remote_url=remote_url+"&"+key+"="+button.params[key];
                    }else {
                        remote_url=remote_url+"?"+key+"="+button.params[key];
                    }
                }
            }
            var curpage=$that.getDataGrid().current_page;
            //页面跳转编辑,添加id参数
            if(remote_url.indexOf("?")>0){
                remote_url=remote_url+"&id="+id+"&current_page="+curpage;
            }else{
                remote_url=remote_url+"?id="+id+"&current_page="+curpage;
            }
            //获取按钮的relation属性,默认false
            if(typeof (button.relation)=="boolean"){
                if(button.relation){
                    var up=$t.checkEmptyObject(opts.urlParams);
                    if(remote_url.indexOf("?")>-1){
                        remote_url=remote_url+"&urlParams="+JSON.stringify(up);
                    }else {
                        remote_url=remote_url+"?urlParams="+JSON.stringify(up);
                    }
                }
            }
            //layer.msg(remote_url);
            window.location=remote_url;
        })
        //追加到父元素
        parent.append(a);
    }
    /***
     * 主从表关联添加，添加从表信息，从表字段必须和主表id字段对应
     * @param button
     * @param parent
     * @param data
     */
    JFormParser.prototype.addDataGridOperateRelationButton=function (button, parent, data) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        //创建按钮
        var a=$('<a></a>');
        a.addClass("btn btn-w-m btn-info");
        a.append(button.element_title);
        var columnKey="id";
        if($that.getRelQuery()){
            columnKey=$that.options.resource_name+"_id";
        }
        a.attr("data-id",data[columnKey]);
        //赋予关联表点击事件
        a.on("click",function(e){
            e.preventDefault();
            var t=$(this);
            var id=t.attr("data-id");
            var remote_url=button.remote_url;
            //判断是否有参数
            if(typeof (button.params)!="undefined"){
                //有参数
                for(var key in button.params){
                    if(remote_url.indexOf("?")>-1){
                        remote_url=remote_url+"&"+key+"="+button.params[key];
                    }else {
                        remote_url=remote_url+"?"+key+"="+button.params[key];
                    }
                }
            }
            var curpage=$that.getDataGrid().current_page;
            var relation_field=button.relation_field;
            //拼装urlParams参数
            var up=new Object();
            up[relation_field]=id;
            //页面跳转编辑,添加id参数
            if(remote_url.indexOf("?")>0){
                remote_url=remote_url+"&urlParams="+JSON.stringify(up)+"&current_page="+curpage;
            }else{
                remote_url=remote_url+"?urlParams="+JSON.stringify(up)+"&current_page="+curpage;
            }
            //layer.msg(remote_url);
            window.location=remote_url;
        })
        //追加到父元素
        parent.append(a);
    }

    /***
     * 添加编辑操作按钮
     * @param button
     * @param parent
     * @param data 数据
     */
    JFormParser.prototype.addDataGridOperateEditButton=function (button, parent,data) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        var opts=$that.options;
        //创建按钮
        var a=$('<a></a>');
        a.addClass("btn btn-primary");
        var i=$('<i></i>');
        i.addClass("fa fa-edit");
        a.append(i);
        a.append(button.element_title);
        var columnKey="id";
        if($that.getRelQuery()){
            columnKey=$that.options.resource_name+"_id";
        }
        a.attr("data-id",data[columnKey]);

        //赋予编辑点击事件
        a.on("click",function(e){
            e.preventDefault();
            var t=$(this);
            var id=t.attr("data-id");
            var remote_url=button.remote_url;
            //判断是否有参数
            if(typeof (button.params)!="undefined"){
                //有参数
                for(var key in button.params){
                    if(remote_url.indexOf("?")>-1){
                        remote_url=remote_url+"&"+key+"="+button.params[key];
                    }else {
                        remote_url=remote_url+"?"+key+"="+button.params[key];
                    }
                }
            }
            var curpage=$that.getDataGrid().current_page;
            //页面跳转编辑,添加id参数
            if(remote_url.indexOf("?")>0){
                remote_url=remote_url+"&id="+id+"&current_page="+curpage;
            }else{
                remote_url=remote_url+"?id="+id+"&current_page="+curpage;
            }
            //获取按钮的relation属性,默认false
            if(typeof (button.relation)=="boolean"){
                if(button.relation){
                    var up=$t.checkEmptyObject(opts.urlParams);
                    if(remote_url.indexOf("?")>-1){
                        remote_url=remote_url+"&urlParams="+JSON.stringify(up);
                    }else {
                        remote_url=remote_url+"?urlParams="+JSON.stringify(up);
                    }
                }
            }
            //layer.msg(remote_url);
            window.location=remote_url;
        })
        //追加到父元素
        parent.append(a);
    }

    /***
     * gridlink连接按钮属性
     * @param button
     * @param parent
     * @param data
     */
    JFormParser.prototype.addDataGridOperateGridLinkButton=function (button, parent,data) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        var opts=$that.options;
        //创建按钮
        var a=$('<a></a>');
        a.addClass("btn btn-primary");
        var i=$('<i></i>');
        i.addClass("fa fa-edit");
        a.append(i);
        a.append(button.element_title);
        var columnKey="id";
        if($that.getRelQuery()){
            columnKey=$that.options.resource_name+"_id";
        }
        a.attr("data-id",data[columnKey]);

        //赋予编辑点击事件
        a.on("click",function(e){
            e.preventDefault();
            var t=$(this);
            var id=t.attr("data-id");
            var remote_url=button.remote_url;
            //判断是否有参数
            if(typeof (button.params)!="undefined"){
                //有参数
                for(var key in button.params){
                    if(remote_url.indexOf("?")>-1){
                        remote_url=remote_url+"&"+key+"="+button.params[key];
                    }else {
                        remote_url=remote_url+"?"+key+"="+button.params[key];
                    }
                }
            }
            var curpage=$that.getDataGrid().current_page;
            //页面跳转编辑,添加id参数
            if(remote_url.indexOf("?")>0){
                remote_url=remote_url+"&id="+id+"&current_page="+curpage;
            }else{
                remote_url=remote_url+"?id="+id+"&current_page="+curpage;
            }
            //获取按钮的relation属性,默认false
            if(typeof (button.relation)=="boolean"){
                if(button.relation){
                    var up=$t.checkEmptyObject(opts.urlParams);
                    if(remote_url.indexOf("?")>-1){
                        remote_url=remote_url+"&urlParams="+JSON.stringify(up);
                    }else {
                        remote_url=remote_url+"?urlParams="+JSON.stringify(up);
                    }
                }
            }
            //layer.msg(remote_url);
            window.location=remote_url;
        })
        //追加到父元素
        parent.append(a);
    }
    /***
     * 添加删除操作按钮
     * @param button
     * @param parent
     * @param data 数据
     */
    JFormParser.prototype.addDataGridOperateDeleteButton=function (button, parent,data) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        var opts=$that.options;
        //创建按钮
        var a=$('<a></a>');
        a.addClass("btn btn-warning");
        var span=$('<span></span>');
        span.addClass("glyphicon glyphicon-remove");
        a.append(span);
        a.append(button.element_title);
        var columnKey="id";
        if($that.getRelQuery()){
            columnKey=$that.options.resource_name+"_id";
        }


        a.attr("data-id",data[columnKey]);

        a.on("click",function(e){
            e.preventDefault();
            var t=$(this);
            var id=t.attr("data-id");
            //confirm
            layer.confirm("是否删除当前数据?",function (index) {
                var params={resource_name:opts.resource_name,id:id};
                var remote_url=button.remote_url;
                $.ajax({
                    url:remote_url,
                    type:"post",
                    dataType:"json",
                    data:params,
                    async:false,
                    success:function (data) {
                        layer.closeAll();
                        if(data.success){
                            var dgrid=$that.getDataGrid();
                            var tbody=dgrid.tbody;
                            //当前页码 2 当前数据 >(2-1)*pageSize+1
                            var current_page=dgrid.current_page;
                            //page_size:10
                            //护获取当前记录总数
                            var count=dgrid.data.count;
                            var psize=10;
                            //需要在总数大于pageSize的情况下
                            if(count>psize){
                                var nowcount=(parseInt(current_page)-1)*psize;

                                //1-10 11-20 21-30
                                //21 删除一条 变成20条 当前页码3需要－为2，
                                //判断当前总记录数-1的大小是否和当前页码 前一页的末尾相等
                                if((count-1)==nowcount){
                                    //末页最后一条，需要当前条数-1
                                    current_page=parseInt(current_page)-1;
                                }
                            }
                            $that.loadData(dgrid.dgrid,tbody,{current_page:current_page});
                        }
                    }
                })
            })


            //layer.msg(id)
        })
        //追加
        parent.append(a);
    }

    //扩展更多操作按钮


    /***
     * 加载datagrid插件的page页码属性，这里分页插件使用laypage插件(http://laypage.layui.com/)
     * @param datagrid
     * @param parent
     */
    JFormParser.prototype.addDataGridPage=function (datagrid, parent) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        //默认不支持分页
        var pagination=false;
        if(typeof (datagrid.pagination)!="undefined"){
            pagination=datagrid.pagination;
        }
        if (pagination){
            //如果需要分页
            //创建分页div,分页
            var pageDiv=$('<div></div>');
            pageDiv.css("float","right");
            //追加
            parent.append(pageDiv);
            $that.setDataGrid(datagrid,{page:pageDiv});
           /* //获取datagrid属性
            var dgrid=$that.getDataGrid();
            var totalPage=1;
            var count=0;
            var current_page=1;
            if(typeof (dgrid.data)!="undefined"){
                //不为空
                totalPage=dgrid.data.total_page;
                count=dgrid.data.count;
                current_page=dgrid.data.current_page;

            }else{

            }
            //调用laypage插件
            laypage({
                cont: pageDiv, //容器。值支持id名、原生dom对象，jquery对象,
                pages: totalPage, //总页数
                skip: true, //是否开启跳页
                curr:current_page,
                skin: '#AF0000',
                groups: 3, //连续显示分页数
                jump:function (obj, first) {
                    if (!first){
                        var dataParent=dgrid.tbody;
                        //当前页码参数加入datagrid属性
                        $that.setDataGrid(datagrid,{current_page:obj.curr});
                        console.log("jump...")
                        console.log($that.getDataGrid());

                        //页面跳转，触发查询事件
                        $that.loadData(datagrid,dataParent,{current_page:obj.curr});
                    }
                }
            });*/
        }
    }
    /***
     * 初始化插件
     * @param plugins 各个组件集合
     * @param parent 父元素
     * @param rows 行
     */
    JFormParser.prototype.addGridPlugins=function (plugins,parent,rows) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        var percent=100;
        if(typeof(rows)!="undefined"){
            //计算百分比
            percent=100/parseInt(rows)-1;
        }
        if(typeof (plugins)!="undefined" && typeof (plugins) =="object"){
            //非空，必须是数组对象
            //遍历
            $.each(plugins,function(i,p){
                var width=p.width;
                if(typeof(width)=="undefined"){
                    width=percent+"%";
                }
                //创建外部div层
                var div=$('<div  class="form-group pull-left"  style = "width:'+width+';margin-right:8px;height: 74.55px;"></div>');
                parent.append(div);
                switch (p.element_type){
                    case "text":
                        $that.addText(p,div);
                        break;
                    case "select":
                        $that.addSelect(p,div);
                        break;
                    case "textarea":
                        $that.addTextarea(p,div);
                        break;
                    case "checkboxGroup":
                        $that.addCheckboxGroup(p,div);
                        break;
                    case "radioGroup":
                        $that.addRadioGroup(p,div);
                        break;
                }
            })
        }
    }

    /***
     * 添加button按钮控件
     * @param button
     * @param parent
     */
    JFormParser.prototype.addButton=function (button, parent) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        //按钮有事件动作,这里因为统一,使用event_type属性来区分是submit，还是其他
        /*//创建按钮
        var btn=$('<button type="button" class="btn btn-sm btn-primary" style="margin-top: 15px;"></button>');
        //这里需要设置当前基本元素的样式
        btn.html(button.element_title);
        //追加到parent
        parent.append(btn);*/
        //根据button-type不同，分类添加不同的按钮
        switch (button.type){
            case "submit":
                $that.addSubmitButton(button,parent);
                break;
            case "link":
                $that.addLinkButton(button,parent);
                break;
            case "query":
                $that.addQueryButton(button,parent);
                break;

        }
        /*//判断是否是submit按钮
        if (typeof (button.event_type)!="undefined"&&button.event_type=="submit"){
            btn.bind("click",function (e) {
                e.preventDefault();
                //提交
                $that.submit();
            })
        }*/
        $that.setConstructs(button);
    }

    /***
     * 添加button组
     * @param bg
     * @param parent
     */
    JFormParser.prototype.addButtonGroup=function (bg, parent) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        //操作按钮组
        var div=$('<div></div>');
        div.addClass("form-group btn-bar");
        //对齐方式
        if(typeof (bg.align)!="undefined"&&bg.align!=""){
            div.css("textAlign",bg.align);
        }
        //append
        parent.append(div);
        //创建按钮组
        if(typeof(bg)!="undefined"&&typeof (bg.childrens)!="undefined"){
            var childrens=bg.childrens;
            for(var i=0;i<childrens.length;i++){
               var btn=childrens[i];
                switch (btn.element_type){
                    case "button":
                        $that.addButton(btn,div);
                        break;
                }
            }
        }
        $that.setConstructs(bg);
    }

    /***
     *
     * 创造插叙那男
     * @param button
     * @param parent
     */
    JFormParser.prototype.addQueryButton=function (button, parent) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;

        var btn=$('<button></button>');
        btn.html(button.element_title);
        btn.addClass("btn  btn-info");
        btn.css("margin","5px");
        if(button.width!=""){
            btn.css("width",button.width);
        }
        parent.append(btn);

        btn.bind("click",function (e) {
            e.preventDefault();
            $that.query(button);
        })
    }

    /***
     * 添加提交按钮操作
     * @param button
     * @param parent
     */
    JFormParser.prototype.addSubmitButton=function (button, parent) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        //按钮有事件动作,这里因为统一,使用event_type属性来区分是submit，还是其他

        //创建按钮
        var btn=$('<button type="button" class="btn btn-sm btn-primary" ></button>');
        //这里需要设置当前基本元素的样式
        btn.html(button.element_title);
        btn.css("margin","5px");
        if(button.width!=""){
            btn.css("width",button.width);
        }
        //追加到parent
        parent.append(btn);
        //判断是否是submit按钮
        if (typeof (button.type)!="undefined"&&button.type=="submit"){
            btn.bind("click",function (e) {
                e.preventDefault();
                //提交
                $that.submit(button);
            })
        }
    }

    /***
     * 添加link连接的button,默认行为为跳转
     * @param button
     * @param parent
     */
    JFormParser.prototype.addLinkButton=function (button, parent) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        var opts=$that.options;

        var btn=$('<button></button>');
        btn.html(button.element_title);
        btn.addClass("btn  btn-info");
        btn.css("margin","5px");
        if(button.width!=""){
            btn.css("width",button.width);
        }
        parent.append(btn);
        //注册link事件
        btn.on("click",function (e) {
            e.preventDefault();
            var remote_url=button.remote_url;
            //判断是否有参数
            if(typeof (button.params)!="undefined"){
                //有参数
                for(var key in button.params){
                    if(remote_url.indexOf("?")>-1){
                        remote_url=remote_url+"&"+key+"="+button.params[key];
                    }else {
                        remote_url=remote_url+"?"+key+"="+button.params[key];
                    }
                }
                //获取按钮的relation属性,默认false
                if(typeof (button.relation)=="boolean"){
                    if(button.relation){
                        var up=$t.checkEmptyObject(opts.urlParams);
                        if(!$.isEmptyObject(up)){
                            if(remote_url.indexOf("?")>-1){
                                remote_url=remote_url+"&urlParams="+JSON.stringify(up);
                            }else {
                                remote_url=remote_url+"?urlParams="+JSON.stringify(up);
                            }
                        }
                    }
                }
            }
            window.location=remote_url;
        })
    }
    /***
     * 添加增加按钮,增加按钮这里动作是url跳转
     * @param button
     * @param parent
     */
    JFormParser.prototype.addAddButton=function (button, parent) {
        var btn=$('<button></button>');
        btn.addClass("btn btn-sm btn-primary");
        btn.html(button.element_title);
        parent.append(btn);
        //注册点击事件
        btn.on("click",function (e) {
            e.preventDefault();
            var remote_url=button.remote_url;
            //判断是否有参数
            if(typeof (button.params)!="undefined"){
                //有参数
                for(var key in button.params){
                    if(remote_url.indexOf("?")>-1){
                        remote_url=remote_url+"&"+key+"="+button.params[key];
                    }else {
                        remote_url=remote_url+"?"+key+"="+button.params[key];
                    }
                }
            }
            window.location=remote_url;
        })
    }

    /***
     * 添加text
     * @param text
     * @param parent
     */
    JFormParser.prototype.addText=function (text, parent) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        //外部div
        var div=$('<div></div>');
        div.addClass("form-group");

        //创建label
        var label=$("<label class='control-label' ></label>");
        label.html(text.element_title);
        //parent.append(label);
        div.append(label);
        $that.setRequiredTag(text,label);
        //创建文本表单域
        var input=$('<input type="text" />');
        input.attr("name",text.meta_column);
        //是否有默认值
        if(typeof (text.defaultValue)!="undefined"){
            input.val(text.defaultValue);
        }
        //placeHolder...

       /* var iptdiv=$('<div class="col-sm-10"></div>');
        iptdiv.append(input);*/
        div.append(input);

        //追加表单域
        //parent.append(input);
        parent.append(div);
        if(typeof (text.width)!="undefined"){
            div.css("width",text.width);
        }
        if(typeof (text.float)!="undefined"){
            div.css("float",text.float);
        }
        if(typeof (text.marginRight)!="undefined"){
            div.css("marginRight",text.marginRight);
        }

        $that.registerComponentsEvents("text",input,text);
        $that.setComponentsStyle("text",input,text,"form-control",{});
        //map元素
        $that.setMapElements(text,input);
        //添加元素
        $that.setBaseElements(text,input);
        $that.setConstructs(text);
        $that.setQueryElements(text,input);
    }

    /***
     * 添加下拉框
     * @param select
     * @param parent
     */
    JFormParser.prototype.addSelect=function (select, parent) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        //外部div
        var div=$('<div></div>');
        div.addClass("form-group");

        //创建label
        var label=$("<label></label>");
        label.html(select.element_title);

        div.append(label);
        //追加到parent
        parent.append(div);
        $that.setRequiredTag(select,label);
        //创建下拉框
        var selectEle=$('<select></select>');
        selectEle.attr("name",select.meta_column);
        var is_remote=false;//默认读取local数据源
        if(typeof (select.is_remote)!="undefind"){
            is_remote=select.is_remote;
        }
        //判断是否是ajax获取数据源
        if(is_remote){
            //远程加载数据源
            var params={
                fk_resource_name:select.fk_resource_name,
                fk_meta_column:select.fk_meta_column,
                fk_meta_column_show:select.fk_meta_column_show
            }
            var remote_url=select.remote_url;
            $.ajax({
                url:remote_url,
                type:"post",
                dataType:"json",
                data:params,
                async:false,
                success:function (data) {
                    if(data.success){
                        var ehdata=data.data;
                        $.each(ehdata,function (i,d) {
                            var option=$('<option value="'+d[select.fk_meta_column]+'">'+d[select.fk_meta_column_show]+'</option>');
                            selectEle.append(option);
                        })
                    }
                }
            })
        }else{
            //加载本地local数据
            var dataSource=select.data;
            $.each(dataSource,function(i,d){
                var option=$('<option value="'+d.value+'">'+d.text+'</option>');
                selectEle.append(option);
            })
        }
        //追加到parent
        //parent.append(selectEle);
        div.append(selectEle)
        $that.setComponentsStyle("select",selectEle,select,"form-control",{});
        $that.setBaseElements(select,selectEle);
        $that.setConstructs(select);
        $that.setQueryElements(select,selectEle);
    }

    /***
     * 添加多行文本
     * @param textarea
     * @param parent
     */
    JFormParser.prototype.addTextarea=function (textarea, parent) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        //创建label
        var label=$("<label></label>");
        label.html(textarea.element_title);
        //追加到parent
        parent.append(label);
        $that.setRequiredTag(textarea,label);
        //创建文本文本域
        var txa=$('<textarea></textarea>');
        txa.attr("name",textarea.meta_column);
        var rows=3;
        if(typeof(textarea.rows)!="undefined"&& typeof(textarea.rows)=="string"){
            rows=parseInt(textarea.rows);
        }
        txa.attr("rows",rows);
        //追加
        parent.append(txa);
        //设置样式
        $that.setComponentsStyle("textarea",txa,textarea,"form-control",{});
        $that.setBaseElements(textarea,txa);
        $that.setConstructs(textarea);
        $that.setQueryElements(textarea,txa);
    }

    /***
     * 添加checkboxGroup
     * @param cbg
     * @param parent
     */
    JFormParser.prototype.addCheckboxGroup=function (cbg, parent) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        //创建label
        var label=$("<label></label>");
        label.html(cbg.element_title);
        //追加到parent
        parent.append(label);
        $that.setRequiredTag(cbg,label);
        //创建隐藏表单域
        var input=$('<input type="hidden" class="form-control"  />');
        input.attr("name",cbg.meta_column);
        input.attr("id",cbg.meta_column);
        //追加parent
        parent.append(input);

        var divId=cbg.meta_column+"_div";
        var div=$('<div></div>');
        div.attr("id",divId);
        //追加append
        parent.append(div);
        //这里要判断是否从远程加载数据
        var is_remote=false;
        if(typeof(cbg.is_remote)!="undefined"){
            is_remote=cbg.is_remote;
        }
        if(is_remote){
            //ajax load data
            //远程加载数据源
            var params={
                fk_resource_name:cbg.fk_resource_name,
                fk_meta_column:cbg.fk_meta_column,
                fk_meta_column_show:cbg.fk_meta_column_show
            }
            var remote_url=cbg.remote_url;
            $.ajax({
                url:remote_url,
                type:"post",
                dataType:"json",
                data:params,
                async:false,
                success:function (data) {
                    if(data.success){
                        var ehdata=data.data;
                        $.each(ehdata,function (i,d) {
                            //创建label
                            var lbl=$('<label class="checkbox-inline"></label>');
                            //创建表单域
                            var ipt=$('<input type="checkbox" />');
                            ipt.val(d[cbg.fk_meta_column]);
                            //创建span
                            var spa=$('<span></span>');
                            spa.html(d[cbg.fk_meta_column_show]);
                            lbl.append(ipt).append(spa);
                            div.append(lbl);
                        })
                    }
                }
            })
        }else{
            //load local data
            $.each(cbg.data,function (i,d) {
                //创建label
                var lbl=$('<label class="checkbox-inline"></label>');
                //创建表单域
                var ipt=$('<input type="checkbox" />');
                ipt.val(d.value);
                //创建span
                var spa=$('<span></span>');
                spa.html(d.text);
                lbl.append(ipt).append(spa);
                div.append(lbl);
            })
        }
        //赋予checkboxGroup元素单机事件,赋值
        div.find("input").bind("click",function(){
            var val=[];
            div.find("input").each(function (i,ipt) {
                if($(ipt).prop("checked")){
                    val.push($(ipt).val());
                }
            });
            //逗号连接,赋值
            input.val(val.join());
        })
        $that.setBaseElements(cbg,input);
        $that.setConstructs(cbg);
        $that.setQueryElements(cbg,input);
    }

    /***
     * 添加单选组组件
     * @param radios
     * @param parent
     */
    JFormParser.prototype.addRadioGroup=function(radios,parent){
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        //创建label
        var label=$("<label></label>");
        label.html(radios.element_title);
        //追加到parent
        parent.append(label);
        $that.setRequiredTag(radios,label);
        //创建隐藏表单域
        var input=$('<input type="hidden" class="form-control"  />');
        input.attr("name",radios.meta_column);
        input.attr("id",radios.meta_column);
        //追加parent
        parent.append(input);

        var divId=radios.meta_column+"_div";
        var div=$('<div></div>');
        div.attr("id",divId);
        //追加append
        parent.append(div);
        //这里要判断是否从远程加载数据
        var is_remote=false;
        if(typeof(radios.is_remote)!="undefined"){
            is_remote=radios.is_remote;
        }
        if(is_remote){
            //ajax load data
            //远程加载数据源
            var params={
                fk_resource_name:radios.fk_resource_name,
                fk_meta_column:radios.fk_meta_column,
                fk_meta_column_show:radios.fk_meta_column_show
            }
            var remote_url=radios.remote_url;
            $.ajax({
                url:remote_url,
                type:"post",
                dataType:"json",
                data:params,
                async:false,
                success:function (data) {
                    if(data.success){
                        var ehdata=data.data;
                        $.each(ehdata,function (i,d) {
                            //创建label
                            var lbl=$('<label class="checkbox-inline"></label>');
                            //创建表单域
                            var ipt=$('<input type="radio" />');
                            //单选需要赋值name属性
                            ipt.attr("name",radios.meta_column+"RadioLines");
                            ipt.val(d[radios.fk_meta_column]);
                            //创建span
                            var span=$('<span></span>');
                            span.html(d[radios.fk_meta_column_show]);
                            lbl.append(ipt).append(span);
                            div.append(lbl);
                        })
                    }
                }
            })
        }else{
            //load local data
            $.each(radios.data,function (i,d) {
                //创建label
                var lbl=$('<label class="checkbox-inline"></label>');
                //创建表单域
                var ipt=$('<input type="radio" />');
                //单选需要赋值name属性
                ipt.attr("name",radios.meta_column+"RadioLines");
                ipt.val(d.value);
                //创建span
                var span=$('<span></span>');
                span.html(d.text);
                lbl.append(ipt).append(span);
                div.append(lbl);
            })
        }
        //赋予checkboxGroup元素单机事件,赋值
        div.find("input").bind("click",function(){
            var ts=$(this);
            if(ts.prop("checked")){
                //逗号连接,赋值
                input.val(ts.val());
            }
        })
        $that.setBaseElements(radios,input);
        $that.setConstructs(radios);
        $that.setQueryElements(radios,input);
    }

    /****
     * 添加富文本框
     * @param obj
     * @param parent
     */
    JFormParser.prototype.addEditor=function (obj, parent) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        //var div=$('<div class="form-group pull-left " style = "width:100%;" ></div>')
        var div=$('<div></div>');
        //创建textarea
        var txa=$('<textarea  style = "display:none;"  ></textarea>');
        txa.attr("id",obj.meta_column);
        txa.attr("name",obj.meta_column);
        div.append(txa);
        //追加到parent
        parent.append(div);
        //设置样式
        $that.setComponentsStyle("div",div,{},"form-group pull-left",{"width":"100%"});
        //初始化editor文本
        $that.registerComponentsEvents("editor",txa,obj);
        $that.setBaseElements(obj,txa);
        $that.setConstructs(obj);
    }

    /***
     * 初始化各个插件事件
     * @param target_type 插件初始对象类型
     * @param target 目标插件初始对象
     * @param obj json格式数组
     */
    JFormParser.prototype.registerComponentsEvents=function (target_type, target, obj) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        switch (target_type){
            case "editor":
                $that.registerEditor(obj,target);
                break;
            case "text":
                $that.registerText(obj,target);
                break;
            case "fileupload":
                $that.registerFileUpload(obj,target);
                break;
            case "images":
                $that.registerImages(obj,target);
                break;
            case "bMap":
                $that.registerBMap(obj,target);
                break;

        }
    }

    /***
     * 实例化地图组件
     * @param map
     * @param target
     */
    JFormParser.prototype.registerBMap=function (bmap, target) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        //实例化地图对象
        var map=new BMap.Map(bmap.id);
        //赋值给this对象属性，方便赋值
        $that.map=map;
        //获取center，如果为空，默认为杭州
        var center="杭州";
        if(typeof (bmap.center)!="undefined"){
            center=bmap.center;
        }
        var zoom=12;
        if(typeof (bmap.zoom)=="number"){
            if(bmap.zoom>0){
                zoom=bmap.zoom;
            }
        }
        map.centerAndZoom(center,zoom);
        //是否启用地图拖拽，默认禁用
        var dragging=false;
        if(typeof (bmap.dragging)=="boolean"){
            dragging=bmap.dragging;
        }
        if(dragging){
            map.enableDragging();
        }else{
            map.disableDragging();
        }

        var scrollwheelzoom=false;
        if(typeof (bmap.scrollwheelzoom)=="boolean"){
            scrollwheelzoom=bmap.scrollwheelzoom;
        }
        if(scrollwheelzoom){
            map.enableScrollWheelZoom();
        }else{
            map.disableScrollWheelZoom();
        }

        var doubleclickzoom=true;
        if(typeof (bmap.doubleclickzoom)=="boolean"){
            doubleclickzoom=bmap.doubleclickzoom;
        }
        if(doubleclickzoom){
            map.enableDoubleClickZoom();
        }else{
            map.disableDoubleClickZoom();
        }

        //默认事件
        //注册click事件，给input文本框赋值
        map.addEventListener("click",function(e){
            //清除地图上所有覆盖物。
            map.clearOverlays();
            var pt=e.point;
            //获取坐标 创建点
            var marker = new BMap.Marker(pt);
            $($that.getMapElement().lng).val(pt.lng);
            $($that.getMapElement().lat).val(pt.lat);
            map.addOverlay(marker);    //增加点
            //alert(e.point.lng + "," + e.point.lat);
        });

        var mapc=new mapComponent(bmap.id,map);
        $that.setMaps(bmap,mapc);
    }

    /****
     * 实例化上传图集组件
     * @param images
     * @param target
     */
    JFormParser.prototype.registerImages=function (images, target) {
        //实例化文件上传
        $(target).images();
    }

    /***
     * 实例化文件上传组件
     * 依赖cloud_fileupload.js
     * @param fileupload
     * @param target
     */
    JFormParser.prototype.registerFileUpload=function (fileupload, target) {
        //实例化文件上传
        $(target).fileupload();
    }

    /***
     * 初始化富文本框
     * @param obj
     * @param target
     */
    JFormParser.prototype.registerEditor=function (obj, target) {
        setTimeout(function () {
            EWEBEDITOR.Replace(obj.meta_column,{style:"coolblue", width:"100%", height:"650"});
        },100)
    }


    /***
     * 初始化文本域事件
     * (日期控件、整数、小数、身份证.....等等)
     * "data_type":"normal",//["normal","email","number","decimal","datetime","card"..普通文本、邮箱、整数、小数、身份证]
     * @param obj
     * @param target
     */
    JFormParser.prototype.registerText=function (obj, target) {
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;
        //获取富文本框的类型
        var dt=obj.data_type;
        //非normal,需要加验证,页面效果等
        if(typeof (dt)!="undefined"&&dt!="normal"){
            //针对整数、小数，做输入限制
            switch (dt){
                case "email":
                    $that.registerTextToEmail(obj,target);
                    break;
                case "card":
                    $that.registerTextToCard(obj,target);
                    break;
                case "number":
                    $that.registerTextToNumber(obj,target);
                    break;
                case "decimal":
                    $that.registerTextToDecimal(obj,target);
                    break;
                case "datetime":
                    $that.registerTextToDateTime(obj,target);
                    break;
                case "onlyNumAlpha":
                    $that.registerTextToNumberAlpha(obj,target);
                    break;
                case "password":
                    $that.registerTextToPassword(obj,target);
                    break;
            }
        }

    }
    /***
     * 密码
     * @param text
     * @param target
     */
    JFormParser.prototype.registerTextToPassword=function (text, target) {
        $(target).passwordText();
    }
    /***
     * 仅仅支持数字和文本
     * @param text
     * @param target
     */
    JFormParser.prototype.registerTextToNumberAlpha=function (text, target) {
        $(target).onlyNumAlpha();
    }

    /***
     * 注册文本组件为整数控件
     * @param text
     * @param target
     */
    JFormParser.prototype.registerTextToNumber=function(text,target){
        //注册keypress事件,只接收数字键的键值输入
        $(target).keypress(function (e) {
            var keycode=e.keyCode;
            //enter、delete
            if(keycode==13||keycode==46){
                return true;
            }
            //48-57
            if(keycode>=48&&keycode<=57){
                return true;
            }
            //other return false
            return false;
        });
        //加表单验证,不能输入非数字
    }
    /**
     * 注册文本组件为小数组件
     * @param text
     * @param target
     */
    JFormParser.prototype.registerTextToDecimal=function (text, target) {

    }

    /***
     * 注册文本组件为身份证组件
     * @param text
     * @param target
     */
    JFormParser.prototype.registerTextToCard=function (text, target) {

    }
    /***
     * 邮件组件
     * @param text
     * @param target
     */
    JFormParser.prototype.registerTextToEmail=function (text, target) {

    }

    /***
     * 注册文本组件为日期控件
     * @param text 控件json结构体
     * @param target 控件jQuery对象
     */
    JFormParser.prototype.registerTextToDateTime=function(text,target){
        //获取datetime的样式格式
        var formatter="yyyy-MM-dd";
        if(typeof(text.formatter)=="string"){
            formatter=text.formatter;
        }
        $(target).on("click",function () {
            WdatePicker({dateFmt:formatter});
        })
    }

    /***
     * 设置是否必填标志
     * @param json
     * @param target
     */
    JFormParser.prototype.setRequiredTag=function (json, target) {
        var is_required=false;
        if(typeof (json.is_required)!="undefined"){
            is_required=json.is_required;
        }
        if (is_required) {
            //必填
            var reqEle = $('<font style="color: red;"></font>');
            reqEle.html("*");
            target.append(reqEle);
        }
    }


    /***
     * 设置元素组件基本样式
     * @param target_type 组件分类
     * @param target 组件jQuery对象
     * @param json 组件结构体
     * @param className css样式类名
     * @param customerStyle 自定义样式,这里接收一个json格式的自定义样式,请参考jQuery.css({})文档
     * @param css_frame css框架,这里不传默认bootstrap
     */
    JFormParser.prototype.setComponentsStyle=function(target_type,target,json,className,customerStyle,css_frame){
        //设置当前实例化对象本身变量,this关键字在每个方法时会产生歧义
        var $that=this;

        var cframe="bootstrap";
        if (typeof (css_frame)!="undefined"&&css_frame!=""){
            cframe=css_frame;
        }
        //目前只支持bootstrap,以后有更多css框架，可在本方法里扩展
        if (cframe=="bootstrap"){
            switch (target_type){
                case "select":
                    $that.setSelectStyle(json,target,className,customerStyle);
                    break;
                case "text":
                    $that.setTextStyle(json,target,className,customerStyle);
                    break;
                case "textarea":
                    $that.setTextAreaStyle(json,target,className,customerStyle);
                    break;
                case "button":
                    $that.setButtonStyle(json,target,className,customerStyle);
                    break;
                case "panel":
                    $that.setPanelStyle(json,target,className,customerStyle);
                    break;
                case "grid":
                    $that.setGridStyle(json,target,className,customerStyle);
                    break;
                case "div":
                    $that.setDivStyle(json,target,className,customerStyle);
                    break;
            }

        }else{
            //其他css框架......
        }
    }
    /***
     * 设置panel组件css样式
     * @param json
     * @param target
     * @param className
     * @param customerStyle 自定义样式,这里接收一个json格式的自定义样式,请参考jQuery.css({})文档
     */
    JFormParser.prototype.setPanelStyle=function (json, target, className,customerStyle) {
        if(typeof (className)!="undefined"&&className!=""){
            $(target).addClass(className);
        }
        if(typeof (customerStyle)!="undefined"){
            $(target).css(customerStyle);
        }
    }

    /***
     * 设置grid组件css样式
     * @param json
     * @param target
     * @param className
     * @param customerStyle 自定义样式,这里接收一个json格式的自定义样式,请参考jQuery.css({})文档
     */
    JFormParser.prototype.setGridStyle=function (json, target, className,customerStyle) {
        if(typeof (className)!="undefined"&&className!=""){
            $(target).addClass(className);
        }
        if(typeof (customerStyle)!="undefined"){
            $(target).css(customerStyle);
        }
    }

    /**
     * 设置文本域组件css样式
     * @param json
     * @param target
     * @param className
     * @param customerStyle 自定义样式,这里接收一个json格式的自定义样式,请参考jQuery.css({})文档
     */
    JFormParser.prototype.setTextStyle=function (json, target, className,customerStyle) {
        if(typeof (className)!="undefined"&&className!=""){
            $(target).addClass(className);
        }
        if(typeof (customerStyle)!="undefined"){
            $(target).css(customerStyle);
        }
    }

    /***
     * 设置下拉框组件css样式
     * @param json
     * @param target
     * @param className
     * @param customerStyle 自定义样式,这里接收一个json格式的自定义样式,请参考jQuery.css({})文档
     */
    JFormParser.prototype.setSelectStyle=function (json, target, className,customerStyle) {
        if(typeof (className)!="undefined"&&className!=""){
            $(target).addClass(className);
        }
        if(typeof (customerStyle)!="undefined"){
            $(target).css(customerStyle);
        }
    }


    /***
     * 设置多行文本css样式
     * @param json
     * @param target
     * @param className
     * @param customerStyle 自定义样式,这里接收一个json格式的自定义样式,请参考jQuery.css({})文档
     */
    JFormParser.prototype.setTextAreaStyle=function (json, target, className,customerStyle) {
        if(typeof (className)!="undefined"&&className!=""){
            $(target).addClass(className);
        }
        if(typeof (customerStyle)!="undefined"){
            $(target).css(customerStyle);
        }
    }

    /***
     * 设置按钮样式
     * @param json
     * @param target
     * @param className
     * @param customerStyle 自定义样式,这里接收一个json格式的自定义样式,请参考jQuery.css({})文档
     */
    JFormParser.prototype.setButtonStyle=function (json, target, className,customerStyle) {
        if(typeof (className)!="undefined"&&className!=""){
            $(target).addClass(className);
        }
        if(typeof (customerStyle)!="undefined"){
            $(target).css(customerStyle);
        }
    }

    /***
     * 设置div层样式
     * @param json
     * @param target
     * @param className
     * @param customerStyle 自定义样式,这里接收一个json格式的自定义样式,请参考jQuery.css({})文档
     */
    JFormParser.prototype.setDivStyle=function (json, target, className,customerStyle) {
        if(typeof (className)!="undefined"&&className!=""){
            $(target).addClass(className);
        }
        if(typeof (customerStyle)!="undefined"){
            $(target).css(customerStyle);
        }
    }




    //JFormParser一些内置工具类
    var $t={
        validateText:function (obj,target) {//验证普通文本
            //获取rolus规则
            var ruls=obj.rules;
            var flag=true;
            if(typeof (ruls)!="undefined"&&ruls!=""){
                //有验证规则,按照验证规则要求验证
                //这里需要做邮箱、身份证、时间、整数等校验
                var rs=ruls.split("|");
                for (var i=0;i<rs.length;i++){
                    var rule=rs[i];
                    if($t.isContainRules(rule)){
                        //验证
                        switch (rule){
                            case "is_number":
                                flag=$t.validateNumber(obj,target);
                                break;
                            case "is_decimal":
                                break;
                            case "is_email":
                                break;
                            case "is_card":
                                break;
                            case "is_phone":
                                break;

                        }
                    }
                }
            }else{
                //普通则做非空校验
                if(!$(target).val()){
                    flag=false;
                    $(target).focus();
                    //layer提示
                    var msg=obj.element_title+"不能为空";
                    //外来结构化message
                    if(typeof (obj.message)!="undefined"&&obj.message!=""){
                        msg=obj.message;
                    }
                    layer.tips(msg,target);
                }
            }
            return flag;
        },validateCheckboxGroup:function (obj, target) {
            //获取rolus规则
            var ruls=obj.rules;
            var flag=true;
            if(typeof (ruls)!="undefined"&&ruls!=""){
                //有验证规则,按照验证规则要求验证
                //这里需要做邮箱、身份证、时间、整数等校验
                var rs=ruls.split("|");
                for (var i=0;i<rs.length;i++){
                    var rule=rs[i];
                    if($t.isContainRules(rule)){
                        //验证
                        switch (rule){

                        }
                    }
                }
            }else{
                //普通则做非空校验
                if(!$(target).val()){
                    flag=false;
                    //这里focus到div层
                    var id=$(target).attr("id")+"_div";
                    $("#"+id).focus();
                    //$(target).focus();
                    //layer提示
                    var msg=obj.element_title+"必须选中一个";
                    //外来结构化message
                    if(typeof (obj.message)!="undefined"&&obj.message!=""){
                        msg=obj.message;
                    }
                    //layer.tips(msg,target);
                    //layer.tips(msg,$("#"+id));
                    layer.msg(msg);
                }
            }
            return flag;
        },validateRadioGroup:function (obj, target) {
            //获取rolus规则
            var ruls=obj.rules;
            var flag=true;
            if(typeof (ruls)!="undefined"&&ruls!=""){
                //有验证规则,按照验证规则要求验证
                //这里需要做邮箱、身份证、时间、整数等校验
                var rs=ruls.split("|");
                for (var i=0;i<rs.length;i++){
                    if($t.isContainRules(rs[i])){
                        //验证
                    }
                }
            }else{
                //普通则做非空校验
                if(!$(target).val()){
                    flag=false;
                    //这里focus到div层
                    var id=$(target).attr("id")+"_div";
                    $("#"+id).focus();
                    //$(target).focus();
                    //layer提示
                    var msg=obj.element_title+"必须选中一个";
                    //外来结构化message
                    if(typeof (obj.message)!="undefined"&&obj.message!=""){
                        msg=obj.message;
                    }
                    //layer.tips(msg,target);
                    //layer.tips(msg,$("#"+id));
                    layer.msg(msg);
                }
            }
            return flag;
        }
        ,validateEditor:function (obj, target) {
            //获取rolus规则
            var ruls=obj.rules;
            var flag=true;
            if(typeof (ruls)!="undefined"&&ruls!=""){
                //有验证规则,按照验证规则要求验证
                //这里需要做邮箱、身份证、时间、整数等校验
                var rs=ruls.split("|");
                for (var i=0;i<rs.length;i++){
                    if($t.isContainRules(rs[i])){
                        //验证
                    }
                }
            }else{
                var editor=EWEBEDITOR.Instances[obj.meta_column];
                var val=editor.getHTML();
                //普通则做非空校验
                if(!val){
                    flag=false;
                    $(target).focus();
                    //layer提示
                    var msg=obj.element_title+"不能为空";
                    //外来结构化message
                    if(typeof (obj.message)!="undefined"&&obj.message!=""){
                        msg=obj.message;
                    }
                    //layer.tips(msg,target);
                    layer.msg(msg);
                }
            }
            return flag;
        }
        ,validateTextArea:function (obj, target) {
            //获取rolus规则
            var ruls=obj.rules;
            var flag=true;
            if(typeof (ruls)!="undefined"&&ruls!=""){
                //有验证规则,按照验证规则要求验证
                //这里需要做邮箱、身份证、时间、整数等校验
                var rs=ruls.split("|");
                for (var i=0;i<rs.length;i++){
                    if($t.isContainRules(rs[i])){
                        //验证
                    }
                }
            }else{
                //普通则做非空校验
                if(!$(target).val()){
                    flag=false;
                    $(target).focus();
                    //layer提示
                    var msg=obj.element_title+"不能为空";
                    //外来结构化message
                    if(typeof (obj.message)!="undefined"&&obj.message!=""){
                        msg=obj.message;
                    }
                    layer.tips(msg,target);
                }
            }
            return flag;
        }
        ,validateFileUpload:function (obj, target) {
            //获取rolus规则
            var ruls=obj.rules;
            var flag=true;
            if(typeof (ruls)!="undefined"&&ruls!=""){
                //有验证规则,按照验证规则要求验证
                //这里需要做邮箱、身份证、时间、整数等校验
                var rs=ruls.split("|");
                for (var i=0;i<rs.length;i++){
                    if($t.isContainRules(rs[i])){
                        //验证
                    }
                }
            }else{
                //普通则做非空校验
                if(!$(target).val()){
                    flag=false;
                    $(target).focus();
                    //layer提示
                    var msg=obj.element_title+"请上传资源";
                    //外来结构化message
                    if(typeof (obj.message)!="undefined"&&obj.message!=""){
                        msg=obj.message;
                    }
                    layer.tips(msg,target);
                }
            }
            return flag;
        }
        ,validateNumber:function(obj,target){
            //首先判断是否是非数字
            var flag=true;
            //验证整数
            var value=$(target).val();
            //是否非空
            if(value==""){
                $(target).focus();
                layer.tips(obj.element_title+"不能为空",target);
                flag=false;
            }else{
                if(isNaN(value)){
                    //特殊字符 非数字
                    layer.msg(obj.element_title+"必须为整数");
                    flag=false;
                }else{
                    var sp=value.split(".");
                    if(sp.length>3){
                        layer.msg(obj.element_title+"格式错误");
                        flag=false;
                    }else {
                        //判断是否有小数点
                        if(value.indexOf(".")>-1){
                            layer.msg(obj.element_title+"必须为整数");
                            flag=false;
                        }
                    }
                }
            }
            return flag;
        },validateDecimal:function (target) {
            //首先判断是否是非数字
            var flag=true;
            //验证整数
            var value=$(target).val();
            //是否非空
            if(value==""){
                flag=false;
            }else{
                if(isNaN(value)){
                    //特殊字符 非数字
                    flag=false;
                }else{
                    //判断是否有小数点
                    if(value.indexOf(".")>-1){
                        //flag=false;
                        //判断小数点个数

                    }//整数
                }
            }
            return flag;
        },validateImages:function (ct,target) {
            //验证图集
            var value=$(target).images("getValue");
            var flag=true;
           if(value.length==0){
               layer.msg("图集不能为空");
                flag=false;
            }
            return flag;
        }
        ,isContainRules:function (rule) {//传参输入的规则是否正确
            //更多验证规则后续更新...
            var rules=["required","is_email","is_phone","is_number","is_decimal"];
            return $.inArray(rule,rules)>-1;
            //return true;
        },
        toString:function (obj) {
            if(obj==null){
                return "";
            }else{
                if(typeof(obj)=="undefined"){
                    return "";
                }else if(typeof(obj)=="Array"){
                    return obj.join(",");
                }else if(typeof(obj)=="string"){
                    return obj;
                }
            }
            return obj;
        },checkEmptyObject:function (obj) {
            var newobj={};
            if(typeof (obj)!="undefined"&&!$.isEmptyObject(obj)){
                newobj=obj;
            }
            return newobj;
        }
    }


    /****
     * jquery plugin components
     * jquery扩展自定义插件部分,包括fileupload(素材上传)、images(图集)等插件的自定义封装
     * 2016-8-2 15:13:12------------------start
     */
    $.fn.fileupload=function(options){
        var method=arguments[0];
        if(fileuploadMethods[method]) {
            method = fileuploadMethods[method];
            arguments = Array.prototype.slice.call(arguments, 1);
        } else if( typeof(method) == 'object' || !method ) {
            method = fileuploadMethods.init;
        } else {
            $.log( 'Method ' +  method + ' does not exist on jQuery.pluginName' );
            return this;
        }
        return method.apply(this, arguments);
    }

    var fileuploadMethods={
        init:function(options){
            return this.each(function(){
                var that=$(this);
                var settings = that.data('fileupload');
                if(typeof(settings) == 'undefined') {
                    var defaults = {
                        autoUpload:true,
                        multipleFilesUpload:true,
                        uploadUrl: "/api/cms/material/uploadMaterial",
                        fileInputName: 'file',
                        browseTemplate: 'success'
                    }
                    settings = $.extend({}, defaults, options);
                    that.data('fileupload', settings);
                } else {
                    settings = $.extend({}, settings, options);
                }

                //依赖jqwights
                //单图上传
                //图片 input 隐藏域,用于提交表单值
                //在隐藏域下面创建div框
                var image=that;
                var id=image.attr("id");
                var logo=$("<div></div>");
                logo.attr("id",id+"_upload_file_div");
                //创建隐藏表单域
                //var hidden_input=$("<input type='hidden' name='"+id+"' /> ")
                //logo.append(hidden_input);
                image.after(logo);
                //实例化上传控件
                logo.jqxFileUpload({autoUpload:settings.autoUpload, uploadUrl:settings.uploadUrl, fileInputName: settings.fileInputName ,browseTemplate: settings.browseTemplate});
                //单文件上传,不需要显示 全部上传、全部取消按钮，直接remove掉，免得影响美观
                logo.find(".jqx-file-upload-buttons-container").remove();
                //取消 button的默认事件,这里的button默认事件是提交表单,是bug,只能手动去掉
                logo.find("button").on("click",function(e){
                    e.preventDefault();
                })
                var pid=id+"_upload_image_preview_div";
                //判断是否是图片
                var imgExp=new RegExp(".*?\.(jpg|png|jpeg|bmp|gif)","ig");
                //处理图片上传完成后的事件操作
                logo.on("uploadEnd",function(event){
                    var preResp=event.args.response;
                    //这里正则去除多余的标签
                    var regex=/<pre style=\".*?\">(.*?)<\/pre>/gim;
                    if(regex.test(preResp)){
                        var resp=eval("("+RegExp.$1+")");
                        var url=resp.data[0].url;
                        var media_id=resp.data[0].media_id;
                        //给隐藏域赋值
                        $("#"+id).val(url);
                        if($("#"+pid).length>0){
                            //存在 直接赋值
                            var preview=$("#"+pid);
                            preview.html("");
                            var previewA=$("<a></a>");
                            if(url.match(imgExp)!=null){
                                //if(imgExp.test($.trim(url))){
                                previewA.addClass("thumbnail");
                                //图片
                                var img=$("<img  style='width:250px;height:200px;'>");
                                img[0].src=url;
                                previewA.append(img);
                            }else{
                                previewA.attr("alt",url);
                                var mediaName=url.substring(url.lastIndexOf("/")+1);
                                previewA.html("").html(mediaName);
                                previewA.attr("href",url).attr("target","_blank");
                            }
                            preview.append(previewA);
                        }else{
                            //创建预览div
                            var preview=$("<div style='margin:5px;'></div>");
                            preview.attr("id",pid);
                            preview.addClass("col-xs-6 col-md-3");
                            var previewA=$("<a></a>");
                            if(imgExp.test(url)){
                                previewA.addClass("thumbnail");
                                var img=$("<img  style='width:250px;height:200px;'>");
                                img[0].src=url;
                                previewA.append(img);
                            }else{
                                //附件
                                previewA.attr("alt",url);
                                var mediaName=url.substring(url.lastIndexOf("/")+1);
                                previewA.html("").html(mediaName);
                                previewA.attr("href",url).attr("target","_blank");
                            }

                            preview.append(previewA);
                            logo.append(preview);
                        }
                    }
                })
                //判断是否url是有值的,如果有,创建默认预览,初始化的情况
                if($("#"+id).val()){
                    //创建预览div
                    var preview=$("<div style='margin:5px;'></div>");
                    preview.attr("id",pid);
                    preview.addClass("col-xs-6 col-md-3");
                    var previewA=$("<a></a>");
                    var url=$("#"+id).val();
                    if(imgExp.test(url)){
                        previewA.addClass("thumbnail");
                        var img=$("<img  style='width:250px;height:200px;'>");
                        img[0].src=$("#"+id).val();
                        previewA.append(img);
                    }else{
                        //附件
                        //http://oss.drore.com/material/e65a026b11ad4c6e98816f716e8f2e66/201605/09/b16bcad062f94035a568d0fea1b1e75f.json
                        //var mediaExp=/.*?\/\(.*?\\.\).*/gim;
                        previewA.attr("alt",url);
                        var mediaName=url.substring(url.lastIndexOf("/")+1);
                        previewA.html("").html(mediaName);
                        previewA.attr("href",url).attr("target","_blank");
                    }
                    preview.append(previewA);
                    logo.append(preview);
                }
            })
        },setValue:function (value) {
            var that=this.eq(0);
            //判断是否是图片
            var imgExp=new RegExp(".*?\.(jpg|png|jpeg|bmp|gif)","ig");
            var id=that.attr("id");
            var pid=id+"_upload_image_preview_div";
            var parent=$("#"+id+"_upload_file_div");
            if(typeof (value)!="undefined"&&value!=""){
                //创建预览div
                var preview=$("<div style='margin:5px;'></div>");
                preview.attr("id",pid);
                preview.addClass("col-xs-6 col-md-3");
                var previewA=$("<a></a>");
                var url=$("#"+id).val();
                if(imgExp.test(url)){
                    previewA.addClass("thumbnail");
                    var img=$("<img  style='width:250px;height:200px;'>");
                    img[0].src=$("#"+id).val();
                    previewA.append(img);
                }else{
                    //附件
                    //http://oss.drore.com/material/e65a026b11ad4c6e98816f716e8f2e66/201605/09/b16bcad062f94035a568d0fea1b1e75f.json
                    //var mediaExp=/.*?\/\(.*?\\.\).*/gim;
                    previewA.attr("alt",url);
                    var mediaName=url.substring(url.lastIndexOf("/")+1);
                    previewA.html("").html(mediaName);
                    previewA.attr("href",url).attr("target","_blank");
                }
                preview.append(previewA);
                parent.append(preview);
            }
        },getParent:function () {
            var that=this.eq(0);
            var id=that.attr("id");
            return $("#"+id+"_upload_file_div");
        }
    }
    window.JFormParser=JFormParser;
})(jQuery)