import React,{ Component } from 'react'
import { connect } from 'react-redux';
import Common from './../common.js'
import './account.css'
import axios from 'axios'

class Login extends Component {
	constructor(props){
        super(props);
        this.state={
            mobile:'',
            password:''
        }
	}
      //组件加载完成
    componentDidMount(){
        console.log(this.props);
        //console.log('componentDidMount === '+this.state.age);
        /*this.setState({
          name:'yuxuemei'
        })*/
    }
    login(){
        Common.post({
            url:"api/user/login",
            data:this.state
        }).then(respose=>{
            localStorage.t = respose.auth_token;
            axios.defaults.headers.common['Authorization'] = localStorage.t;
            Common.getUserInfo().then(()=>{
                //哪里来的回到哪里去
                this.props.history.goBack();
            })
        })
    }
    handleChangeMobile(event) {
        this.setState({mobile: event.target.value});
    }
    handleChangePassword(event) {
        this.setState({password: event.target.value});
    }
	render(){
        var state = this.state;
		return (
			<div className="login">
                <div className="password-title text-left">手机号快捷登录</div>
                <div className="password">
                    <div className="old-password">
                        <div className="psw-left">* 手机号码：</div>
                        <div className="psw-right">
                            <input type="number" placeholder="请输入手机号码" name="mobile" value={state.mobile} onChange={this.handleChangeMobile.bind(this)}/>
                        </div>
                    </div>
                    <div className="new-password">
                        <div className="psw-left">* 密码 ：</div>
                        <div className="psw-right">
                            <input type="password" placeholder="请输入密码" name="password" value={state.password} onChange={this.handleChangePassword.bind(this)}/>
                        </div>
                    </div>
                </div>
                <div className="psw-bun">
                    <div className="sure-change" onClick={this.login.bind(this)}>登录</div>
                    <div>
                        <div className="forget-psw">注册</div>
                    </div>
                </div>
            </div>
		)
	}
}

const mapStateToProps = function (store){
    return {
	    planlist: store.planlist
	};
};
export default connect(mapStateToProps)(Login);