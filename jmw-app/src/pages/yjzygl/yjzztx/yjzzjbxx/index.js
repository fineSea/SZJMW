import React from 'react';
import { Button , Form , Breadcrumb , Modal , message ,Input , InputNumber , Layout , Select , DatePicker , Row , Col} from  'antd';
import axios from '../../../../axios'
import Utils from '../../../../utils/utils'
import ETable from '../../../../components/ETable'
import moment from 'moment'
import FaceUrl from '../../../../utils/apiAndInterfaceUrl'
import Dictionary from '../../../../utils/dictionary'

const Content = Layout;
const { TextArea,Search } = Input;
const FormItem = Form.Item;
const Option = Select.Option;
export default class Yjzzjbxx extends React.Component{
    state={
        dataSource:[],
        footer:'',
    }

    params={
        currentPage:1,
        pageSize:10,
        query:{},
    }

    componentDidMount(){
      this.requestList()
    }

    requestList = ()=>{
        let _this =this;
        axios.requestList(_this,FaceUrl.orggl,FaceUrl.POST,FaceUrl.bdApi,this.params);
    }

    //查询
    handleSearchTable = (value)=>{
        let _this =this;
        this.params.query = {"searchInfo":value}
        axios.requestList(_this,FaceUrl.orggl,FaceUrl.POST,FaceUrl.bdApi,this.params);
    }

     //打开详情
     handleDetail = (value)=>{
        this.setState({
            type:"detail",
            isVisible:true,
            title:'查看详情',
            tableInfo:value,
       })  
    }
    //关闭详情
    handleCancel = () => {
        this.setState({ 
            isVisible: false,
            tableInfo:{} 
        });
        this.requestList(); 
    }

    //打开添加编辑
    handleOperate =(type)=>{
        let item = this.state.selectedItem
        if(type==='add'){
            this.setState({
                type:type,
                isVisible:true,
                title:'添加'
           })
        }else if(type==='edit'){
            if(item&&item.length==1){
                this.setState({
                    type:type,
                    isVisible:true,
                    title:'修改',
                    tableInfo:item[0]
               })  
            }else{
                message.error('请选择一条需要修改的项！');
                
            }
            
        }
    }

    //提交
    handleSubmit =()=>{
        let type = this.state.type;
        const form = this.modalForm.props.form;
        form.validateFields((err, values) => {
        if (err) {
            return;
        }
            let message = "";
            if(type=="add"){
                message="添加成功";
            }if(type=="edit"){
                message="修改成功";
            }
            //提交or修改
            axios.ajax({
                url:FaceUrl.orgAdd,
                method:FaceUrl.POST,
                baseApi:FaceUrl.bdApi,
                data:{
                    ...values,
                    isShowLoading:true
                }
            }).then((res)=>{
                if(res.code == '1') {
                    form.resetFields();
                    this.setState({ 
                        isVisible: false,
                        tableInfo:{}  
                    });
                    this.requestList();
                    message.success(message);
                }
            })
        });
    }

    //删除操作
    handleDelete = ()=>{
        let rows = this.state.selectedItem;
        let ids = [];
        if(rows&&rows.length){
            rows.map((item)=>{
                ids.push(item.kid)
            })
            Modal.confirm({
                title:'提示',
                content:`您确定要删除这${ids.length}项吗？`,
                onOk:()=>{
                    axios.ajax({
                        url:FaceUrl.orgDel,
                        method:FaceUrl.POST,
                        baseApi:FaceUrl.bdApi,
                        data:ids
                    }).then((res)=>{
                        if(res.code == '1') {
                            this.requestList();
                            message.success('删除成功！');
                        }
                    })
                   
                }
            })
        }else{
            message.error('请选择需要删除的项！');
        }
    }

