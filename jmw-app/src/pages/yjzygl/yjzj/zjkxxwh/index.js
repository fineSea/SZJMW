import React from 'react';
import { Button , Form , Breadcrumb , Modal , message ,Input  , Layout , Select , DatePicker } from  'antd';
import axios from '../../../../axios'
import Utils from '../../../../utils/utils'
import ETable from '../../../../components/ETable'
import moment from 'moment'
import FaceUrl from '../../../../utils/apiAndInterfaceUrl'

const Content = Layout;
const { TextArea,Search } = Input;
const FormItem = Form.Item;
const Option = Select.Option;
export default class Zjkxxwh extends React.Component{
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
        axios.requestList(_this,FaceUrl.jcjhgl,FaceUrl.POST,FaceUrl.bdApi,this.params);
    }

    //查询
    handleSearchTable = (value)=>{
        let _this =this;
        this.params.query = {"searchInfo":value}
        axios.requestList(_this,FaceUrl.jcjhgl,FaceUrl.POST,FaceUrl.bdApi,this.params);
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

    //提交
    handleSubmit =()=>{
        let type = this.state.type;
        const form = this.modalForm.props.form;
        form.validateFields((err, values) => {
        if (err) {
            return;
        }
        //console.log('form: ', values);
            let message = "";
            if(type=="add"){
                message="添加成功";
            }if(type=="edit"){
                message="修改成功";
            }
            //提交or修改
            axios.ajax({
                url:FaceUrl.jcjhAdd,
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
                        url:FaceUrl.jcjhDel,
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
                 title:'储备物资',
                 dataIndex:'wzName',
                 key:'wzName',
                 align:'center',
                 render:(wzName,record)=>{
                     return <a  href="javascript:;" onClick={()=>{this.handleDetail(record)}}>{wzName}</a>;
                }
             },
             {
                title:'库点代码',
                dataIndex:'cbkCode',
                key:'cbkCode',
                align:'center',
            },
             {
                 title:'所属企业',
                 dataIndex:'ssqy',
                 key:'ssqy',
                 align:'center',
            },
             {
                 title:'计划时间',
                 dataIndex:'planDate',
                 key:'planDate',
                 align:'center',
                 render(planDate){
                    return moment(planDate).format('YYYY-MM-DD')
                 }
            },
            {
                title:'检查频次',
                dataIndex:'jcpc',
                key:'jcpc',
                align:'center',
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
                    <Breadcrumb.Item>应急专家</Breadcrumb.Item>
                    <Breadcrumb.Item>专家库信息维护</Breadcrumb.Item>
                </Breadcrumb>
                <Content className="content-wrap">
                    <div >
                    <span className="table_input ft">
                        <Search size="large" style={{width: 325}}
                        name="searchInfo"
                        placeholder="请输入储备物资/库点代码/所属企业"
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
                    {...footer}
                    onOk={this.handleSubmit}
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
        let type = this.props.type ;
        let tableInfo =this.props.tableInfo || {};
        const formItemLayout = {
            labelCol:{
                span:6
            },
            wrapperCol:{
                span:18
            }
        }
        const { getFieldDecorator }  =this.props.form;
        return (
            <Form layout="horizontal">
                    {   
                        getFieldDecorator('kid',{
                            initialValue:tableInfo.kid,
                        })
                         (<Input type="hidden" />
                         )
                    }
                <FormItem label="储备物资" {...formItemLayout}>
                    {   
                        tableInfo && type=='detail'? tableInfo.wzName: 
                        getFieldDecorator('wzName',{
                            initialValue:tableInfo.wzName,
                            rules:[
                                {
                                    required: true,
                                    message:'储备物资不能为空！'
                                }
                            ]
                        })
                         (<Input placeholder="请输入储备物资" />
                         )
                    }
                </FormItem>
                <FormItem label="库点代码" {...formItemLayout}>
                    {   
                        tableInfo && type=='detail'? tableInfo.cbkCode: 
                        getFieldDecorator('cbkCode',{
                            initialValue:tableInfo.cbkCode, 
                            rules:[
                                {
                                    required: true,
                                    message:'请输入库点代码'
                                }
                            ]
                        })(
                            <Input placeholder="请输入库点代码" />
                        )
                    }
                </FormItem>
                <FormItem label="所属企业" {...formItemLayout}>
                   { 
                       tableInfo && type=='detail'? tableInfo.ssqy: 
                       getFieldDecorator('ssqy',{
                        initialValue:tableInfo.ssqy,
                    })
                        (<Input placeholder="请输入所属企业" />
                        )
                    }

                </FormItem>
                <FormItem label="计划时间" {...formItemLayout}>
                    {   
                        tableInfo && type=='detail'? tableInfo.planDate: 
                        getFieldDecorator('planDate',{
                            initialValue:moment(tableInfo.planDate),
                            rules:[]
                        })( <DatePicker  />
                            
                        )
                    }
                </FormItem>
                <FormItem label="检查频次" {...formItemLayout}>
                    {   
                        tableInfo && type=='detail'? tableInfo.jcpc: 
                        getFieldDecorator('jcpc',{
                            initialValue:tableInfo.jcpc,
                    })
                        (<Input placeholder="请输入检查频次" />
                        )
                    }
                </FormItem>
            </Form>
        );
    }
}
OpenFormTable = Form.create({})(OpenFormTable);