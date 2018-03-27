import React,{ Component } from 'react'
import { connect } from 'react-redux';
import store from './../redux/store.js';
import Common from './../common.js'

//引入定义的action
import { user } from './../actions/plan.js'
import './edit.css'
 
class Ref extends Component {
	constructor(props){
        super(props);
        this.state = {
            user:{},
            type:this.props.location.state.type
        }
	}
    componentDidMount(){
        this.setState({
            user:this.props.data.user
        })
    }
    updateRef(){
       localStorage.userinfo = JSON.stringify(this.state.user);
       store.dispatch(user(this.state.user));
       if(this.state.type === "fromcode"){
            if(this.state.user.fromcode && this.state.user.fromcode.length>0 && this.state.user.fromcode.length !== 8){
                Common.fail("邀请码长度为8位数");
                return;
            }
       }else if(this.state.type === "email"){
            if(this.state.user.email){
                if(!this.isEmail(this.state.user.email)){
                    Common.fail("输入正确的邮箱地址！");
                    return;
                }
            }
       }
       //哪里来的回到哪里去
       this.props.history.goBack();
    }
    isEmail(str){ 
        var reg = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(.[a-zA-Z0-9_-])+/; 
        return reg.test(str); 
    }
    handleChange(e){
        let value = e.target.value;
        var user = this.state.user;
        if(this.state.type === "email"){
            user.email = value;
        }else if(this.state.type === "nickname"){
            user.nickname = value;
        }else if(this.state.type === "fromcode"){
            user.fromcode = value;
        }
        this.setState({
            user:user
        })
    }
	render(){
        let type = this.props.location.state.type;
        let user = this.state.user;
        let inputHtml;
        if(type === 'email'){
            inputHtml = (<input type="text" name="email" value={user.email || ''} placeholder="请输入您的邮箱" onChange ={this.handleChange.bind(this)}/>)
        }else if(type === 'nickname'){
            inputHtml = (<input type="text" name="nickname" value={user.nickname || ''} placeholder="请输入您的姓名" onChange ={this.handleChange.bind(this)}/>);
        }else if(type === 'fromcode'){
            inputHtml = (<input type="text" name="fromcode" value={user.fromcode || ''} placeholder="请填写邀请码" onChange ={this.handleChange.bind(this)}/>);
        }
		return (
			<div>
                <div className="editname">
                    {inputHtml}
                </div>
                <div className="bottomBtn">
                    <div className="btn" onClick={this.updateRef.bind(this)}>保存</div>
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

export default connect(mapStateToProps)(Ref);