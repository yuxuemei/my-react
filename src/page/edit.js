import React,{ Component } from 'react'
import axios from 'axios'
import { connect } from 'react-redux';
import { Link } from 'react-router-dom'
import Common from './../common.js'
import { DatePicker } from 'antd-mobile';
import './edit.css'
 
class Edit extends Component {
	constructor(props){
        super(props);
        this.state = {
            user:{},
            isSex:false,//性别选择弹窗
            havecode:false,//是否已有邀请码
            minDate:new Date(1900,1,1),
            maxDate:new Date(),
            submitDate:'',
            qiniuUrl:"http://oo6mmo8xw.bkt.clouddn.com/user/head/",
        }
	}
    componentDidMount(){
        this.setState({
            user:this.props.data.user,
            submitDate:new Date(this.props.data.user.birthday*1000)
        })
    }
    sexChoose(bool){
        this.setState({
            isSex:bool
        })
    }
    // 性别选择
    bindsex(sex){
        var user = this.state.user;
        user.sex = sex;
        this.setState({
            user:user
        })
        this.sexChoose(false);  
    }
    handleChange(value){
        this.setState({
            submitDate:value
        })
    }
    editCode(){
        if(!this.state.user.fromcode){
            this.props.history.push({pathname:"/ref",state:{type:'fromcode'}});
        }
    }
    updateHead(e){
        let file = e.target.files[0];
        if(file){
            //let type = file.name.split('.');
            let param = new FormData(); //创建form对象
            //param.append('chunk','0');//断点传输
            //param.append('chunks','1');
            setTimeout(()=>{
                param.append('file',file,file.name);
                param.append('key',this.getUUId());
                //console.log(param.get('file')); //FormData私有类对象，访问不到，可以通过get判断值是否传进去
                let config = {
                    headers:{'Content-Type':'multipart/form-data'}
                };
               //先从自己的服务端拿到token
                Common.get({
                   url:'api/qiniu/token'
                }).then(respose=>{
                    param.append('token',respose.token);
                    this.upload(param,config);//然后将参数上传七牛
                    return;
                })
            },0)
        }
    }
    upload(param,config){
        axios.post("http://upload-z2.qiniu.com",param,config).then(response=>{
            let user = this.state.user;
            user.head = "http://oslg9bt6h.bkt.clouddn.com/"+response.data.key;
            this.setState({
                user:user
            })
        })
    }
    updateUser(){
        let user = this.state.user;
        var email = user.email;
        var data = {
            nickname:user.nickname,
            fromcode:user.fromcode,
            head:user.head,
            sex:user.sex,
            birthday:this.state.submitDate,
            email:email?email:''
        }
        Common.post({
            url: '/api/user/updateuserinfo',
            data: data,
        }).then(respose=>{
            Common.success('修改成功');
            setTimeout(() => {
                Common.getUserInfo();
                this.props.history.push('/my');
            }, 2000);
        })
    }
    getUUId (){
        var s = [];
        var hexDigits = "0123456789abcdef";
        for (let i = 0; i < 36; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[14] = "4"; // bits 12-15 of the time_hi_and_version field to 0010
        s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1); // bits 6-7 of the clock_seq_hi_and_reserved to 01
        s[8] = s[13] = s[18] = s[23] = ""; //去掉"-"
        var uuid = s.join("");
        return uuid;
    }
	render(){
        let user = this.props.data.user;
        let setHtml;
        if(user.sex === 0){
            setHtml = (<span className="edit-right">保密</span>);
        }else if(user.sex === 1){
            setHtml = (<span className="edit-right">男</span>);
        }else if(user.sex === 2){
            setHtml = (<span className="edit-right">女</span>);
        }

        const CustomChildren = ({ extra, onClick, children }) => (
            <div className="edit-list dsacfb" onClick={onClick}>
                <div className="text">出生日期</div>
                <div className="dsac">
                   <div className="picker edit-right">
                       {extra}
                   </div>
                   <img src={Common.ARROW_03} className="edit-right-icon" alt="arrow-03"></img>
                </div>
           </div>
        );

		return (
			<div>
                <div className="edit-box">
                    <div className="edit-list dsacfb relative" onClick={this.updateHead.bind(this)}>
                        <div className="text">头像</div>
                        <div className="header-img dsafc">
                            <img binderror="binderrorimg" src={user.head || Common.IMG_DEFAULT} alt="head"></img>
                            <form id= "uploadForm"  encType="multipart/form-data">
                                <input type="file" id="headImgUpload" onChange={this.updateHead.bind(this)} name="headImg" className="file" /> 
                            </form>
                        </div>
                    </div>
                    <Link to={{pathname:'/ref',state:{type:'nickname'}}}>
                        <div className="edit-list dsacfb">
                            <div className="text">昵称</div>
                            <div className="dsac">
                                <span className="edit-right">{user.nickname}</span>
                                <img src={Common.ARROW_03} className="edit-right-icon" alt="arrow-03"></img>
                            </div>
                        </div>
                    </Link>
                    <Link to={{pathname:'/ref',state:{type:'email'}}}>
                        <div className="edit-list dsacfb">
                            <div className="text">邮箱</div>
                            <div className="dsac">
                                <span className="edit-right">{user.email  || "未填写"}</span>
                                <img src={Common.ARROW_03} className="edit-right-icon" alt="arrow-03"></img>
                            </div>
                        </div>
                    </Link>
                    <div className="edit-list dsacfb" onClick={this.sexChoose.bind(this,true)}>
                        <div className="text">性别</div>
                        <div className="dsac">
                            {setHtml}
                            <img src={Common.ARROW_03} className="edit-right-icon" alt="arrow-03"></img>
                        </div>
                    </div>
                    <DatePicker mode="date" value={this.state.submitDate} onOk={this.handleChange.bind(this)} minDate={this.state.minDate} maxDate={this.state.maxDate} >
                        <CustomChildren></CustomChildren>
                    </DatePicker>
                    
                    <div className="edit-list dsacfb" onClick={this.editCode.bind(this)}>
                        <div className="text">邀请码</div>
                        <div className="dsac">
                            <span className="edit-right">{user.fromcode || "未填写"}</span>
                            <img src={Common.ARROW_03} className="edit-right-icon" alt="arrow-03"></img>
                        </div>
                    </div>
                </div>
                <div className="bottomBtn">
                    <div className="btn" onClick={this.updateUser.bind(this)}>保存</div>
                </div>
                <div className="popup z-fixed" style={this.state.isSex?{}:{display:'none'}} onClick={this.sexChoose.bind(this,false)}>
                    <div className="bottom-box">
                        <div className="item dsafc" onClick={this.bindsex.bind(this,1)}>男</div>
                        <div className="item dsafc" onClick={this.bindsex.bind(this,2)}>女</div>
                        <div className="item dsafc" onClick={this.bindsex.bind(this,0)}>保密</div>
                    </div>
                </div>

            </div>
		)
	}
}

const mapStateToProps = function(store){
    return {
        data:store.data
    };
};

export default connect(mapStateToProps)(Edit);