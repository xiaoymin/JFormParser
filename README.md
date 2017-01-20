#JFormParser



The JFormParser plugin: creating a web page based on the JSON structure, and achieve liberation back-end developers to reduce back-end requirements for front-end development, is focused on developing interface background service program, the form elements, later will add more page elements support
	
	
#JFormParser Component dependency

At present mainly rely on bootstrap CSS framework, jQuery top two core components, the beginning of the design idea is to reduce the dependence on the plug-in coupling, the page elements used to construct the other plug-ins can achieve diversification can be replaced, which makes the page effect more abundant

##Each components:

 - <strong>*bootstrap*</strong> : *v3.3.5*
 - <strong>*jQuery*</strong> : *1.9.1*
 - <strong>*layer*</strong> : *v2.2*
 - <strong>*WdatePicker*</strong> : *v4.8*
 - <strong>*jQWidgets*</strong> : *v3.9.1*


#JFormParser element
	
Depending on the number of elements to build a colorful page, the current support for the plug-in is as follows:
	
- Editor (rich text plugin): rich text plugin here using EWEBEDITOR plugin
- Textarea (multi line text field): multi line text field
- select (drop down box): drop-down box element, the drop-down box involves the cause of data initialization, so the plugin provides the remote_url attribute to initialize the data through the background loading
Panel (panel): panel component is a container component
- grid (table): form component, the table here has no special meaning, just for the page layout, the same as panel, but also the container component
- checkboxGroup: check box group
- RadioGroup: single box assembly
- button: button (ordinary button, submit button, return button,,,,, etc.)
- the buttonGroup: button group is a container component that contains a combination of buttons,
- datagrid: table display component, dependent metadata query component
- fileupload: file upload
- Images: upload component Atlas
- BMap: pick up the latitude and longitude coordinates of the map component, depending on the Baidu JS map (http://lbsyun.baidu.com/index.php? Title=jspopular)
- text (basic text box): text field, the text field is a powerful form element, JFormParser now supports the text field of the following data types
    - Normal: regular text field, no task effect
    - email: only supports text input in the form of a message, and will self check other non formatted data
    - number: integer text field, only to support the input integer, self inspection and other non format data
    - decimal: decimal text field
    - datetime: date type, the plugin currently used is the My97DatePicker date plug, so rely on the WdatePicker.js file



#JFormParser page template

At present, the template is mainly two, one is the list page template, a FORM form page template



## list template

JSON structure example:

    {
      "component_name":"scenic_form",
      "component_title":"景区form",
      "template_type":"list",
      "navs_title":"景区标准化管理 > 景区管理 > 景区列表",
      "navs":[{"title":"景区标准化管理","icon":"","url":""},{"title":"景区管理","icon":""},{"title":"景区列表","icon":""}],
      "resource_name":"scenic_info",
      "submit_url":"/cms/template/submit.htm",
      "childrens":[{
        "element_type":"panel",
        "element_title":"景区查询",
        "whether_header":false,
        "whether_border":false,
        "container":true,
        "childrens":[
          {
            "element_type":"datagrid",
            "element_title":"景区查询",
            "is_remote":true,
            "is_operate":true,
            "operate_title":"操作",
            "operate_buttons":[
              {"element_type":"button","type":"edit","element_title":"编辑","remote_url":"/cms/template/template_form.htm","params":{"url":"/json/baotou/scenic/scenic_form.json"}},
              {"element_type":"button","type":"delete","element_title":"图片","remote_url":"/cms/template/delete.htm"},
              {"element_type":"button","type":"delete","element_title":"视频","remote_url":"/cms/template/delete.htm"},
              {"element_type":"button","type":"delete","element_title":"音频","remote_url":"/cms/template/delete.htm"},
              {"element_type":"button","type":"delete","element_title":"删除","remote_url":"/cms/template/delete.htm"}],
            "pagination":true,
            "remote_url":"/cms/template/get_remote_list.htm",
            "columns":[
    		{"field":"title","title":"景区名称"},
    		{"field":"level","title":"景区等级"},
    		{"field":"lawyer","title":"法人代表"},
    		{"field":"person_liable","title":"负责人"},
    		{"field":"phone","title":"手机号码"},
    		{"field":"tel","title":"电话"},
    		{"field":"fax","title":"传真"},
    		{"field":"approve_date","title":"批准时间"},
    		{"field":"approve_date","title":"地理位置"}],
            "childrens":[
              {
                "element_type":"text",
                "element_title":"景区名称",
                "meta_column":"title",
                "is_query":true,
                "direction":"left",
                "width":"100%"
              },{
                "element_type":"text",
                "element_title":"景区等级",
                "meta_column":"level",
                "is_query":true,
                "direction":"left",
                "width":"100%"
              },{
                "element_type":"button",
                "element_title":"查询",
                "type":"query",
                "remote_url":"/cms/template/get_remote_list.htm",
                "params": {
                  "params": "{resource_name: scenic_info}"
                }
              },{
                "element_type":"buttonGroup",
                "element_title":"操作按钮组",
                "align":"left",
                "childrens":[
                  {"element_type":"button","type":"link","element_title":"新增景区","remote_url":"/cms/template/template_form.htm","params":{"url":"/json/baotou/scenic/scenic_form.json"}},
                  {"element_type":"button","type":"link","element_title":"删除","remote_url":"/cms/template/template_form.htm","params":{"url":"/json/baotou/scenic/scenic_form.json"}},
                  {"element_type":"button","type":"link","element_title":"导入","remote_url":"/cms/template/template_form.htm","params":{"url":"/json/baotou/scenic/scenic_form.json"}},
                  {"element_type":"button","type":"link","element_title":"导出","remote_url":"/cms/template/template_form.htm","params":{"url":"/json/baotou/scenic/scenic_form.json"}}
                ]
              }
            ]
          }
        ]
      }
      ]
    }
    
## The results are as follows
  ![Document list template effect diagram][1]  
##FORM form template

JSON structure example:

    {
      "component_name":"trips_form",
      "component_title":"行程form",
      "template_type":"form",
      "navs_title":"信息管理 > 行程管理 > 行程维护",
      "navs":[{"title":"信息管理","icon":"","url":""},{"title":"行程管理","icon":""},{"title":"行程维护","icon":""}],
      "resource_name":"trips_info",
      "submit_url":"/cms/template/submit.htm",
      "init_url":"/cms/template/get_form_data.htm",
      "childrens":[
        {
          "element_type":"panel",
          "element_title":"基础信息",
          "container":true,
          "childrens":[
            {
              "element_type":"grid",
              "cols":3,
              "rows":"3",
              "childrens":[{
                "element_type":"text",
                "element_title":"行程名称",
                "meta_column":"title",
                "is_required":true
              },{
                "element_type":"select",
                "element_title":"行程类型",
                "is_required":true,
                "meta_column":"type",
                "is_fk":true,
                "fk_resource_name":"scenic_spot_info",
                "fk_meta_column":"id",
                "fk_meta_column_show":"title",
                "data":[
                  {"text":"交通","value":"jt"},
                  {"text":"会议","value":"hy"},
                  {"text":"入住","value":"rz"},
                  {"text":"用餐","value":"yc"},
                  {"text":"考察","value":"kc"}
                ],
                "is_remote":false,
                "remote_url":""
              },{
                "element_type":"text",
                "element_title":"开始时间",
                "meta_column":"start_time",
                "is_required":true
              },{
                "element_type":"checkboxGroup",
                "element_title":"参与小组",
                "is_required":true,
                "meta_column":"team_infos",
                "fk_resource_name":"team_info",
                "fk_meta_column":"id",
                "fk_meta_column_show":"name",
                "is_remote":true,
                "width":"100%",
                "remote_url":"/cms/template/get_remote_data.htm"
              }]
            }
          ]
        },{
          "element_type":"panel",
          "element_title":"详情",
          "container":true,
          "childrens":[
            {
              "element_type":"editor",
              "meta_column":"intro",
              "width":"400px",
              "height":"300px"
            }
          ]
        },{
          "element_type":"buttonGroup",
          "element_title":"",
          "align":"center",
          "childrens":[
            {"element_type":"button","type":"submit","element_title":"提交","remote_url":"/cms/template/submit.htm","width":"80px","action_url":"/cms/template/template_list.htm","params":{"url":"/json/shengsi/trips/trips_list.json"}},
            {"element_type":"button","type":"link","element_title":"返回","remote_url":"/cms/template/template_list.htm","params":{"url":"/json/shengsi/trips/trips_list.json"},"width":"80px"}
          ]
        }
      ]
    }
    
##FORM template effects are as follows:
![FORM template effects are as follows][2]


  [1]: http://git.oschina.net/uploads/images/2017/0120/102836_fcd08910_118100.jpeg
  [2]: http://git.oschina.net/uploads/images/2017/0120/103119_723e3743_118100.jpeg