    render(){
        const columns = [
            
             {
                 title:'机构名称',
                 dataIndex:'jgName',
                 key:'jgName',
                 align:'center',
                 render:(jgName,record)=>{
                    return <a  href="javascript:;" onClick={()=>{this.handleDetail(record)}}>{jgName}</a>;
               }
             },
             {
                title:'机构编号',
                dataIndex:'jgCode',
                key:'jgCode',
                align:'center'
            },
             {
                 title:'密级代码',
                 dataIndex:'jgmjCode',
                 key:'jgmjCode',
                 align:'center',
                //  render(mj){
                //     let config = Dictionary.mj
                //     return config[mj];
                // }
             },
             {
                title:'类型',
                dataIndex:'jgType',
                key:'jgType',
                align:'center',
                render(jgType){
                    let config = Dictionary.jyzzType
                    return config[jgType];
                }
            },
            {
                title:'级别',
                dataIndex:'jgjb',
                key:'jgjb',
                align:'center'
            },
            {
                title:'行政区划',
                dataIndex:'areaCode',
                key:'areaCode',
                align:'center'
            },
            {
                title:'地址',
                dataIndex:'jgAddr',
                key:'jgAddr',
                align:'center'
            }
         ]
        
        let footer = {}
        if(this.state.type=='detail'){
            footer={
               footer: <Button key="关闭" onClick={this.handleCancel.bind(this)}>关闭</Button>,
            }
            
        }
        //多选框
        const rowSelection = {
            type: 'checkbox',
        }

        return (
            <div>
                <Breadcrumb separator=">" style={{ margin: '16px 20px' }}>
                    <Breadcrumb.Item>首页</Breadcrumb.Item>
                    <Breadcrumb.Item>应急资源管理</Breadcrumb.Item>
                    <Breadcrumb.Item>应急组织体系</Breadcrumb.Item>
                    <Breadcrumb.Item>应急组织基本信息</Breadcrumb.Item>
                </Breadcrumb>
                <Content className="content-wrap">
                    <div >
                    <span className="table_input ft">
                        <Search size="large" style={{width: 325}}
                        name="searchInfo"
                        placeholder="请输入机构名称/机构编号/地址"
                        onSearch={value => this.handleSearchTable(value)}
                        enterButton
                        />  
                    </span>
                    <span className="table_button ht" >
                        <Button icon="plus" ghost type="primary" onClick={()=>{this.handleOperate('add')}}>添加</Button>
                        <Button icon="form" ghost type="primary" onClick={()=>{this.handleOperate('edit')}}>修改</Button>
                        <Button icon="delete" ghost type="primary" onClick={this.handleDelete}>删除</Button>    
                    </span>   
                    </div>        
                    <ETable
                        columns={columns}
                        updateSelectedItem={Utils.updateSelectedItem.bind(this)}
                        dataSource={this.state.list}
                        selectedRowKeys={this.state.selectedRowKeys}
                        selectedIds={this.state.selectedIds}
                        selectedItem={this.state.selectedItem}
                        rowSelection={rowSelection}
                        pagination={this.state.pagination}
                        
                    />

                </Content>
                <Modal
                    width='700px'
                    title={this.state.title}
                    visible={this.state.isVisible}
                    onCancel={()=>{
                        this.modalForm.props.form.resetFields();
                        this.setState({
                            isVisible:false,
                            tableInfo:[],
                            type:''
                        })
                    }}
                    onOk={this.handleSubmit}
                    {...footer}
                >
                <OpenFormTable type={this.state.type} tableInfo={this.state.tableInfo}
                 wrappedComponentRef={(inst)=>{this.modalForm = inst;}}/>
                </Modal>
            </div>
            
        );
    }
}
class OpenFormTable extends React.Component{

    render(){
        let type = this.props.type;
        let tableInfo =this.props.tableInfo || {};
        const formItemLayout = {
            // labelCol:{
            //     span:8
            // },
            // wrapperCol:{
            //     span:16
            // }
        }
        const { getFieldDecorator }  =this.props.form;
        return (
            <Form layout="inline" >
                    {
                        getFieldDecorator('kid',{
                            initialValue:tableInfo.kid,
                        })
                         (<Input type="hidden" />
                         )
                    }
                <Row>
                    <Col span={12}>
                        <div className="gutter-box" align="left">
                            <FormItem label="机构名称" {...formItemLayout}>
                                {   
                                    //tableInfo && type=='detail'? tableInfo.cbkName: 
                                    getFieldDecorator('jgName',{
                                        initialValue:tableInfo.jgName,
                                        rules:[
                                            {
                                                required: true,
                                                message:'机构名称不能为空！'
                                            }
                                        ]
                                    })
                                    (<Input placeholder="请输机构名称" style={{ width: 200 }}/>
                                    )
                                }
                            </FormItem>
                        </div>
                    </Col>
                    <Col span={12}>
                    <div className="gutter-box">
                    <FormItem label="机构编号" {...formItemLayout}>
                            {   
                                //tableInfo && type=='detail'? tableInfo.cbkCode: 
                                getFieldDecorator('jgCode',{
                                    initialValue:tableInfo.jgCode,
                                    rules:[
                                        {
                                            required: true,
                                            message:'机构编号不能为空！'
                                        }
                                    ]
                                })
                                (<Input placeholder="请输入机构编号" style={{ width: 200 }}/>
                                )
                            }
                        </FormItem>
                    </div>
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                    <div className="gutter-box">
                    <FormItem label="密级代码" {...formItemLayout}>
                        {   
                            //tableInfo && type=='detail'? tableInfo.cbkCode: 
                            getFieldDecorator('jgmjCode',{
                                initialValue:tableInfo.jgmjCode,
                                rules:[
                                    {
                                        required: true,
                                        message:'密级代码不能为空！'
                                    }
                                ]
                            })
                            (<Input placeholder="请输入密级代码" style={{ width: 200 }}/>
                            )
                        }
                </FormItem>
                    </div>
                    </Col>
                    <Col span={12}>
                    <div className="gutter-box">
                    <FormItem label="上级单位" {...formItemLayout}>
                            {   
                                //tableInfo && type=='detail'? tableInfo.cbkGrade:
                                getFieldDecorator('sjDw',{
                                    initialValue:tableInfo.sjDw,
                                    rules:[
                                        {
                                            required: true,
                                            message:'上级单位不能为空！'
                                        }
                                    ]
                                })
                                (<Input placeholder="请输入上级单位" style={{ width: 200 }}/>
                                )
                            }
                        </FormItem>
                    </div>
                        
                    </Col>
                </Row>
                <Row>
                <Col span={12}>
                    <div className="gutter-box">
                    <FormItem label="隶属关系" {...formItemLayout}>
                        {   
                            //tableInfo && type=='detail'? tableInfo.cbkCode: 
                            getFieldDecorator('lsgx',{
                                initialValue:tableInfo.lsgx,
                                rules:[
                                    {
                                        required: true,
                                        message:'隶属关系不能为空！'
                                    }
                                ]
                            })
                            (<Input placeholder="请输入隶属关系" style={{ width: 200 }}/>
                            )
                        }
                </FormItem>
                    </div>
                    </Col>
                    <Col span={12}>
                    <div className="gutter-box">
                    <FormItem label="类型" {...formItemLayout}>
                            {   
                                //tableInfo && type=='detail'? tableInfo.cbkGrade:
                                getFieldDecorator('jgType',{
                                    initialValue:tableInfo.jgType? tableInfo.jgType : '1',
                                    rules:[
                                        {
                                            required: true,
                                            message:'类型不能为空！'
                                        }
                                    ]
                                })
                                ( <Select style={{ width: 200 }} >
                                    <Option value="1">国内或国际间的应急响应协调组织</Option>
                                    <Option value="2">企业或政府的应急响应组织</Option>
                                    <Option value="3">计算机软件厂商提供的应急响应组织</Option>
                                    <Option value="4">商业化的应急响应组织</Option>
                                </Select>
                                )
                            }
                        </FormItem>
                    </div>
                        
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                    <div className="gutter-box">
                    <FormItem label="级别" {...formItemLayout}>
                            {   
                                //tableInfo && type=='detail'? tableInfo.area:
                                getFieldDecorator('jgjb',{
                                    initialValue:tableInfo.jgjb,
                                })
                                (<Input placeholder="请输入级别" style={{ width: 200 }}/> )
                            }
                        </FormItem>
                    </div>
                        
                    </Col>
                    <Col span={12}>
                    <div className="gutter-box">
                    <FormItem label="行政区划" {...formItemLayout}>
                            {   
                                //tableInfo && type=='detail'? tableInfo.areaCode:
                                getFieldDecorator('areaCode',{
                                    initialValue:tableInfo.areaCode,
                                })
                                (<Input placeholder="请输入行政区划" style={{ width: 200 }}/>
                                )
                            }
                        </FormItem>
                    </div>
                        
                    </Col>
                </Row>
                <Row >
                    <Col span={12}>
                    <div className="gutter-box">
                    <FormItem label="地址" {...formItemLayout}>
                            {   
                                //tableInfo && type=='detail'? tableInfo.cbkAdd:
                                getFieldDecorator('jgAddr',{
                                    initialValue:tableInfo.jgAddr,
                                })
                                (<Input placeholder="请输入地址" style={{ width: 200 }}/>
                                )
                            }
                        </FormItem>
                    </div>
                        
                    </Col>
                    <Col span={12}>
                    <div className="gutter-box">
                    <FormItem label="社会信用代码" {...formItemLayout}>
                            {   
                                //tableInfo && type=='detail'? tableInfo.fzrOffTel:
                                getFieldDecorator('xyCode',{
                                    initialValue:tableInfo.xyCode,
                                })
                                (<Input placeholder="请输入社会信用代码" style={{ width: 200 }}/>
                                )
                            }
                        </FormItem>
                    
                    </div>
                       
                    </Col>
                </Row>
                <Row>
                    <Col span={12}>
                    <div className="gutter-box">
                    <FormItem label="经度" {...formItemLayout}>
                            {   
                                //tableInfo && type=='detail'? tableInfo.kr:
                                getFieldDecorator('longitude',{
                                    initialValue:tableInfo.longitude,
                                })
                                (<InputNumber style={{ width: 200 }}/>    
                                )
                            }
                        </FormItem>
                    </div>
                        
                    </Col>
                    <Col span={12}>
                    <div className="gutter-box">
                    <FormItem label="纬度" {...formItemLayout}>
                            {   
                                //tableInfo && type=='detail'? tableInfo.fzrName:
                                getFieldDecorator('latitude',{
                                    initialValue:tableInfo.latitude,
                                })
                                (<InputNumber style={{ width: 200 }}/>  
                                )
                            }
                        </FormItem>
                    
                    </div>
                        
                    </Col>
                </Row>
                <Row >
                    <Col span={24}>
                    <div className="gutter-box">
                    <FormItem label="机构职责" >
                            {   
                                //tableInfo && type=='detail'? tableInfo.zbjt:
                                getFieldDecorator('jgzz',{
                                    initialValue:tableInfo.jgzz,
                                    rules:[]
                                })(
                                <TextArea style={{ width: 526 }}
                                autosize={{minRows:3}}
                                placeholder="请输入机构职责" 
                                    />
                                )
                            }
                        </FormItem>
                    </div>
                        
                    </Col>
                </Row>
                <Row >
                    <Col span={12}>
                    <div className="gutter-box">
                    <FormItem label="机构领导" {...formItemLayout}>
                            {   
                                //tableInfo && type=='detail'? tableInfo.fzrMob:
                                getFieldDecorator('jgld',{
                                    initialValue:tableInfo.jgld,
                                })
                                (<Input placeholder="请输入机构领导" style={{ width: 200 }}/>
                                )
                            }
                        </FormItem>
                    </div>
                        
                    </Col>
                    <Col span={12}>
                    <div className="gutter-box">
                    <FormItem label="分管领导" {...formItemLayout}>
                            {   
                                //tableInfo && type=='detail'? tableInfo.linkName:
                                getFieldDecorator('fgLd',{
                                    initialValue:tableInfo.fgLd,
                                })
                                (<Input placeholder="请输入分管领导" style={{ width: 200 }}/>
                                )
                            }
                        </FormItem>
                    </div>
                        
                    </Col>
                </Row>
                <Row >
                    <Col span={12}>
                    <div className="gutter-box">
                    <FormItem label="联系电话" {...formItemLayout}>
                            {   
                                //tableInfo && type=='detail'? tableInfo.linkOffTel:
                                getFieldDecorator('linkTel',{
                                    initialValue:tableInfo.linkTel,
                                })
                                (<Input placeholder="请输入联系电话" style={{ width: 200 }}/>
                                )
                            }
                        </FormItem>
                    </div>
                        
                    </Col>
                    <Col span={12}>
                    <div className="gutter-box">
                    <FormItem label="传真" {...formItemLayout}>
                            {   
                                //tableInfo && type=='detail'? tableInfo.linkMob:
                                getFieldDecorator('fax',{
                                    initialValue:tableInfo.fax,
                                })
                                (<Input placeholder="请输入传真" style={{ width: 200 }}/>
                                )
                            }
                        </FormItem>
                    </div>
                        
                    </Col>
                </Row>
                <Row >
                    <Col span={12}>
                    <div className="gutter-box">
                    <FormItem label="电子邮箱" {...formItemLayout}>
                            {   
                                //tableInfo && type=='detail'? tableInfo.longitude:
                                getFieldDecorator('email',{
                                    initialValue:tableInfo.email,
                                    rules: [{
                                        type: 'email', message: '无效的电子邮箱!',
                                      }],
                                })
                                (<Input placeholder="请输入电子邮箱" style={{ width: 200 }}/>
                                )
                            }
                        </FormItem>
                    </div>
                        
                    </Col>
                    <Col span={12}>
                    <div className="gutter-box">
                    <FormItem label="应急通信方式" {...formItemLayout}>
                            {   
                                //tableInfo && type=='detail'? tableInfo.syDate:
                                getFieldDecorator('yjtxfs',{
                                    initialValue:tableInfo.yjtxfs,
                                })
                                (<Input placeholder="请输入应急通信方式" style={{ width: 200 }}/>
                                )
                            }
                        </FormItem>
                    
                    </div>
                        
                    </Col>
                </Row>
                <Row >
                    <Col span={12}>
                    <div className="gutter-box">
                    <FormItem label="应急机构标志" {...formItemLayout}>
                            {   
                                //tableInfo && type=='detail'? tableInfo.latitude:
                                getFieldDecorator('yjjgbz',{
                                    initialValue:tableInfo.yjjgbz,
                                })
                                (<Input placeholder="请输入应急机构标志" style={{ width: 200 }}/>
                                )
                            }
                        </FormItem>
                    </div>
                        
                    </Col>
                    <Col span={12}>
                    <div className="gutter-box">
                    <FormItem label="顺序号" {...formItemLayout}>
                            {   
                                //tableInfo && type=='detail'? tableInfo.synx:
                                getFieldDecorator('sx',{
                                    initialValue:tableInfo.sx,
                                })
                                ( <InputNumber style={{ width: 200 }}/>    
                                )
                            }
                        </FormItem>
                    </div>
                        
                    </Col>
                </Row>
                <Row >
                    <Col span={24}>
                    <div className="gutter-box">
                    <FormItem label="备注" >
                            {   
                                //tableInfo && type=='detail'? tableInfo.zbjt:
                                getFieldDecorator('mark',{
                                    initialValue:tableInfo.mark,
                                    rules:[]
                                })(
                                <TextArea style={{ width: 526 }}
                                autosize={{minRows:3}}
                                placeholder="请输入备注" 
                                    />
                                )
                            }
                        </FormItem>
                    </div>
                        
                    </Col>
                </Row>
            </Form>
        );
    }
}
OpenFormTable = Form.create({})(OpenFormTable);
